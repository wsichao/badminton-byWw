/**
 * Created by lijinxia on 2017/12/14.
 */
"use strict";
var
    mongodb = require('./../../configs/db'),
    Schema = mongodb.mongoose.Schema,
    StatisticsHelper = require('../../../lib/StatisticsHelper'),
    hookUpModel = StatisticsHelper.hookUpModel;
var fields = {
    createdAt: {type: Number, default: Date.now},//用户注册时间
    updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
    isDeleted: {type: Boolean, default: false},//该条记录是否被删除
    statisticsUpdatedAt: {type: Number, default: Date.now},


    address: String,//地址
    doctorId: Schema.ObjectId,//医生ID

};

var servicePackageDoctorAddressSchema = new Schema(fields, {
    collection: 'servicePackageDoctorAddress'
});

mongoosePre(servicePackageDoctorAddressSchema, 'servicePackageDoctorAddress');

hookUpModel(servicePackageDoctorAddressSchema);
var ServicePackageDoctorAddress = mongodb.mongoose.model('ServicePackageDoctorAddress', servicePackageDoctorAddressSchema);
ServicePackageDoctorAddress.fields = fields;
ServicePackageDoctorAddress.publicFields = Object.keys(fields).join(' ');
module.exports = ServicePackageDoctorAddress;



