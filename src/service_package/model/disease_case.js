/**
 *
 * 病例模型
 *
 *
 * Created by yichen on 2018/7/2.
 */


"use strict";

module.exports = {
  config: {
    servicePackageOrderId :  String,   //服务包订单id
    userId : Backend.Schema.Types.ObjectId,  // 病例所有者id
    checkTime : Number, //检查时间
    selectedReservations  : [String], //以选择预约
    checkDetail : String , //检查详情
    checkImgs : [String] , //资料图片
    memo : String ,//备注
    assistantId : Backend.Schema.Types.ObjectId , //助理id 助理端添加时候 助理的id（sysUser 的 _id）
  },
  options: {
    collection: 'diseaseCase'
  }
};