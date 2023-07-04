
/**
 * Created by yichen on 2017/5/25.
 */
'use strict';

var _  = require('underscore')

module.exports = {
  getCouponByCond: function (cond) {
    let CouponModel = Backend.model('common' , undefined, 'coupon');
    return CouponModel.find(cond).exec();
  },
  createCoupon: function (newCoupon) {
    console.log(1111);
    let CouponModel = Backend.model('common' , undefined, 'coupon');
    return CouponModel.create(newCoupon).exec();
  }
}