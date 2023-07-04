'user strict';
let commonUtil = require('../../../lib/common-util'),
    FactoryDrugRelService = require('../../../app/services/FactoryDrugRelService'),
    constants = require('../../../app/configs/constants'),
    DrugService = require('../../../app/services/DrugService'),
    drugService = Backend.service('allowance', 'drugService'),
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
        var city = req.query.city;
        var keys = req.query.keys;
        if (!city) {
            self.fail(3001);
        }
// var cond = {stopPlan: false, balanceVal: {$gt: 0}};
        var cond = {stopPlan: false};//去掉balanceVal字段
        cond.$or = [{area: '全部城市'}, {area: city}];
        if (keys) {
            cond.drugName = new RegExp(keys, 'i');
        }

        console.log('请求参数', cond);
        let result = co(function* () {

            var fdrMap;
            let fdr = yield FactoryDrugRelService.getFactoryDrugRel(cond, {}, pageSlice);

            fdr = JSON.parse(JSON.stringify(fdr));
            var drugIds = _.map(fdr, function (item) {
                console.log('item.drugId', item, item.drugId);
                if (item.drugId) {
                    return item.drugId;
                }
            });

            console.log('drugIds', drugIds);
            let _d = yield DrugService.getDrug({_id: {$in: drugIds}});

            console.log('药品信息', _d);//TODO 这里不能按照药品列表展示了，要按照会员计划循环，把所有的药品补上
            _d = JSON.parse(JSON.stringify(_d));
            let drugMap = _.indexBy(_d, '_id');
            console.log('drugMap', drugMap);
            for (var i = 0; i < fdr.length; i++) {
                fdr[i].planId = fdr[i]._id;
                fdr[i]._id = drugMap[fdr[i].drugId]._id;
                fdr[i].name = drugMap[fdr[i].drugId].name;
                fdr[i].images = drugMap[fdr[i].drugId].images;
                fdr[i].desc = drugMap[fdr[i].drugId].desc;
                fdr[i].packageInfo = drugMap[fdr[i].drugId].packageInfo;
                fdr[i].introduction = constants.Introduction;
            }
            fdr = _.sortBy(fdr, function (item) {
                return -item.reimbursePrice;
            });
            return self.success(fdr);

        }).catch(function (err) {
            console.log(err);
        });
        return result;
    }
};
