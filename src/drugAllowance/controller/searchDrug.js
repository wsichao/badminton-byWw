//5.12.0版本
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
        let resObj = {
            code: '200',
            msg: '',
            items: [{
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
            }]
        };
        return this.success(resObj);
    },

    getAction: function () {
        let self = this;
        let req = self.req;
        let userId = req.headers['x-docchat-user-id'] || '';

        var pageNum = Number(req.query.pageNum || 0);
        var pageSize = Number(req.query.pageSize || 20);

        var pageSlice = commonUtil.getCurrentPageSlice(req, pageNum, pageSize);
        pageSlice.sort = {};
        // console.log('pageSlicepageSlice',pageSlice);

        var type = req.query.type;
        var name = req.query.name;
        var keys = req.query.keys;
        let barCode = req.query.barCode;

        // db.factoryDrugRel.find({ isDeleted: false, drugName: /4/i, '$and': [ {$or:[ {region: []},{ 'region.district': /路氹填海区/i } ]},
        //         { $or:[{ userGroupId: null },{userGroupId: { '$in': [] } }] }], stopPlan: false, source: { '$ne': 'zs' } })
        // var cond = {stopPlan: false,$or:[{userGroupId:null}]};//去掉balanceVal字段
        var cond = {$and: []};//去掉balanceVal字段
        // var cond = {stopPlan: false};//去掉balanceVal字段

        let groupCond = {$or: [{userGroupId: null}]}, regionCond = {$or: []};
        // let groupCond={$or:[{userGroupId:null}]},regionCond=[];
        if (type && name) {
            regionCond['$or'].push({'region': []});
            switch (type) {
                case 'province':
                    regionCond['$or'].push({'region.province': new RegExp(name, 'i')});

                    break;
                case 'city':
                    // cond['$and']['$or'].push({'region.city': new RegExp(name, 'i')});
                    regionCond['$or'].push({'region.city': new RegExp(name, 'i')});
                    break;
                case 'county':
                    type = 'district';
                    // cond['$and']['$or'].push({'region.district': new RegExp(name, 'i')});
                    regionCond['$or'].push({'region.district': new RegExp(name, 'i')});
                    break;
            }
        }

        if (keys) {
            cond.drugName = new RegExp(keys, 'i');
        }


        // var fdr, fdrMap;
        var result = co(function* () {
            let drugInfo = '', _fdr = '';
            let userGroupIds = [];
            if (userId) {
                userGroupIds = yield group_service.getGroupPlanDrugs(userId);
            }
            console.log('userGroupIds', userGroupIds)

            // console.log('特殊用户ID',userGroupIds);
            // cond['$and'].push({userGroupId:{$in:userGroupIds}});
            groupCond['$or'].push({userGroupId: {$in: userGroupIds}})
            console.log('查询条件', groupCond, regionCond);
            if (groupCond['$or'].length > 0) {
                cond['$and'].push(groupCond)
            }
            if (regionCond['$or'].length > 0) {
                cond['$and'].push(regionCond)
            }

            if (barCode) {
                drugInfo = yield drugService.getDrugByBarCode(barCode);
                // console.log('药品信息', drugInfo);
                if (!drugInfo) {//药品不存在
                    return self.fail(2437);
                }
                cond.drugId = drugInfo._id;
                _fdr = yield FactoryDrugRelService.getFactoryDrugRel(cond);//不分页，查询所有
                if (!_fdr || (_fdr.length == 0)) {//该药品不在补贴范围，请扫描其他药品
                    return self.fail(2438);
                }

            } else {
                _fdr = yield FactoryDrugRelService.getFactoryDrugRel(cond, {}, pageSlice);

            }

            // console.log('请求参数', cond);
            let fdr = JSON.parse(JSON.stringify(_fdr));

            var drugIds = _.map(fdr, function (item) {
                if (item.drugId) {
                    return item.drugId;
                }
            });

            let _d = yield DrugService.getDrug({_id: {$in: drugIds}});

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
                fdr[i].limitCount = fdr[i].maxCount;//用户未登录时，limitCount使用maxCount
                fdr[i].isCollected = false;
            }

            let resObj = fdr, myCollection = [];
            if (userId) {
                resObj = yield drugService.drugLimit(userId, drugIds, planIds, fdr);
                myCollection = yield collectionCenterService.getCollectionCenterCond(userId, planIds, drugIds);
            }

            let limitCountNum = 0;//有补贴名额的计划数
            for (let item in resObj) {
                for (let col in myCollection) {
                    if ((resObj[item].drugId + '' == myCollection[col].drugId + '') && (resObj[item].planId + '' == myCollection[col].planId + '')) {
                        resObj[item].isCollected = true;
                        break;
                    }
                }

                // if (resObj[item].limitCount > 0) {
                if (resObj[item].limitCount > resObj[item].leastCount) {
                    limitCountNum++;
                }
            }

            if (barCode && (limitCountNum == 0)) {//您的该药品补贴数量已用完，请扫描其他药品
                return self.fail(2439);
            }

            resObj = _.sortBy(resObj, function (item) {//特殊计划在添加时，会破坏数据库中reimbursePrice的排序
                return -item.reimbursePrice;
            });
            // console.log('返回的会员维护计划书', resObj.length);
            return self.success({code: '200', msg: '', items: resObj});
        }).catch(function (err) {
            console.log(err)
        });
        return result;
    }
};
