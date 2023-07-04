/**
 *
 * 服务包医生
 *
 * Created by yichen on 2017/12/12.
 */


"use strict";
let
  mongodb = require('./../../configs/db'),
  Schema = mongodb.mongoose.Schema;

let servicePackageDoctor = new Schema({
  // source: {type: String, default: 'docChat'},//数据来源: docChat-医聊
  createdAt: {type: Number, default: Date.now},//用户注册时间
  updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
  isDeleted: {type: Boolean, default: false},//该条记录是否被删除
  statisticsUpdatedAt: {type: Number, default: Date.now},


  name : {type: String, default: ''}, //名字
  gender: {type: String, default: ''}, //性别
  avatar : {type: String, default: ''}, //头像
  title : {type: String, default: ''}, //职称
  preSalesPhone : String, //售前电话
  speciality: String, //擅长
  desc: String, //简介
  remark : String, //简介
  provinceId:Schema.ObjectId,//省id
  province:{type: String, default: ''},//省名称
  cityId:Schema.ObjectId,//市id
  city:{type: String, default: ''},//市名称
  townId:Schema.ObjectId,//县id
  town:{type: String, default: ''},//县名称
  hospitalId: Schema.ObjectId, //医院id
  hospital:{type: String, default: ''},//医院名称
  department: {type: String, default: ''}, //科室
  phone : String //手机号 新增字段
}, {
  collection: 'servicePackageDoctor'
});

let ServicePackageDoctor = mongodb.mongoose.model('ServicePackageDoctor', servicePackageDoctor);
module.exports = ServicePackageDoctor;