'user strict';
let userService = Backend.service('common', 'user_service'),
    collectionCenterService = Backend.service('collectionCenter', 'collectionCenter'),
    commonUtil = require('../../../lib/common-util'),
    FactoryDrugRelService = require('../../../app/services/FactoryDrugRelService'),
    ReimburseService = require('../../../app/services/ReimburseService'),
    DrugService = require('../../../app/services/DrugService'),
    constants = require('../../../app/configs/constants'),
    drugService = Backend.service('allowance', 'drugService'),
    group_service = Backend.service('user_group', 'group'),
    _ = require('underscore'),
    co = require('co');


module.exports = {
    __rule: function (valid) {
        return valid.object({});
    },
    mockAction: function () {
        let resObj = [
            {
                "_id": "5acc5b9755a8503306fd585c",
                "user": "58cf7ee535a02b0b0a72ceca",
                "type": "1",
                "planId": "5aaa42230dd25d093b708608",
                "drugId": "5acc5b9755a8503306fd585c",
                "statisticsUpdatedAt": 1523342776603,
                "updatedAt": 1523342231260,
                "createdAt": 1523342231260,
                "isDeleted": false,
                "__v": 0,
                "factoryName": "121411点厂家",
                "planName": "test_wy",
                "normalCount": 1,
                "leastCount": 1,
                "maxCount": 1,
                "memberCount": 1,
                "remark": "123",
                "factoryCode": 483560,
                "drugName": "感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒",
                "reimbursePrice": 200,
                "region": [
                    {
                        "province": "辽宁省",
                        "provinceId": "5aaa42230dd25d093b708607",
                        "city": "丹东市",
                        "cityId": "5aaa42230dd25d093b708606",
                        "district": "东港市",
                        "districtId": "5aaa42230dd25d093b708605"
                    }
                ],
                "name": "感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒感冒",
                "images": [
                    "http://7j1ztl.com1.z0.glb.clouddn.com/o_1c1a800m41pilgfk9d0gof1ss01q.jpg",
                    "http://7j1ztl.com1.z0.glb.clouddn.com/o_1c1a800m41pilgfk9d0gof1ss01q.jpg",
                    "http://7j1ztl.com1.z0.glb.clouddn.com/o_1c1a800m41pilgfk9d0gof1ss01q.jpg"
                ],
                "desc": "的点点滴滴多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多多",
                "packageInfo": "多多多多多多多多多多多",
                "limitCount": 1,
                "isCollected": true
            }
        ];
        return this.success(resObj);
    },

    getAction: function () {
        let self = this;
        let req = self.req;
        let userId = req.headers['x-docchat-user-id'] || '';
        let version = req.headers['x-docchat-app-Version'] || '';

        var pageNum = Number(req.query.pageNum || 0);
        var pageSize = Number(req.query.pageSize || 20);

        var pageSlice = commonUtil.getCurrentPageSlice(req, pageNum, pageSize, {createdAt: -1});
        pageSlice.sort = {};
        // var city = req.query.city;
        var type = req.query.type;
        var name = req.query.name;
        var keys = req.query.keys;

        var cond = {stopPlan: false, $or: [{userGroup: null}]};//去掉balanceVal字段

        if (type && name) {
            cond['$or'] = [{'region': []}];
            switch (type) {
                case 'province':
                    cond['$or'].push({'region.province': new RegExp(name, 'i')});
                    break;
                case 'city':
                    cond['$or'].push({'region.city': new RegExp(name, 'i')});
                    break;
                case 'county':
                    type = 'district';
                    cond['$or'].push({'region.district': new RegExp(name, 'i')});
                    break;
            }
        }

        if (keys) {
            cond.drugName = new RegExp(keys, 'i');
        }
        console.log('请求参数', cond);
        // var fdr, fdrMap;
        var result = co(function* () {
            let userGroupIds = [];
            if (userId) {
                userGroupIds = yield group_service.getGroupPlanDrugs(userId);
            }

            console.log('特殊用户ID', userGroupIds);
            cond['$or'].push({userGroup: {$in: userGroupIds}});
            console.log('查询条件', cond);
            var _fdr = yield FactoryDrugRelService.getFactoryDrugRel(cond, {}, pageSlice);
            pageSlice.sort = {};

            let fdr = JSON.parse(JSON.stringify(_fdr));

            var fdrRange = [];
            for (var i = 0; i < fdr.length; i++) {
                if (fdr[i].rangeUser && fdr[i].rangeUser.length > 0) {
                    fdrRange.push(fdr[i]);
                    fdr.splice(i, 1);
                    i--;
                }
            }

            // console.log('range后的数据', fdrRange.length, fdr.length);
            // //会员维护计划的查询条件
            // //1、已补贴：审核通过，直接查询，查到结果.length=0，删除
            // //2、未补贴：审核未通过、未参加过补贴的，查询审核成功记录.length>0，删除
            // for (var i = 0; i < fdrRange.length; i++) {
            //     // console.log('进入循环');
            //     console.log('freferfer', i, fdrRange[i].rangeUser);
            //     for (var j = 0; fdrRange[i] && fdrRange[i].rangeUser && (j < fdrRange[i].rangeUser.length); j++) {
            //         var fdrRangeCond = {//有一次申请通过，就算通过了
            //             planId: fdrRange[i].rangeUser[j].planId,
            //             user: userId,
            //             auditTime: {
            //                 $gte: fdrRange[i].rangeUser[j].startTime,
            //                 $lte: fdrRange[i].rangeUser[j].endTime,
            //             },
            //             checkStatus: 1
            //         };
            //
            //         var fdrRangeTemp = yield ReimburseService.getReimburse(fdrRangeCond);
            //
            //         console.log('补贴用户信息', i, j, fdrRange[i].rangeUser[j].reimburseStatus, fdrRangeTemp);
            //         // console.log('范围数据', fdrRangeTemp);
            //         if (fdrRange[i].rangeUser[j].reimburseStatus == 1) {//查询已补贴的用户
            //
            //             if (fdrRangeTemp && fdrRangeTemp.length == 0) {//从fdrRange中删除
            //                 fdrRange.splice(i, 1);
            //                 i--;
            //                 console.log('减少', i, j, fdrRange.length);
            //             }
            //         } else if (fdrRange[i].rangeUser[j].reimburseStatus == 2) {
            //             if (fdrRangeTemp && fdrRangeTemp.length > 0) {
            //                 fdrRange.splice(i, 1);
            //                 i--;
            //                 console.log('增加', i, j, fdrRange.length);
            //             }
            //         }
            //         // console.log('第几次',j,fdrRange);
            //     }
            // }

            // console.log('特殊操作的fdr',fdrRange);
            for (var key in fdrRange) {
                fdr.push(fdrRange[key]);
            }
            var drugIds = _.map(fdr, function (item) {
                if (item.drugId) {
                    return item.drugId;
                }
            });

            // console.log('drugIds', drugIds);
            let _d = yield DrugService.getDrug({_id: {$in: drugIds}});

            // console.log('药品信息', _d);//TODO 这里不能按照药品列表展示了，要按照会员计划循环，把所有的药品补上
            _d = JSON.parse(JSON.stringify(_d));
            var drugMap = _.indexBy(_d, '_id');

            var planIds = [];
            // console.log('drugMap', drugMap);
            for (var i = 0; i < fdr.length; i++) {
                fdr[i].planId = fdr[i]._id;
                fdr[i]._id = drugMap[fdr[i].drugId]._id;
                if (fdr[i].planId) {
                    planIds.push(fdr[i].planId + '');
                }
                if (fdr[i]._id) {
                    drugIds.push(fdr[i]._id + '');
                }
                fdr[i].name = drugMap[fdr[i].drugId].name;
                fdr[i].images = drugMap[fdr[i].drugId].images;
                fdr[i].desc = drugMap[fdr[i].drugId].desc;
                fdr[i].packageInfo = drugMap[fdr[i].drugId].packageInfo;
                fdr[i].introduction = constants.Introduction;
            }

            let resObj = yield drugService.drugLimit(userId, drugIds, planIds, fdr);


            let myCollection = yield collectionCenterService.getCollectionCenterCond(userId, planIds, drugIds);
            // console.log('我的查询结果', myCollection);
            for (let item in resObj) {
                resObj[item].isCollected = false;
                for (let col in myCollection) {
                    if ((resObj[item].drugId + '' == myCollection[col].drugId + '') && (resObj[item].planId + '' == myCollection[col].planId + '')) {
                        resObj[item].isCollected = true;
                        break;
                    }
                }
            }
            resObj = _.sortBy(resObj, function (item) {
                return -item.reimbursePrice;
            });
            // console.log('返回的会员维护计划书', resObj.length);
            return self.success(resObj);
        }).catch(function (err) {
            console.log(err)
        });
        return result;
    }
};