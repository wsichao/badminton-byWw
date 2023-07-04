'user strict';
const collectionCenterService = Backend.service('collectionCenter', 'collectionCenter'),
    commonUtil = require('../../../lib/common-util'),
    FactoryDrugRelService = require('../../../app/services/FactoryDrugRelService'),
    DrugService = require('../../../app/services/DrugService'),
    constants = require('../../../app/configs/constants'),
    drugService = Backend.service('allowance', 'drugService'),
    group_service = Backend.service('user_group', 'group'),
    DrugCoupon = Backend.service('activity', 'drug_coupon'),
    DrugActivityService = Backend.service('drugActivity', 'drugActivity'),
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
            items: [{
                "_id": "5acc5b9755a8503306fd585c",
                "user": "58cf7ee535a02b0b0a72ceca",
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
                "isCollected": true,
                "isReceived": false,
                "couponCode": '12312313123',
                "type": 'fullAndSub'
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
        pageSlice.sort = {};

        let type = req.query.type;
        let name = req.query.name;
        let keys = req.query.keys;
        let barCode = req.query.barCode;
        let activityType = req.query.activityType;//fullAndSub-满就减，buyAndSend-买就送，buyAndCashback-购买返现

        let activityCond = {$and: []}, drugCond = {$and: []};//去掉balanceVal字段

        if (keys) {
            activityCond['$and'].push({'name': new RegExp(keys, 'i')});
            drugCond['$and'].push({'drugName': new RegExp(keys, 'i')});
        }

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

            let drugInfo = '', _fdr = '';
            if (activityRegionCond['$or'].length > 0) {
                activityCond['$and'].push(activityRegionCond);
            }
            if (drugRegionCond['$or'].length > 0) {
                drugCond['$and'].push(drugRegionCond);
            }

            let groupCond = {$or: [{userGroupId: null}]}, userGroupIds = [];
            if (userId) {
                userGroupIds = yield group_service.getGroupPlanDrugs(userId);
            }

            groupCond['$or'].push({userGroupId: {$in: userGroupIds}});

            if (groupCond['$or'].length > 0) {
                drugCond['$and'].push(groupCond)
            }

            let activityInfo = [];//活动信息
            if (barCode) {
                drugInfo = yield drugService.getDrugByBarCode(barCode);
                if (!drugInfo) {//药品不存在
                    return self.fail(2437);
                }
                // drugCond.drugId = drugInfo._id;

                //活动查询
                activityCond['$and'].push({'drugs.drugId': drugInfo._id+''});
                activityInfo = yield DrugActivityService.getDrugActivityByCond(activityCond);//不分页，查询所有
                //药品查询
                drugCond['$and'].push({drugId: drugInfo._id});
                _fdr = yield FactoryDrugRelService.getFactoryDrugRel(drugCond);//不分页，查询所有
                // if (!_fdr || (_fdr.length == 0)) {//该药品不在补贴范围，请扫描其他药品
                //     return self.fail(2438);
                // }

            } else {
                if (activityType == 'fullAndSub') {
                    activityCond['$and'].push({type: 1});
                } else if (activityType == 'buyAndSend') {
                    activityCond['$and'].push({type: 2});
                }
                if (activityType!='buyAndCashback'&&(activityCond['$and'].length > 0)) {
                    activityInfo = yield DrugActivityService.getDrugActivityByCond(activityCond, pageSlice);
                }

                // if ((activityType == 'fullAndSub' || activityType == 'buyAndSend')) {
                if (!activityType) {
                    if (activityInfo.length < 20) {
                        let activityCount = yield DrugActivityService.getDrugActivityCount(activityCond);
                        let page = yield DrugActivityService.calculatePage(activityCount, activityInfo.length, pageSize, pageNum);
                        pageSlice.limit = page.limit;
                        pageSlice.skip = page.skip;
                    }
                    _fdr = yield FactoryDrugRelService.getFactoryDrugRel(drugCond, {}, pageSlice);
                }else if(activityType=='buyAndCashback'){
                    _fdr = yield FactoryDrugRelService.getFactoryDrugRel(drugCond, {}, pageSlice);
                }

            }

            let fdr = JSON.parse(JSON.stringify(_fdr));

            let drugIds = _.map(fdr, function (item) {
                if (item.drugId) {
                    return item.drugId;
                }
            });

            let _d = yield DrugService.getDrug({_id: {$in: drugIds}});

            _d = JSON.parse(JSON.stringify(_d));
            let drugMap = _.indexBy(_d, '_id');

            let planIds = [];
            for (let i = 0; i < fdr.length; i++) {
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
                fdr[i].limitCount = fdr[i].maxCount;//用户未登录时，limitCount使用maxCount
                fdr[i].isCollected = false;
            }

            let retDrug = fdr, myCollection = [];
            if (userId) {
                retDrug = yield drugService.drugLimit(userId, drugIds, planIds, fdr);
                myCollection = yield collectionCenterService.getCollectionCenterCond(userId, planIds, drugIds);
            }

            // let limitCountNum = 0;//有补贴名额的计划数
            //购买返现，是否收藏
            for (let item in retDrug) {
                for (let col in myCollection) {
                    if ((retDrug[item].drugId + '' == myCollection[col].drugId + '') && (retDrug[item].planId + '' == myCollection[col].planId + '')) {
                        retDrug[item].isCollected = true;
                        break;
                    }
                }

                // if (retDrug[item].limitCount > retDrug[item].leastCount) {
                //     limitCountNum++;
                // }
            }
            //
            // if (barCode && (limitCountNum == 0)) {//您的该药品补贴数量已用完，请扫描其他药品
            //     return self.fail(2439);
            // }

            retDrug = _.sortBy(retDrug, function (item) {//特殊计划在添加时，会破坏数据库中reimbursePrice的排序
                item.type = 'buyAndCashback';
                return -item.reimbursePrice;
            });


            activityInfo = JSON.parse(JSON.stringify(activityInfo));

            let userCoupon = [];
            console.log('userIduserId',userId);
            if (userId) {
                userCoupon = yield DrugCoupon.getUnusedDrugCouponsByUserId(userId);
            }

            let userCouponMap = _.indexBy(userCoupon, 'activityId');

            let fullAndSub = [], buyAndSend = [];
            //对活动进行分类、是否有优惠券可使用
            for (let i = 0; i < activityInfo.length; i++) {
                activityInfo[i].drugName = activityInfo[i].name;
                activityInfo[i].planName = activityInfo[i].tag;
                activityInfo[i].images = activityInfo[i].imgs;

                if (userCouponMap[activityInfo[i]._id]) {
                    activityInfo[i].isReceived = true;
                    activityInfo[i].couponCode = userCouponMap[activityInfo[i]._id].unionCode;
                } else {
                    activityInfo[i].isReceived = false;
                    activityInfo[i].couponCode = '';
                }
                if (activityInfo[i].type == 1) {
                    activityInfo[i].type = 'fullAndSub';
                    fullAndSub.push(activityInfo[i]);
                } else if (activityInfo[i].type == 2) {
                    activityInfo[i].type = 'buyAndSend';
                    buyAndSend.push(activityInfo[i]);
                }
            }

            //对满就减排序
            fullAndSub = _.sortBy(fullAndSub, function (item) {
                return -item.createdAt;
            });

            //对买就送排序
            buyAndSend = _.sortBy(buyAndSend, function (item) {
                return -item.createdAt;
            });
            //对购买返现排序
            retDrug = _.sortBy(retDrug, function (item) {//特殊计划在添加时，会破坏数据库中reimbursePrice的排序
                return -item.reimbursePrice;
            });


            let retData = [], retActivity = [];

            retActivity = fullAndSub.concat(buyAndSend);
            retData = retActivity.concat(retDrug);

            if (barCode && retData.length == 0) {
                self.fail(2509);//扫码的时候，药品不存在的提示
            }
            return self.success({code: '200', msg: '', items: retData});
        }).catch(function (err) {
            console.log(err)
        });
        return result;
    }
};
