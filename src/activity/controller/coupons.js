'use strict';
const co = require('co');
const ObjectId = require('mongoose').Types.ObjectId;

const drug_coupon_service = Backend.service('activity', 'drug_coupon');
module.exports = {
  mockAction() {
    let resObj = {
      code: '200',
      msg: '',
      items: [
        {
          "_id": '13sdfafasf',
          "state": 0,
          "type": 1,
          "tag": "满50减10",
          "name": "维生素e+c套装",
          "img": "29CF4418-62BF-4C58-B81E-8E341E30D942",
          "couponStartTime": 1525767522457,
          "couponEndTime": 1526372327671,
        },
        {
          "_id": '13sdfafasssf',
          "state": 0,
          "type": 2,
          "tag": "满50减30",
          "name": "维生素e+c2套装",
          "img": "29CF4418-62BF-4C58-B81E-8E341E30D942",
          "couponStartTime": 1525767522457,
          "couponEndTime": 1526372327671,
        },
        {
          "_id": '13sdfafasssf',
          "state": -1,
          "type": 1,
          "tag": "满50减40",
          "name": "维生素e+c3套装",
          "img": "29CF4418-62BF-4C58-B81E-8E341E30D942",
          "couponStartTime": 1525767522457,
          "couponEndTime": 1526372327671,
        },
        {
          "_id": '13sdfafasssf',
          "state": -2,
          "type": 2,
          "tag": "满50减50",
          "name": "维生素e+c4套装",
          "img": "29CF4418-62BF-4C58-B81E-8E341E30D942",
          "couponStartTime": 1525767522457,
          "couponEndTime": 1526372327671,
        }
      ]
    };
    return this.success(resObj);
  },
  getAction() {
    const self = this;
    let resObj = {
      code: '200',
      msg: '',
      items: []
    };
    const identity = this.req.identity;
    const userId = identity.userId;
    const req = this.req.query;
    const pageNum = req.pageNum && Number(req.pageNum)|| 0;
    const pageSize = req.pageSize && Number(req.pageSize) || 20;
    return co(function* () {
      const pagination = {
        skip: pageNum * pageSize,
        limit: pageSize,
        sort: {
          isConsumed: 1,
          'activity.couponEndTime': -1,
          createdAt: -1
        }
      }
      const coupons = yield drug_coupon_service.getDrugCouponsByUserId(userId, '', pagination);
      const items = [];
      coupons.forEach(coupon => {
        const activity = coupon.activity;
        if(!activity) return;
        let state = 0;
        if(coupon.isConsumed){
          state = -1;
        }else if(activity.couponEndTime < Date.now()){
          state = -2;
        }
        items.push({
          "_id": coupon._id,
          "unionCode": coupon.unionCode,
          "state": state,
          "type": activity.type,
          "tag": activity.tag || '',
          "name": activity.name || '',
          "img": activity.imgs && activity.imgs[0] || '',
          "couponStartTime": activity.couponStartTime,
          "couponEndTime": activity.couponEndTime,
        })
      });
      resObj.items = items;
      return self.success(resObj);
    });
  }
};