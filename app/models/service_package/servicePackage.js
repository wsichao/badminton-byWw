/**
 * 服务包表
 * Created by Mr.Carry on 2017/12/11.
 */
"use strict";
let
  mongodb = require('./../../configs/db'),
  Schema = mongodb.mongoose.Schema;

let servicePackage = new Schema({
  createdAt: {type: Number, default: Date.now},//用户注册时间
  updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
  isDeleted: {type: Boolean, default: false},//该条记录是否被删除
  statisticsUpdatedAt: {type: Number, default: Date.now},
  name: String, //服务包名称
  introduce: String, //一句话总结介绍
  duration: Number, //服务时长
  frequency: Number, //最高预约次数
  icon: String, //服务包图标
  desc: String, //服务包详细描述
}, {
  collection: 'servicePackage'
});

let ServicePackage = mongodb.mongoose.model('ServicePackage', servicePackage);
module.exports = ServicePackage;