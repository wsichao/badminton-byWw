/**
 * 推送服务相关路由
 */
var
  VERSION = "/1",
  router = require('express').Router(), 
  JPush = require('../../controllers/JPushController');

//FIXME: @zhenbo API 向C端账户推送通知
router.post(VERSION+"/push/notification", JPush.pushNotificationByRegId);
//FIXME: @zhenbo API 向C端账户推送自定义消息
router.post(VERSION+"/push/message", JPush.pushMessageByRegId);

module.exports = router;