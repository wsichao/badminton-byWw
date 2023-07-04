/**
 * 通用信息
 */
var
  VERSION = "/1",
  router = require('express').Router(),
  WX = require('../../controllers/WXController'),
  Info = require('../../controllers/InfoController'), 
  Auth = require('../../controllers/AuthController'),
  RegionController = require('../../controllers/RegionController'),
  IndexController = require('../../controllers/IndexController');
var appVersion = '';
var versionRouter = function (router1, router2) {
  return function handler(req, res) {
    appVersion = req.identity && req.identity.appVersion ? req.identity.appVersion : '';
    if(!appVersion){
      return res.status(403).end();
    }
    console.log('appVersion:', appVersion);
    appVersion > '4.0.4' ? router1(req, res) : router2(req, res);
  };
};
// API-10xx 通用接口
// API-1001 获取cdn服务器信息
router.get(VERSION + "/common/cdn", Info.getCdn);
// API-1002 获取朱李叶400客服电话
router.get(VERSION + "/common/zly400", Info.getZly400);
// API-1003 获取当前时间戳
router.get(VERSION + '/common/timestamp', Info.getTimeStamp);
// API-1004 获取执业信息
router.get(VERSION + '/common/practice', Info.getPractice);
// API-1005 获取验证码
router.get(VERSION + "/common/authCode", versionRouter(Auth.getAuthCodeJSONP_new, Auth.getAuthCodeJSONP)); //TODO 为什么叫JSONP?
// router.post(VERSION + "/common/voiceCodes", Auth.getVoiceCode);
// API-1007 充值列表-充值活动信息
router.get(VERSION + "/common/recharge/options", Info.getRechargeOptions);
// API-1008 广告信息
router.get(VERSION + "/common/banners", Info.getCurrentBanners);
// API-1009 获取地区
router.get(VERSION + "/indexes/regions", RegionController.getRegionList);
// API-1010 获取地区下的医院列表
router.get(VERSION + "/indexes/hospitals", IndexController.getHospitalList);
// API-1011 获取医院下的科室列表
router.get(VERSION + "/indexes/departments", IndexController.getDepartmentList);

// API-1012
router.get(VERSION + "/common/regions", function(req,res){
  Backend.service("1/city_buy","shop_apply_regions").getAllRegions().then(function(data){
    "use strict";
    res.send({items:data});
  })
});

//获得微信内二次分享的JS配置信息
router.get(VERSION + '/wxConfig', WX.getWXConfig);
// ==== 6053.获取基础信息 ====
router.get(VERSION + "/common/serverInfo", Info.serverInfo);
module.exports = router;