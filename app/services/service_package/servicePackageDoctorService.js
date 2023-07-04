/**
 * 服务包医生信息 service
 * Created by yichen on 2017/12/12.
 */


"use strict";
let servicePackageDoctor = require('./../../models/service_package/servicePackageDoctor');

let ServicePackageDoctor = function () {
};

/**
 * 获取医生详情
 * @param userId 用户唯一标识 非空
 * @return {Object|{}}
 */
ServicePackageDoctor.prototype.findDoctorById = function (userId) {
  if (!userId) {
    throw new Error("医生id不能为空")
  }
  let cond = {
    'isDeleted': false,
    '_id': userId
  };
  return servicePackageDoctor.findOne(cond)
    .then(function(doctor){
      doctor = JSON.parse(JSON.stringify(doctor));
      doctor.departmentName = doctor.department;
      doctor.hospitalName = doctor.hospital;
      doctor.preSalesPhone = doctor.preSalesPhone || '4006182273';
      delete doctor.department;
      delete doctor.hospital;
      return doctor;
    })
};
/**
 * 获取多个医生信息
 * @param ids
 * @return {T|{set, expr}|*|{ID, NAME, TAG}|{}}
 */
ServicePackageDoctor.prototype.findDoctorByIds = function (ids) {
  let cond = {
    'isDeleted': false,
    '_id': {$in:ids}
  };
  return servicePackageDoctor.find(cond)
};
/**
 * 通过cmsId获取医生信息
 * @param cmsUserName
 */
ServicePackageDoctor.prototype.findDoctorByCmsId = function (cmsId) {

    let cond = {
        'isDeleted': false,
        'cmsUserName': cmsId
    };
    return servicePackageDoctor.findOne(cond);
};

/**
 * 获取多个医生信息,可指定字段
 * @param ids
 * @return {T|{set, expr}|*|{ID, NAME, TAG}|{}}
 */
ServicePackageDoctor.prototype.getDoctorsByIds = function (ids, fields) {
  let cond = {
    'isDeleted': false,
    '_id': {$in:ids}
  };
  return servicePackageDoctor.find(cond, fields || undefined);
};

/**
 * 通过医院IDs获取所有医生
 * @param hospitalIds
 * @param fields
 */
ServicePackageDoctor.prototype.getDoctorsByHospitalIds = function (hospitalIds, fields) {
  let cond = {
    isDeleted: false,
    hospitalId: {$in: hospitalIds}
  }
  return servicePackageDoctor.find(cond, fields || undefined);
};
module.exports = new ServicePackageDoctor();