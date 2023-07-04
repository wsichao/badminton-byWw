/**
 * Created by zhaoyifei on 15/6/1.
 */
var util = require("util"),
  commonUtil = require("../common-util"),
  encrypt = commonUtil.commonMD5,
  apiHandler = require('../../app/configs/ApiHandler'),
  isUpperCase = true,
  configs = require('../../app/configs/server'),

  JULIYE_HEADER = {
    APP_ID: "x-juliye-application-id",
    APP_VERSION: "x-juliye-application-version",
    PHONE_VERSION: "x-juliye-application-phone-version",
    TERMINAL_ID: "x-juliye-terminal-id",
    USER_ID: "x-juliye-user-id",
    DEVICE_MARK: "x-juliye-application-device-mark",//设备唯一标识
    DEVICE_MODEL: "x-juliye-application-device-model",//设备型号
    CHANNEL_INFO: "x-juliye-application-channel",//渠道
    SESSION_TOKEN: "x-juliye-session-token"
    //USER_MOBILE = "x-juliye-user-mobile",
    //USER_NAME = 'x-juliye-user-name',
    //PROVINCE_ID = 'x-juliye-province-id',
    //AREA_ID = 'x-juliye-area-id',
  };


var ExpressMidware = function () {
};

ExpressMidware.prototype.constructor = ExpressMidware;

ExpressMidware.prototype.clientAuthHandler = function (req, res, next) {
  var secret = configs.secret;
  //console.log("come in client session: " + util.inspect(req.headers));
  //req.headers['Access-Control-Allow-Origin'] = '*';
  //console.log("come in client session: " + util.inspect(req.headers));
  var reqIdentity = {};
  console.log(req.headers);
  reqIdentity.applicationId = req.headers[JULIYE_HEADER.APP_ID] || "";
  reqIdentity.applicationVersion = req.headers[JULIYE_HEADER.APP_VERSION] || "";
  reqIdentity.terminalId = req.headers[JULIYE_HEADER.TERMINAL_ID] || "";
  reqIdentity.userId = req.headers[JULIYE_HEADER.USER_ID] || "";
  reqIdentity.sessionToken = req.headers[JULIYE_HEADER.SESSION_TOKEN] || "";
  reqIdentity.phoneVer = req.headers[JULIYE_HEADER.PHONE_VERSION] || "";
  //reqIdentity.phoneNum = req.headers[USER_MOBILE] || "";
  //reqIdentity.userName = req.headers[USER_NAME] || "";

  //reqIdentity.provinceId = req.headers[PROVINCE_ID] || "";
  //reqIdentity.areaId = req.headers[AREA_ID] || "";

  //console.log("headers: " + util.inspect(req.headers));
  encryptToken = encrypt(reqIdentity.userId, secret, isUpperCase);
  //console.log("encryt token: " + encryptToken + "  :  " + reqIdentity.sessionToken);
  //验证登陆身份合法性 "/3/authCode"
  //if (encryptToken === reqIdentity.sessionToken) {
  req.identity = reqIdentity;
  //}

  var url = req.url;
  if (url.indexOf('?') > 0)
    url = url.substr(0, url.indexOf('?'));
  var urls = url.split('/');
  console.log(url + "  :  " + reqIdentity.userId);

  //TODO 能否统一下？？？
  //var exceptUser = /\/user/;
  var exceptLogin = /\/login/;
  var exceptGetAuthCode = /\/auth\/code/;

  if ((req.method.toLowerCase() == "post" || req.method.toLowerCase() == "get")) {
    //TODO 所有方法不都会走这个分支吗？？？

  } else if ((req.method.toLowerCase() == "post") && exceptLogin.test(url)) {

  } else if (( req.method.toLowerCase() == "get") && exceptGetAuthCode.test(url)) {

  } else {
    console.log(encryptToken);
    console.log(reqIdentity.sessionToken);
    if (encryptToken === reqIdentity.sessionToken) {
      req.identity = reqIdentity;
      // 监听res回调header方法
      res.on('header', function () {
        // 更新client session
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Client-Session');
        res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        var newToken = res.sessionToken;
        res.setHeader(JULIYE_HEADER.SESSION_TOKEN, newToken);
      });
    } else {
      //Session 验证失败
      return apiHandler.handleErr(res);
    }
  }
  next();
};

ExpressMidware.prototype.unCatchErrorHandler = function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Unknown err!');
};

ExpressMidware.prototype.haltOnTimedout = function (req, res, next) {
  if (!req.timedout) next();
};

ExpressMidware.prototype.logRequest = function (req, res, next) {


  next();
};

module.exports = exports = new ExpressMidware();