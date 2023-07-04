/**
 * 提现管理
 * @type {_|exports}
 * @private
 */
var
  _ = require('underscore'),
  Q = require("q"),
  commonUtil = require('../../lib/common-util'),
  Application = require('../models/Application'),
  ErrorHandler = require('../../lib/ErrorHandler');

var ApplicationService = function () {
};

ApplicationService.prototype.constructor = ApplicationService;

ApplicationService.prototype.getInfoByID = function (ID) {
  var condition = {};
  condition._id = ID;
  condition.isDeleted = false;

  return Application.findOne(condition).exec();
};

ApplicationService.prototype.createApplication = function (application) {
  return Application.create(application);
};

var findOneAndUpdate = function (query, update, option) {
  var deferred = Q.defer();
  Application.findOneAndUpdate(query, update, option).exec()
    .then(function (c) {
      if (!c) {
        console.log("no coupon match:" + JSON.stringify(query));
        deferred.reject(ErrorHandler.getBusinessErrorByCode(1520));
      } else {
        deferred.resolve(c);
      }
    }, function (err) {
      console.log("Error: " + err);
      deferred.reject(err);
    });

  return deferred.promise;
};

ApplicationService.prototype.updateStatus = function (id, status, reason) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = id;
  condition.isDeleted = false;
  return findOneAndUpdate(condition, {$set: {status: status, reason: reason ,updatedAt: Date.now(),opReviewdAt : Date.now()}});
};

ApplicationService.prototype.updateReceiveMemo = function (id , memo) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = id;
  condition.isDeleted = false;
  return findOneAndUpdate(condition, {$set: {receiveMemo: memo ,updatedAt: Date.now()}});
};

ApplicationService.prototype.findTodayWithdrawByUserId = function (userId,type){
  var todayBegin = new Date(commonUtil.getDateMidnight(Date.now())).getTime();
  var conds = {
    applicantId: userId,
    createdAt: {$gt: todayBegin},
    source: 'docChat',
    isDeleted: false
  };
  if(type)
    conds.type = type;

  return Application.findOne(conds, "_id").exec();
};

ApplicationService.prototype.query = function (conditions, pageSlice, fields, option) {

  conditions.isDeleted = false;
  if(option && option.population){
    return  Application.find(conditions, {}, pageSlice).populate(option.population,'province city hospital department position').exec();
  }
  return Application.find(conditions, {}, pageSlice).exec();
};

ApplicationService.prototype.updateWithdrawal = function (id, status, reason, txnId,opReviewdAt,financialReviewdAt) {

  var conditions = {
    type: 20,
    _id: id,
    isDeleted: false
  };
  var updates = {
    updatedAt: Date.now()
  };
  if(opReviewdAt){
    updates.opReviewdAt = opReviewdAt;
  }
  if(financialReviewdAt){
    updates.financialReviewdAt = financialReviewdAt;
  }
  switch (status) {
    case 2:// 运营通过
      conditions.status = 1;
      updates.status = status;
      break;
    case 3: // 财务通过
      conditions.status = 2;
      updates.status = status;
      break;
    case -2:// 运营拒绝
      conditions.status = 1;
      updates.status = status;
      updates.reason = reason || "";
      break;
    case -3:// 财务拒绝
      conditions.status = 2;
      updates.status = status;
      updates.reason = reason || "";
      break;
    default:
      throw ErrorHandler.getBusinessErrorByCode(8001);
      break;
  }
  console.log('conditions:',conditions);
  return findOneAndUpdate(conditions, updates, {new: true});
};
ApplicationService.prototype.list = function (conditions, pageSlice) {
  "use strict";
  return Application.find(conditions, null, pageSlice).exec();
};

ApplicationService.prototype.findLastShopApplication = function (userId) {
    var conditions = {
        applicantId : userId,
        type : 17,
        isDeleted : false
    }
    return Application.find(conditions).sort({"createdAt" : -1}).limit(1).exec();
};
/*
新版朱李叶健康，提现申请，查找最近的一次记录
 */
ApplicationService.prototype.findLatestOne = function (conditions) {
    // var conditions = {
    //     applicantId : userId,
    //     alipayNum:{$exits:true},
    // }
    conditions.type=20;
    conditions.isDeleted=false;
    return Application.find(conditions).sort({"createdAt" : -1}).limit(1).exec();
}
module.exports = exports = new ApplicationService();
