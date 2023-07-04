/**
 * Created by yichen on 2017/12/14.
 */



"use strict";
var
  mongodb = require('./../../configs/db'),
  Schema = mongodb.mongoose.Schema;

let servicePackageDoctorAssistantRef = new Schema({
  createdAt: {type: Number, default: Date.now},//用户注册时间
  updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
  isDeleted: {type: Boolean, default: false},//该条记录是否被删除
  statisticsUpdatedAt: {type: Number, default: Date.now},



  doctorId: Schema.ObjectId, //医生id
  assistantId :  Schema.ObjectId, //助理id
}, {
  collection: 'servicePackageDoctorAssistantRef'
});

let ServicePackageDoctorAssistantRef = mongodb.mongoose.model('ServicePackageDoctorAssistantRef', servicePackageDoctorAssistantRef);
module.exports = ServicePackageDoctorAssistantRef;