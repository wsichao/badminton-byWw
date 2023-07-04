var
  _ = require('underscore'),
  serverConfigs = require('../configs/server'),
  commonUtil = require('../../lib/common-util'),
  regionUtils = require('../../lib/regionUtils'),
  apiHandler = require('../configs/ApiHandler'),
  ErrorHandler = require('../../lib/ErrorHandler'),
  configs = require('../configs/api'),
  constants = require('../configs/constants'),
  Q = require("q"),
  Promise = require('promise'),
  ClientAuth = require('../../lib/middleware/ClientAuthentication'),
  CustomerService = require('../services/CustomerService'),
  TransactionMysqlService = require('../services/TransactionMysqlService'),
  DoctorService = require('../services/DoctorService'),
  LoggerService = require('../services/LoggerService'),
// OperationController = require('./OperationController'),
  CommonInfoService = require('../services/CommonInfoService'),
  ValidateService = require('../services/ValidateService'),
  VoipService = require('../services/VoipService'),
  MomentMsgService = require('../services/MomentMsgService'),
  MomentService = require('../services/MomentService'),
  ApplicationService = require('../services/ApplicationService'),
    ZlycareController = require('./ZlycareController'),
  NODE_ENV = process.env.NODE_ENV;


var AuthController = function () {
};
AuthController.prototype.constructor = AuthController;


AuthController.prototype.loginCustomer = function (req, res) {
  var payload = req.body;
  //var docChatNum = "";
  var fields = {
    required: ['phoneNum'],
    optional: ['authCode', 'password','storeChannel']
  };

  var deviceId = req.headers[ClientAuth.HEADER.DEVICE_MARK] || "";
  let user_center_data;
  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var user;
    if (!data.password && !data.authCode) {
      throw ErrorHandler.getBusinessErrorByCode(1810);
    }
    if (data.password) {
      data.password = commonUtil.genJuliyeMD5(data.password);
    }
    let user_center = Backend.service('user_center','handle_user_center');
    user_center.login_lazy_user_init(data.phoneNum)
      .then(function(){
        return ValidateService.validateByPhone(data.phoneNum, data.authCode, data.password)
      })
      .then(function (_resObj) {
        console.log('_resObj:', _resObj);
        user_center_data = _resObj;
        // if (data.password && !_resObj.isPhone) {
        //   return CustomerService.validUserByDocChatNum(data.phoneNum, '', deviceId);
        // }
        return CustomerService.validUser(data.phoneNum, '', deviceId,'','','',data.storeChannel,_resObj);
      })
      .then(function (u) {
          return ZlycareController.handleUserInfo(u,user_center_data);
      })
        .then(function(json){
          if(data.password){
            json.hasPwd = true
          }
          apiHandler.OK(res, json);
            ZlycareController.loginUpdateUserInfo(user);
        LoggerService.trace(LoggerService.getTraceDataByReq(req)); //和发送验证码的log一起用，不能删
      },
      function (err) {
        console.log('err:', err);
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

AuthController.prototype.webcallRegister = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['authCode', 'phoneNum', 'name', 'source']
  };


  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    CustomerService.getInfoByPhone(data.phoneNum)
      .then(function (_d) {
        if (_d) {
          throw ErrorHandler.getBusinessErrorByCode(1528);
        }
        return ValidateService.validateByPhone(data.phoneNum, data.authCode)
      })
      .then(function (v) {
        return CustomerService.validUser(data.phoneNum, data.name, "", "webCall", null, data.source);
      })
      .then(function (u) {
        apiHandler.OK(res, {});
      },
      function (err) {
        console.log('err', err);
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};


//通过短信验证批量关注医生
AuthController.prototype.msgFollowDocs = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['authCode', 'name', 'phoneNum', 'docGrpId']
  };

  var deviceId = req.headers[ClientAuth.HEADER.DEVICE_MARK] || "";

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var user, doctors, docIds;

    //1. validate phone authcode
    ValidateService.validateByPhone(data.phoneNum, data.authCode)
      .then(function (v) {
        //2. create or update user info
        return CustomerService.validUser(data.phoneNum, data.name, deviceId, 'web');
      })
      .then(function (u) {
        if (!u) {
          throw ErrorHandler.getBusinessErrorByCode(1503);
        } else {
          user = u;
          //3. get doctor list by doctor group
          return DoctorService.getDocListByDocGrpNum(data.docGrpId, "_id");
        }
      })
      .then(function (_list) {
        _list = JSON.parse(JSON.stringify(_list));
        if (!_list || _list.length < 1) {
          throw ErrorHandler.getBusinessErrorByCode(1205);
        } else {
          //4. customer add favorite
          _list = _.map(_list, function (d) {
            return d._id + ""
          });
          docIds = _.difference(_list, user.favoriteDocs);
          if (docIds && docIds.length > 0) { //医生未被收藏则收藏
            // 收藏触发 blockDocs 清空 docIds
            CustomerService.changeDocsPushState(data._id, docIds, false);
            return CustomerService.favoriteDocs(user._id, docIds);
          }
        }
      })
      .then(function (c) {
        //if (c) {
        // 5. doctor add favorite number
        return DoctorService.bathModifyFavoritedNum(docIds, 1); //修改收藏数
        //}
      })
      .then(function () {
        apiHandler.OK(res);
        LoggerService.trace(LoggerService.getTraceDataByReq(req)); //和发送验证码的log一起用，不能删
      }, function (err) {
        console.log(err);
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

//将临时账号收藏的医生同步到证实账户
var synchronizeTempAccountFavoriteToOfficialAccount = function (userId, deviceId) {
  CustomerService.getTemporayAccountByDeviceId(deviceId)
    .then(function (tempAccount) {
      if (tempAccount && tempAccount.favoriteDocs.length > 0) {
        //console.log("tempAccount:" + tempAccount);
        CustomerService.favoriteDocs(userId, tempAccount.favoriteDocs);
        CustomerService.clearFavoriteDocs(tempAccount._id);
      }
    });
};

AuthController.prototype.getTemporaryAccount = function (req, res) {
  var deviceId = req.headers[ClientAuth.HEADER.DEVICE_MARK];

  if (!deviceId)
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));

  CustomerService.getTemporayAccount(deviceId)
    .then(function (u) {
      var json = JSON.parse(JSON.stringify(u));
      json.sessionToken = CustomerService.token(u);
      apiHandler.OK(res, json);

      console.log(json);
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};

AuthController.prototype.loginDoctor = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['phoneNum', 'password']
  };

  var deviceId = req.headers[ClientAuth.HEADER.DEVICE_MARK] || "";

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var json = {},
      doctor,
      accidExists = false;
    DoctorService.validDoctor(data.phoneNum, data.password, deviceId)
      .then(function (u) {
        doctor = u;
        json = JSON.parse(JSON.stringify(u));
        json.sessionToken = DoctorService.token(u);
        if (u.accid && u.callToken) {
          json.accid = u.accid;
          json.callToken = u.callToken;
          accidExists = true;
          return;
        }
        var accid = (NODE_ENV == 'production') ? (u._id + '') : (u._id + '_dev');
        return VoipService.setAccidAndToken(accid, {name: u.realName});
      })
      .then(function (voipRes) {
        if (!accidExists) {
          if (voipRes.code != 200) {
            return apiHandler.handleErr(ErrorHandler.getBusinessErrorByCode(1810));
          }
          var info = voipRes.info;
          json.accid = info.accid;
          json.callToken = info.token;
          //console.log(json);
          var updateData = {
            $set: {accid: info.accid, callToken: info.token, updatedAt: Date.now()}
          }
          DoctorService.updateBaseInfo(doctor._id, updateData);
        }
        apiHandler.OK(res, json);
      },
      function (err) {
        console.log(err);
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

AuthController.prototype.logoutCustomer = function (req, res) {
  var user = req.identity && req.identity.user ? req.identity.user : ''
  userId = user && user._id ? user._id : '';
  //console.log('req.identity.user:', req.identity.user);
  if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }
  if (!user.doctorRef || !user.doctorRef._id) {
    return apiHandler.OK(res);
  }
  var data = {
    isOnline: false,
    isOnlineOnLogout: user.doctorRef.isOnline,
    pushId: ''
  }
  DoctorService.updateBaseInfo(user.doctorRef._id, data)
    .then(function (c) {
      return CustomerService.updateBaseInfo(userId, {pushId: ''})
    })
    .then(function () {
      apiHandler.OK(res);
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};

AuthController.prototype.logoutDoctor = function (req, res) {
  DoctorService.getAllInfoByID(req.body.userId)
    .then(function (d) {
      if (d)
        DoctorService.logout(d._id);

      apiHandler.OK(res);
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};

AuthController.prototype.getAuthCodeJSONP = function (req, res) {
  var phone = req.query.phoneNum;
  var from = req.query.from; //setPayPwd设置支付密码
  var token = req.query.token;// FIXME:

  if (from == "favoriteDoc" && token != "true") {
    console.log("Web authcode token not pass");
    //apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8007));
    res.status(403).end();
    return;
  }

  if (!from && constants.IS_PROD_ENV) {
    // 必须走https => X-Request-Port == 443
    var port = req.get("X-Request-Port");
    console.log("current port " + port);
    if (port != "443") {
      res.status(403).end();
      return;
    }
  }

  var ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
  console.log("ip:" + ip);


  if (!commonUtil.isValidPhone(phone)) {
    apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8007));
    return;
  }
  var twelveHourCallNum = 0;
  req.path = req.path.toLowerCase(); //TODO
  if (from != "setPayPwd") {
    LoggerService.getCallNumTimeAgo(ip, req.path, 10000)
      .then(function (num) {
        console.log("num1:" + num);
        if (num > 3) {
          throw ErrorHandler.getBusinessErrorByCode(8007);
        }

        return LoggerService.getCallNumTimeAgo(ip, req.path, constants.TIME12H);
      })
      .then(function (num) {
        console.log("num2:" + num);
        twelveHourCallNum = num;

        //TODO 将来如果有新的需要验证验证码的接口，需要加入数组
        var callUrls = ['/1/customer/msgFollowDocs', '/1/customer/login',
          '/1/customer/msgFollowDoc', '/1/customer/getCouponByPhone',
          '/1/doctor/resetPWD', '/1/doctor/applyWithdraw', '/1/customer/getCouponByFriend',
          '/1/customer/getCouponByDouble12'
        ];

        return LoggerService.getCallsNumTimeAgo(ip, callUrls, constants.TIME12H);
      })
      .then(function (num) {
        console.log(11111);
        console.log("num3:" + num);
        if (twelveHourCallNum > 1000 && num == 0)
          throw ErrorHandler.getBusinessErrorByCode(8007);
        else if (twelveHourCallNum > 300)
          throw ErrorHandler.getBusinessErrorByCode(8007);


        return ValidateService.sendValidate(phone, '');
      })
      .then(function (ac) {
        apiHandler.OK(res);

        LoggerService.trace(LoggerService.getTraceDataByReq(req));

      }, function (err) {
        apiHandler.handleErr(res, err);
        req.query.responseError = true;
        LoggerService.trace(LoggerService.getTraceDataByReq(req));
      });
  } else {
    ValidateService.sendValidate(phone, from)
      .then(function () {
        apiHandler.OK(res);
        LoggerService.trace(LoggerService.getTraceDataByReq(req));

      }, function (err) {
        apiHandler.handleErr(res, err);
        req.query.responseError = true;
        LoggerService.trace(LoggerService.getTraceDataByReq(req));
      });
  }


};


AuthController.prototype.getAuthCodeJSONP_new = function (req, res) {
  var phone = req.query.phoneNum;
  var from = req.query.from; //setPayPwd设置支付密码
  var token = req.query.token;// FIXME:
  var isVoiceCode = Number(req.query.isVoiceCode||0);// 是否发送语音验证码
  if (from == "favoriteDoc" && token != "true") {
    console.log("Web authcode token not pass");
    //apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8007));
    res.status(403).end();
    return;
  }
  // if (!from && constants.IS_PROD_ENV) {
  //   // 必须走https => X-Request-Port == 443
  //   var port = req.get("X-Request-Port");
  //   console.log("current port " + port);
  //   if (port != "443") {
  //     res.status(403).end();
  //     return;
  //   }
  // }

  var ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
  console.log("ip:" + ip);

  var phoneFixed = commonUtil.isValidFixedPhone(phone),//座机号,带中划线
    phoneMobile = commonUtil.isValidPhone(phone);
  console.log('phone:', phone, phoneFixed, phoneMobile);
  if (!phoneMobile && !phoneFixed) {
    apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8007));
    return;
  }

  var phoneType = phoneFixed ? 'fixed' : (isVoiceCode? "fixed": "mobile");//座机的时候，只发语音验证码；手机的时候，根据isVoiceCode进行判断；fixed-发送语音验证码  mobile-发送短信验证码

    console.log('phoneType验证码类别',phoneFixed,phoneType,isVoiceCode);
  var resData = {
    phoneType: phoneType,
    phoneStr: phoneFixed ? phoneFixed : phone
  };
  var twelveHourCallNum = 0;
  req.path = req.path.toLowerCase(); //TODO
  if (from != "setPayPwd") {
    LoggerService.getCallNumTimeAgo(ip, req.path, 10000)
      .then(function (num) {
        console.log("num1:" + num);
        if (num > 3) {
          throw ErrorHandler.getBusinessErrorByCode(8007);
        }

        return LoggerService.getCallNumTimeAgo(ip, req.path, constants.TIME12H);
      })
      .then(function (num) {
        console.log("num2:" + num);
        twelveHourCallNum = num;

        //TODO 将来如果有新的需要验证验证码的接口，需要加入数组
        var callUrls = ['/1/customer/msgFollowDocs', '/1/customer/login',
          '/1/customer/msgFollowDoc', '/1/customer/getCouponByPhone',
          '/1/doctor/resetPWD', '/1/doctor/applyWithdraw', '/1/customer/getCouponByFriend',
          '/1/customer/getCouponByDouble12'
        ];

        return LoggerService.getCallsNumTimeAgo(ip, callUrls, constants.TIME12H);
      })
      .then(function (num) {
        console.log(2222222)
        console.log("num3:" + num);
        if (twelveHourCallNum > 100 && num == 0) // >5 测试防治ip被封
          throw ErrorHandler.getBusinessErrorByCode(8007);
        else if (twelveHourCallNum > 300)
          throw ErrorHandler.getBusinessErrorByCode(8007);


        return ValidateService.sendValidate(phone, '', phoneType);
      })
      .then(function (ac) {
        apiHandler.OK(res, resData);

        LoggerService.trace(LoggerService.getTraceDataByReq(req));

      }, function (err) {
        apiHandler.handleErr(res, err);
        req.query.responseError = true;
        LoggerService.trace(LoggerService.getTraceDataByReq(req));
      });
  } else {
    ValidateService.sendValidate(phone, from, phoneType)
      .then(function () {
        apiHandler.OK(res);
        LoggerService.trace(LoggerService.getTraceDataByReq(req));

      }, function (err) {
        apiHandler.handleErr(res, err);
        req.query.responseError = true;
        LoggerService.trace(LoggerService.getTraceDataByReq(req));
      });
  }
};

AuthController.prototype.webcallRegister = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['authCode', 'phoneNum', 'name', 'source']
  };


  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    CustomerService.getInfoByPhone(data.phoneNum)
      .then(function (_d) {
        if (_d) {
          throw ErrorHandler.getBusinessErrorByCode(1528);
        }
        return ValidateService.validateByPhone(data.phoneNum, data.authCode)
      })
      .then(function (v) {
        return CustomerService.validUser(data.phoneNum, data.name, "", "webCall", null, data.source);
      })
      .then(function (u) {
        apiHandler.OK(res, {});
      },
      function (err) {
        console.log('err', err);
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};


// AuthController.prototype.getVoiceCode = function (req, res) {
//     var payload = req.body;
//     var fields = {
//         required: ['phoneNum'],
//         optional: ['authCodeId']
//     };
//
//     var onFailure = function (handler, type) {
//         handler(res, type);
//     };
//     var onSuccess = function (handler, data) {
//         var uuid = data.authCodeId;
//         var ac = {};
//         //var ac = {
//         //  _id: commonUtil.getNewObjectId(),
//         //  authCode: commonUtil.generateAuthCode(),
//         //  phoneNum: data.phoneNum
//         //};
//
//         if (uuid && commonUtil.isUUID24bit(uuid)) {
//             var now = Date.now();
//             ValidateService.findById(uuid)
//                 .then(function (v) {
//                     if (!v)
//                         throw ErrorHandler.getBusinessErrorByCode(1001);
//                     if (now - v.createdAt > configs.AUTH_EXPIRE_TIME)
//                         throw new Error('USER_EXPIRE_AUTHCODE');
//
//                     ac.authCode = v.authCode;
//                     //ValidateService.create(ac);
//                     ValidateService.updateById(uuid, {updatedAt: now});
//                 })
//                 .then(function () {
//                     commonUtil.sendVoice(data.phoneNum, ac.authCode);
//                     return apiHandler.OK(res, {authCodeId: uuid});
//                 }, function (err) {
//                     logger.error(TAG, "ERR: " + err);
//                     switch (err.message) {
//                         case "USER_EXPIRE_AUTHCODE":
//                             //新建一条记录并返回
//                             ValidateService.createCode(data.phoneNum)
//                                 .then(function (ac) {
//                                     commonUtil.sendSms("408913", data.phoneNum, "#code#=" + ac.authCode);
//                                     return apiHandler.CREATED(res, {authCodeId: ac._id})
//                                 }, function (err) {
//                                     logger.error(TAG, "ERR: " + err);
//                                     return apiHandler.SYS_DB_ERROR(res, err);
//                                 });
//                             break;
//                         default:
//                             break;
//                     }
//
//                     return apiHandler.OUTER_DEF(res, err);
//                 });
//         }
//         //else {
//         //  ValidateService.createCode(data.phoneNum)
//         //    .then(function (ac) {
//         //      commonUtil.sendSms("408913", data.phoneNum, "#code#=" + ac.authCode);
//         //      apiHandler.CREATED(res, {authCodeId: ac._id})
//         //    }, function (err) {
//         //      logger.error(TAG, "ERR: " + err);
//         //      apiHandler.OUTER_DEF(res, err);
//         //    });
//         //}
//     };
//
//     commonUtil.validate(payload, fields, onSuccess, onFailure);
// };
module.exports = exports = new AuthController();
