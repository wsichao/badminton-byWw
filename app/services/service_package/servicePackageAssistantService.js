/**
 * 助理表 service
 * Created by yichen on 2017/12/14.
 */

"use strict";
let servicePackageAssistant = require('./../../models/service_package/servicePackageAssistant');

let servicePackageAssistantService = function () {
};

/**
 * 获取助理信息
 * @param assistantId 助理唯一标识
 * @return {Object|{}}
 */
servicePackageAssistantService.prototype.findAssistant = function (assistantId) {
  let cond = {
    'isDeleted': false,
    '_id': assistantId
  };
  return servicePackageAssistant.findOne(cond);
};
/**
 * 获取助理信息
 * @param phoneNum 助理唯一标识
 * @return {Object|{}}
 */
servicePackageAssistantService.prototype.findAssistantByIds = function (ids) {
  let cond = {
    'isDeleted': false,
    '_id': {$in : ids}
  };
  return servicePackageAssistant.find(cond);
};
module.exports = new servicePackageAssistantService();