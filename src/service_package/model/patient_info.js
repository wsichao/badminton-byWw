/**
 * 就诊人信息
 * servicePackageOrder 表的副表
 *
 * Created by yichen on 2018/7/2.
 */

"use strict";

module.exports = {
  config: {
    servicePackageOrder: String, //服务包订单id
    userId: Backend.Schema.Types.ObjectId, //用户id
    buyer: Backend.Schema.Types.ObjectId, // 购买者id
    buyerFrom: String, // 购买者来源 user-普通用户 assistant-助理

    name: String,
    sex: String,
    phoneNum: String,
    birth: Number, //出生日期
    medicalNumber: String, //医疗卡号
    lastMenstruation: Number, //末次月经
    expectedDate: Number, //预产期
    assistantIds: Backend.Schema.Types.ObjectId, //助理id列表
    babyBirth: Number, //生产日期
    allergyHistory: String, //过敏史
    note: String, //备注
    // 选择理由
    chooseReasons: [{
      type: Number,
      enum: [0, 1, 2, 3]
    }],
    // 了解渠道
    understandChannels: [{
      type: Number,
      enum: [0, 1, 2]
    }],
  },
  options: {
    collection: 'patientInfo'
  }
};