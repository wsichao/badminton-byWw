/**
 * 常用就诊人信息
 * Created by yichen on 2018/8/20.
 */

"use strict";

module.exports = {
  config: {
    userId : Backend.Schema.Types.ObjectId, //用户id
    name : String,
    sex : String,
    phoneNum : String,
    birth:Number, //出生日期
    medicalNumber : String, //医疗卡号
    lastMenstruation : Number, //末次月经
    expectedDate : Number , //预产期
    babyBirth : Number, //生产日期
    allergyHistory : String,//过敏史
    note : String //备注
  },
  options: {
    collection: 'commonUsedPatient'
  }
};
