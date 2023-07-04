var
  _ = require('underscore'),
  Q = require("q"),
  commonUtil = require('../../lib/common-util'),
  encrypt = commonUtil.commonMD5,
  serverconfigs = require('../../app/configs/server'),
  constants = require('../configs/constants'),
  Coupon = require('../models/Coupon'),

  ErrorHandler = require('../../lib/ErrorHandler'),
  Promise = require('promise');

var
  logger = require('../configs/logger'),
  filename = 'app/services/AuthService',
  TAG = logger.getTag(logger.categorys.SERVICE, filename);

var CouponService = function () {
};
CouponService.prototype.constructor = CouponService;

CouponService.prototype.createCoupon = function (coupon) {
  return Coupon.create(coupon);
};

CouponService.prototype.createUnionCodeCoupon = function (coupon, couponId) {
  couponId = couponId || commonUtil.getNewObjectId();
  return Coupon.findByIdAndUpdate(constants.UNION_CODE_AUTH_INC_ID, {$inc: {unionCode: 1}}).exec()
    .then(function(_coupon){
      coupon._id = couponId;
      coupon.unionCode = _coupon.unionCode + '' + commonUtil.getRandomNum(10, 99);
      var qrCode = commonUtil.genJuliyeMD5((coupon.boundUserId || '') + (coupon.boundVenderId || '') + coupon._id + coupon.unionCode, false);
      coupon.qrCode = qrCode;
      console.log(_coupon.unionCode, coupon.unionCode);
      return Coupon.create(coupon);
    });

};

CouponService.prototype.createUnionCodeCouponActivity0524 = function (coupon) {
  var couponId = commonUtil.getNewObjectId();
    return Coupon.findOneAndUpdate({_id:constants.ACTIVITY_0524_COUPON_LIMIT_ID,balance:{$gte:0}}, {$inc: {balance: -1}}).exec()
      .then(function(_coupon){
        if(!_coupon){
          deferred.reject(ErrorHandler.getBusinessErrorByCode(2202));
        }
        return Coupon.findByIdAndUpdate(constants.UNION_CODE_AUTH_INC_ID, {$inc: {unionCode: 1}}).exec()
      })
      .then(function(_coupon){
        coupon._id = couponId;
        coupon.unionCode = _coupon.unionCode + '' + commonUtil.getRandomNum(10, 99);
        var qrCode = commonUtil.genJuliyeMD5((coupon.boundUserId || '') + (coupon.boundVenderId || '') + coupon._id + coupon.unionCode, false);
        coupon.qrCode = qrCode;
        console.log(_coupon.unionCode, coupon.unionCode);
        return Coupon.create(coupon);
      });

};

CouponService.prototype.createUnionCodeCouponActivity0526 = function (coupon) {
  var couponId = commonUtil.getNewObjectId();
  return Coupon.findOneAndUpdate({_id:constants.ACTIVITY_0526_COUPON_LIMIT_ID,balance:{$gte:0}}, {$inc: {balance: -1}}).exec()
    .then(function(_coupon){
      if(!_coupon){
        deferred.reject(ErrorHandler.getBusinessErrorByCode(2202));
      }
      return Coupon.findByIdAndUpdate(constants.UNION_CODE_AUTH_INC_ID, {$inc: {unionCode: 1}}).exec()
    })
    .then(function(_coupon){
      coupon._id = couponId;
      coupon.unionCode = _coupon.unionCode + '' + commonUtil.getRandomNum(10, 99);
      var qrCode = commonUtil.genJuliyeMD5((coupon.boundUserId || '') + (coupon.boundVenderId || '') + coupon._id + coupon.unionCode, false);
      coupon.qrCode = qrCode;
      console.log(_coupon.unionCode, coupon.unionCode);
      return Coupon.create(coupon);
    });

};

CouponService.prototype.updateToUnionCodeCoupon9 = function (coupon) {
  return Coupon.findByIdAndUpdate(constants.UNION_CODE_AUTH_INC_ID, {$inc: {unionCode: 1}}).exec()
    .then(function(_coupon){
      var unionCode = _coupon.unionCode + '' + commonUtil.getRandomNum(10, 99);
      var qrCode = commonUtil.genJuliyeMD5((coupon.boundUserId || '') + (coupon.boundVenderId || '') + coupon._id + unionCode, false);
      console.log(unionCode, qrCode);
      var nowTS = Date.now();
      var update = {
        '$set': {
          activityNO: constants.COUPON_ACTIVITYNO_PURCHASE,
          deductedRMB: 6,
          type: 9,
          unionCode: unionCode,
          qrCode: qrCode,
          updatedAt: nowTS,
          validAt: nowTS,
          subTitle: '可以对所有商户使用',
          description: '可以对所有商户使用',
        }
      }

      return Coupon.update({_id: coupon._id},update).exec();
    });

};

CouponService.prototype.createUnionCodeCoupons = function (coupons) {
    return Coupon.findByIdAndUpdate(constants.UNION_CODE_AUTH_INC_ID, {$inc: {unionCode: 1}}).exec()
        .then(function(_coupon){
            coupons.forEach(function(item,index){
              var couponId = commonUtil.getNewObjectId();
              item._id = couponId;
              var min = (index + 1 ) * 10 + 1, max =  (index + 2) * 10;
              item.unionCode = _coupon.unionCode + '' + commonUtil.getRandomNum(min, max);
              var qrCode = commonUtil.genJuliyeMD5((item.boundUserId || '') + (item.boundVenderId || '')+ item._id + item.unionCode, false);
              item.qrCode = qrCode;
            })
            return Coupon.create(coupons);
        });
};

CouponService.prototype.updateCoupon = function (id, update) {
  return Coupon.findOneAndUpdate({_id: id}, update, {new: true}).exec();
};

var findOneAndUpdate = function (query, update, option) {
  var deferred = Q.defer();

  Coupon.findOneAndUpdate(query, update, option).exec()
    .then(function (c) {
      if (!c) {
        console.log("no coupon match:" + JSON.stringify(query));
        deferred.reject(ErrorHandler.getBusinessErrorByCode(1602));
      } else {
        deferred.resolve(c);
      }
    }, function (err) {
      console.log("Error: " + err);
      deferred.reject(err);
    });

  return deferred.promise;
};

/**
 * 查询指定号码是否拿到指定活动的优惠券
 * @param phoneNum
 * @param activityNo
 * @returns {Promise|*}
 */
CouponService.prototype.getCouponByPhoneAndActivityNo = function (phoneNum, activityNo) {
  var condition = {};
  condition.source = 'docChat';
  condition.boundUserPhoneNum = phoneNum;
  condition.activityNO = activityNo;
  condition.isDeleted = false;

  return Coupon.findOne(condition).exec();
};

/**
 * 获得用户的所有优惠券
 * @param userId
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
CouponService.prototype.getAllCouponByUerId = function (userId) {
  var condition = {};
  condition.source = 'docChat';
  condition.boundUserId = userId;
  condition.isDeleted = false;

  return Coupon.find(condition).exec();
};

CouponService.prototype.getCouponInfoById = function (id, option) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = id;
  condition.isDeleted = false;
  var fields = option && option.fields || null;
  return Coupon.findOne(condition, fields).exec();
};

CouponService.prototype.getUsedCommonCouponToday = function (userId) {
  var now = Date.now();
  var dayBeginTS = new Date(commonUtil.dateFormat(now, 'yyyy-MM-dd 00:00:00:000')).getTime();
  var dayEndTS = new Date(commonUtil.dateFormat(now, 'yyyy-MM-dd 23:59:59:999')).getTime();
  var condition = {};
  condition.source = 'docChat';
  condition.boundUserId = userId + '';
  condition.isDeleted = false;
  condition.isConsumed = true;
  condition.type = 9;
  condition.updatedAt = {$lte: dayEndTS, $gte: dayBeginTS};
  condition.shopProp = 0;
  return Coupon.findOne(condition, '_id').exec();
};

CouponService.prototype.getTransferCouponByUserId = function (userId) {
  var condition = {};
  var now = Date.now();
  var nowObj = new Date(now);
  condition.source = 'docChat';
  condition.boundUserId = userId;
  condition.isDeleted = false;
  condition.isConsumed = false;
  condition.$or = [ {type : 5 },{ type : 6,validAt:{$lt:now}},{type : 7,validAt:{$lt:now}}];
  condition.expiredAt = {$gt: now};
  return Coupon.find(condition).sort({"rmb":1}).exec();
};

/**
 * 按面值倒叙排序用户所有有效的优惠券
 * 注：该接口返回所有所有类型的优惠券，在有效期内但不一定能用，如活动券。
 *
 * @param userId
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
CouponService.prototype.getRMBDESCValidAllCouponsByUerId = function (userId) {
  var condition = {};
  condition.source = 'docChat';
  condition.isDeleted = false;
  condition.boundUserId = userId;
  condition.isConsumed = false;
  condition.expiredAt = {$gt: Date.now()};

  return Coupon.find(condition, null, {sort: {rmb: -1}}).exec();
};


/**
 * 历史代金券,按时间倒序
 * @param userId
 * @param pageSlice
 * @returns {Promise|Array|{index: number, input: string}}
 */
CouponService.prototype.getHistoryCoupons = function (userId, pageSlice) {
  //历史代金券
  var condition = {};
  condition.source = 'docChat';
  condition.isDeleted = false;
  condition.boundUserId = userId;
  condition['$or'] = [
    { isConsumed: true },
    { expiredAt: {$lt: Date.now()} },
  ]
  return Coupon.find(condition, null, pageSlice).exec();
};

/**
 * 按面值倒叙排序用户所有有效的电话优惠券
 * 注：该接口返回所有所有类型的优惠券，在有效期内但不一定能用，如活动券。
 *
 * @param userId
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
CouponService.prototype.getRMBDESCValidAllPhoneCouponsByUerId = function (userId) {
  var condition = {};
  condition.source = 'docChat';
  condition.isDeleted = false;
  condition.type = {'$ne': 2};
  condition.boundUserId = userId;
  condition.isConsumed = false;
  condition.expiredAt = {$gt: Date.now()};

  return Coupon.find(condition, null, {sort: {rmb: -1}}).exec();
};

/**
 * 按面值排序(默认升序)用户所有有效并且当前可用的优惠券(不包含购买专属医生的折扣券)
 * 注：活动优惠券的面值大于所有的普通的优惠券，所以拨号以及分账默认都先走活动优惠券
 * @param userId
 * @param isCallSeedDoctor  是否呼叫种子医生(是则可以使用type＝3优惠券)
 * @param sortDESC  降序排列
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
CouponService.prototype.getRMBSortValidUsableAllPhoneCouponsByUerId = function (userId, isCallSeedDoctor, double12Doctor, sortDESC) {
  var condition = {};
  condition.source = 'docChat';
  condition.isDeleted = false;
  condition.boundUserId = userId;
  condition.isConsumed = false;
  condition.expiredAt = {$gt: Date.now()};

  var currentHours = new Date().getHours();
  condition["$or"] = [{"type": 0},
    {
      "type": 1,
      "dateBegin": {$lte: Date.now()},
      "timeBegin": {$lte: currentHours},
      "timeEnd": {$gte: currentHours}
    }
  ];
  if (isCallSeedDoctor)
    condition["$or"].push({"type": 3});
  if (double12Doctor)
    condition["$or"].push({"type": 4});

  return Coupon.find(condition, null, {sort: {rmb: sortDESC ? -1 : 1}}).exec();
};


/**
 * 按面值倒叙排序用户所有有效的普通电话优惠券
 * @param userId
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
CouponService.prototype.getRMBDESCValidGeneralPhoneCouponsByUerId = function (userId) {
  var condition = {};
  condition.source = 'docChat';
  condition.isDeleted = false;
  condition.type = 0;
  condition.boundUserId = userId;
  condition.isConsumed = false;
  condition.expiredAt = {$gt: Date.now()};

  return Coupon.find(condition, null, {sort: {rmb: -1}}).exec();
};

/**
 * 按面值倒叙排序用户所有有效并且当前可用的活动优惠券
 * @param userId
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
CouponService.prototype.getRMBDESCValidUsableActivityPhoneCouponsByUerId = function (userId) {
  var condition = {};
  condition.source = 'docChat';
  condition.isDeleted = false;
  condition.type = 1;
  condition.boundUserId = userId;
  condition.isConsumed = false;
  condition.expiredAt = {$gte: Date.now()};
  condition.dateBegin = {$lte: Date.now()};

  var currentHours = new Date().getHours();
  condition.timeBegin = {$lte: currentHours};
  condition.timeEnd = {$gte: currentHours};

  return Coupon.find(condition, null, {sort: {rmb: -1}}).exec();
};


/**
 * 消费掉优惠券
 * @param id
 * @param userId
 */
CouponService.prototype.consumedCoupon = function (id, deductedRMB) {
  var condition = {"source": "docChat"};
  condition._id = id;
  condition.isDeleted = false;
  condition.isConsumed = false;

  return findOneAndUpdate(condition,
    {isConsumed: true, deductedRMB: deductedRMB, updatedAt: Date.now(), consumedAt: Date.now()},
    {new: true});
};

CouponService.prototype.getDiscountCouponByBoundUserId = function (userId) {
    var condition = {};
    condition.boundUserId = userId;
    condition.isDeleted = false;
    condition.type = 7;

    return Coupon.findOne(condition).exec();
};

/**
 * 获得特定活动的所有优惠券
 * @param activityNO
 * @param pageSlice
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
CouponService.prototype.getActivityAllCoupons = function (activityNO, pageSlice) {
  var condition = {};
  condition.source = 'docChat';
  condition.isDeleted = false;
  condition.activityNO = activityNO;

  return Coupon.find(condition, null, pageSlice).exec();
};

CouponService.prototype.getCouponById = function (id) {
  var condition = {};
  condition._id = id;
  condition.isDeleted = false;
  condition.isConsumed = false;

  return Coupon.findOne(condition).exec();
};

CouponService.prototype.getCouponInfo = function (cond) {
  cond.isDeleted = false;
  return Coupon.findOne(cond).exec();
};

CouponService.prototype.getDiscountCouponByBoundUserId = function (userId) {
    var condition = {};
    condition.boundUserId = userId;
    condition.isDeleted = false;
    condition.type = 7;

    return Coupon.findOne(condition).exec();
};

CouponService.prototype.getVendersWithCoupon = function (boundUserId, venderIds, option) {
  // 自然日
  // 一天最多只能领一次;领过,且未过期,未使用,也不能领
  var now = Date.now();
  var dayBeginTS = new Date(commonUtil.dateFormat(now, 'yyyy-MM-dd 00:00:00:000')).getTime();
  var dayEndTS = new Date(commonUtil.dateFormat(now, 'yyyy-MM-dd 23:59:59:999')).getTime();
  console.log(dayBeginTS, dayEndTS);
  var condition = {
    isDeleted: false,
    type: 8,
    boundUserId: boundUserId,
    boundVenderId: {$in: venderIds},
  };
  condition['$or'] = [
    //今天领过
    {
      createdAt: {$gte: dayBeginTS, $lte: dayEndTS}
    },
    //以前领过,未使用,且为过期
    {
      createdAt: {$lt: dayBeginTS},
      isConsumed: false,
      expiredAt: {$gt: now}
    }
  ];
  var fields = option && option.fields || '_id'
  return Coupon.find(condition, fields).sort({createdAt: -1}).exec();
};
CouponService.prototype.getRandomCoupon  = function (cps, isVenderFirstThree){
  var random = commonUtil.getRandomNum(constants.couponRateInCPS.min * 100, constants.couponRateInCPS.max * 100);
  //console.log('random:', random);
  var randomVal = Math.round((cps || 0) * random / 10) / 10;
  //if(isVenderFirstThree){
  //  return Math.max(randomVal, constants.sysReward);
  //}
  return commonUtil.couponValueRule(randomVal);
}
CouponService.prototype.getRandomTotalVal  = function (cps){
  var random = commonUtil.getRandomNum(constants.couponAndRebateRateInCPS.min * 100, constants.couponAndRebateRateInCPS.max * 100);
  console.log('random:', random);
  var randomVal = Math.round((cps || 0) * random / 10) / 10;
  return randomVal;
}
CouponService.prototype.getVenderRangeCouponVal  = function (cps){
  var maxVal = Math.round(constants.couponRateInCPS.max * cps * 10) / 10;
  var minVal = Math.round(constants.couponRateInCPS.min * cps * 10) / 10;
  return {
    maxVal: commonUtil.couponValueRule(maxVal),
    minVal: commonUtil.couponValueRule(minVal)
  };
}
CouponService.prototype.getCouponByCond  = function (cond){
  return Coupon.findOne(cond).exec();
};

module.exports = exports = new CouponService();