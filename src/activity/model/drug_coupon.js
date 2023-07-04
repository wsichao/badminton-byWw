/**
 *
 * 药品优惠券
 * Created by zhenbo on 2018/5/15.
 */


"use strict";
const ObjectId = Backend.Schema.ObjectId;
module.exports = {
  config: {
    userId: ObjectId, //领取优惠券的用户
    activityId: { //优惠券对应的活动ID
      type: ObjectId
    },
    activity: { //活动信息，冗余activity的全部信息
      type: Object
    },
    unionCode: { //优惠码
      type: String
    },
    isConsumed: {
      type: Boolean,
      default: false
    },
    consumedAt: Number, //优惠券被使用时间
    consumedBy: { //优惠券被谁收取
      type: ObjectId
    },

  },
  options: {
    collection: 'drugCoupon'
  }
};