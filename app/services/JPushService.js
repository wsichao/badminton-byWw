/**
 * 极光推送
 */
var
  JPush = require("jpush-sdk"),
  Q = require("q"),
  //customerClient = JPush.buildClient('6468a30e3a149244145cfdde', '888d67c965b8fa4acb0a182d'),
  customerClient = JPush.buildClient('0b83dc8e9b61f531191e7f61', '4a3f5a0500b709fbd0f79f6e'),
  doctorClient = JPush.buildClient('0b83dc8e9b61f531191e7f61', '0b83dc8e9b61f531191e7f61'),
  ErrorHandler = require('../../lib/ErrorHandler'),
  commonUtil = require('../../lib/common-util'),
  constants = require('../configs/constants');

var JPushService = function () {};
var CONS = {
  APP:{
    CUS: "customer",
    DOC: "doctor",
    WEB: "web"
  }
};
JPushService.prototype.constructor = JPushService;

var pushNotification = function (app, regId, notification, extra,platform) {
  var deferred = Q.defer();
  var client;
  switch(app){
    case CONS.APP.CUS:
      console.log("customer push");
      client = customerClient;
      break;
    case CONS.APP.DOC:
      console.log("doctor push");
      client = doctorClient;
      break;
    default:
      console.log("default push");
      client = customerClient;
      break;
  }
  extra = extra || {};
  var obj = {
    type: extra.type || 1,
    role: extra.role || "user",
    contentType: extra.contentType || "",
      notificationBody: extra.notificationBody || {}
  };
  //android(alert, title, builder_id, extras, priority, category, style, value)
  var android = JPush.android(notification, null, 1, obj);
  //ios(alert,sound,badge,contentAvailable,extras)
  var ios = JPush.ios(notification, "default", null, true, obj);
  console.log("env: " + constants.IS_PROD_ENV);

  if(regId!='all'){//广播全平台
    regId=JPush.registration_id(regId);
  }

  if(platform){
      client.push()
          .setPlatform(platform) // 支持平台
          //.setPlatform(JPush.ALL)
          // .setAudience(JPush.registration_id(regId)) // 发送给谁
          .setAudience(regId) // 发送给谁
          .setNotification(ios, android)//notification)
          //.setNotification('Hi, JPush', JPush.ios('ios alert'), JPush.android('android alert', null, 1))
          .setOptions(null, 60, null, constants.IS_PROD_ENV? true:false)
          .send(function (err, res) {
              if (err) {
                  if (err instanceof JPush.APIConnectionError) {
                      console.log(err.message);
                      //Response Timeout means your request to the server may have already received, please check whether or not to push
                      console.log(err.isResponseTimeout);
                  } else if (err instanceof  JPush.APIRequestError) {
                      console.log(err.message);
                  }

                  deferred.reject(ErrorHandler.getBusinessErrorByCode(5002));
              } else {
                  console.log('Sendno: ' + res.sendno);
                  console.log('Msg_id: ' + res.msg_id);
                  deferred.resolve(res);
              }
          });

  }else{
      client.push()
          .setPlatform('ios', 'android') // 支持平台
          //.setPlatform(JPush.ALL)
          // .setAudience(JPush.registration_id(regId)) // 发送给谁
          .setAudience(regId) // 发送给谁
          .setNotification(ios, android)//notification)
          //.setNotification('Hi, JPush', JPush.ios('ios alert'), JPush.android('android alert', null, 1))
          .setOptions(null, 60, null, constants.IS_PROD_ENV? true:false)
          .send(function (err, res) {
              if (err) {
                  if (err instanceof JPush.APIConnectionError) {
                      console.log(err.message);
                      //Response Timeout means your request to the server may have already received, please check whether or not to push
                      console.log(err.isResponseTimeout);
                  } else if (err instanceof  JPush.APIRequestError) {
                      console.log(err.message);
                  }

                  deferred.reject(ErrorHandler.getBusinessErrorByCode(5002));
              } else {
                  console.log('Sendno: ' + res.sendno);
                  console.log('Msg_id: ' + res.msg_id);
                  deferred.resolve(res);
              }
          });

  }

  return deferred.promise;
};

var pushMessage = function (app, regId, message, extras,platform) {
  var deferred = Q.defer();
  var client;
  switch(app){
    case CONS.APP.CUS:
      client = customerClient;
      break;
    case CONS.APP.DOC:
      client = doctorClient;
      break;
    default:
      client = customerClient;
      break;
  }
  var title = "";
  var content_type = "0";

  if(regId!='all'){//广播全平台
    regId=JPush.registration_id(regId);
  }

  if(platform){
      client.push()
          .setPlatform(platform)
          .setAudience(regId)
          .setMessage(message, title, content_type, extras)
          //.setOptions(null, 60, null,constants.IS_PROD_ENV? true:false)
          .setOptions(null, 60, null, true)
          .send(function (err, res) {
              if (err) {
                  if (err instanceof JPush.APIConnectionError) {
                      console.log(err.message);
                      //Response Timeout means your request to the server may have already received, please check whether or not to push
                      console.log(err.isResponseTimeout);
                  } else if (err instanceof  JPush.APIRequestError) {
                      console.log(err.message);
                  }

                  deferred.reject(ErrorHandler.getBusinessErrorByCode(5002));
              } else {
                  console.log('Sendno: ' + res.sendno);
                  console.log('Msg_id: ' + res.msg_id);
                  deferred.resolve(res);
              }
          });

  }else{
      client.push()
      .setPlatform('ios', 'android')
          // .setAudience(JPush.registration_id(regId))
          .setAudience(regId)
          .setMessage(message, title, content_type, extras)
          //.setOptions(null, 60, null,constants.IS_PROD_ENV? true:false)
          .setOptions(null, 60, null, true)
          .send(function (err, res) {
              if (err) {
                  if (err instanceof JPush.APIConnectionError) {
                      console.log(err.message);
                      //Response Timeout means your request to the server may have already received, please check whether or not to push
                      console.log(err.isResponseTimeout);
                  } else if (err instanceof  JPush.APIRequestError) {
                      console.log(err.message);
                  }

                  deferred.reject(ErrorHandler.getBusinessErrorByCode(5002));
              } else {
                  console.log('Sendno: ' + res.sendno);
                  console.log('Msg_id: ' + res.msg_id);
                  deferred.resolve(res);
              }
          });

  }

  return deferred.promise;
};

/**
 * 推送透传消息
 * @param regId
 * @param message
 * @param client
 * @param extras
 * * {
 * *  type: Number, //1-新消息
 * *  contentType: String, //moment-动态, personal-个人留言, sys-系统通知
 * * }
 * @returns {*}
 */
JPushService.prototype.pushMessage = function (regId, message, client, extras,platform) {
  var client = client || CONS.APP.CUS;
  //return pushMessage(client, regId, message);
  if (regId && regId.length > 1){
    return pushMessage(client, regId, message, extras,platform)
      .then(function(){
        console.log("Push OK");
      }, function(err){
        console.log("Push error: " + err);
      });
  }else{
    console.log("Push error: No regId : " + regId);
    var deferred = Q.defer();
    deferred.resolve();
    return deferred.promise;
  }
};
/**
 * 推送通知
 **/
 var _pushNotification = function (regId, notification, client, extras,platform) {
  var client = client || CONS.APP.CUS;
  if (regId && regId.length > 1){
    return pushNotification(client, regId, notification, extras,platform)
      .then(function(){
        console.log("Push OK");
      }, function(err){
        console.log("Push error: " + err);
      });
  }else{
    console.log("Push error: No regId : " + regId);
    var deferred = Q.defer();
    deferred.resolve();
    return deferred.promise;
  }
};
JPushService.prototype.pushNotification = _pushNotification;
// 配置常量
JPushService.prototype.CONS = CONS;
module.exports = exports = new JPushService();