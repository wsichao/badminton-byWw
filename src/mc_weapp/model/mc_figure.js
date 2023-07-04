/**
 *
 * 数据统计：合作医生数,服务会员数,用户节省金额（万元）
 *
 */


"use strict";
module.exports = {
  config: {
    coDoctorsNum: { type: Number}, //合作医生数
    serviceMemberNum: { type: Number }, //服务会员数
    userSavings: { type: Number}, //用户节省金额（万元）
    isDeleted: { type: Boolean, default: false },//该条记录是否被删除
  }, options: {
    collection: 'mcFigure'
  }
}