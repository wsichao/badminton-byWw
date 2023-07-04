/**
 * 医院科室表
 * Created by Mr.Carry on 2017/12/112
 */
"use strict";
var
  mongodb = require('./../../configs/db'),
  Schema = mongodb.mongoose.Schema;


let servicePackageHospital = new Schema({
  createdAt: {type: Number, default: Date.now},//用户注册时间
  updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
  isDeleted: {type: Boolean, default: false},//该条记录是否被删除
  statisticsUpdatedAt: {type: Number, default: Date.now},

  name: String, //医院名称
  department: [String], //科室
}, {
  collection: 'servicePackageHospital'
});

let ServicePackageHospital = mongodb.mongoose.model('ServicePackageHospital', servicePackageHospital);
module.exports = ServicePackageHospital;