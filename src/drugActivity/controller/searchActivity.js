'user strict';
const commonUtil = require('../../../lib/common-util'),
    group_service = Backend.service('user_group', 'group'),
    DrugActivityService = Backend.service('drugActivity', 'drugActivity'),
    DrugGroupModel = Backend.model('drugActivity', undefined, 'drugGroup'),
    _ = require('underscore'),
    co = require('co');


module.exports = {
    __rule: function (valid) {
        return valid.object({});
    },
    mockAction: function () {
        let resObj = {
            code: '200',
            msg: '',
            sorts: ['我的收藏', '高血压'],
            items: [{
                _id: '5af8ebda0dd25d1555888f97',
                name: '经典护眼仪',
                planName: '送枣花花蜜一瓶100ml',
                images: ['https://cdn.juliye.net/FlX1gSH9mt7gTWH4FrslnaNO-TPF'],
                type: 'buyAndSend'
            }]

        };
        return this.success(resObj);
    },

    getAction: function () {
        let self = this;
        let req = self.req;
        let userId = req.headers['x-docchat-user-id'] || '';

        let pageNum = Number(req.query.pageNum || 0);
        let pageSize = Number(req.query.pageSize || 20);


        let pageSlice = commonUtil.getCurrentPageSlice(req, pageNum, pageSize);
        let pageParams = {pageNum: pageNum, pageSize: pageSize, pageSlice: pageSlice};
        // pageSlice.sort = {};

        let type = req.query.type;
        let name = req.query.name;
        let sortName = req.query.sortName;

        let activityCond = {$and: []}, drugCond = {$and: []};//去掉balanceVal字段

        let drugRegionCond = {$or: []}, activityRegionCond = {$or: []};
        if (type && name) {
            drugRegionCond['$or'].push({'region': []});
            switch (type) {
                case 'province':
                    drugRegionCond['$or'].push({'region.province': new RegExp(name, 'i')});
                    activityRegionCond['$or'].push({'province': new RegExp(name, 'i')});
                    break;
                case 'city':
                    drugRegionCond['$or'].push({'region.city': new RegExp(name, 'i')});
                    activityRegionCond['$or'].push({'city': new RegExp(name, 'i')});
                    break;
                case 'county':
                    type = 'district';
                    drugRegionCond['$or'].push({'region.district': new RegExp(name, 'i')});
                    activityRegionCond['$or'].push({'district': new RegExp(name, 'i')});
                    break;
            }
        }

        let result = co(function* () {
            const DEFAULTSORT = '推荐';
            let retData = {code: '200', msg: '', sorts: [], items: []};
            // if (activityRegionCond['$or'].length > 0) {
            //     activityCond['$and'].push(activityRegionCond);
            // }
            // if (drugRegionCond['$or'].length > 0) {
            //     drugCond['$and'].push(drugRegionCond);
            // }

            let groupCond = {$or: [{userGroupId: null}]}, userGroupIds = [];
            if (userId) {
                userGroupIds = yield group_service.getGroupPlanDrugs(userId);
            }

            groupCond['$or'].push({userGroupId: {$in: userGroupIds}});

            if (groupCond['$or'].length > 0) {
                drugCond['$and'].push(groupCond)
            }

            let userCollectionDrugIds = [], userActivity = [];
            //分类不存在，需传回分类数组
            if (!sortName) {
                //有收藏药品，且通过收藏药品查询出了内容
                if (userId) {
                    userCollectionDrugIds = yield DrugActivityService.getCollectionDrugIds(userId);
                }
                userActivity = yield getActivityListOfCollection(activityCond, drugCond, pageParams, userId,drugRegionCond,activityRegionCond);

                if (userCollectionDrugIds.length > 0 && userActivity.length > 0) {
                    retData.sorts.push(DEFAULTSORT);//收藏的药品有活动时，将"推荐"添加到分类中
                }

                let drugGroup = yield DrugGroupModel.methods.getDrugAndGroupByCond({});//查询"推荐"之外的分类

                // 分组里面有活动或补贴，才可以被展示
                for (let key in drugGroup) {
                    let groupActgivity = yield getActivityListOfSearch(activityCond, drugCond, {}, drugGroup[key].name,drugRegionCond,activityRegionCond);
                    if(groupActgivity.length>0){
                        retData.sorts.push(drugGroup[key].name);
                    }
                }


                    if (retData.sorts.length == 0) {//分类为空，查询所有内容
                        userActivity = yield getAllActivityListOfSearch(activityCond, drugCond, pageParams,drugRegionCond,activityRegionCond);
                        retData.items = userActivity;
                    } else if (retData.sorts[0] == DEFAULTSORT) {//分类的第一组是"推荐",查询收藏的分类
                        userActivity = yield getActivityListOfCollection(activityCond, drugCond, pageParams, userId,drugRegionCond,activityRegionCond);
                        retData.items = userActivity;

                    } else {//按照查询条件查询
                        userActivity = yield getActivityListOfSearch(activityCond, drugCond, pageParams, retData.sorts[0],drugRegionCond,activityRegionCond);
                        retData.items = userActivity;
                    }

            } else {//分类存在
                if (sortName == DEFAULTSORT) {//查询的是"推荐"分组
                    userActivity = yield getActivityListOfCollection(activityCond, drugCond, pageParams, userId,drugRegionCond,activityRegionCond);
                    retData.items = userActivity;
                } else {//其它分组
                    userActivity = yield getActivityListOfSearch(activityCond, drugCond, pageParams, sortName,drugRegionCond,activityRegionCond);
                    retData.items = userActivity;
                }
            }



            return self.success(retData);
        }).catch(function (err) {
            console.log(err)
        });
        return result;
    }
};

/**
 * "推荐"时的查询
 * @param activityCond
 * @param drugCond
 * @param pageParams
 * @param userId
 */
function getActivityListOfCollection(activityCond, drugCond, pageParams, userId,drugRegionCond,activityRegionCond) {
    let result = co(function* () {
        let userCollectionDrugIds = [];
        if (userId) {
            userCollectionDrugIds = yield DrugActivityService.getCollectionDrugIds(userId);
        }
        let userActivity = yield DrugActivityService.getActivityList(activityCond, drugCond, userCollectionDrugIds, pageParams,drugRegionCond,activityRegionCond);
        return userActivity;
    });
    return result;
}

/**
 * 按照分组参数查询
 * @param activityCond
 * @param drugCond
 * @param pageParams
 *  @param sortName
 * @returns {*}
 */
function getActivityListOfSearch(activityCond, drugCond, pageParams, sortName,drugRegionCond,activityRegionCond) {
    let result = co(function* () {
        let drugGroupCond = {}, drugIdsOfActivity = [];
        if (sortName) {
            drugGroupCond = {'name': new RegExp(sortName, 'i')}
        }
        let drugOfActivity = yield DrugGroupModel.methods.getDrugAndGroupByCond(drugGroupCond);
        drugOfActivity.forEach(function (item) {
            if (item && item.drugInfo.length > 0) {
                item.drugInfo.forEach(function (inner) {
                    if (inner && (inner.isDeleted == false)) {
                        drugIdsOfActivity.push(inner._id + '');
                    }
                })
            }
        });
        let userActivity = yield DrugActivityService.getActivityList(activityCond, drugCond, drugIdsOfActivity, pageParams,drugRegionCond,activityRegionCond);
        return userActivity;
    });
    return result;
}

/**
 * 查询当前地区下的所有活动和维护计划
 * @param activityCond
 * @param drugCond
 * @param pageParams
 * @returns {*}
 */
function getAllActivityListOfSearch(activityCond, drugCond, pageParams,drugRegionCond,activityRegionCond) {
    let result = co(function* () {

        let userActivity = yield DrugActivityService.getActivityList(activityCond, drugCond, [], pageParams,drugRegionCond,activityRegionCond);

        return userActivity;
    });
    return result;
}
