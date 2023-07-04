"use strict";
const drugActivity = Backend.model('activity', undefined, 'drug_activity'),
    DrugActivityService = Backend.service('drugActivity', 'drugActivity'),
    DrugGroupModel = Backend.model('drugActivity', undefined, 'drugGroup'),
    // FactoryDrugRelService = require('./../../../app/services/FactoryDrugRelService'),
    CollectionCenterService = Backend.service('collectionCenter', 'collectionCenter'),
    FactoryDrugRelService = Backend.service('drugActivity', 'factoryDrugRel'),
    DrugService = Backend.service('allowance', 'drugService'),
    _ = require('underscore'),
    co = require('co');
module.exports = {
    getOneDrugActivity: function (activityId) {
        let cond = {_id: activityId, endTime: {$gte: Date.now()}, isDeleted: false};
        return drugActivity.findOne(cond);
    },
    getDrugActivityByCond: function (cond, pageSlice) {
        cond.isDeleted = false;
        cond.endTime = {$gte: Date.now()};
        if(!pageSlice){
            pageSlice={};
        }
        pageSlice = JSON.parse(JSON.stringify(pageSlice));
        pageSlice.sort = {type: 1, createdAt: -1};

        return drugActivity.find(cond, {}, pageSlice);
    },
    getDrugActivityCount: function (cond) {
        if (cond['$and'] && cond['$and'].length == 0) {
            delete cond['$and'];
        }
        cond.isDeleted = false;
        cond.endTime = {$gte: Date.now()};
        return drugActivity.count(cond);
    },
    //获取推荐的药品ID
    getCollectionDrugIds: function (userId) {
        return co(function* () {
            let userCollection = yield CollectionCenterService.getUserCollections(userId);
            let userColDrugIds = [];
            if (userCollection.length > 0) {
                userCollection.forEach(function (item) {
                    if (item && item.drugId) {
                        userColDrugIds.push(item.drugId + '');
                    }
                });
            }

            return userColDrugIds;
        });
        // return result;
    },
    //获取标签组的药品ID
    getGroupDrugIds: function (sortName) {
        return co(function* () {
            let drugGroup = yield DrugGroupModel.methods.getDrugAndGroupByCond({name: sortName});
            let drugIdsOfGroup = [];
            drugGroup.forEach(function (item) {
                if (item && item._id) {
                    drugIdsOfGroup.push(item._id + '');
                }
            });
            let drugsOfGroup = yield DrugService.getDrugList({drugGroupId: {$in: drugIdsOfGroup}});
            let drugIds = [];
            drugsOfGroup.forEach(function (item) {
                if (item && item._id) {
                    drugIds.push(item._id + '');
                }
            });

            return drugIds;
        });
        // return result;
    },
    //查找活动列表
    getActivityList: function (activityCond, drugCond, drugIds, pageParams,drugRegionCond,activityRegionCond) {
        activityCond=JSON.parse(JSON.stringify(activityCond));
        drugCond=JSON.parse(JSON.stringify(drugCond));

        if(drugRegionCond&&drugRegionCond['$or'].length>0){
            drugCond['$and'].push(drugRegionCond);
        }

        if(activityRegionCond&&activityRegionCond['$or'].length>0){
            activityCond['$and'].push(activityRegionCond);
        }


        let self = this;
        return co(function* () {
            if (drugIds.length > 0) {
                activityCond['$and'].push({'drugs.drugId': {$in: drugIds}});

                drugCond['$and'].push({drugId: {$in: drugIds}});
            }
            if(drugCond['$and'].length==0){
                drugCond={};
            }
            if(activityCond['$and'].length==0){
                activityCond={};
            }
            //参加活动的药品
            let userDrugActivity = yield self.getDrugActivityByCond(activityCond, pageParams.pageSlice);
            let fullAndSub = [], buyAndSend = [];//满就减、买就送
            for (let key in userDrugActivity) {
                if (userDrugActivity[key].type == 1) {
                    fullAndSub.push(userDrugActivity[key]);
                } else if (userDrugActivity[key].type == 2) {
                    buyAndSend.push(userDrugActivity[key])
                }
            }


            //参加补贴的药品
            let userDrugAllowance = [];
            if (userDrugActivity.length < pageParams.pageSize) {
                let activityCount = yield self.getDrugActivityCount(activityCond);
                let page = self.calculatePage( activityCount,userDrugActivity.length, pageParams.pageSize, pageParams.pageNum);
                pageParams.pageSlice.limit = page.limit;
                pageParams.pageSlice.skip = page.skip;
                if(pageParams.pageSlice.limit>0){
                    if (drugCond['$and'].length == 0) {
                        delete drugCond['$and'];
                    }
                    userDrugAllowance = yield FactoryDrugRelService.getFactoryDrugRel(drugCond, {}, pageParams.pageSlice);
                }
            }


            let retData = [];
            fullAndSub.forEach(function (item) {
                retData.push({
                    _id: item._id,
                    name: item.name,
                    planName: item.tag,
                    images: item.imgs,
                    type: 'fullAndSub'
                });
            });
            buyAndSend.forEach(function (item) {
                retData.push({
                    _id: item._id,
                    name: item.name,
                    planName: item.tag,
                    images: item.imgs,
                    type: 'buyAndSend'
                });
            });


            let drugIdsOfAllowance = [];
            userDrugAllowance.forEach(function (item) {
                drugIdsOfAllowance.push(item.drugId);
            })
            let drugInfo = yield DrugService.getDrugList({_id: {$in: drugIdsOfAllowance}});

            let drugMap = _.indexBy(drugInfo, '_id');

            for(let key in userDrugAllowance){
                if (userDrugAllowance[key] && userDrugAllowance[key]._id) {
                    retData.push({
                        _id: userDrugAllowance[key]._id,
                        name: userDrugAllowance[key].drugName,
                        planName: '返现' + userDrugAllowance[key].reimbursePrice + '元',
                        images: drugMap[userDrugAllowance[key].drugId].images,
                        type: 'buyAndCashback'
                    });
                }
            }

            return retData;
        });
    },
    /**
     * 分页：数据先从第一个表中获取，当取尽的时候，从第二个表中获取，满足一页pageSize
     * @param firstCount
     * @param firstCurrentCount
     * @param pageSize
     * @param pageNum
     * @returns {{skip: number, limit: number}}
     */
    calculatePage: function (firstCount, firstCurrentCount, pageSize, pageNum) {
        let skip = 0, limit = 0;
        if (firstCurrentCount < pageSize) {
            limit = pageSize - firstCurrentCount;
            if (pageNum * pageSize > firstCount) {
                skip = pageNum* pageSize - firstCount;
            }
        }
        return {skip: skip, limit: limit}
    }
}