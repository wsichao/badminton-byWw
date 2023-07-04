var
  _ = require('underscore'),
  util = require('util'),
  commonUtil = require('../../lib/common-util'),
  apiHandler = require('../configs/ApiHandler'),
  ErrorHandler = require('../../lib/ErrorHandler'),
  configs = require('../configs/api'),
  serverConf = require('../configs/server'),
  constants = require('../configs/constants'),
  serverConfigs = require('../configs/server'),
  Q = require("q"),
  Promise = require('promise'),
  ValidateService = require('../services/ValidateService'),
  CustomerService = require('../services/CustomerService'),
  OrderService = require('../services/OrderService'),
  CallbackService = require('../services/CallbackService'),
  JPushService = require('../services/JPushService'),
  LoggerService = require('../services/LoggerService'),
  DoctorService = require('../services/DoctorService'),
  SuggestionService = require('../services/SuggestionService'),
  ApplicationService = require('../services/ApplicationService'),
  MomentService = require('../services/MomentService'),
  HongbaoService = require('../services/HongbaoService'),
  MessageService = require('../services/MessageService'),
  CacheService = require('../services/CacheService'),
  TransactionMysqlService = require('../services/TransactionMysqlService'),
  SocialRelService = require('../services/SocialRelService'),
  MomentMsgService = require('../services/MomentMsgService');
var SMS_MOMENT_DES_LEN = 100;//300
var DoctorController = function () {
};
DoctorController.prototype.constructor = DoctorController;

DoctorController.prototype.getInfoByID = function (req, res) {
  var userId = req.query.userId;
  var customerId = req.query.customerId;

  var doctor;
  DoctorService.getInfoByID(userId)
    .then(function (d) {
      if (!d) {
        throw ErrorHandler.getBusinessErrorByCode(1503);
      } else {
        doctor = d;
        var now = new Date();
        var lastPriceChgAt = new Date(doctor.lastPriceChgAt);
        doctor.isPriceEdit = true;
        doctor.priceLevelList = [
          {
            level: "零",
            title: "免费"
          },
          {
            level: "一",
            title: "5分钟内8元，之后2元/分钟"
          },
          {
            level: "二",
            title: "5分钟内16元，之后4元/分钟"
          },
          {
            level: "三",
            title: "5分钟内40元，之后10元/分钟"
          },
          {
            level: "四",
            title: "5分钟内80元，之后18元/分钟"
          },
        ]
        // FIXME: 不需要查询???
        if (customerId)
          return CustomerService.getInfoByID(customerId);
      }
    })
    .then(function (c) {
      doctor = JSON.parse(JSON.stringify(doctor));
      doctor.commentNum = doctor.commentNum || 0;
      doctor.zanNum = doctor.zanNum || 0;
      doctor.profile = doctor.profile || "";
      doctor.occupation = doctor.occupation || "";
      doctor.position = doctor.position || "";
      doctor.profileModifyAppStatus = doctor.profileModifyAppStatus || 0;
      doctor.lastPriceChgAt = doctor.lastPriceChgAt || 0;
      doctor.applicationId = doctor.applicationId || "";
      doctor.city = doctor.city || "";
      doctor.province = doctor.province || "";
      doctor.callPriceDescription = DoctorService.callPriceDescription(doctor);


      console.log(JSON.stringify(doctor));
      apiHandler.OK(res, doctor);
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};

DoctorController.prototype.getAllInfoByID = function (req, res) {
  var userId = req.query.userId;
  var customerId = req.query.customerId;

  var doctor;
  DoctorService.getAllInfoByID(userId)
    .then(function (d) {
      if (!d) {
        throw ErrorHandler.getBusinessErrorByCode(1503);
      } else {
        doctor = d;

        if (customerId)
          return CustomerService.getInfoByID(customerId);
      }
    })
    .then(function (c) {
      doctor = JSON.parse(JSON.stringify(doctor));
      if (c) {
        doctor.callPriceDescription = DoctorService.callPriceDescription(doctor);
      } else {
        doctor.callPriceDescription = DoctorService.callPriceDescription(doctor);
      }

      console.log(JSON.stringify(doctor));
      apiHandler.OK(res, doctor);
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};

DoctorController.prototype.getInfoByDocGrpId = function (req, res) {
  var docGrpId = req.query.docGrpId;
  if (!docGrpId || !commonUtil.isUUID24bit(docGrpId)) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }
  DoctorService.getInfoByDocGrpId(docGrpId, "avatar department docChatNum hospital position realName sex")
    .then(function (u) {
      if (!u) {
        apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
      } else {
        console.log(u);
        apiHandler.OK(res, u);
      }
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
  //return apiHandler.OK(res, [
  //  {
  //    realName: "张三",
  //    avatar: "",
  //    docChatNum: 1111,
  //    hospital: "北京天坛医院",
  //    department: "肿瘤科",
  //    position: "主任医师"
  //  },{
  //    realName: "李四",
  //    avatar: "",
  //    docChatNum: 2222,
  //    hospital: "北京肿瘤医院",
  //    department: "肿瘤科",
  //    position: "副主任医师"
  //  },{
  //    realName: "王五",
  //    avatar: "",
  //    docChatNum: 33333,
  //    hospital: "北医三院",
  //    department: "肿瘤科",
  //    position: "医师"
  //  }
  //]);
};

DoctorController.prototype.getInfoByDocChatNum = function (req, res) {
  var docChatNum = req.query.docChatNum;
  var deviceId = req.headers[constants.HEADER_DEVICE_ID] || '';
  var customerId = req.headers[constants.HEADER_USER_ID] || "";

  var doctor;
  DoctorService.getInfoByDocChatNum(docChatNum)
    .then(function (d) {
      if (!d) {
        throw ErrorHandler.getBusinessErrorByCode(1503);
      } else {
        doctor = d;

        if (customerId)
          return CustomerService.getInfoByID(customerId);
      }
    })
    .then(function (c) {
      doctor = JSON.parse(JSON.stringify(doctor));

      if (c) {
        doctor.callPriceDescription = DoctorService.callPriceDescription(doctor);
      } else {
        doctor.callPriceDescription = DoctorService.callPriceDescription(doctor);
      }
      return CustomerService.getInfoByDocChatNum(docChatNum)
    })
    .then(function(_user){
      doctor.mainPageTitle = _user.mainPageTitle;
      console.log(JSON.stringify(doctor));
      apiHandler.OK(res, doctor);

      if (deviceId) {
        LoggerService.trace(LoggerService.getTraceDataByReq(req));
        //DoctorService.addQueryDeviceId(doctor._id, deviceId);
      }
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};

DoctorController.prototype.getInfoByPhone = function (req, res) {
  var phone = req.query.phoneNum;

  DoctorService.getInfoByPhone(phone)
    .then(function (u) {
      if (!u) {
        apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
      } else {
        console.log(u);
        apiHandler.OK(res, u);
      }
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};

DoctorController.prototype.resetPWD = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['authCode', 'phoneNum', 'password']
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {

    ValidateService.validateByPhone(data.phoneNum, data.authCode)
      .then(function (v) {
        return DoctorService.resetPWD(data.phoneNum, data.password);
      })
      .then(function (u) {
        console.log(u);
        apiHandler.OK(res);
        LoggerService.trace(LoggerService.getTraceDataByReq(req)); //和发送验证码的log一起用，不能删
      },
      function (err) {
        console.log(err);
        apiHandler.handleErr(res, err);
      });

  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};
/**
 * 发布新闻
 * 1. 定义接收的数据格式
 *    news: {
 *      account: "顾问号", // required
 *      content: "新闻正文", // required
 *      pics: ["新闻配图1","新闻配图2",...] // optional
 *    }
 * 2. 数据映射
 *  req.identity
 *  req.identity.userId
 *  req.identity.user
 *  optional: ["message2Customer", 'pics']
 * 3. 转发
 * @param req
 * @param res
 * @param next
 */
DoctorController.prototype.news = function (req, res, next) {
  var payload = req.body;
  var fields = {
    required: ["account", "content"],
    optional: ["pics", "location", "momentURL"]
  };
  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data){
    try {
      var momentArray = data.momentURL;
      if(momentArray){
        console.log(typeof data.momentURL);
        if((typeof data.momentURL) == 'string'){
          momentArray = JSON.parse(momentArray);
        }
        if(!momentArray || !momentArray[0]){
          return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(2206));
        }
      }
    } catch (e) {
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(2206));
    }
    if(data.momentURL && !data.content){
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(2205));
    }
    if(!(/^80[5|6]/.test(data.account))){
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(2206));
    }

    if ((typeof data.account == "string") && (data.account.length >= 5)){
      CustomerService.getInfoByDocChatNum(data.account)
        .then(function(account){
          if (!account) return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
          req.identity = {
            userId : account._id,
            user: account
          };
          req.body = {
            message2Customer: data.content,
            pics: data.pics || [],
            location: data.location || '',
            momentURL: momentArray || [],
          };
          return next();
        }, function(err){
          console.log("err");
          return apiHandler.handleErr(res, err);
        })
    }else{
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
    }
  };
  commonUtil.validate(payload, fields, onSuccess, onFailure);
};
/**
 *
 * 规则：
 *  1. 如果有图片，必须有文字内容
 *  2. 如果有红包，必需有文字内容
 *  3. 如果没有附加信息，而且没有文字，则是清空动态
 *
 * @param req
 * @param res
 */
DoctorController.prototype.moment = function (req, res) {
  var payload = req.body;
  var id = req.identity && req.identity.userId;
  //var version = req.identity.appVersion;
  var appUser = req.identity && req.identity.user ? req.identity.user : '';

  if (!commonUtil.isUUID24bit(id) || !commonUtil.isExist(appUser)) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }
  // TODO: 如果没有开通顾问权限是不能发动态的
  var fields = {
    optional: ["message2Customer", 'pics', 'hongbao', 'recommendedUser','singlePicWidth','singlePicHeight','location', 'momentURL']
    //hongbao-红包id, recommendedUser-被推荐人主账号ID, 发布动态的位置
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    //if (data.message2Customer) {//非法动态内容验证
    //  var flag = commonUtil.isValidSmsTxt(data.message2Customer);
    //  //if (flag == 0)
    //  //  return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(2104));
    //  if (flag < 0)
    //    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(2103));
    //}
    var canMomentPublished = true;
    var momentType = '';
    var mapMoment = '【图片】';
    var hasPics = data.pics && data.pics.length ? true : false;
    if(!data.message2Customer && !hasPics){
      canMomentPublished = false;
    }else if(!data.message2Customer && hasPics){
      momentType = 'pic';
    }
    var user = appUser, moment, hongbao , oldUserRef , fansUsers = [] ,fansUsersPushId = [];
    //CustomerService.getInfoByID(id)
    Promise.resolve().then(function () {
      if(!canMomentPublished){
        throw ErrorHandler.getBusinessErrorByCode(2204);
      }
      if (data.hongbao) {
        return HongbaoService.getInfoById(data.hongbao);
      }
    })
      .then(function (_hongbao) {
        if (_hongbao) {
          hongbao = _hongbao;
          return OrderService.commonFindOrderById(OrderService.CONS.TYPE.HONGBAO, _hongbao.order);
        }
      })
      .then(function (_order) {
        if (data.hongbao) {
          if (!_order) {
            throw ErrorHandler.getBusinessErrorByCode(2100);
          }
          if (_order && _order.payStatus != 'paid') {
            throw ErrorHandler.getBusinessErrorByCode(2101);
          }
        }
        if (canMomentPublished) {
          //商户-shop,医疗-medical,金融-finance,个人-personal
          var userInfo = {
            shopVenderApplyStatus: user.shopVenderApplyStatus,
            shopType: user.shopType,
            docChatNum: user.docChatNum,
            hasMomentLocation: data.location && data.location.indexOf(',') > -1 ? true : false
          }
          var moment = {};
          moment._id = commonUtil.getNewObjectId();
          moment.type = getMomentType(userInfo);
          if((['shop', 'medical'].indexOf(moment.type) > -1) && !userInfo.hasMomentLocation){
            moment.shopLocation = user.shopLocation || [];
          }
          //console.log('moment.shopLocation:', moment.shopLocation);
          moment.userId = id;
          moment.userRefId = user.doctorRef._id + '';
          moment.userName = user.name;
          moment.userDocChatNum = user.docChatNum;
          moment.userCity = user.shopCity || user.city;
          moment.originalContent = data.message2Customer || "";
          moment.displayContent = data.message2Customer || "";
          moment.momentURL = data.momentURL || [];
          moment.pics = data.pics || [];
          moment.originalUser = {};
          moment.originalUser.userId = id;
          moment.originalUser.userName = user.shopName || user.name;
          moment.originalUser.docChatNum = user.docChatNum;
          moment.originalUser.userCity = user.shopCity || user.city;
          moment.originalUser.moment = moment._id;
          moment.location = data.location && data.location.indexOf(',') > -1 ? data.location.split(',').reverse() : [];

          if(data.recommendedUser){
            moment.recommendedUser = data.recommendedUser;
          }
          if (data.hongbao) {
            moment.hongbao = data.hongbao;
          }
          if (hongbao) {
            moment.hongbaoTotalCount = hongbao.totalCount;
            moment.hongbaoTotalValue = hongbao.totalValue;
          }
          if(data.pics && data.pics.length ==1){
            moment.singlePicWidth = data.singlePicWidth;
            moment.singlePicHeight = data.singlePicHeight;
          }
          return MomentService.createMoment(moment);
        }
      })
      .then(function (m) {
        var msgData = {};
        msgData.currentMoment = data.message2Customer || "";
        if (m) {
          moment = m;
          msgData.momentRef = m._id;
          msgData.momentUpdatedAt = m.createdAt;
          msgData.momentLocation = m.location || [];
          msgData.momentType = momentType;
          msgData.momentURL = data.momentURL || [];
        } else {
          msgData.momentRef = null;
        }
        //更新主账户信息
        return CustomerService.updateBaseInfo(user._id, msgData);
      })
      .then(function () {
        if (data.hongbao) {
          return HongbaoService.updateHongbao({"_id": data.hongbao}, {"moment": moment._id})
        }
      })
      .then(function () {
        var dData = {};
        dData.message2Customer = data.message2Customer || "";
        // 更新主账户信息, 为了兼容< 4.0.0版本的接口
        return DoctorService.updateBaseInfo(user.doctorRef._id, dData);
      })
      .then(function (d) {
        var msg_name = '';
        if (appUser.shopVenderApplyStatus >= 3) {
          msg_name = appUser.shopName;
        } else if (appUser.shopVenderApplyStatus <= 2) {
          msg_name = appUser.name;
        }
        var userInfo = {
          userId: appUser._id + '',
          doctorRefId: appUser.doctorRef._id + '',
          blackList: appUser.blackList,
          msg_name: msg_name
        }
        var momentInfo = {
          _id: moment._id,
          originalMomentId: moment.originalMomentId,
          content: data.message2Customer || mapMoment
        }
        return CustomerService.sendMomentMsgs(userInfo, momentInfo);
      })
      .then(function() {
        apiHandler.OK(res, {}); //todo:
        LoggerService.trace(LoggerService.getTraceDataByReq(req)); //记录发送的动态 todo:
        //建立关系
        if(!data.recommendedUser){
          return;
        }
        var fanCount = 0, fromUser, toUser = user;
          CustomerService.countFans(user.doctorRef._id)
            .then(function (_count) {
              fanCount = _count || 0;
              return CustomerService.getMainInfoByID(data.recommendedUser, {
                fields: 'doctorRef'
              });
            })
            .then(function (_user) {
              if (!_user) {
                return null;
              }
              fromUser = _user;
              var cond = {
                type: "recmnd_fans",
                fromId: fromUser.doctorRef,
                toId: toUser.doctorRef._id,
                isDeleted: false
              }
              console.log('cond:', cond);
              var update = {
                weight: fanCount
              }
              return DoctorService.updateRel(cond, update);
            })
            .then(function (_rel) {
              console.log('_rel:', _rel);

              if (!_rel) {
                var rel = {
                  type: "recmnd_fans",
                  fromId: fromUser.doctorRef + '',
                  toId: toUser.doctorRef._id + '',
                  fromRef: commonUtil.getObjectIdByStr(fromUser.doctorRef),
                  toRef: commonUtil.getObjectIdByStr(toUser.doctorRef._id),
                  //fans: [order._id + ""],
                  weight: fanCount
                }
                console.log('rel:', rel);
                DoctorService.createRel(rel);
              }
            });
      },
      function (err) {
        console.log(err);
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};


/**
 *
 * 活动发送红包动态
 * 1. 50%的几率会发出红包动态
 * 2. 概率触发红包，每个红包包含10份，自己会得到一份，剩余九份需要其它用户进去其主页领取
 * 3. 每个红包2元，每份红包0.01-0.4元
 * 4. 每天最多有1000个用户触发红包动态
 * 5. 同一用户，一天只会触发一次红包动态
 *
 * @param req
 * @param res
 */
DoctorController.prototype.moment_red_paper = function (req, res) {
  var payload = req.body;
  var id = req.identity && req.identity.userId;
  var appUser = req.identity && req.identity.user ? req.identity.user : '';

  if (!commonUtil.isUUID24bit(id) || !commonUtil.isExist(appUser)) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }
  // TODO: 如果没有开通顾问权限是不能发动态的
  var fields = {
    optional: ["message2Customer", 'pics', 'hongbao', 'recommendedUser','singlePicWidth','singlePicHeight','location', 'momentURL','mock']
    //hongbao-红包id, recommendedUser-被推荐人主账号ID, 发布动态的位置
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    if(data.mock){
      var mockResult = {
        code : 200,
        msg : '发送成功' ,
        redPaperAmount : 0.38 ,
        redPaperNumber : 9 ,
        shareAmount : 3 ,
        isRedPaper : true
      }
      apiHandler.OK(res,mockResult);
    }
    var canMomentPublished = true;
    var momentType = '';
    var mapMoment = '【图片】';
    var hasPics = data.pics && data.pics.length ? true : false;
    if(!data.message2Customer && !hasPics){
      canMomentPublished = false;
    }else if(!data.message2Customer && hasPics){
      momentType = 'pic';
    }
    var user = appUser, moment, hongbao , oldUserRef ,
      fansUsers = [] ,fansUsersPushId = [] ,redPaperAmount,redPaperNumber,isRedPaper = false;

    var redPaperService = Backend.service("1/red_paper","red_paper");

    Promise.resolve().then(function () {
      if(!canMomentPublished){
        throw ErrorHandler.getBusinessErrorByCode(2204);
      }
      if (data.hongbao) {
        return HongbaoService.getInfoById(data.hongbao);
      }
    })
      .then(function (_hongbao) {
        if (_hongbao) {
          hongbao = _hongbao;
          return OrderService.commonFindOrderById(OrderService.CONS.TYPE.HONGBAO, _hongbao.order);
        }
      })
      .then(function (_order) {
        if (data.hongbao) {
          if (!_order) {
            throw ErrorHandler.getBusinessErrorByCode(2100);
          }
          if (_order && _order.payStatus != 'paid') {
            throw ErrorHandler.getBusinessErrorByCode(2101);
          }
        }
        var configService = Backend.service('common','config_service');
        return configService.getTagsByUserId(id);
      })
      .then(function(_tags){
        if (canMomentPublished) {
          //商户-shop,医疗-medical,金融-finance,个人-personal
          var userInfo = {
            shopVenderApplyStatus: user.shopVenderApplyStatus,
            shopType: user.shopType,
            docChatNum: user.docChatNum,
            hasMomentLocation: data.location && data.location.indexOf(',') > -1 ? true : false
          }
          var moment = {};
          moment._id = commonUtil.getNewObjectId();
          moment.type = getMomentType(userInfo);
          if((['shop', 'medical'].indexOf(moment.type) > -1) && !userInfo.hasMomentLocation){
            moment.shopLocation = user.shopLocation || [];
          }
          //console.log('moment.shopLocation:', moment.shopLocation);
          moment.userId = id;
          moment.userRefId = user.doctorRef._id + '';
          moment.userName = user.name;
          moment.userDocChatNum = user.docChatNum;
          moment.userCity = user.shopCity || user.city;
          moment.originalContent = data.message2Customer || "";
          moment.displayContent = data.message2Customer || "";
          moment.momentURL = data.momentURL || [];
          moment.pics = data.pics || [];
          moment.originalUser = {};
          moment.originalUser.userId = id;
          moment.originalUser.userName = user.shopName || user.name;
          moment.originalUser.docChatNum = user.docChatNum;
          moment.originalUser.userCity = user.shopCity || user.city;
          moment.originalUser.moment = moment._id;
          moment.location = data.location && data.location.indexOf(',') > -1 ? data.location.split(',').reverse() : [];
          moment.tags = _tags || [];

          if(data.recommendedUser){
            moment.recommendedUser = data.recommendedUser;
          }
          if (data.hongbao) {
            moment.hongbao = data.hongbao;
          }
          if (hongbao) {
            moment.hongbaoTotalCount = hongbao.totalCount;
            moment.hongbaoTotalValue = hongbao.totalValue;
          }
          if(data.pics && data.pics.length ==1){
            moment.singlePicWidth = data.singlePicWidth;
            moment.singlePicHeight = data.singlePicHeight;
          }
          return MomentService.createMoment(moment);
        }
      })
      .then(function (m) {
        var msgData = {};
        msgData.currentMoment = data.message2Customer || "";
        if (m) {
          moment = m;
          msgData.momentRef = m._id;
          msgData.momentUpdatedAt = Date.now();
          msgData.momentLocation = m.location || [];
          msgData.momentType = momentType;
          msgData.momentURL = data.momentURL || [];
        } else {
          msgData.momentRef = null;
        }
        //更新主账户信息
        return CustomerService.updateBaseInfo(user._id, msgData);
      })
      .then(function () {
        if (data.hongbao) {
          return HongbaoService.updateHongbao({"_id": data.hongbao}, {"moment": moment._id})
        }
      })
      /**
       * v4.14 发动态 50%的几率生成红包
       */
      .then(function(){
        //1.几率创建红包
        return redPaperService.chanceGetRedPaper(moment._id,id,data.location);
      })
      .then(function(redPapers){
        //2.抢到红包，更新红包状态
        if(redPapers && redPapers.length > 0){
          redPaperNumber = redPapers.length - 1;
          return redPaperService.getRedPaper(moment._id,id)
        }
      })
      .then(function(redPaper){

        //3.平账
        var orginalUserName = moment.userName;
        if(redPaper){
          isRedPaper = true;
          redPaperAmount = redPaper.amount;
          var redPaperOrderId = "hongbao_" + commonUtil.getNewObjectId();
          var sqls = TransactionMysqlService.genMomentRedPaperSqls(id, redPaper.amount, redPaperOrderId, "",
            false, {hongbaoFrom: orginalUserName});
          return TransactionMysqlService.execSqls(sqls);
        }
      })
      .then(function () {
        var dData = {};
        dData.message2Customer = data.message2Customer || "";
        // 更新主账户信息, 为了兼容< 4.0.0版本的接口
        return DoctorService.updateBaseInfo(user.doctorRef._id, dData);
      })

      .then(function (d) {
        var msg_name = '';
        if (appUser.shopVenderApplyStatus >= 3) {
          msg_name = appUser.shopName;
        } else if (appUser.shopVenderApplyStatus <= 2) {
          msg_name = appUser.name;
        }
        var userInfo = {
          userId: appUser._id + '',
          doctorRefId: appUser.doctorRef._id + '',
          blackList: appUser.blackList,
          msg_name: msg_name
        }
        var momentInfo = {
          _id: moment._id,
          originalMomentId: moment.originalMomentId,
          content: data.message2Customer || mapMoment
        }
        return CustomerService.sendMomentMsgs(userInfo, momentInfo);
      })
      .then(function() {
          //粉丝
          var result = {
            code : 200,
            msg : '发送成功' ,
            redPaperAmount : redPaperAmount ,
            redPaperNumber : redPaperNumber ,
            shareAmount : 3 ,
            isRedPaper : isRedPaper
          }
          apiHandler.OK(res,result);
          LoggerService.trace(LoggerService.getTraceDataByReq(req)); //记录发送的动态

          //建立关系
          if(!data.recommendedUser){
            return;
          }
          var fanCount = 0, fromUser, toUser = user;
          CustomerService.countFans(user.doctorRef._id)
            .then(function (_count) {
              fanCount = _count || 0;
              return CustomerService.getMainInfoByID(data.recommendedUser, {
                fields: 'doctorRef'
              });
            })
            .then(function (_user) {
              if (!_user) {
                return null;
              }
              fromUser = _user;
              var cond = {
                type: "recmnd_fans",
                fromId: fromUser.doctorRef,
                toId: toUser.doctorRef._id,
                isDeleted: false
              }
              console.log('cond:', cond);
              var update = {
                weight: fanCount
              }
              return DoctorService.updateRel(cond, update);
            })
            .then(function (_rel) {
              console.log('_rel:', _rel);

              if (!_rel) {
                var rel = {
                  type: "recmnd_fans",
                  fromId: fromUser.doctorRef + '',
                  toId: toUser.doctorRef._id + '',
                  fromRef: commonUtil.getObjectIdByStr(fromUser.doctorRef),
                  toRef: commonUtil.getObjectIdByStr(toUser.doctorRef._id),
                  //fans: [order._id + ""],
                  weight: fanCount
                }
                console.log('rel:', rel);
                DoctorService.createRel(rel);
              }
            });
        },
        function (err) {
          console.log(err);
          apiHandler.handleErr(res, err);
        });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};


DoctorController.prototype.switchOnline = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['userId', 'isOnline']
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var id = data.userId;
    delete data.userId;

    data.updatedAt = Date.now();
    data.isOnlineOnLogout = data.isOnline;
    DoctorService.updateBaseInfo(id, data)
      .then(function (u) {
        apiHandler.OK(res);

        //如果isOnline = true,通知打过电话的患者
        if (data.isOnline == true && u.offlineCallers != undefined && u.offlineCallers.length > 0) {
          var phones = "";
          for (var i = 0; i < u.offlineCallers.length; i++)
            phones += u.offlineCallers[i] + ",";

          commonUtil.sendSms("930323", phones, "#docName#=" + u.realName +
            "&#docChatNum#=" + commonUtil.stringifyDocChatNum(u.docChatNum) +
            "&#url#=" + constants.customerPublicDownloadURL);

          DoctorService.cleanOnflineCallers(u._id);
        }
      },
      function (err) {
        console.log(err);
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

var _genCallPrice = function (level) {
  var callPrice = {
    "discount": 1,
    "customerInitiateTime": 5,
    "doctorInitiateTime": 5
  };
  var limitMin = 15; //默认可欠费时限
  if (level == "零") {
    callPrice.initiatePayment = 0;
    callPrice.initiateIncome = 0;
    callPrice.paymentPerMin = 0;
    callPrice.incomePerMin = 0;
    callPrice.canLackMoney = false;
  } else if (level == "一") {
    callPrice.initiatePayment = 10;
    callPrice.initiateIncome = 8;
    callPrice.paymentPerMin = 3;
    callPrice.incomePerMin = 2;
    callPrice.canLackMoney= true;
  } else if (level == "二") {
    callPrice.initiatePayment = 20;
    callPrice.initiateIncome = 16;
    callPrice.paymentPerMin = 5;
    callPrice.incomePerMin = 4;
    callPrice.canLackMoney = true;
  } else if (level == "三") {
    callPrice.initiatePayment = 50;
    callPrice.initiateIncome = 40;
    callPrice.paymentPerMin = 12;
    callPrice.incomePerMin = 10;
    callPrice.canLackMoney = true;
  } else if (level == "四"){
    callPrice.initiatePayment = 100;
    callPrice.initiateIncome = 80;
    callPrice.paymentPerMin = 22;
    callPrice.incomePerMin = 18;
    callPrice.canLackMoney = true;
  } else if (level == "五") {
    callPrice.initiatePayment = 10;
    callPrice.initiateIncome = 8;
    callPrice.paymentPerMin = 3;
    callPrice.incomePerMin = 2;
    callPrice.canLackMoney= false;
  } else if (level == "六") {
    callPrice.initiatePayment = 20;
    callPrice.initiateIncome = 16;
    callPrice.paymentPerMin = 5;
    callPrice.incomePerMin = 4;
    callPrice.canLackMoney = false;
  } else if (level == "七") {
    callPrice.initiatePayment = 50;
    callPrice.initiateIncome = 40;
    callPrice.paymentPerMin = 12;
    callPrice.incomePerMin = 10;
    callPrice.canLackMoney = false;
  } else if (level == "八"){
    callPrice.initiatePayment = 100;
    callPrice.initiateIncome = 80;
    callPrice.paymentPerMin = 22;
    callPrice.incomePerMin = 18;
    callPrice.canLackMoney = false;
  }
  callPrice.lackedMoney = 0;
  if(callPrice.canLackMoney){
    callPrice.lackedMoney = callPrice.incomePerMin * limitMin;
  }
  return callPrice;
};
DoctorController.prototype.openRegDoctor = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['password', 'from', 'province', 'city', 'phoneNum',
      'realName', 'sex', 'hospital', 'department'],
    optional: ['position', 'managerName'] // , 'chargeLevel'
  };
  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {

    if (data.from !== "ucom")
      return apiHandler.handleErr(res, new ErrorHandler.getBusinessErrorByCode(8001));
    data.chargeLevel = "二"; // 默认全部为二级收费

    DoctorService.getInfoByPhone(data.phoneNum)
      .then(function (u) {
        if (u)
          throw ErrorHandler.getBusinessErrorByCode(1202);
        data.callPrice = _genCallPrice(data.chargeLevel);
        //data.avatar = 'avatar_' + docChatNum + '.jpg';
        data.systag = 'doctor';
        data.password = data.password.toLowerCase();
        delete data.chargeLevel;
        return DoctorService.genDoctorChatNum('80002', 4);
      })
      .then(function (_chatnum) {
        data.docChatNum = _chatnum;

        console.log(data);
        return DoctorService.publicRegDoctor(data);
      })
      .then(function (d) {
        console.log(d);
        if (!d) {
          throw ErrorHandler.getBusinessErrorByCode(1201);
        }
        //主副表需要同步的字段
        var fields = ['realName', 'phoneNum', 'docChatNum', 'sex', 'profile', 'avatar'],
          newCustomer = {};
        newCustomer.doctorRef = d._id;
        newCustomer.from = data.from;
        Object.keys(data).forEach(function (field) {
          if (fields.indexOf(field) > -1) {
            if (field == 'realName') {
              newCustomer.name = data[field];
            } else {
              newCustomer[field] = data[field];
            }
          }
        });
        return CustomerService.createCustomer(newCustomer);
      })
      .then(function (u) {
        if (!u) {
          throw ErrorHandler.getBusinessErrorByCode(1201);
        }
        apiHandler.CREATED(res);
      },
      function (err) {
        console.log(err);
        apiHandler.handleErr(res, err);
      });

  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

DoctorController.prototype.applyTobeDoctor = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['province', 'city', 'phoneNum', 'realName', 'sex', 'hospital', 'department', 'chargeLevel'],
    optional: ['from', 'position', 'managerName', 'occupation']
  };
  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var randomPwd;
    DoctorService.getInfoByPhone(data.phoneNum)
      .then(function (u) {
        if (u)
          throw ErrorHandler.getBusinessErrorByCode(1202);

        data.callPrice = _genCallPrice(data.chargeLevel);
        delete data.chargeLevel;
        //生成热线号
        var startNum = '801';
        var randNum = 6;
        var min = 1;
        return DoctorService.genDoctorChatNum(startNum, randNum, min);   //不审核直接通过
      })
      .then(function (docChatNum) {
        console.log("docChatNum:" + docChatNum);
        data.applyStatus = 'done';
        data.docChatNum = docChatNum;
        randomPwd = "" + commonUtil.getRandomNum(100000, 999999);
        data.password = commonUtil.commonMD5(randomPwd);
        return DoctorService.applyTobeDoctor(data);
      })
      .then(function (u) {
        var update = {};
        update.doctorRef = u._id;
        update.docChatNum = u.docChatNum;
        update.name = u.realName;
        update.sex = u.sex;
        update.occupation = u.occupation;
        update.position = u.position;
        update.hospital = u.hospital;
        update.department = u.department;
        CustomerService.updateBaseInfo(req.identity.userId, update);

        //commonUtil.sendSms("1593424", u.phoneNum,
        //  "#docName#=" + u.realName +
        //  "&#pwd#=" + randomPwd +
        //  "&#url#=" + constants.doctorPublicDownloadURL);
        //
        apiHandler.OK(res, {"docChatNum": u.docChatNum});

        //commonUtil.sendSms("964401", constants.notifyPhones, "#docName#=" + data.realName +
        //"&#phone#=" + data.phoneNum);
      },
      function (err) {
        console.log(err);
        apiHandler.handleErr(res, err);
      });

  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

DoctorController.prototype.getInfoListByIds = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['docIds']
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var ids = data.docIds;

    DoctorService.getUsersByIDs(ids)
      .then(function (data) {
        console.log("data:" + data);
        apiHandler.OK(res, data);
      }, function (err) {
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

//顾问给粉丝打电话
DoctorController.prototype.callCustomerPure = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['userId', 'customerId']
  };

  var doctor, customer, orderId;
  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    DoctorService.getAllInfoByID(data.userId)
      .then(function (d) {
        if (!d) {
          throw ErrorHandler.getBusinessErrorByCode(1503); //用户不存在
        } else {
          doctor = d;
          console.log("doctor:" + d);
          return CustomerService.getInfoByID(data.customerId); //查询患者是否存在
        }
      })
      .then(function (c) {
        if (!c) {
          throw ErrorHandler.getBusinessErrorByCode(1205);//空号
        } else {
          customer = c;
          console.log("customer:" + customer);

          var order = {};
          order.doctorId = doctor._id;
          order.doctorRealName = doctor.realName;
          order.doctorPhoneNum = doctor.phoneNum;
          order.doctorDocChatNum = doctor.docChatNum;
          order.doctorSex = doctor.sex;
          order.doctorAvatar = doctor.avatar;
          order.customerId = customer._id;
          order.customerName = customer.name;
          order.customerPhoneNum = customer.phoneNum;
          order.customerDocChatNum = customer.docChatNum;
          order.customerAvatar = customer.avatar;
          order.callPrice = doctor.callPrice;
          order.direction = "D2C";

          return OrderService.createOrder(order); //生成订单
        }
      })
      .then(function (o) {
        DoctorService.addOrderNum(doctor._id);

        orderId = o._id;
        return OrderService.getBusyPhoneOrder(customer._id, doctor._id, orderId); //查询是否正忙
      })
      .then(function (order) {
        if (order)
          throw ErrorHandler.getBusinessErrorByCode(1304);//通话正忙

        return CallbackService.callback(doctor.phoneNum, customer.phoneNum, constants.callbackMaxCallTime, true); //双向回拨
      })
      .then(function (callback) {
        console.log("callSid:" + callback.callSid);
        return OrderService.updateOrderInfo(orderId, {
          callStatus: "busy",
          callbackId: callback.callSid
        }); //设置callbackId
      })
      .then(function () {
        data = {};
        data.msg = "请注意接听回拨电话" + constants.callbackPhone;
        apiHandler.OK(res, data);
      }, function (err) {
        console.log("err-" + err.code);
        apiHandler.handleErr(res, err);

        if (orderId != null)
          OrderService.updateOrderInfo(orderId, {
            callStatus: 'failed',
            failedReason: err.code
          }); //更新订单
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

//顾问给粉丝打电话
DoctorController.prototype.callCustomer = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['userId', 'customerId'],
    optional: ['callWay']
  };

  var doctor, customer, orderId;
  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var callWay = data.callWay || 'call_both';
    DoctorService.getAllInfoByID(data.userId)
      .then(function (d) {
        if (!d) {
          throw ErrorHandler.getBusinessErrorByCode(1503); //用户不存在
        } else {
          doctor = d;
          //console.log("doctor:" + d);
          if (callWay == 'voip' && (!d.accid || !d.callToken)) {
            throw ErrorHandler.getBusinessErrorByCode(1807); //
          }
          return CustomerService.getInfoByID(data.customerId); //查询患者是否存在
        }
      })
      .then(function (c) {
        if (!c) {
          throw ErrorHandler.getBusinessErrorByCode(1205);//空号
        } else {
          if (callWay == 'voip' && (!c.accid || !c.callToken)) {
            throw ErrorHandler.getBusinessErrorByCode(1808); //被叫方版本低,不支持voip通话
          }
          customer = c;
          //console.log("customer:" + customer);

          var order = {};

          if (callWay == 'voip') {
            order.callWay = 'voip';
            order.callerAccid = doctor.accid;
            order.calleeAccid = customer.accid;
          }

          order.doctorId = doctor._id;
          order.doctorRealName = doctor.realName;
          order.doctorPhoneNum = doctor.phoneNum;
          order.doctorDocChatNum = doctor.docChatNum;
          order.doctorSex = doctor.sex;
          order.doctorAvatar = doctor.avatar;
          order.customerId = customer._id;
          order.customerName = customer.name;
          order.customerPhoneNum = customer.phoneNum;
          order.customerDocChatNum = customer.docChatNum;
          order.customerAvatar = customer.avatar;
          order.callPrice = doctor.callPrice;
          order.direction = "D2C";

          return OrderService.createOrder(order); //生成订单
        }
      })
      .then(function (o) {
        DoctorService.addOrderNum(doctor._id);

        orderId = o._id;
        return OrderService.getBusyPhoneOrder(customer._id, doctor._id, orderId); //查询是否正忙
      })
      .then(function (order) {
        if (order)
          throw ErrorHandler.getBusinessErrorByCode(1304);//通话正忙
        if (callWay == 'call_both') {
          return CallbackService.callback(doctor.phoneNum, customer.phoneNum, constants.callbackMaxCallTime, true); //双向回拨
        } else if (callWay == 'voip') {
          return;
        }
      })
      .then(function (callback) {
        var updateData = {
          callStatus: "busy",
        }
        if (callWay == 'call_both') {
          console.log("callSid:" + callback.callSid);
          updateData.callbackId = callback.callSid;
        }
        return OrderService.updateOrderInfo(orderId, updateData); //设置callbackId
      })
      .then(function (o) {
        data = {};
        if (callWay == 'call_both') {
          data.msg = "请注意接听回拨电话" + constants.callbackPhone;
        } else if (callWay == 'voip') {
          data = {
            callerAccid: doctor.accid,
            callerToken: customer.callToken,
            calleeAccid: customer.accid,
            calleeName: customer.name,
            calleeAvatar: customer.avatar,
            orderId: o._id
          };
        }
        apiHandler.OK(res, data);
      }, function (err) {
        console.log("err-" + err.code);
        if (err.code == 1808) //
        //TODO: 患者端app版本低,短信通知患者端升级版本
          apiHandler.handleErr(res, err);

        if (orderId != null)
          OrderService.updateOrderInfo(orderId, {
            callStatus: 'failed',
            failedReason: err.code
          }); //更新订单
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

//顾问拨打免费电话
DoctorController.prototype.freePhone = function (req, res) {
  var payload = req.body;
  var callBothType = '';
  var user = req.identity && req.identity.user ? req.identity.user : '';
  if (!commonUtil.isExist(user) || !user.doctorRef || !user.doctorRef._id) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }
  var fields = {
    required: ['customerPhone'],
    optional: ['customerName']
  };

  var doctor, customer, orderId;
  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    //if (!data.customerName)
    //  return apiHandler.handleErr(res, new ErrorHandler.getBusinessErrorByCode(1210));

    if (data.customerPhone.startsWith('+86')) {
      data.customerPhone = data.customerPhone.replace('+86', '');
    }
    if (data.customerPhone.startsWith('86')) {
      data.customerPhone = data.customerPhone.replace('86', '');
    }
    if (data.customerPhone.startsWith('086')) {
      data.customerPhone = data.customerPhone.replace('086', '');
    }
    if (data.customerPhone.startsWith('0086')) {
      data.customerPhone = data.customerPhone.replace('0086', '');
    }
    if (data.customerPhone.indexOf('-') >= 0) {
      data.customerPhone = data.customerPhone.replace(/-/g, '');
    }
    //飞语云通话记录号码会包含'(' 或者 ')';
    data.customerPhone = data.customerPhone.replace(/\(|\)/g, '');

    var phoneFixed = commonUtil.isValidFixedPhone(data.customerPhone),//座机号,带中划线
        phoneMobile = commonUtil.isValidPhone(data.customerPhone);
    console.log('phone:', data.customerPhone, phoneFixed, phoneMobile);
    if (!phoneMobile && !phoneFixed) {
      apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1530));
      return;
    }
    //var phoneType = phoneFixed ? 'fixed': 'mobile';
    CustomerService.validUserWithoutUpdate(data.customerPhone, data.customerName, '', 'dFreePhone')
      .then(function (c) {
        customer = c;
        var order = {};
        order.callerId = user._id;
        order.callerRefId = user.doctorRef && user.doctorRef._id ? user.doctorRef._id : '';
        order.callerName = user.name;
        order.callerPhoneNum = user.phoneNum;
        order.callerDocChatNum = user.docChatNum || '';
        order.callerSex = user.sex;
        order.callerAvatar = user.avatar;
        order.calleeId = customer._id;
        order.calleeRefId = customer.doctorRef && customer.doctorRef._id ? customer.doctorRef._id : '';
        order.calleeName = customer.name;
        order.calleePhoneNum = customer.phoneNum;
        order.calleeDocChatNum = customer.docChatNum || '';
        order.calleeAvatar = customer.avatar;
        order.callPrice = constants.FREE_CALL_PRICE;
        order.from = "freePhone";

        return OrderService.createOrder(order); //生成订单
      })
      .then(function (o) {
        DoctorService.addOrderNum(user.doctorRef._id);

        orderId = o._id;
      //  return OrderService.getBusyPhoneOrder(user._id, customer._id, orderId); //查询是否正忙
      //})
      //.then(function (order) {
      //  if (order)
      //    throw ErrorHandler.getBusinessErrorByCode(1304);//通话正忙
        callBothType = CallbackService.getCallBothType(user.callBothType || '', user.phoneNum, data.customerPhone, true);
        if(!callBothType || callBothType == 'yuntongxun'){
          return CallbackService.callback(user.phoneNum, customer.phoneNum, constants.callbackMaxCallTime, true); //双向回拨
        }else{
          return CallbackService.callback_feiyu(user.phoneNum, customer.phoneNum, constants.callbackMaxCallTime, orderId, true,  {}); //feiyu双向回拨
        }
      })
      .then(function (callback) {
        var updateData = {
          callStatus: "busy"
        };
        if(!callBothType || callBothType == 'yuntongxun'){
          console.log("callSid:" + callback.callSid);
          if(!callback || !callback.callSid){
            throw ErrorHandler.getBusinessErrorByCode(1816);
          }
          updateData.channelId = callback.callSid;
        }else{
          callback = callback ? JSON.parse(callback) : null;
          console.log('callback:', callback, typeof callback);
          if(!callback || !callback.result || !callback.result.fyCallId){
            throw ErrorHandler.getBusinessErrorByCode(1816);
          }
          updateData.channelId = callback.result.fyCallId;
          updateData.appId = callback.appId || '';
          updateData.provider = 'feiyucloud';
          updateData.callerShowNum = callback.showNumObj && callback.showNumObj.callerShowNum || '';
          updateData.calleeShowNum = callback.showNumObj && callback.showNumObj.calleeShowNum || '';
        }

        return OrderService.updateOrderInfo(orderId, updateData); //设置callbackId
      })
      .then(function () {
        data = {};
        data.msg = "请注意接听回拨电话" + constants.callbackPhone;
        apiHandler.OK(res, data);
      }, function (err) {
        console.log("err-" + err.code);
        apiHandler.handleErr(res, err);

        if (orderId != null)
          OrderService.updateOrderInfo(orderId, {
            callStatus: 'failed',
            failedReason: err.code
          }); //更新订单
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};


DoctorController.prototype.scanQRCode = function (req, res) {
  var docChatNum = req.query.docChatNum;

  if (docChatNum)
    DoctorService.addScannedNum(docChatNum)
      .then(function () {
        apiHandler.OK(res);

        LoggerService.trace(LoggerService.getTraceDataByReq(req));
      }, function (err) {
        apiHandler.handleErr(res, err);
      });
};

DoctorController.prototype.downloadTrace = function (req, res) {
  var docChatNum = req.query.docChatNum;

  if (docChatNum)
    DoctorService.addDownloadNum(docChatNum)
      .then(function () {
        apiHandler.OK(res);

        LoggerService.trace(LoggerService.getTraceDataByReq(req));
      }, function (err) {
        apiHandler.handleErr(res, err);
      });
};

DoctorController.prototype.shareDoctorTrace = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['userId', 'docId', 'isTimeline']
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    DoctorService.addSharedNum(data.docId)
      .then(function () {
        apiHandler.OK(res);

        LoggerService.trace(LoggerService.getTraceDataByReq(req));
      }, function (err) {
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

DoctorController.prototype.allFavoriteCustomer = function (req, res) {
  var userId = req.query.userId;
  var page = req.query.pageNum;
  var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {createdAt: 1});
  if (!userId)
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));

  var doctor, customers;
  CustomerService.getInfoByID(userId)
    .then(function (u) {
      if (!u) {
        throw ErrorHandler.getBusinessErrorByCode(1503);
      } else {
        return DoctorService.getInfoByID(u.doctorRef)
      }
    })
    .then(function (d) {
      if (!d) {
        apiHandler.OK(res, []);
      } else {
        doctor = d;
        return CustomerService.getAllFavoriteUserByDocIdSortPinYin(d._id, pageSlice)
      }
    })
    .then(function (c) {
      customers = JSON.parse(JSON.stringify(c));
      if (doctor['customerNote'])
        for (var i = 0; i < doctor['customerNote'].length; i++)
          for (var j = 0; j < customers.length; j++)
            if ((customers[j]._id == doctor['customerNote'][i].customerId)) {
              customers[j].note = doctor['customerNote'][i].note;
              break;
            }

      var ids = [];
      for (var i = 0; i < customers.length; i++) {
        customers[i].orderNum = 0;
        ids[i] = customers[i]._id + "";
      }

      return OrderService.favoriteDoctorCustomerPhoneOrderNum(doctor._id + "", ids);
    })
    .then(function (o) {
      //console.log("--->" + util.inspect(o));

      for (var i = 0; i < o.length; i++)
        for (var j = 0; j < customers.length; j++)
          if ((customers[j]._id == o[i]._id)) {
            customers[j].orderNum = o[i].count;
            break;
          }
    })
    .then(function () {
      apiHandler.OK(res, customers);
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};

DoctorController.prototype.updateCustomerNote = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['userId', 'notedUserId', 'note']
  };
  var appUser, notedUser;
  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    console.log("come in");
    var doctor;
    CustomerService.getInfoByID(data.userId)
      .then(function (d) {
        if (!d) {
          throw ErrorHandler.getBusinessErrorByCode(1503);
        } else {
          doctor = d;
          appUser = d;
          return CustomerService.getInfoByID(data.notedUserId);
        }
      })
      .then(function (c) {
        if (!c) {
          apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
        } else {
          notedUser = c;
          var customerNote;
          if (doctor['customerNote'] && doctor['customerNote'].length > 0)
            for (var i in doctor['customerNote'])
              if (c._id == doctor['customerNote'][i].customerId) {
                customerNote = doctor['customerNote'][i];
                break;
              }

          if (customerNote) {
            return CustomerService.modifyCustomerNote(doctor._id, c._id, data.note);
          } else {
            return CustomerService.addCustomerNote(doctor._id, c._id, data.note);
          }
        }
      })
      .then(function () {
        return SocialRelService.getRelByUserId(data.userId, data.notedUserId);
      })
      .then(function(_rel){
        if(_rel){
          return SocialRelService.updateRel(_rel._id, {'noteInfo.desc': data.note});
        }
        var relData = {
          user: appUser._id,
          userDoctorRef: appUser.doctorRef,
          userDocChatNum: appUser.docChatNum,
          relUser: notedUser._id,
          relUserDoctorRef: notedUser.doctorRef,
          relUserDocChatNum: notedUser.docChatNum,
          isRelUserBlocked: (appUser.blockDocs || []).indexOf(notedUser.id + '') > -1 ? true : false,
          isRelUserBlacked: (appUser.blackList || []).indexOf(notedUser.id + '') > -1 ? true : false,
          isUserBlacked: (notedUser.blackList || []).indexOf(appUser.id + '') > -1 ? true : false,
          'noteInfo.desc': data.note || ''
        }
        SocialRelService.createRel(relData);
      })
      .then(function(){
        apiHandler.OK(res);
        LoggerService.trace(LoggerService.getTraceDataByReq(req));
      }, function (err) {
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

DoctorController.prototype.sendSmsToCustomer = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['docId', 'customerId', 'message']
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var doctor;
    DoctorService.getInfoByID(data.docId)
      .then(function (d) {
        if (!d) {
          throw ErrorHandler.getBusinessErrorByCode(1506);
        } else {
          doctor = d;
          return CustomerService.getInfoByID(data.customerId);
        }
      })
      .then(function (c) {
        if (!c) {
          throw ErrorHandler.getBusinessErrorByCode(1503);
        } else {
          commonUtil.sendSms("1183427", c.phoneNum, "#doctorName#=" + doctor.realName +
            "&#docChatNum#=" + commonUtil.stringifyDocChatNum(doctor.docChatNum) +
            "&#message#=" + data.message +
            "&#docChatNum2#=" + commonUtil.stringifyDocChatNum(doctor.docChatNum) +
            "&#url#=" + constants.customerPublicDownloadURL);
        }
      })
      .then(function () {
        apiHandler.OK(res);
        LoggerService.trace(LoggerService.getTraceDataByReq(req));
      }, function (err) {
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

DoctorController.prototype.bindJPush = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['userId', "jPushId"]
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    if (!data.jPushId || data.jPushId.length < 1) {
      apiHandler.OK(res, {});
    }
    DoctorService.getInfoByID(data.userId)
      .then(function (u) {
        if (!u) {
          throw ErrorHandler.getBusinessErrorByCode(1503); //用户不存在
        } else {
          return DoctorService.bindJPush(data.userId, data.jPushId); //绑定极光id
        }
      })
      .then(function (u) {
        console.log(u);
        apiHandler.OK(res, u);
      },
      function (err) {
        console.log(err);
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

//更新状态，推送给关注他的患者同时发送短信
var pushLastMessage2Customer = function (doctor, moment, hongbaoCount) {
  var customers;
  CustomerService.getAllFavoriteUserByDocId(doctor._id)
    .then(function (c) {
      //console.log("---" + util.inspect(c));
      customers = c;
      return CustomerService.getInfoByPhone(doctor.phoneNum)
    })
    .then(function (u) {
      var sendPhones = [];
      if (serverConfigs.env == 1) {
        for (var i = 0; i < customers.length; i++) {
          if (!customers[i].blockDocs || (customers[i].blockDocs && customers[i].blockDocs.indexOf(u._id + '') < 0))
            sendPhones.push(customers[i].phoneNum);
          //sendPhones += customers[i].phoneNum + ",";
        }
      } else {
        sendPhones.push(constants.zly400Phone);
      }

      if (sendPhones) {
        if (moment) {
          var hongbaoDoc = "",
            nameX = doctor.realName;
          if (hongbaoCount) {
            hongbaoDoc = "#前" + hongbaoCount + "名转发领红包#"
          }
          if (!moment.isOriginal) {
            nameX = nameX + "转发";
          } else {
            nameX = nameX + "发布";
          }

          var content = moment.originalContent;
          if (content.length > SMS_MOMENT_DES_LEN) {
            content = content.substr(0, SMS_MOMENT_DES_LEN) + "...(还有" + (content.length - SMS_MOMENT_DES_LEN) + "字)";
          }

          if (moment.pics.length == 1) {
            console.log(moment.pics[0]);
            commonUtil. sendSmsV2(sendPhones, "【朱李叶健康App】" + hongbaoDoc + "您关注的" + nameX +
              "了最新动态：" + content + " " + "图：https://cdn.juliye.net/" + moment.pics[0] + " 打开朱李叶健康(" +
              constants.customerPublicDownloadURL + ")拨" + commonUtil.stringifyDocChatNum(doctor.docChatNum) + "与我联系了解详情。");
          } else if (moment.pics.length > 1) {
            commonUtil.sendSmsV2(sendPhones, "【朱李叶健康App】" + hongbaoDoc + "您关注的" + nameX +
              "了最新动态：" + content + " " + "图：https://cdn.juliye.net/" + moment.pics[0] +
              " (还有" + (moment.pics.length - 1) + "张图片) 打开朱李叶健康(" + constants.customerPublicDownloadURL + ")拨" +
              commonUtil.stringifyDocChatNum(doctor.docChatNum) + "与我联系了解详情。");
          } else {
            //commonUtil.sendSmsV2(sendPhones,"【朱李叶健康】您关注的aaaaaa(热线号bbbbbb)发布了最新动态：ccccccc登录朱李叶健康(dddd)在拨号盘中输入eeeeee即可与我联系。");
            commonUtil.sendSmsV2(sendPhones, "【朱李叶健康App】" + hongbaoDoc + "您关注的" + nameX +
              "了最新动态：" + content + " 打开朱李叶健康(" + constants.customerPublicDownloadURL +
              ")拨" + commonUtil.stringifyDocChatNum(doctor.docChatNum) + "与我联系了解详情。");
          }
        } else {

          var content = doctor.message2Customer;
          if (content.length > SMS_MOMENT_DES_LEN) {
            content = content.substr(0, SMS_MOMENT_DES_LEN) + "...(还有" + (content.length - SMS_MOMENT_DES_LEN) + "字)";
          }
          commonUtil.sendSmsV2(sendPhones, "【朱李叶健康App】您关注的" + doctor.realName +
            "发布了最新动态：" + content + " 打开朱李叶健康(" + constants.customerPublicDownloadURL +
            ")拨" + commonUtil.stringifyDocChatNum(doctor.docChatNum) + "与我联系了解详情。");
        }
      }
    }, function (err) {
      console.log(err);
    });
};


//更新状态，推送给关注他的患者同时发送短信
var pushLastMessage2CustomerNew = function (user, moment, hongbaoCount) {
  if (!user || !user.doctorRef) return;
  var doctor = user.doctorRef;
  var customers;
  CustomerService.getAllFavoriteUserByDocId(doctor._id)
    .then(function (c) {
      //console.log("---" + util.inspect(c));
      customers = c;
      //return CustomerService.getInfoByPhone(doctor.phoneNum)
      var sendPhones = [];
      if (serverConfigs.env == 1 && customers.length <3000) {// 生产环境
        var originalMomentId = moment.originalUser.moment + "";

        for (var i = 0; i < customers.length; i++) {
          if (!customers[i].blockDocs || (customers[i].blockDocs && customers[i].blockDocs.indexOf(user._id + '') < 0))
            if (!CacheService.isUserMomentExistsLocal(
                customers[i].phoneNum,
                "moment")) {
              CacheService.addUserMomentLocal(customers[i].phoneNum, "moment");
              sendPhones.push(customers[i].phoneNum);
            }
          //sendPhones += customers[i].phoneNum + ",";
        }
      } else {// 测试环境
        sendPhones.push(constants.zly400Phone);
      }
      if (sendPhones) {
        var content;
        if (moment) {
          var hongbaoDoc = "",
            nameX = doctor.realName;
          if (hongbaoCount) {
            hongbaoDoc = "#前" + hongbaoCount + "名转发领红包#"
          }
          if (!moment.isOriginal) {
            nameX = nameX + "转发";
          } else {
            nameX = nameX + "发布";
          }

          content = moment.originalContent;
          if (content.length > SMS_MOMENT_DES_LEN) {
            content = content.substr(0, SMS_MOMENT_DES_LEN) + "...(还有" + (content.length - SMS_MOMENT_DES_LEN) + "字)";
          }

          if (moment.pics.length == 1) {
            console.log(moment.pics[0]);
            commonUtil.sendSmsV2(sendPhones, "【朱李叶健康App】" + hongbaoDoc + "您关注的" + nameX +
              "了最新动态：" + content + " " + "图：https://cdn.juliye.net/" + moment.pics[0] + " 打开朱李叶健康(" +
              constants.customerPublicDownloadURL + ")拨" + commonUtil.stringifyDocChatNum(doctor.docChatNum) + "与我联系了解详情。");
          } else if (moment.pics.length > 1) {
            commonUtil.sendSmsV2(sendPhones, "【朱李叶健康App】" + hongbaoDoc + "您关注的" + nameX +
              "了最新动态：" + content + " " + "图：https://cdn.juliye.net/" + moment.pics[0] +
              " (还有" + (moment.pics.length - 1) + "张图片) 打开朱李叶健康(" + constants.customerPublicDownloadURL + ")拨" +
              commonUtil.stringifyDocChatNum(doctor.docChatNum) + "与我联系了解详情。");
          } else {
            //commonUtil.sendSmsV2(sendPhones,"【朱李叶健康】您关注的aaaaaa(热线号bbbbbb)发布了最新动态：ccccccc登录朱李叶健康(dddd)在拨号盘中输入eeeeee即可与我联系。");
            commonUtil.sendSmsV2(sendPhones, "【朱李叶健康App】" + hongbaoDoc + "您关注的" + nameX +
              "了最新动态：" + content + " 打开朱李叶健康(" + constants.customerPublicDownloadURL +
              ")拨" + commonUtil.stringifyDocChatNum(doctor.docChatNum) + "与我联系了解详情。");
          }
        } else {
          content = doctor.message2Customer;
          if (content.length > SMS_MOMENT_DES_LEN) {
            content = content.substr(0, SMS_MOMENT_DES_LEN) + "...(还有" + (content.length - SMS_MOMENT_DES_LEN) + "字)";
          }
          commonUtil.sendSmsV2(sendPhones, "【朱李叶健康App】您关注的" + doctor.realName +
            "发布了最新动态：" + content + " 打开朱李叶健康(" + constants.customerPublicDownloadURL +
            ")拨" + commonUtil.stringifyDocChatNum(doctor.docChatNum) + "与我联系了解详情。");
        }
      }
    }, function (err) {
      console.log(err);
    });
};

DoctorController.prototype.receiveSuggestion = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['content'],
    optional: []
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var userId = req.headers[constants.HEADER_USER_ID] || "";

    DoctorService.getAllInfoByID(userId)
      .then(function (u) {
        if (!u) {
          throw ErrorHandler.getBusinessErrorByCode(1503);
        } else {
          var suggestion = {
            type: '24_doc',
            userId: u._id,
            name: u.realName,
            phoneNum: u.phoneNum,
            content: data.content//反馈信息 
          };

          return SuggestionService.createSuggestion(suggestion);
        }
      })
      .then(function () {
        apiHandler.OK(res);
      }, function (err) {
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

DoctorController.prototype.modifyProfileInfo = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['province', 'city','hospital', 'department'],
    optional: ['position','occupation']
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var user;
  var onSuccess = function (handler, data) {
    CustomerService.getInfoByID(req.identity.userId)
      .then(function (u) {
        user = u;
        return CustomerService.updateBaseInfo(u._id, data);
      })
      .then(function(){
        return DoctorService.updateBaseInfo(user.doctorRef._id, data);
      })
      .then(function (v) {
        apiHandler.OK(res, {isOccupationSet : true, province : v.province, city : v.city});
      }, function (err) {
        apiHandler.handleErr(res, err);
      });

  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

DoctorController.prototype.updateDescription = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['userId', 'profile'],
    optional: []
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var id = data.userId;
    delete data.userId;
    if (_.keys(data).length == 0) {
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8001));
    }

    data.updatedAt = Date.now();

    var doctor;
    DoctorService.getInfoByID(id)
      .then(function (d) {
        if (!d) {
          throw ErrorHandler.getBusinessErrorByCode(1506);
        } else {
          doctor = d;
          return DoctorService.updateBaseInfo(id, data);
        }
      })
      .then(function () {
        apiHandler.OK(res);
      }, function (err) {
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};


DoctorController.prototype.updateChargeLevel = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['userId', 'chargeLevel'],
    optional: []
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var doctor;
    var id = data.userId;
    delete data.userId;
    if (_.keys(data).length == 0) {
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8001));
    }

    data.updatedAt = Date.now();
    data.lastPriceChgAt = Date.now();
    data.callPrice = _genCallPrice(data.chargeLevel);
    delete data.chargeLevel;
    var user;
    CustomerService.getInfoByID(id)
      .then(function (u) {
        if (!u) {
          throw ErrorHandler.getBusinessErrorByCode(1503);
        } else {
          user = u;
          if (u.doctorRef) {
            return DoctorService.getInfoByID(u.doctorRef._id)
          } else {
            throw ErrorHandler.getBusinessErrorByCode(1506);
          }
        }
      })
      .then(function (d) {
        doctor = d;
        data.callPrice.discount = 1;
        if(doctor && doctor.callPrice){
          data.callPrice.discount = doctor.callPrice.discount || 1;
        }
        return DoctorService.updateBaseInfo(user.doctorRef._id, data);
      })
      .then(function () {
        apiHandler.OK(res);
      }, function (err) {
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

DoctorController.prototype.momentZan = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['momentId', 'zanStatus']
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var userId = req.identity.userId;
    var user =  req.identity.user;
    var moment;
    data.updatedAt = Date.now();
    MomentService.getInfoByID(data.momentId)
      .then(function (u) {
        if (!u) {
          throw ErrorHandler.getBusinessErrorByCode(2207);
        } else {
          moment = u;
          var zanStatus = (u.zanUsers && u.zanUsers.indexOf(userId + '') > -1) ? true : false;
          if (data.zanStatus === zanStatus) {
              throw ErrorHandler.getBusinessErrorByCode(2208);
          }
          data.zanUser = userId;
          return MomentService.updateZanStatus(data);
        }
      })
        .then(function(_moment){
          var commentMsgService = Backend.service("1/moment","comment_msg_service");
          if(data.zanStatus == true){
              if(userId != moment.userId) {
                var newComment_msg = {
                  fromUserId: userId,                                        //发评论用户id
                  toUserId: _moment.userId,
                  moment: {
                    momentId: _moment._id,                                    //动态id
                    content: _moment.displayContent,                                     //动态内容
                    pics: _moment.pics                                      //动态图片
                  },
                  isZan: true
                };
                return commentMsgService.createCommentMsg(newComment_msg);
              }
          }else{
              return commentMsgService.deleteCommentMsg(userId,_moment._id);
          }

        })
        .then(function(_newComment_msg){
            return CustomerService.getInfoByID(moment.userId)
        })
        .then(function(_momentUser){
            /**
             * moment-动态, personal-个人留言, sys-系统通知  comment 点赞评论
             * @type {{type: number, contentType: string}}
             */
            //console.log(data.zanStatus, userId, moment.userId);
            if(data.zanStatus == true && userId != moment.userId){
              var momentService = Backend.service('1/moment','moment');
              //console.log('_momentUser:', _momentUser.pushId, _momentUser._id);
              return momentService.sendUnreadReminding(_momentUser._id);
                /*var extras = {
                    type: 1,//有新消息 
                    contentType: 'comment'
                };
                var pushMsg = user.name + '的赞';

                JPushService.pushMessage(_momentUser.pushId , pushMsg , extras);
                JPushService.pushNotification(_momentUser.pushId , pushMsg , extras);*/
            }
        })
      .then(function(){
        //[ 用户行为记录 ] 点赞动态
        var config_service = Backend.service('common', 'config_service');
        var dynamic_sample_service = Backend.service('1/recommend', 'dynamic_sample_service.js');
        if (!data.zanStatus || !userId || !moment || !moment.userId) return;
        return config_service.getTagsByUserId(moment.userId)
          .then(tags => {
            if (!tags || tags.length == 0) return;
            var sample_info = {
              type: 0,
              targetId: moment._id + '',
              action: 1,
              tags: tags
            }
            return dynamic_sample_service.genSample(userId, sample_info);
          })
      })
      .then(function () {
        apiHandler.OK(res, {});
      }, function (err) {
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

DoctorController.prototype.momentTransfer = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['momentId', 'sharedType'],
    optional: ['location']
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var userId = req.identity.userId;
    var user = req.identity.user;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    if (!user.doctorRef && data.sharedType == 'inner') {
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1510));
    }
    var moment,
        momentMan,
        oMoment,
        hongbaoId,
        pushId = '',
        originalUserId = '',
        favouriteUserMainId,
        favouriteUserId,
        favouriteUser,
        fans,
        fansUsers = [] ,
        fansUsersPushId = [];
    // FIXME: TOO DIRTY!!
    var u;
    MomentService.getMomentByID(data.momentId)
      .then(function (_moment) {
        if (!_moment) {
          throw ErrorHandler.getBusinessErrorByCode(2207);
        }
        u = _moment;
        if (u.hongbao) {
          return HongbaoService.getOrderAndHongbaoById(_moment.hongbao);
        }
      })
      .then(function (_hongbao) {
        // 1. 红包里面的order必须是已支付的
        // 2. 订单里面的副账户ID用作默认关注
        if (u.hongbao) {
          if (!_hongbao || !_hongbao.order || (_hongbao.order.payStatus != OrderService.CONS.PAY_STATUS.PAID)) {
            throw ErrorHandler.getBusinessErrorByCode(8005);
          }
          favouriteUserId = _hongbao.order.customerRefId;
          favouriteUserMainId = _hongbao.order.customerId;
        }
        if (!u) {
          throw ErrorHandler.getBusinessErrorByCode(8005);
        } else {
          if (u.isOriginal == false) {
            console.log(" it's not a origin moment");
            originalUserId = u.originalUser.userId;
            MomentService.getInfoByID(u.originalUser.moment)
              .then(function (_moment) {
                var isInc = true;
                for (var i = 0; i < _moment.sharedUsers.length; i++) {
                  if (_moment.sharedUsers[i].userId == userId && _moment.sharedUsers[i].sharedType == data.sharedType) {
                    isInc = false;
                    break;
                  }
                }
                MomentService.updateShare(data, isInc, u.originalUser.moment);
              })
          } else {
            originalUserId = u.userId;
          }
          data.userId = userId;
          var isInc = true;
          for (var i = 0; i < u.sharedUsers.length; i++) {
            if (u.sharedUsers[i].userId == userId && u.sharedUsers[i].sharedType == data.sharedType) {
              isInc = false;
              break;
            }
          }
          return MomentService.updateShare(data, isInc);
        }
      })
      .then(function (om) {
        oMoment = om;
        if (data.sharedType == "inner") {
          //商户-shop,医疗-medical,金融-finance,个人-personal
          var userInfo = {
            shopVenderApplyStatus: user.shopVenderApplyStatus,
            shopType: user.shopType,
            docChatNum: user.docChatNum,
            hasMomentLocation: data.location && data.location.indexOf(',') > -1 ? true : false
          }
          var momentData = {};
          momentData.userId = userId;
          momentData.userRefId = user.doctorRef._id + '';
          momentData.type = getMomentType(userInfo);
          if((['shop', 'medical'].indexOf(momentData.type) > -1) && !userInfo.hasMomentLocation){
            momentData.shopLocation = user.shopLocation || [];
          }
          momentData.userName = user.name;
          momentData.userDocChatNum = user.docChatNum;
          momentData.userCity = user.shopCity || user.city;
          momentData.originalContent = om.originalContent;
          momentData.displayContent = om.displayContent;
          momentData.pics = om.pics;
          momentData.isOriginal = false;
          momentData.originalUser = {};
          momentData.originalUser.userId = om.originalUser.userId;
          momentData.originalUser.userName = om.originalUser.userName;
          momentData.originalUser.docChatNum = om.originalUser.docChatNum;
          momentData.originalUser.userCity = om.originalUser.userCity;
          momentData.originalUser.moment = om.originalUser.moment;
          momentData.hongbao = om.hongbao;
          momentData.hongbaoTotalCount = om.hongbaoTotalCount;
          momentData.hongbaoTotalValue = om.hongbaoTotalValue;
          momentData.recommendedUser = om.recommendedUser;
          momentData.singlePicWidth = om.singlePicWidth;
          momentData.singlePicHeight = om.singlePicHeight;
          momentData.momentURL = om.momentURL;
          momentData.location = data.location && data.location.indexOf(',') > -1 ? data.location.split(',').reverse() : [];
          return MomentService.createMoment(momentData);
        } else {
          return u;
        }
      })
      .then(function (m) {
        moment = m;
        var isRedMoneyBlocked = user.isRedMoneyBlocked || false;// 禁止某人领红包
        if (m.hongbao) {
          console.log("has hongbao")
          hongbaoId = m.hongbao;
          var h;
          return HongbaoService.getInfoById(m.hongbao)
            .then(function (hongbao) {
              if(!hongbao){
                return;
              }
              h = hongbao;
              return CustomerService.getInfoByID(originalUserId, {
                customerFields: 'pushId name shopName shopVenderApplyStatus',
                doctorFields: '_id'
              });
            })
            .then(function (orginalUser) {
              if(!orginalUser){
                return;
              }
              pushId = orginalUser.pushId;
              var sqls = TransactionMysqlService.genHongbaoCatchUsersSqls(h.order);
              TransactionMysqlService.execSqls(sqls)
                .then(function (_userArray) {
                  var flag = true;
                  for (var i = 0; i < _userArray.length; i++) {
                    if (_userArray[i].userId == userId) {
                      flag = false;
                    }
                  }
                  if (flag) { // flag
                    if (h.expiredAt > Date.now() && h.usedCount < h.totalCount && !isRedMoneyBlocked) {
                      //var value = h.values[h.usedCount];
                      var counter, value;
                      // 1. 抢 红包
                      HongbaoService.updateHongbao(
                        {
                          "_id": h._id,
                          usedCount: {$lt: h.totalCount}
                        },
                        {$inc: {"usedCount": 1}}
                        //{"usedCount" : h.usedCount+1, "usedValue": h.usedValue + value}
                      )// 2. 领 红包
                        .then(function (_hongbao) {
                          counter = _hongbao.usedCount - 1;
                          value = _hongbao.values[counter] || 0;
                          return HongbaoService.updateHongbao(
                            {"_id": h._id},
                            {$inc: {"usedValue": value}}
                          );
                        })
                        .then(function (_hongbao) {
                          var orginalUserName = CustomerService.isShopAuthorized(orginalUser.shopVenderApplyStatus) ?
                            orginalUser.shopName || orginalUser.name || '' : orginalUser.name || '';
                          var sqls = TransactionMysqlService.genHongbaoIncomeSqls(userId, value, h.order + "", "",
                            false, {hongbaoFrom: orginalUserName});
                          TransactionMysqlService.execSqls(sqls);

                          //转发动态,领取红包,平账
                          CustomerService.payTheNonPayment(user._id, user.doctorId);

                          var shortName = (user.name ? user.name.substring(0, 4) : '') + (user.name.length > 4 ? '...' : '');
                          var messageContent = user.name + '领取了您的红包,转发了您的动态' + '"' + moment.originalContent + '"';
                          var messageTitle = shortName + '领取了您的第' + (counter + 1) + '个红包';
                          var update = {
                            title: messageTitle,
                            content: messageContent,
                            updatedAt: Date.now(),
                            isViewed: false,
                            messageFrom: userId
                          }
                          MessageService.updateMessage({
                            userId: _hongbao.user,
                            type: 'hongbao_record',
                            orderId: _hongbao.order + ''
                          }, update)
                            .then(function (_message) {
                              if (!_message) {
                                var message = {
                                  userId: _hongbao.user,
                                  type: 'hongbao_record',
                                  title: messageTitle,
                                  content: messageContent,
                                  link_title: '红包领取记录',
                                  link: serverConf.HOST + '/myHongbaoInfo?hongbaoId=' + _hongbao._id,
                                  linkType: 'web',
                                  trxType: '',
                                  orderId: _hongbao.order + '',
                                  messageFrom: userId,
                                  messageTo: u.userId
                                };
                                console.log('message:', message);
                                console.log('pushId:', pushId);
                                MessageService.createMessage(message);
                              }
                              CustomerService.updateBaseInfo(_hongbao.user, {hasNewMessage: true, 'msgReadStatus.sys': true, 'msgReadStatus.all': true});
                              if (pushId) {
                                var extras = {
                                  type: 2 ,//有新消息 1老版本 2 新版本留言
                                  contentType : "sys"
                                };
                                  JPushService.pushMessage(pushId, messageContent, '', extras);
                                if ((h.totalCount - h.usedCount) == 1) {
                                  var notificationExtras = {
                                    type: 3, //type: 1-为收藏推送, 2-消息中心, 3-新消息
                                    contentType : "sys"
                                  };
                                  var messageNotification = user.name + '领取了您的红包,您的红包已被领完';
                                  JPushService.pushNotification(pushId, messageNotification, '', notificationExtras);
                                }
                              }
                            });
                        })
                        .then(function(){
                          return CustomerService.getMainInfoByID(favouriteUserMainId, {fields: 'doctorRef docChatNum'});
                        })
                        .then(function(_favouriteUser){
                          if(!_favouriteUser){
                            throw new Error('not found user');
                          }
                          favouriteUser = _favouriteUser;
                          return SocialRelService.getRelByUserId(userId, favouriteUserMainId);
                        })
                        .then(function(_rel){
                          if(!_rel){
                            var relData = {
                              user: userId,
                              userDoctorRef: user.doctorRef._id,
                              userDocChatNum: user.docChatNum,
                              relUser: favouriteUser._id,
                              relUserDoctorRef: favouriteUser.doctorRef,
                              relUserDocChatNum: favouriteUser.docChatNum,
                              isRelUserFavorite: true,
                              theTrueRelCreatedAt: Date.now()
                            }
                            SocialRelService.createRel(relData);
                          }else{
                            if(!_rel.isRelUserFavorite){
                              SocialRelService.updateRel({_id: _rel._id}, {isRelUserFavorite: true, theTrueRelCreatedAt: Date.now()});
                            }
                            console.log("already favorite");
                          }
                        })
                        .then(function () {
                          console.log("22222222222222" + userId + "," + favouriteUserId);
                          if (userId != u.originalUser.userId && commonUtil.isUUID24bit(favouriteUserId)) {

                            if (!_.contains(user.favoriteDocs, "" + favouriteUserId)) {   //未被收藏则收藏
                              CustomerService.favoriteDoc(userId, favouriteUserId);
                              DoctorService.modifyFavoritedNum(favouriteUserId, 1); //修改收藏数
                            }
                          }
                        }, function(err){
                          console.log(JSON.stringify(err));
                        })
                    }
                  }
                })
            })
        }
      })
      .then(function (u) {
        return CustomerService.getInfoByID(oMoment.userId);
      })
      .then(function (v) {
        if (!v) {
          throw ErrorHandler.getBusinessErrorByCode(1503);
        }
        momentMan = v;
        if (data.sharedType == "inner") {
          var uData = {};
          uData.currentMoment = moment.originalContent; //"首发于@"+ momentMan.name + " " + momentMan.docChatNum + "\n" +
          uData.momentRef = moment._id;
          uData.momentUpdatedAt = moment.createdAt;
          uData.momentLocation = data.location && data.location.indexOf(',') > -1 ? data.location.split(',').reverse() : [];
          uData.momentURL = moment.momentURL || [];
          return CustomerService.updateBaseInfo(userId, uData)
        }
      })
      .then(function (z) {
        if (data.sharedType == "inner") {
          var zData = {};
          zData.message2Customer = moment.originalContent;//"首发于@"+ momentMan.name + " " + momentMan.docChatNum + "\n" +
          return DoctorService.updateBaseInfo(z.doctorRef._id, zData)
        }
      })
      .then(function(){
        if (data.sharedType == "inner") {
          var msg_name = '';
          if (user.shopVenderApplyStatus >= 3) {
            msg_name = user.shopName;
          } else if (user.shopVenderApplyStatus <= 2) {
            msg_name = user.name;
          }
          var userInfo = {
            userId: user._id + '',
            doctorRefId: user.doctorRef._id + '',
            blackList: user.blackList,
            msg_name: msg_name
          }
          var momentInfo = {
            _id: moment._id,
            originalMomentId: data.momentId,
            content: oMoment.displayContent,
            originalUserMoment: moment.originalUser.moment
          }
           return CustomerService.sendMomentTransferMsgs(userInfo, momentInfo);
        }
      })
      .then(function(){
        //[ 用户行为记录 ] 转发动态
        var currentMoment = u;
        var config_service = Backend.service('common', 'config_service');
        var dynamic_sample_service = Backend.service('1/recommend', 'dynamic_sample_service.js');
        if (!userId || !currentMoment || !currentMoment.userId) return;
        return config_service.getTagsByUserId(currentMoment.userId)
          .then(tags => {
            if (!tags || tags.length == 0) return;
            var sample_info = {
              type: 0,
              targetId: currentMoment._id + '',
              action: 3,
              tags: tags
            }
            return dynamic_sample_service.genSample(userId, sample_info);
          })
      })
      .then(function () {
        apiHandler.OK(res, {
          "sharedCount": oMoment.sharedCount,
          "hongbaoId": hongbaoId || "0"
        });
        LoggerService.trace(LoggerService.getTraceDataByReq(req));
        if (data.sharedType == "inner") {
          //创建或更新关系, 转发人非被转发人
          //粉丝数
          if (user.doctorRef && userId != originalUserId) {
            var fanCount = 0, fromUser = originalUserId, toUser = user;
            CustomerService.countFans(user.doctorRef._id)
              .then(function (_count) {
                fanCount = _count || 0;
                return CustomerService.getMainInfoByID(originalUserId, {
                  fields: 'doctorRef'
                });
              })
              .then(function (_user) {
                if (!_user) {
                  return null;
                }
                fromUser = _user;
                var cond = {
                  type: "recmnd_fans",
                  fromId: fromUser.doctorRef,
                  toId: toUser.doctorRef._id,
                  isDeleted: false
                }
                console.log('cond:', cond);
                var update = {
                  weight: fanCount
                }
                return DoctorService.updateRel(cond, update);
              })
              .then(function (_rel) {
                console.log('_rel:', _rel);

                if (!_rel) {
                  var rel = {
                    type: "recmnd_fans",
                    fromId: fromUser.doctorRef + '',
                    toId: toUser.doctorRef._id + '',
                    fromRef: commonUtil.getObjectIdByStr(fromUser.doctorRef),
                    toRef: commonUtil.getObjectIdByStr(toUser.doctorRef._id),
                    //fans: [order._id + ""],
                    weight: fanCount
                  }
                  console.log('rel:', rel);
                  DoctorService.createRel(rel);
                }
                //被转发短信
              });
          }
        }
      }, function (err) {
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

DoctorController.prototype.getDocInfoApplication = function (req, res) {
  var appId = req.query.appId;
  var application;
  ApplicationService.getInfoByID(appId)
    .then(function (d) {
      if (!d) {
        throw ErrorHandler.getBusinessErrorByCode(1503);
      } else {
        application = d;
      }
      console.log(application);
      apiHandler.OK(res, application);
    }, function (err) {
      apiHandler.handleErr(res, err);
    })

};

DoctorController.prototype.getMoment = function (req, res) {
  var momentId = req.query.momentId;
  var userId = req.query.userId;
  var moment;
  MomentService.getInfoByID(momentId)
    .then(function (m) {
      if (!m) {
        apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
      } else {
        moment = m;
        return CustomerService.getInfoByID(m.userId)
      }
    })
    .then(function (u) {
      if (!u) {
        apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
      } else {
        moment = JSON.parse(JSON.stringify(moment))
        moment.userName = u.name;
        moment.avatar = u.avatar;
        moment.docChatNum = u.docChatNum;
        moment.sex = u.sex;
        moment.shopName = u.shopName;
        var moment_msg_service = Backend.service("1/city_buy", "moment_msg");
        var momentURL = moment && moment.momentURL;
        moment.displayURL = moment_msg_service.momentURL(moment.displayContent, momentURL || []);
        if (moment.location && moment.location.length > 0) moment.location = moment.location.reverse();
        // 检查用户是否点赞该动态
        moment.isZan = _.contains(moment.zanUsers, userId);
        apiHandler.OK(res, moment);
      }
    }, function (err) {
      apiHandler.handleErr(res, err);
    });

};


module.exports = exports = new DoctorController();
