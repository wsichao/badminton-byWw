'user strict';
let userService = Backend.service('common', 'user_service'),
    collectionCenterService = Backend.service('collectionCenter', 'collectionCenter'),
    commonUtil = require('../../../lib/common-util'),
    ZlycareController = require('../../../app/controllers/ZlycareController'),
    drugService = Backend.service('allowance', 'drugService'),
    constants = require('../../../app/configs/constants'),
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
                "isSaled": true,
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
        // let pageSize = Number(req.query.pageSize || 20);
        // let bookmark = Number(req.query.bookmark || -1);


        let result = co(function* () {
            let collections = yield collectionCenterService.getCollectionCenterList(userId);
            console.log('用户收藏列表', collections);
            collections = JSON.parse(JSON.stringify(collections));
            for (let i=0;i<collections.length;i++) {
                // console.log(collections[i].drugInfo.length);
                if ((collections[i].factoryDrugRelInfo.length > 0) && (collections[i].drugInfo.length > 0)) {
                    collections[i].factoryName = collections[i].factoryDrugRelInfo[0].factoryName;
                    collections[i].planName = collections[i].factoryDrugRelInfo[0].planName;
                    collections[i].planValue = collections[i].factoryDrugRelInfo[0].planValue;
                    collections[i].normalCount = collections[i].factoryDrugRelInfo[0].normalCount;
                    collections[i].leastCount = collections[i].factoryDrugRelInfo[0].leastCount;
                    collections[i].maxCount = collections[i].factoryDrugRelInfo[0].maxCount;
                    collections[i].memberCount = collections[i].factoryDrugRelInfo[0].memberCount;
                    collections[i].remark = collections[i].factoryDrugRelInfo[0].remark;
                    collections[i].factoryCode = collections[i].factoryDrugRelInfo[0].factoryCode;

                    collections[i].drugName = collections[i].drugInfo[0].name;
                    collections[i].reimbursePrice = collections[i].factoryDrugRelInfo[0].reimbursePrice;
                    collections[i].region = collections[i].factoryDrugRelInfo[0].region;
                    collections[i].planId = collections[i].factoryDrugRelInfo[0]._id;
                    collections[i].name = collections[i].drugInfo[0].name;
                    collections[i].images = collections[i].drugInfo[0].images;
                    collections[i].desc = collections[i].drugInfo[0].desc;
                    collections[i].packageInfo = collections[i].drugInfo[0].packageInfo;
                    collections[i].introduction = constants.Introduction;
                    collections[i].drugId = collections[i].drugInfo[0]._id;
                    // collections[i].isCollected = true;
                    delete collections[i].factoryDrugRelInfo;
                    delete collections[i].drugInfo;

                } else {
                    collections.splice(i,1);
                    i--;
                }

            }

            let drugIds = _.map(collections, function (item) {
                return item.drugId;
            });
            let planIds = _.map(collections, function (item) {
                return item.planId;
            });

            let resObj = yield drugService.drugLimit(userId, drugIds, planIds, collections);
            return self.success(resObj);
        }).catch(function (err) {
            console.log(err)
        })

        return result;
    }
};