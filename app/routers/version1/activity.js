/**
 * Created by yichen on 2017/5/15.
 * 活动相关接口
 */
var
  VERSION = "/1",
  router = require('express').Router(),
  Activity = require('../../controllers/ActivityController');

var limitApiCall = function (api) {
  return function (req, res, next){
    var userId = req.identity && req.identity.userId;
    var CacheService = require("../../services/CacheService");
    var apiHandler = require('../../configs/ApiHandler');
    var ErrorHandler = require('../../../lib/ErrorHandler');
    if (!api) return next();
    if (!userId) return next();

    // API 限流
    if (CacheService.isUserAPIUseOverLimit(userId, api)){
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8003));
    }else{
      CacheService.addOrUpdUserApiLimit(userId, api);
      return next();
    }
  };
};

  // API-6001 20170524活动,领取优惠券
  router.get(
    VERSION+"/activity/share/getCoupon170524",
    limitApiCall("getCoupon0524"),
    Activity.getCoupon170524);
  // API-6002 20170524活动,微信中领取优惠券
  router.get(
    VERSION+"/activity/share/getCouponInWX170524",
    limitApiCall("getCouponInWX0524"),
    Activity.getCouponInWX170524);
  //API-6003 20170526活动,分享领取优惠券扣会员额度
  // router.get(
  //   VERSION+"/activity/share/getCoupon170526",
  //   limitApiCall("getCoupon0526"),
  //   Activity.getCoupon170526);
  // API-6004 20170526活动,微信中领取优惠券
  // router.get(
  //   VERSION+"/activity/share/getCouponInWX170526",
  //   limitApiCall("getCouponInWX170526"),
  //   Activity.getCouponInWX170526);
module.exports = router;
