'use strict';
const co = require('co');
const drug_coupon_service = Backend.service('activity', 'drug_coupon');
let messages_service = Backend.service("1/message", 'messages');
const user_service = Backend.service('common', 'user_service');

module.exports = {
  mockAction(){
    let resObj = {
      code: '200',
      msg: '',
    };
    return this.success(resObj);
  },
  postAction(){
    const self = this;
    let resObj = {
      code: '200',
      msg: '',
    };
    const couponId = this.req.body.couponId;
    const identity = this.req.identity;
    const userId = identity.userId;
    const user = identity.user;
    return co(function* (){
      const isAuditor = yield drug_coupon_service.checkAuditor(user.phoneNum);
      if(!isAuditor){
        return self.fail(2500);
      }
      const coupon = yield drug_coupon_service.getDrugCouponById(couponId);
      if(!coupon){
        return self.fail(2501);
      }
      if(coupon.isConsumed){
        return self.fail(2502);
      }
      const activity = coupon.activity;

      if(!activity){
        return self.fail(2506);
      }
      if(activity.couponStartTime > Date.now()){
        return self.fail(2508);
      }
      if(activity.couponEndTime < Date.now()){
        return self.fail(2505);
      }
      yield drug_coupon_service.consumeCoupon(couponId, userId);
      const coupon_user = yield user_service.getInfoByUserId(coupon.userId, 'pushId');
      if(coupon_user.pushId){
        const extras = {
          contentType: 'check_coupon'
        };
        messages_service.pushMessage(coupon_user.pushId, '优惠成功', extras);
      }
      return self.success(resObj);
    });
  }
};