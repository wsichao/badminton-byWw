/**
 *
 * 医生出诊周期表
 *
 * Created by yichen on 2017/12/12.
 */



"use strict";
var
  mongodb = require('./../../configs/db'),

  Schema = mongodb.mongoose.Schema;

let servicePackageVisitCycle = new Schema({
  createdAt: {type: Number, default: Date.now},//用户注册时间
  updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
  isDeleted: {type: Boolean, default: false},//该条记录是否被删除
  statisticsUpdatedAt: {type: Number, default: Date.now},


  doctorId: Schema.ObjectId, //医生id
  week: {type: Number, enum: [1, 2, 3, 4, 5, 6, 7]}, //标识周一到周七 1~7
  timeQuantum: {type: Number, enum: [1, 2, 3]}, //出诊时间段(上午中午下午) 1~3
  startTime: {type: String}, //出诊开始时间  "20:12"
  endTime: {type: String, default: ''}, //出诊结束时间  "21:12"

  addressId: Schema.ObjectId //地址id

}, {
  collection: 'servicePackageVisitCycle'
});

let ServicePackageVisitCycle = mongodb.mongoose.model('ServicePackageVisitCycle', servicePackageVisitCycle);
module.exports = ServicePackageVisitCycle;


