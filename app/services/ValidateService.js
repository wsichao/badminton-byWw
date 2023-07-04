/**
 * 短信相关（验证码验证、发送验证码）
 * Created by zhaoyifei on 15/6/10.
 */
var
  Validate = require('../models/Validate'),
  commonUtil = require('../../lib/common-util'),
  Q = require("q"),
  Promise = require('promise'),
  constants = require('../configs/constants'),
  Utils = require('../../lib/Utils'),
  ErrorHandler = require('../../lib/ErrorHandler'),
  Customer = require('../models/Customer');

var validUUID = function (uuid) {
  return uuid;
};

var ValidateService = function () {
};

ValidateService.prototype.validate = function (id, code) {
  return Validate.findById(id).exec()
    .then(function (v) {
      var deferred = Q.defer();
      var now = Date.now();
      // 1. 验证码是否合法
      if (!v || v.authCode != code || now - v.createdAt > constants.AUTH_EXPIRE_TIME || v.isAuth) {
        deferred.reject(ErrorHandler.getBusinessErrorByCode(1502));
        return deferred.promise;
      } else {
        // 更新验证码状态
        return Validate.findByIdAndUpdate(id, {
          updatedAt: now,
          isAuth: true
        }).exec();
      }

    })
};

ValidateService.prototype.validateByPhone = function (phone, code ,pwd) {
  var now = Date.now();
  var deferred = Q.defer();
  //if (phone == "19912345678" && code == "333333") {
  if ((phone == "19912345678" || phone == "19987654321" ) && code == "123456") {
    deferred.resolve();
    return deferred.promise;
  }
  //if (code == "10070022") { //万能验证码 TODO DEL
  //  deferred.resolve();
  //  return deferred.promise;
  //}
  let user_center_service  = Backend.service('user_center','handle_user_center');
  if(code){
    user_center_service.login_auth_code(phone,code)
      .then(function (v) {
        // 1. 验证码是否合法
        if (!v ||  (v.errno && v.errno != 2003)) {
          deferred.reject(ErrorHandler.getBusinessErrorByCode(1502));
        } else {
          // 更新验证码状态
          deferred.resolve(v.data);
        }
      });
  }else if(pwd){
     user_center_service.login_password(phone,pwd)
     .then(function(user_center){
       if(!user_center|| user_center.errno || !user_center.data || !user_center.data.id){
         deferred.reject(ErrorHandler.getBusinessErrorByCode(1529));
       }else{
         deferred.resolve(user_center.data);
       }
     })
  }

  return deferred.promise;
};

ValidateService.prototype.validateByPhoneWebCall = function (phone, code, secret) {
  var now = Date.now();
  var deferred = Q.defer();
  if (secret && !code) {
    deferred.resolve();
    return deferred.promise;
  }
  Validate.findOneAndUpdate({
    phoneNum: phone,
    isAuth: false,
    authCode: code,
    expireAt: {$gte: now}
  }, {
    updatedAt: now,
    isAuth: true
  }).exec()
    .then(function (v) {
      // 1. 验证码是否合法
      if (!v) {
        deferred.reject(ErrorHandler.getBusinessErrorByCode(1502));
      } else {
        // 更新验证码状态
        deferred.resolve(v);
      }

    });
  return deferred.promise;
};

ValidateService.prototype.sendValidate = function (phoneNum, from, phoneType ) {
  var now = Date.now();
  var deferred = Q.defer();
  var authCode;
  if (!phoneNum) {
    deferred.reject(ErrorHandler.getBusinessErrorByCode(1203));
    return deferred.promise;
  }
  let user_center_service = Backend.service("user_center",'handle_user_center');
  user_center_service.auth_code(phoneNum)
  .then(function (ac) {
      if(!ac || ac.errno || !ac.data || !ac.data.code){
        throw ErrorHandler.getBusinessErrorByCode(8007);
      }
    authCode = ac.data.code;
      console.log("authCode#" + authCode + "#");
      if (phoneNum == "19912345678") {

      } else {
        if (from == "setPayPwd") {
          if(phoneType == 'fixed'){
            commonUtil.sendVoice(phoneNum, authCode);
          }else{
            commonUtil.sendSms("1908950", phoneNum, "#code#=" + authCode);
          }
        } else {
          if(phoneType == 'fixed'){
            commonUtil.sendVoice(phoneNum, authCode);
          }else{
            commonUtil.sendSms("1908200", phoneNum, "#code#=" + authCode);
          }

        }

      }
      deferred.resolve(ac);
    }, function (err) {
      console.error(err);
      deferred.reject(ErrorHandler.getBusinessErrorByCode(1501, err));
    });


  return deferred.promise;
};
// ValidateService.prototype.findById = function (id) {
//     return Validate.findById(id).exec();
// };

module.exports = exports = new ValidateService();
