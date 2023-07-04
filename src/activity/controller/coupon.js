'use strict';
const co = require('co');
const drug_coupon_service = Backend.service('activity', 'drug_coupon');
module.exports = {
  mockAction(){
    let resObj = {
      code: '200',
      msg: '',
      data: {
        "_id": '1223r2rsfasfd',
        "unionCode": 94,
        "tag": "满50减10",
        "name": "维生素e+c套装",
        "img": "29CF4418-62BF-4C58-B81E-8E341E30D942",
        "couponStartTime": 1525767522457,
        "couponEndTime": 1526372327671,
        "desc": "吃券用于购买维生素e+c套装",
        "drugstore": "心连心店、心连心店、心连心店、心连心店、心连心店、心连心店、心连心店、心连心店"
      }
    };
    return this.success(resObj);
  },
  getAction(){
    const self = this;
    let resObj = {
      code: '200',
      msg: '',
      data: {}
    };
    const query = this.req.query;
    const couponId = query && query.couponId || '';
    const unionCode = query && query.unionCode || '';
    const type = query && query.type || '';
    const identity = this.req.identity;
    const userId = identity.userId;
    let coupon = null;
    return co(function* (){
      if(couponId){
        coupon = yield drug_coupon_service.getDrugCouponById(couponId);
      }else if(unionCode){
        coupon = yield drug_coupon_service.getDrugCouponByUnionCode(unionCode);
      }else{
        return self.fail(2507);
      }
      if(!coupon){
        return self.fail(2501);
      }
      if(type === 'check_coupon'){
        if(coupon.isConsumed){
          return self.fail(2502);
        }
      }
      const activity = coupon.activity;
      if(!activity){
        return self.fail(2506);
      }
      if(type === 'check_coupon'){
        if(activity.couponStartTime > Date.now()){
          return self.fail(2508);
        }
        if(activity.couponEndTime < Date.now()){
          return self.fail(2505);
        }
      }
      resObj.data = {
        "_id": coupon._id,
        "unionCode": coupon.unionCode,
        "type": activity.type,
        "tag": activity.tag || '',
        "name": activity.name || '',
        "img": activity.imgs && activity.imgs[0] || '',
        "couponStartTime": activity.couponStartTime,
        "couponEndTime": activity.couponEndTime,
        "desc": activity.desc || '',
        "drugstore":  activity.drugstore || ''
      };
      return self.success(resObj);
    });
  }
};