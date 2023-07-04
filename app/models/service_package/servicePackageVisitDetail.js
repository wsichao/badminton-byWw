/**
 * Created by lijinxia on 2017/12/15.
 * 出诊明细表
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


    // doctorId: { // 关联的医生账户
    //     type: Schema.ObjectId,
    //     ref: 'servicePackageDoctor'
    // },
    doctorId: Schema.ObjectId,//医生ID
    date: Number,//日期
    timeQuantum: Number,//会员名额
    status:Number,//特定某天某时段出诊状态(停诊、正常出诊) 1正常 2停诊
    startTime:String,//出诊开始时间
    endTime:String,//出诊结束时间
    addressId:Schema.ObjectId,//出诊地址ID
};

var servicePackageVisitDetailSchema = new Schema(fields, {
    collection: 'servicePackageVisitDetail'
});

mongoosePre(servicePackageVisitDetailSchema, 'servicePackageVisitDetail');

hookUpModel(servicePackageVisitDetailSchema);
var ServicePackageVisitDetail = mongodb.mongoose.model('servicePackageVisitDetail', servicePackageVisitDetailSchema);
ServicePackageVisitDetail.fields = fields;
ServicePackageVisitDetail.publicFields = Object.keys(fields).join(' ');
module.exports = ServicePackageVisitDetail;