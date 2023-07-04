'user strict';
let commonUtil = require('../../../lib/common-util'),
    FactoryDrugRelService = require('../../../app/services/FactoryDrugRelService'),
    userService = Backend.service('common', 'user_service'),
    collectionCenterService = Backend.service('collectionCenter', 'collectionCenter'),
    invitationBonusLogService = Backend.service('activity', 'invitation_bonus_log'),
    drugService = Backend.service('allowance', 'drugService'),
    constants = require('../../../app/configs/constants'),
    _ = require('underscore'),
    co = require('co');

console.log(drugService)


module.exports = {
    __rule: function (valid) {
        return valid.object({
            planId: valid.string().required()
        });
    },
    mockAction: function () {
        let resObj = {
            code: '200',
            msg: '',
            data: {
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
        };
        return this.success(resObj);
    },
    getAction: function () {
        let self = this;
        let req = self.req;
        let userId = req.headers['x-docchat-user-id'] || '';
        // let drugId = req.query.drugId;
        let planId = req.query.planId;
        let result = co(function* () {
                let resObj = {code: '200', msg: '', data: {}};

                let factoryInfo = yield FactoryDrugRelService.getFactoryDrugRel({_id: planId});
                if(!factoryInfo||factoryInfo.length==0){
                    return self.fail(2405);
                }
                factoryInfo = JSON.parse(JSON.stringify(factoryInfo[0]));
                factoryInfo.isCollected = false;

                let drugInfo=yield drugService.getOneDrug(factoryInfo.drugId);

                if(!drugInfo){
                    return self.fail(2437);
                }
            console.log('药品信息',drugInfo);
                factoryInfo.planId=factoryInfo._id;
                factoryInfo.drugId=drugInfo._id;
                factoryInfo.drugName=drugInfo.name;
                factoryInfo.name=drugInfo.name;
                factoryInfo.images=drugInfo.images;
                factoryInfo.desc=drugInfo.desc;
                factoryInfo.packageInfo=drugInfo.packageInfo;
                factoryInfo.introduction=constants.Introduction;

                let collect = yield collectionCenterService.getOneCollectionCenter(userId, planId, factoryInfo.drugId);

                if (collect) {
                    factoryInfo.isCollected = true;
                }

                let res = yield drugService.drugLimit(userId, [factoryInfo.drugId], [planId], [factoryInfo]);
                resObj.data = res[0];
                return self.success(resObj);
            }
        ).catch(function (err) {
            console.log(err);
        });
        return result;
    }
};