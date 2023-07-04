/**
 * 服务包 service
 * Created by Mr.Carry on 2017/12/11.
 */
"use strict";
let servicePackage = require('./../../models/service_package/servicePackage');
let servicePackageDoctorRef = require('./../../models/service_package/servicePackageDoctorRef');

let ServicePackageService = function () {
};

/**
 * 获取全部服务包信息
 * @return {T|{set, expr}|*|{ID, NAME, TAG}|{}}
 */
ServicePackageService.prototype.findAll = () => {
  let cond = {
    'isDeleted': false
  };
  return servicePackageDoctorRef.find(cond)
    .then(function (dt) {
      let serviceIds = dt.map(function (dt) {
        return dt.serviceId;
      });
      cond['_id'] = {'$in': serviceIds};
      return servicePackage
        .find(cond, 'name introduce icon')
        .sort({'createdAt': -1});
    });

};

/**
 * 获取服务包信息
 * @param id
 */
ServicePackageService.prototype.get = (id) => {
  if (!id) {
    throw new Error("服务包id不能为空")
  }
  let cond = {
    'isDeleted': false,
    '_id': id
  };
  return servicePackage.findOne(cond, 'name icon desc duration createdAt')
    .exec()
    .then((res) => {
      return res || {
        "_id": "",
        "name": "",
        "icon": "",
        "desc": "",
        "duration": "",
        "createdAt": ""

      }
    });
};

/**
 * 获取服务包信息
 * @param ids
 */
ServicePackageService.prototype.findPackageServicesByIds = (ids) => {
  let cond = {
    'isDeleted': false,
    '_id': {$in: ids}
  };
  return servicePackage.find(cond, 'name icon desc')
    .exec()
};

module.exports = new ServicePackageService();