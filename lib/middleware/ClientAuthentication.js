/**
 *  ClientAuthentication
 *  中间件-客户端登陆认证
 *
 *  Author: Jacky.L
 *  Created by Jacky.L on 10/16/14.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var
  _ = require('underscore'),
  util = require("util"),
  commonUtil = require("../common-util"),
  apiHandler = require('../../app/configs/ApiHandler'),
  ErrorHandler = require('../../lib/ErrorHandler'),
  configs = require('../../app/configs/server'),
  constants = require('../../app/configs/constants'),
  OpAdmin = require('../../app/configs/opUsers.json'),
  LoggerService = require('../../app/services/LoggerService'),
  CustomerService = require('../../app/services/CustomerService'),
  DoctorService = require('../../app/services/DoctorService'),
  block_ip = require('../../app/json/block_ip'),
  needAuth = require('../../src/auth/auth_utils').needAuth,
  DOCCHAT_HEADER = {
    DEVICE_MARK: constants.HEADER_DEVICE_ID,
    USER_ID: constants.HEADER_USER_ID,
    SESSION_TOKEN: constants.HEADER_SESSION_TOKEN,
    APP_VERSION: constants.HEADER_APP_VERSION,
    APP_TYPE: constants.HEADER_APP_TYPE
  };
const sessionTokenService = require('./../../src/common/service/session_token')
const co = require('co')


var ClientAuthentication = function () {};
ClientAuthentication.prototype.constructor = ClientAuthentication;

ClientAuthentication.prototype.clientSession = function (options) {
  // 服务器配置参数
  options = options || {};
  var secret = options.secret || configs.secret || "";
  console.log("init middleware client authentication");

  return function clientSession(req, res, next) {
    var ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
    //console.log("ip:" + ip);
    if (_.contains(block_ip, ip))
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(4003));

    var reqIdentity = {};
    reqIdentity.userId = req.headers[DOCCHAT_HEADER.USER_ID] || "";
    reqIdentity.sessionToken = req.headers[DOCCHAT_HEADER.SESSION_TOKEN] || "";
    reqIdentity.appVersion = req.headers[DOCCHAT_HEADER.APP_VERSION] || "";
    reqIdentity.type = req.headers[DOCCHAT_HEADER.APP_TYPE] || "";
    reqIdentity.sessionType = req.headers['x-docchat-session-type'] || "";

    //console.log(reqIdentity.userId + "," + reqIdentity.sessionToken);
    req.identity = reqIdentity;
    //console.log("identity : " + util.inspect(req.identity));
    var url = req.url;
    //console.log("000:" + url);

    if (new RegExp("/[1-9]/operation/").test("" + url)) {

      //运营相关除以下接口都必须有userId和sessionToken
      if (new RegExp("/login").test("" + url) || new RegExp("/getCoupon").test("" + url) ||
        new RegExp("/yesterdayIndicatorStatistics").test("" + url) || new RegExp("/todayIndicatorStatistics").test("" + url)) {
        next();
      } else {
        for (var i = 0; i < OpAdmin.users.length; i++)
          if (req.identity.userId == OpAdmin.users[i].username) {
            authToken(req, res, next, OpAdmin.users[i].sessionToken);
            return;
          }

        apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
      }

      return;
    }

    // 监听res回调header方法
    res.on('header', function () {
      // 更新client session
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Client-Session');
      res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    });

    if (!needAuth(req.url, req.method)) {
      next();
    } else {
      if (!reqIdentity.userId)
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(4002));

      CustomerService.getInfoByID(reqIdentity.userId, undefined, reqIdentity.type)
        .then(function (data) {
          if (!data) {
            apiHandler.handleErr(res, new ErrorHandler.getBusinessErrorByCode(1503));
          }
          req.identity.user = data; // 缓存查询的用户信息
          // if type is 2030Assistant , check token
          if (req.identity.sessionType && req.identity.sessionType != '') {
            // TODO 6.3.0
            // 接口鉴权
            co(function* () {
              const isLogin = yield sessionTokenService.checkToken(reqIdentity.userId, req.identity.sessionType, reqIdentity.sessionToken);
              if (!isLogin) apiHandler.handleErr(res, new ErrorHandler.getBusinessErrorByCode(4002));
              else next()
            })
          } else {
            // console.log('缓存的用户信息',req.identity.user);
            authToken(req, res, next, CustomerService.token(data));
            // console.log('data.latestLoginVersion:', data.latestLoginVersion, reqIdentity.appVersion);
            // if (reqIdentity.appVersion && (data.latestLoginVersion != reqIdentity.appVersion)) { //如果当前版本号,与上一次登陆版本号不一致
            //   CustomerService.updateBaseInfo(reqIdentity.userId, {
            //     latestLoginVersion: reqIdentity.appVersion
            //   });
            //   console.log('版本不一致');
            // } else {
            //   console.log('版本一致');
            // }
          }
        });
    }

  };
};

var authToken = function (req, res, next, encryptToken) {
  //console.log("headers: " + util.inspect(req.headers));
  console.log("encryt token: " + encryptToken + "  :  " + req.identity.sessionToken);

  if (encryptToken === req.identity.sessionToken) {
    //TODO   下面代码都是干哈的？？
    var url = req.url;
    if (url.indexOf('?') > 0)
      url = url.substr(0, url.indexOf('?'));
    next();
  } else {
    apiHandler.handleErr(res, new ErrorHandler.getBusinessErrorByCode(4002));
  }
};

ClientAuthentication.prototype.HEADER = DOCCHAT_HEADER;

module.exports = exports = new ClientAuthentication();