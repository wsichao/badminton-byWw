/**
 *  缓存服务
 *  1. 单机全局缓存
 *  2. 分布式缓存(Redis)
 *
 *  DocChat-backend
 *  Created by Jacky.L on 1/22/17.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var
  _ = require('underscore'),
  LocalCacheOp = require('../../lib/helper/LocalCacheHelper').crud;

var TIME_CACHE_EXPIRED = 2 * 60 * 60 * 1000; // 缓存有效期
var TIME_CACHE_CLEAN = 3 * 24 * 60 * 60 * 1000; // 缓存池清空间隔

var CacheService = function () {};

CacheService.prototype.constructor = CacheService;

CacheService.prototype.isUserMomentExistsLocal = function (userId, momentId, timeStep) {
  var key = userId + momentId;
  var now = Date.now();
  var old = LocalCacheOp.get(key) || 0;
  //console.log("Key: " + key + "Now: " + now + " Old: " + old);
  return (now - old) < (timeStep || TIME_CACHE_EXPIRED);
};

CacheService.prototype.addUserMomentLocal = function (userId, momentId) {
  // TODO: clean local cache
  var now = Date.now();
  LocalCacheOp.clean(now, TIME_CACHE_CLEAN);
  LocalCacheOp.add(userId + momentId, now);
};
/**
 * 商户最近的扫码记录，5s内是否存在
 * @param userId
 * @returns {boolean}
 */
CacheService.prototype.isVenderCheckinExistsLocal = function (userId) {
  var timeStep = 5000;
  var key = userId + ":customer/coupon/checkin";
  var now = Date.now();
  var old = LocalCacheOp.get(key) || 0;
  //console.log("Key: " + key + "Now: " + now + " Old: " + old);
  return (now - old) < timeStep;
};
/**
 * 通用：用户调用api的频率是否过高
 * @param userId
 * @param api
 * @returns {boolean}
 */
CacheService.prototype.isUserAPIUseOverLimit = function (userId, api) {
  var timeStep = 5000;
  var key = userId + api;
  var now = Date.now();
  var old = LocalCacheOp.get(key) || 0;
  //console.log("Key: " + key + "Now: " + now + " Old: " + old);
  return (now - old) < timeStep;
};
/**
 * 通用：更新用户的api调用限制
 * @param userId
 * @param api
 */
CacheService.prototype.addOrUpdUserApiLimit = function (userId, api) {
  var now = Date.now();
  LocalCacheOp.add(userId + api, now);
};

CacheService.prototype.addOrUpdVenderCheckinExistsLocal = function (userId) {
  // TODO: clean local cache
  var now = Date.now();
  // LocalCacheOp.clean(now, TIME_CACHE_CLEAN);
  LocalCacheOp.add(userId + ":customer/coupon/checkin", now);
};

CacheService.prototype.isTransferExistsLocal = function (userId) {
  var timeStep = 10000;
  var key = userId + ":/order/transfer";
  var now = Date.now();
  var old = LocalCacheOp.get(key) || 0;
  //console.log("Key: " + key + "Now: " + now + " Old: " + old);
  return (now - old) < timeStep;
};

CacheService.prototype.addOrUpdTransferExistsLocal = function (userId) {
  // TODO: clean local cache
  var now = Date.now();
  // LocalCacheOp.clean(now, TIME_CACHE_CLEAN);
  LocalCacheOp.add(userId + ":/order/transfer", now);
};

CacheService.prototype.getValueByKeyLocal = function (key) {
  return LocalCacheOp.get(key) || null;
};

CacheService.prototype.addKeyValueLocal = function (key, value) {
  LocalCacheOp.add(key, value);
};

module.exports = exports = new CacheService();
