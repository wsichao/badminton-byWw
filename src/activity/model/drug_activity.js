/**
 *
 * 满减买送活动
 * Created by zhenbo on 2018/5/15.
 */


"use strict";
const ObjectId = Backend.Schema.ObjectId;
module.exports = {
  config: {
    type: Number, //活动类型, 1 满减活动 2 买就送活动
    name: String, //活动名称
    tag: String, //活动标签
    endTime: Number, //结束时间
    drugs: [], //活动药品列表
    province: String, //省
    provinceId: ObjectId,
    city: String,
    cityId: ObjectId,
    district: String,
    districtId: ObjectId,
    imgs: [], //活动图片
    drugstore: String, //活动药店
    desc: String, //活动介绍
    couponCount: Number, //优惠券数量
    couponType: String, //优惠券类型,活动列表领取－activityList,操作文章领取－article
    couponStartTime: Number, //优惠券有效期 开始时间
    couponEndTime: Number, //优惠券有效期 截止时间
    couponAndArticle: [] //优惠券关联文章id
  },
  options: {
    collection: 'activity'
  }
};