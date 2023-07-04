let userService = Backend.service('common', 'user_service'),
    collectionCenterService = Backend.service('collectionCenter', 'collectionCenter'),
    commonUtil = require('../../../lib/common-util'),
    FactoryDrugRelService = require('../../../app/services/FactoryDrugRelService'),
    ReimburseService = require('../../../app/services/ReimburseService'),
    DrugService = require('../../../app/services/DrugService'),
    constants = require('../../../app/configs/constants'),
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
        let version = req.headers['x-docchat-app-version'] || '';
        let keys = req.query.keys || '', type = req.query.type || '', name = req.query.name || '',
            pageNum = req.query.pageNum || 0, city = req.query.city || '';
        let url;
        if (version >= '5.5.1') {
            console.log('进入new');
            url = '/1/allowance/searchDrugNew?keys=' + keys + '&type=' + type + '&name=' + name + '&pageNum=' + pageNum;
            // self.res.redirect(encodeURI('/1/allowance/searchDrugNew?keys='+keys+'&type='+type+'&name='+name+'&pageNum='+pageNum+'&timestamp='+Date.now()));
        } else {
            console.log('进入old');
            url = '/1/allowance/searchDrugOld?keys=' + keys + '&city=' + city+'&pageNum=' + pageNum;
            // self.res.redirect('/1/allowance/searchDrugOld?keys='+keys+'&city='+city);
        }
        url += '&timestamp=' + Date.now();
        self.res.redirect(encodeURI(url));
    }
};
