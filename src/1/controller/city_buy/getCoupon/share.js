/**
 * Created by yichen on 2017/5/24.
 */

"use strict";
let COUPON_ACTIVITYNO_CASH_0524_7 = '2017051500001';
module.exports = {
  // __beforeAction: function () {
  //   return userInfoAuth(this.req, {
  //     items: []
  //   });
  // },
  /**
   * 1.验证用户信息（header）
   * 2.判断同一设备号
   * 3.判断剩余张数
   * 4.判断是否领取过
   * 5.创建优惠券
   */
  getAction: function () {
    return this.success({});
    var that = this;

    var userId = this.req.identity.userId;
    var user = this.req.identity.user;
    if (!isUUID24bit(userId) || !isExist(user)) {
      return that.fail(8005);
    }
    let deviceService = Backend.service('common', 'deviceCoupon.service');
    let couponService = Backend.service('common', 'coupon.service');
    var result = deviceService.hadDeviceGot(
      user.deviceId,
      userId + '', '', '',
      '4.5.0',
      COUPON_ACTIVITYNO_CASH_0524_7)
      .then((_deviceRes) => {
        if (_deviceRes) {
          throw getBusinessErrorByCode(1503)
        }
        return couponService.getCouponByCond({_id:"591a979def5de8ed051bf26e"})
      })
      .then((_coupon) => {
        if(_coupon.balance <= 0){
          return that.fail(2202);
        }
        var cond = {
          isDeleted : false,
          activityNO : '2017051500001',
          boundUserId : userId
        };
        return couponService.getCouponByCond(cond)
      })
      .then(function(_coupon){
        if(_coupon){
          return that.fail(1531)
        }
        var newCoupon  = {
          activityNO: '2017051500001',
          type: 9,
          title: '7元代金券',
          subTitle: '7元代金券',
          description: '7元代金券',
          manual: '',
          rmb: 7,
          deductedRMB: 7,
          rmbDescription: '¥7',
          expiredAt: Date.now(),
          validAt: Date.now() + (1000 * 60 * 60 * 12 * 7),
          boundUserId: userId,
          boundUserPhoneNum: user.phoneNum,
          orderId: '',
          shopProp: 1,
        }
        return couponService.createCoupon(newCoupon)
      }, function (err) {
        console.log(err);
        commonResponse(that.res, 400, {code:err.code, msg:err.message}, null);
      })




    // let result = seniorMembersService.getSeniorMembers().then(function (_resData) {
    //   return {items: _resData};
    // })

  }
}