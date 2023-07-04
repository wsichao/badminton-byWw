/**
 * Created by Mr.Carry on 2017/12/12.
 */
"use strict";
let servicePackageHospital = require('./../../models/service_package/servicePackageHospital');

let ServicePackageHospital = function () {
};

/**
 * 根据id获取医院集合
 * @param ids 医院id
 * @return {T|{set, expr}|*|{ID, NAME, TAG}|{}}
 */
ServicePackageHospital.prototype.findByIds = function (ids) {
  ids = ids || [];
  let cond = {
    'isDeleted': false,
    '_id': {
      '$in': ids
    }
  };
  return servicePackageHospital
    .find(cond, 'name department');
};

module.exports = new ServicePackageHospital();


