/**
 * Created by lijinxia on 2017/12/12.
 * 服务包签约医生
 */
"use strict";
let
  mongodb = require('./../../configs/db'),
  Schema = mongodb.mongoose.Schema,
  StatisticsHelper = require('../../../lib/StatisticsHelper'),
  hookUpModel = StatisticsHelper.hookUpModel;
let fields = {
  createdAt: {type: Number, default: Date.now},//用户注册时间
  updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
  isDeleted: {type: Boolean, default: false},//该条记录是否被删除
  statisticsUpdatedAt: {type: Number, default: Date.now},


  doctorId: { // 关联的医生账户
    type: Schema.ObjectId,
    ref: 'servicePackageDoctor'
  },
  serviceId: { // 关联的医生账户
    type: Schema.ObjectId,
    ref: 'servicePackage'
  },
  vipPrice: Number,//会员价 实际数值*100
  vipNum: Number,//会员名额
  orderPrice: Number,//预约费用 实际数*100
};

let serviceSignedDoctorsSchema = new Schema(fields, {
  collection: 'serviceSignedDoctors'
});

mongoosePre(serviceSignedDoctorsSchema, 'serviceSignedDoctors');

hookUpModel(serviceSignedDoctorsSchema);
let ServiceSignedDoctors = mongodb.mongoose.model('serviceSignedDoctors', serviceSignedDoctorsSchema);
ServiceSignedDoctors.fields = fields;
ServiceSignedDoctors.publicFields = Object.keys(fields).join(' ');
module.exports = ServiceSignedDoctors;