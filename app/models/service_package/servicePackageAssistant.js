/**
 * 助理表
 * Created by yichen on 2017/12/14.
 */


"use strict";
var
  mongodb = require('./../../configs/db'),
  Schema = mongodb.mongoose.Schema;

let servicePackageAssistant = new Schema({
  createdAt: {type: Number, default: Date.now},//用户注册时间
  updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
  isDeleted: {type: Boolean, default: false},//该条记录是否被删除
  statisticsUpdatedAt: {type: Number, default: Date.now},


  name: String, //助理名字
  phoneNum: String,//电话号
  avatar : String,// 头像

  provinceId: String, //省id
  cityId: String,//市id
  gender: String,//性别
  remark: String, //备注
}, {
  collection: 'servicePackageAssistant'
});

let ServicePackageAssistant = mongodb.mongoose.model('ServicePackageAssistant', servicePackageAssistant);
module.exports = ServicePackageAssistant;