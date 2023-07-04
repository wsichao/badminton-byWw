/**
 * 城市表 service
 * Created by Mr.Carry on 2017/12/12.
 */
"use strict";
let servicePackageArea = require('./../../models/service_package/servicePackageArea');

let ServicePackageArea = function () {
};


/**
 * 获取搜索用省市县、医生、科室配置信息
 */
ServicePackageArea.prototype.getSearchDefData = function () {
  let cond = {
    'isDeleted': false,
  };
  return servicePackageArea.find(cond)
};


ServicePackageArea.prototype.getByCond = function (cond,param) {
  return servicePackageArea.find(cond,param).exec();
};

module.exports = new ServicePackageArea();

