/**
 * Created by yichen on 2017/5/15.
 */

var
  constants = require('../configs/constants'),
  commonUtil = require("../../lib/common-util"),
  OrderService = require("../services/OrderService"),
  ErrorHandler = require('../../lib/ErrorHandler'),
  _ = require('underscore'),
  apiHandler = require('../configs/ApiHandler'),
  CouponService = require('../services/CouponService'),
  LoggerService = require('../services/LoggerService'),
  CustomerService = require('../services/CustomerService'),
  MembershipService = require('../services/MembershipService'),
  ValidateService = require('../services/ValidateService');

var ActivityController = function () {
};
/**
 *
 * @param req
 * @param res
 */
ActivityController.prototype.getCoupon170524 = function (req, res) {
  var userId = req.identity ? req.identity.userId : '';
  var user = req.identity && req.identity.user ? req.identity.user : null;
  if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }
  CustomerService.hasTheDeviceGot(
    user.deviceId,
    userId + '', '', '',
    '4.5.0',
    constants.COUPON_ACTIVITYNO_CASH_0524_7)
    .then(function (_deviceRes) {
      if (_deviceRes) {
        throw ErrorHandler.getBusinessErrorByCode(2115);
      }
     return CouponService.getCouponByCond({_id:constants.ACTIVITY_0524_COUPON_LIMIT_ID})
    })
    .then(function(_coupon){
      if(_coupon.balance <= 0){
        throw ErrorHandler.getBusinessErrorByCode(2202);
      }
      var cond = {
        isDeleted : false,
        activityNO : constants.COUPON_ACTIVITYNO_CASH_0524_7,
        boundUserId : userId
      };
      return CouponService.getCouponByCond(cond);
    })
    .then(function(_coupon){
      if(_coupon){
        throw ErrorHandler.getBusinessErrorByCode(1531);
      }
      var newCoupon  = {
        activityNO: constants.COUPON_ACTIVITYNO_CASH_0524_7,
        type: 9,
        title: constants.COUPON_ACTIVITYNO_CASH_0524_TITLE_7,
        subTitle: constants.COUPON_ACTIVITYNO_CASH_0524_SUBTITLE_7,
        description: constants.COUPON_ACTIVITYNO_CASH_0524_SUBTITLE_7,
        manual: '',
        rmb: constants.COUPON_ACTIVITYNO_CASH_0524_RMB_7,
        deductedRMB: constants.COUPON_ACTIVITYNO_CASH_0524_RMB_7,
        rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_CASH_0524_RMB_7,
        expiredAt: constants.COUPON_ACTIVITYNO_CASH_0524_EXPIREDAT_7,
        validAt: constants.COUPON_ACTIVITYNO_CASH_0524_VALIDAT_7,
        boundUserId: userId,
        boundUserPhoneNum: user.phoneNum,
        orderId: '',
        shopProp: 1,
      }
      return CouponService.createUnionCodeCouponActivity0524(newCoupon);
    })
    .then(function(_coupon){
      apiHandler.OK(res, {});
      LoggerService.trace(LoggerService.getTraceDataByReq(req));
    }, function (err) {
      apiHandler.handleErr(res, err);
    })
};


ActivityController.prototype.getCouponInWX170524 = function (req, res) {
  var phoneNum =  req.query.phoneNum || '';
  if(!commonUtil.isValidPhone){
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }
  var user;
  CustomerService.getInfoByPhone(phoneNum)
    .then(function(_user){
      if(!_user){
        return CustomerService.validUser(phoneNum, null, null, "Activity0524");
      }else{
        return _user;
      }
    })
    .then(function(_user){
      user = _user;
      console.log(_user._id)
      var cond = {
        isDeleted : false,
        activityNO : constants.COUPON_ACTIVITYNO_CASH_0524_7,
        boundUserId : _user._id
      };
      return CouponService.getCouponByCond(cond);
    })
    .then(function(_coupon) {
      if (_coupon) {
        throw ErrorHandler.getBusinessErrorByCode(1601);
      }
      return CouponService.getCouponByCond({_id: constants.ACTIVITY_0524_COUPON_LIMIT_ID})
    })
    .then(function(_coupon){
      if(_coupon.balance <= 0){
        throw ErrorHandler.getBusinessErrorByCode(2202);
      }
      var newCoupon  = {
        activityNO: constants.COUPON_ACTIVITYNO_CASH_0524_7,
        type: 9,
        title: constants.COUPON_ACTIVITYNO_CASH_0524_TITLE_7,
        subTitle: constants.COUPON_ACTIVITYNO_CASH_0524_SUBTITLE_7,
        description: constants.COUPON_ACTIVITYNO_CASH_0524_SUBTITLE_7,
        manual: '',
        rmb: constants.COUPON_ACTIVITYNO_CASH_0524_RMB_7,
        deductedRMB: constants.COUPON_ACTIVITYNO_CASH_0524_RMB_7,
        rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_CASH_0524_RMB_7,
        expiredAt: constants.COUPON_ACTIVITYNO_CASH_0524_EXPIREDAT_7,
        validAt: constants.COUPON_ACTIVITYNO_CASH_0524_VALIDAT_7,
        boundUserId: user._id,
        boundUserPhoneNum: user.phoneNum,
        orderId: '',
        shopProp: 1,
        from:'wx'
      }
      return CouponService.createUnionCodeCouponActivity0524(newCoupon);
    })
    .then(function(_coupon){
      apiHandler.OK(res, {});
      LoggerService.trace(LoggerService.getTraceDataByReq(req));
    }, function (err) {
      apiHandler.handleErr(res, err);
    })
};

ActivityController.prototype.getCouponInWX170526 = function (req, res) {
  var phoneNum = req.query.phoneNum || '';
  var authCode = req.query.authCode;
  if(!authCode){
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }
  if(!commonUtil.isValidPhone){
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }
  var user;
  var now = Date.now();
  ValidateService.validateByPhone(phoneNum, authCode)
    .then(function(){
      return CustomerService.getInfoByPhone(phoneNum)
    })
    .then(function(_user){
      if(!_user){
        return CustomerService.validUser(phoneNum, null, null, "Activity0526");
      }else{
        return _user;
      }
    })
    .then(function(_user){
      user = _user;
      var cond = {
        isDeleted : false,
        activityNO : constants.COUPON_ACTIVITYNO_CASH_0526_5,
        boundUserId : _user._id
      };
      return CouponService.getCouponByCond(cond);
    })
    .then(function(_coupon) {
      if (_coupon) {
        throw ErrorHandler.getBusinessErrorByCode(1601);
      }
      return CouponService.getCouponByCond({_id: constants.ACTIVITY_0526_COUPON_LIMIT_ID})
    })
    .then(function(_coupon){
      if(_coupon.balance <= 0){
        throw ErrorHandler.getBusinessErrorByCode(2202);
      }
      var newCoupon  = {
        activityNO: constants.COUPON_ACTIVITYNO_CASH_0526_5,
        type: 9,
        title: constants.COUPON_ACTIVITYNO_CASH_0526_TITLE_5,
        subTitle: constants.COUPON_ACTIVITYNO_CASH_0526_SUBTITLE_5,
        description: constants.COUPON_ACTIVITYNO_CASH_0526_SUBTITLE_5,
        manual: '',
        rmb: constants.COUPON_ACTIVITYNO_CASH_0526_RMB_5,
        deductedRMB: constants.COUPON_ACTIVITYNO_CASH_0526_RMB_5,
        rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_CASH_0526_RMB_5,
        expiredAt: new Date(commonUtil.getDateMidnight(now + constants.TIME7D)).getTime() - 1,
        validAt: now,
        boundUserId: user._id,
        boundUserPhoneNum: user.phoneNum,
        orderId: '',
        from:'wx'
      }
      return CouponService.createUnionCodeCouponActivity0526(newCoupon);
    })
    .then(function(_coupon){
      apiHandler.OK(res, {});
      LoggerService.trace(LoggerService.getTraceDataByReq(req));
    }, function (err) {
      apiHandler.handleErr(res, err);
    })
};

ActivityController.prototype.getCoupon170526 = function (req, res) {
  var userId = req.identity ? req.identity.userId : '';
  var user = req.identity && req.identity.user ? req.identity.user : null;
  if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }
  var now = Date.now();
  CustomerService.hasTheDeviceGot(
    user.deviceId,
    userId + '', '', '',
    '4.5.0',
    constants.COUPON_ACTIVITYNO_CASH_0526_5)
    .then(function (_deviceRes) {
      if (_deviceRes) {
        throw ErrorHandler.getBusinessErrorByCode(2115);
      }
      return CouponService.getCouponByCond({_id: constants.ACTIVITY_0526_COUPON_LIMIT_ID})
    })
    .then(function(_coupon){
      if(_coupon.balance <= 0){
        throw ErrorHandler.getBusinessErrorByCode(2202);
      }
      var cond = {
        isDeleted : false,
        activityNO : constants.COUPON_ACTIVITYNO_CASH_0526_5,
        boundUserId : userId
      };
      return CouponService.getCouponByCond(cond);
    })
    .then(function(_coupon) {
      if (_coupon) {
        throw ErrorHandler.getBusinessErrorByCode(1531);
      }
      return MembershipService.consumedMembership(userId, constants.COUPON_ACTIVITYNO_CASH_0526_RMB_5)
    })
    .then(function(_res){
      if (!_res || !_res.isConsumedSuccess) {
        throw ErrorHandler.getBusinessErrorByCode(2109);
      }
      var newCoupon  = {
        activityNO: constants.COUPON_ACTIVITYNO_CASH_0526_5,
        type: 9,
        title: constants.COUPON_ACTIVITYNO_CASH_0526_TITLE_5,
        subTitle: constants.COUPON_ACTIVITYNO_CASH_0526_SUBTITLE_5,
        description: constants.COUPON_ACTIVITYNO_CASH_0526_SUBTITLE_5,
        manual: '',
        rmb: constants.COUPON_ACTIVITYNO_CASH_0526_RMB_5,
        deductedRMB: constants.COUPON_ACTIVITYNO_CASH_0526_RMB_5,
        rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_CASH_0526_RMB_5,
        expiredAt: new Date(commonUtil.getDateMidnight(now + constants.TIME7D)).getTime() - 1,
        validAt: now,
        boundUserId: userId,
        boundUserPhoneNum: user.phoneNum,
        orderId: '',
      }
      return CouponService.createUnionCodeCouponActivity0526(newCoupon);
    })
    .then(function(_coupon){
      apiHandler.OK(res, {});
      LoggerService.trace(LoggerService.getTraceDataByReq(req));
    }, function (err) {
      apiHandler.handleErr(res, err);
    })
};


module.exports = exports = new ActivityController()