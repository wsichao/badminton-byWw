/**
 * 医生出诊周期 service
 * Created by yichen on 2017/12/12.
 */


"use strict";
let ServicePackageVisitCycle = require('./../../models/service_package/servicePackageVisitCycle');
let mongoose = require('mongoose');

let ServicePackageVisitCycleService = function () {
};

/**
 * 获取医生详情
 * @param id 用户唯一标识 非空
 * @return {Object|{}}
 */
ServicePackageVisitCycleService.prototype.findCycleByDoctorId = function (id) {
    if (!id) {
        throw new Error("医生id不能为空")
    }
    let cond = {
        'isDeleted': false,
        'doctorId': id
    };
    return ServicePackageVisitCycle.find(cond).sort({week:1,timeQuantum:1})
};
/**
 * 关联出诊地点来查询数据
 * @param id
 * @returns {Promise}
 */
ServicePackageVisitCycleService.prototype.findCycleAndAddressByDoctorId = function (id) {
    if (!id) {
        throw new Error("医生id不能为空")
    }
    let cond = {
        'isDeleted': false,
        'doctorId': id
    };
    return ServicePackageVisitCycle.find(cond).exec();
};

ServicePackageVisitCycleService.prototype.findCycleAndAddressByDoctorIdObject= function (doctorId) {


    var cond = {doctorId: mongoose.Types.ObjectId(doctorId), isDeleted: false};

    // cond.isDeleted=false;
    // return ServicePackageVisitCycle.find(cond).populate('addressId','address').exec();


    return ServicePackageVisitCycle.aggregate([{'$match': cond},
        {
            '$lookup': {
                from: 'servicePackageDoctorAddress',
                localField: 'addressId',
                foreignField: '_id',
                as: 'addressInfo'
            }
        }]).exec();
};

ServicePackageVisitCycleService.prototype.findCycleAndAddress= function (doctorId,week,timeQuantum) {

    var cond = {doctorId: mongoose.Types.ObjectId(doctorId),week:week, timeQuantum:Number(timeQuantum),isDeleted: false};

    return ServicePackageVisitCycle.aggregate([{'$match': cond},
        {
            '$lookup': {
                from: 'servicePackageDoctorAddress',
                localField: 'addressId',
                foreignField: '_id',
                as: 'addressInfo'
            }
        }]).exec();
};
module.exports = new ServicePackageVisitCycleService();