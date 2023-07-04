/**
 * 服务包医生关系表 service
 * Created by yichen on 2017/12/12.
 */


"use strict";
let servicePackageDoctorRef = require('./../../models/service_package/servicePackageDoctorRef');
let servicePackageOrder = require('./../../models/service_package/servicePackageOrder');

let commonUtil = require('./../../../lib/common-util');

let servicePackageDoctorRefSreivce = function () {
};

/**
 * 获取医生详情
 * @param doctorId 用户唯一标识 非空
 * @return {Object|{}}
 */
servicePackageDoctorRefSreivce.prototype.findRefByDoctorId = function (doctorId) {
  if (!doctorId) {
    throw new Error("医生id不能为空")
  }
  let cond = {
    'isDeleted': false,
    'doctorId': doctorId,
    isShow : {$ne : false}
  };
  return servicePackageDoctorRef.find(cond).sort({sortWeight : -1,vipPrice : 1});
};


/**
 * 根据服务包关系表，查询服务包、医生相关信息
 * @param id
 * @return {Array|{index: number, input: string}}
 */
servicePackageDoctorRefSreivce.prototype.findServicePackage = (id) => {
  return servicePackageDoctorRef.aggregate([
    {'$match': {'_id': commonUtil.getObjectIdByStr(id)}},
    {
      '$lookup':
        {
          'localField': "serviceId",
          'from': "servicePackage",
          'foreignField': "_id",
          'as': "servicePackage"
        }
    },
    {
      '$lookup':
        {
          'localField': "doctorId",
          'from': "servicePackageDoctor",
          'foreignField': "_id",
          'as': "servicePackageDoctor"
        }
    }
  ])
    .exec()
    .then(function (result) {
      let obj = {};
      if (result && result.length > 0) {
        obj = result[0];
        if (obj.servicePackage && obj.servicePackage.length > 0) {
          obj.servicePackage = obj.servicePackage[0];
        } else {
          obj.servicePackage = {};
        }
        if (obj.servicePackageDoctor && obj.servicePackageDoctor.length > 0) {
          obj.servicePackageDoctor = obj.servicePackageDoctor[0];
        } else {
          obj.servicePackageDoctor = {};
        }
      }
      return obj;
    });
};

/**
 * 根据服务包关系表，查询服务包、医生相关信息
 * @param orderId
 * @return {Array|{index: number, input: string}}
 */
servicePackageDoctorRefSreivce.prototype.findServicePackageByOrderId = (orderId) => {
  console.log(orderId)
  return servicePackageOrder.findOne({
    orderId: orderId
  }, '')
    .exec()
    .then((orderDt) => {
      return servicePackageDoctorRef.aggregate([
        {'$match': {'serviceId': commonUtil.getObjectIdByStr(orderDt._id)}},
        {
          '$lookup':
            {
              'localField': "serviceId",
              'from': "servicePackage",
              'foreignField': "_id",
              'as': "servicePackage"
            }
        },
        {
          '$lookup':
            {
              'localField': "doctorId",
              'from': "servicePackageDoctor",
              'foreignField': "_id",
              'as': "servicePackageDoctor"
            }
        }
      ])
        .exec()
        .then(function (result) {
          let obj = {};
          if (result && result.length > 0) {
            obj = result[0];
            if (obj.servicePackage && obj.servicePackage.length > 0) {
              obj.servicePackage = obj.servicePackage[0];
            } else {
              obj.servicePackage = {};
            }
            if (obj.servicePackageDoctor && obj.servicePackageDoctor.length > 0) {
              obj.servicePackageDoctor = obj.servicePackageDoctor[0];
            } else {
              obj.servicePackageDoctor = {};
            }
          }
          return obj;
        });
    })

};
/**
 * 通过医生服务包订单ID，查找医生服务包订单信息
 * @param id
 */
servicePackageDoctorRefSreivce.prototype.findServicePackageDoctorRefById = function (id) {

  let cond = {
    'isDeleted': false,
    '_id': id
  };
  return servicePackageDoctorRef.find(cond).exec();
};

module.exports = new servicePackageDoctorRefSreivce();
