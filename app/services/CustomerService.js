/**
 * 患者管理
 *  Authors: Tom
 *  Created by Tom on 5/20/15.
 *  Copyright (c) 2015 ZLYCare. All rights reserved.
 */
var
  async = require('async'),
  _ = require('underscore'),
  Q = require("q"),
  pinyin = require("pinyin"),
  commonUtil = require('../../lib/common-util'),
  encrypt = commonUtil.commonMD5,
  serverconfigs = require('../../app/configs/server'),
  constants = require('../configs/constants'),
  Customer = require('../models/Customer'),
  Shop = require('../models/Shop'),
  Doctor = require('../models/Doctor'),
  Moment = require('../models/Moment'),
  Coupon = require('../models/Coupon'),
  NewPhoneOrder = require('../models/Order').NewPhoneOrder,
  ErrorHandler = require('../../lib/ErrorHandler'),
  SearchService = require('./SearchService'),
  TransactionMysqlService = require('./TransactionMysqlService'),
  OrderService = require('./OrderService'),
  JPushService = require('./JPushService'),
  SocialRelService = require('./SocialRelService'),
  CouponService = require('./CouponService'),
  MessageService = require('./MessageService'),
  MomentMsgService = require('./MomentMsgService'),
  Promise = require('promise'),
  https = require('https'),
  MomentMsg = require('../models/MomentMsg'),
  DoctorService = require('./DoctorService');

var
  logger = require('../configs/logger'),
  filename = 'app/services/CustomerService',
  TAG = logger.getTag(logger.categorys.SERVICE, filename);

var CONS = {
  SOURCE: "docChat"
};

var CustomerService = function () {
};

CustomerService.prototype.constructor = CustomerService;

CustomerService.prototype.token = function (customer) {
  if (customer.accountType == 'Temporary')
    return encrypt(customer._id, serverconfigs.secret, true);
  else {
    if (process.env.NODE_ENV != 'production') {
      console.log('token:', encrypt(customer._id + customer.jkLastestLoginTime, serverconfigs.secret, true));
    }
    // return encrypt(customer._id + customer.lastestLoginTime, serverconfigs.secret, true);
    return encrypt(customer._id + customer.jkLastestLoginTime, serverconfigs.secret, true);
  }
};

/**
 * 手机号注册用户
 * @param phone
 * @param name
 * @param deviceId
 * @param from
 * @param referrer 介绍人id
 * @param source 来源
 * @param thirdParty 第三方登录信息
 * @returns {Promise|*}
 */
CustomerService.prototype.validUser = function (phone, name, gender, deviceId, from, referrer, source, storeChannel, user_center) {
  var condition = {};
  if (user_center && user_center.id) {
    condition.openId = user_center.id;
  } else {
    condition.phoneNum = phone
  }
  condition.isDeleted = false;

  var u;
  return Customer.findOne(condition, Customer.selectFields)
    .populate("doctorRef", Doctor.selectFields)
    .exec().then(function (user) {
      if (!user) { //新用户注册
        console.log("new one coming");
        u = {
          source: 'docChat',
          usedApp: ['docChat'],
          phoneNum: phone,
          gender: gender,
          phoneType: commonUtil.getPhoneType(phone),
          favoriteDocs: [constants.DoctorId_00120],
          collectedDocs: [constants.DoctorId_00120],
          deviceId: deviceId,
          msgReadStatus: {
            all: true, //
            moment: true, //是否有未读的动态
            personal: false, //是否有未读的个人留言
            sys: false//是否有未读的系统通知
          }
        };
        // 4月24号前新用户免费送25元额度
        if (Date.now() < 1493049599000) {
          u["membership.balance"] = 25
        }
        if (source) {
          u.source = source;
        }
        if (user_center) {
          if (user_center.name || user_center.avatar) {
            u.name = user_center.name;
            u.avatar = user_center.avatar;
          }
          u.openId = user_center.id;
        }
        if (name) {
          u.name = name;
          u.pinyinName = toPinYin(name);
        }
        if (from)
          u.from = from;
        if (referrer)
          u.referrer = referrer + '';
        if (from == "webCall") {
          commonUtil.sendSms("1675196", phone, "#url#=" + constants.customerPublicDownloadURL);
        }
        if (storeChannel) {
          u.storeChannel = storeChannel;
        }
        var user;
        return Customer.create(u)
          .then(function (_u) {
            user = _u;
            return Customer.findOne({ _id: constants.twoFourHotLineTeamId }, "momentRef")
          })
          .then(function (_twofour) {
            var momentData = {
              moment: _twofour.momentRef,
              momentUser: constants.twoFourHotLineTeamId,
              msgCreatedAt: Date.now()
            }
            var data = {
              userId: user._id,
              momentList: [
                momentData
              ]
            }
            MomentMsg.create(data);
          })
          .then(function () {
            var startNum = '801';
            var randNum = 6;
            var min = 1;
            //新注册的用户不产生热线号
            //   return DoctorService.genDoctorChatNum(startNum, randNum, min);
            // })
            // .then(function(docChatNum){
            //   console.log("docChatNum:" + docChatNum);
            var docData = {};
            docData.applyStatus = 'done';
            // docData.docChatNum = docChatNum;
            docData.docChatNum = '';
            docData.phoneNum = phone;
            docData.callPrice = {
              customerInitiateTime: 5,
              doctorInitiateTime: 5,
              initiatePayment: 0,
              initiateIncome: 0,
              paymentPerMin: 0,
              incomePerMin: 0,
              canLackMoney: false,
              lackedMoney: 0
            };
            docData.online = true;
            return DoctorService.applyTobeDoctor(docData);
          })
          .then(function (_doctor) {
            var update = {};
            update.doctorRef = _doctor._id;
            update.docChatNum = _doctor.docChatNum;
            var condition = {
              _id: user._id,
              isDeleted: false
            }
            return findOneAndUpdate(condition, update, { new: true });
          })
          .then(function (_user) {
            //新用户送10元会员额度
            var user_service = Backend.service('common', 'user_service');
            user_service.genFreeMembershipForTheNew(user._id + '');
            return _user;
          });

      } else {
        if (from == 'web' || from == 'dFreePhone' || from == 'webCall' || from == "share3Day") { //不更新用户信息
          return user;
        } else {
          u = {
            deviceId: deviceId || user.deviceId,
            $addToSet: { "usedApp": 'docChat' },
            // lastestLoginTime: Date.now(),
            jkLastestLoginTime: Date.now(),
            updatedAt: Date.now(),
            pushId: ""
          };
          if (name) {
            u.name = name;
            u.pinyinName = toPinYin(name);
          }

          return findOneAndUpdate(condition, u, { new: true });
        }
      }
    });
};

/**
 * 手机号注册用户
 * @param phone
 * @param name
 * @param deviceId
 * @param from
 * @param referrer 介绍人id
 * @param source 来源
 * @returns {Promise|*}
 */
CustomerService.prototype.validUserByDocChatNum = function (phone, name, deviceId, from, referrer, source) {
  var condition = {};
  condition.docChatNum = phone;
  condition.isDeleted = false;

  var u;
  return Customer.findOne(condition, Customer.selectFields)
    .populate("doctorRef", Doctor.selectFields)
    .exec().then(function (user) {
      {
        if (from == 'web' || from == 'dFreePhone' || from == 'webCall') { //不更新用户信息
          return user;
        } else {
          u = {
            deviceId: deviceId || user.deviceId,
            $addToSet: { "usedApp": 'docChat' },
            // lastestLoginTime: Date.now(),
            jkLastestLoginTime: Date.now(),
            updatedAt: Date.now()
          };
          if (name) {
            u.name = name;
            u.pinyinName = toPinYin(name);
          }

          return findOneAndUpdate(condition, u, { new: true });
        }
      }
    });
};

/**
 * 手机号注册用户
 * @param phone
 * @param name
 * @param deviceId
 * @param from
 * @param referrer 介绍人id
 * @returns {Promise|*}
 */
CustomerService.prototype.validUserWithoutUpdate = function (phone, name, deviceId, from, referrer) {
  var condition = {};
  condition.phoneNum = phone;
  condition.isDeleted = false;

  var u;
  return Customer.findOne(condition, Customer.selectFields).populate("doctorRef", Doctor.selectFields).exec().then(function (user) {
    if (!user) { //新用户注册
      u = {
        source: 'docChat',
        usedApp: ['docChat'],
        phoneNum: phone,
        favoriteDocs: [constants.DoctorId_00120],
        collectedDocs: [constants.DoctorId_00120],
        deviceId: deviceId
      };
      if (name) {
        u.name = name;
        u.pinyinName = toPinYin(name);
      }
      if (from)
        u.from = from;
      if (referrer)
        u.referrer = referrer + '';
      var user;
      return Customer.create(u)
        .then(function (_u) {
          user = _u;
          return Customer.findOne({ _id: constants.twoFourHotLineTeamId }, "momentRef")
        })
        .then(function (_twofour) {
          var momentData = {
            moment: _twofour.momentRef,
            momentUser: constants.twoFourHotLineTeamId,
            msgCreatedAt: Date.now()
          }
          var data = {
            userId: user._id,
            momentList: [
              momentData
            ]
          }
          console.log(data);
          MomentMsg.create(data);
        })
        .then(function () {
          var startNum = '801';
          var randNum = 6;
          var min = 1;
          return DoctorService.genDoctorChatNum(startNum, randNum, min);
        })
        .then(function (docChatNum) {
          console.log("docChatNum:" + docChatNum);
          var docData = {};
          docData.applyStatus = 'done';
          docData.docChatNum = docChatNum;
          docData.phoneNum = phone;
          docData.realName = user.name || docChatNum;
          docData.callPrice = {
            customerInitiateTime: 5,
            doctorInitiateTime: 5,
            initiatePayment: 0,
            initiateIncome: 0,
            paymentPerMin: 0,
            incomePerMin: 0,
            canLackMoney: false,
            lackedMoney: 0
          };
          docData.isOnline = true;
          return DoctorService.applyTobeDoctor(docData);
        })
        .then(function (_doctor) {
          var update = {};
          update.doctorRef = _doctor._id;
          update.docChatNum = _doctor.docChatNum;
          if (user.name) {
            update.name = _doctor.docChatNum;
          }
          var condition = {
            _id: user._id,
            isDeleted: false
          }
          return findOneAndUpdate(condition, update, { new: true });
        })
        .then(function (_user) {
          return _user;
        });

    } else {
      return user;
    }
  });
};

/**
 * 获得临时账号，没有则创建
 * @废弃
 * @param deviceId
 * @returns {Promise|*}
 */
CustomerService.prototype.getTemporayAccount = function (deviceId) {
  var condition = {};
  condition.accountType = 'Temporary';
  condition.deviceId = deviceId;
  condition.isDeleted = false;

  return Customer.findOne(condition).exec()
    .then(function (user) {
      if (!user) {
        return Customer.create({
          accountType: 'Temporary',
          deviceId: deviceId
        });
      } else {
        return user;
      }
    });
};

CustomerService.prototype.getTemporayAccountByDeviceId = function (deviceId) {
  var condition = {};
  condition.accountType = 'Temporary';
  condition.deviceId = deviceId;
  condition.isDeleted = false;

  return Customer.findOne(condition, Customer.selectFields).exec();
};

CustomerService.prototype.getAllCustomer = function (pageSlice) {
  var condition = {
    "$or": [{ "source": 'docChat' }, { "source": 'webFavorite' }, { "source": "blued" }, { "usedApp": 'docChat' }],
    'isDeleted': false
  };

  return Customer.find(condition, Customer.selectFields, pageSlice).exec();
};

CustomerService.prototype.customerSts = function (conditions, pageSlice) {
  return Customer.find(conditions, Customer.selectFields, pageSlice).exec();
};
//截止到某一时间的患者统计
CustomerService.prototype.getExpiryDateCustomerNum = function (expiryDate) {
  var condition = {
    "$or": [{ "source": 'docChat' }, { "source": 'webFavorite' }, { "source": "blued" }, { "usedApp": 'docChat' }],
    "createdAt": { "$lte": expiryDate },
    "isDeleted": false
  };

  return Customer.find(condition).count().exec();
};

//大于某一时间的患者统计
CustomerService.prototype.getGTDateCustomerNum = function (gtDate) {
  var condition = {
    "$or": [{ "source": 'docChat' }, { "source": 'webFavorite' }, { "source": "blued" }, { "usedApp": 'docChat' }],
    "createdAt": { "$gt": gtDate },
    "isDeleted": false
  };

  return Customer.find(condition).count().exec();
};
/**
 * 获取用户信息
 * @param {*} ID 用户唯一标识
 * @param {*} option fiels
 * @param {*} type 用户类型 assistant：助理类型
 */
CustomerService.prototype.getInfoByID = function (ID, option, type) {
  var condition = {};
  condition._id = ID;
  condition.isDeleted = false;
  var customerFields = option && option.customerFields ? option.customerFields : Customer.selectFields;
  var doctorFields = option && option.doctorFields ? option.doctorFields : Doctor.selectFields;
  if(type == 'assistant'){
    console.log(ID)
    return Backend.service('assistant', 'user').getUser(ID);
  }
  return Customer.findOne(condition, customerFields).populate("doctorRef", doctorFields).lean().exec();
};

CustomerService.prototype.bookVenderCoupon = function (venderId, cps, isOpShop) {
  var condition = {};
  condition.isDeleted = false;
  if (!isOpShop) {
    condition['marketing.cps'] = { $gte: cps };
    condition['marketing.remainMemberSize'] = { $gt: 0 };
    condition['marketing.balance'] = { $gt: 0 };
    condition['marketing.remainBalance'] = { $gte: cps };
    condition._id = venderId;
    return Customer.findOneAndUpdate(condition, {
      $inc: {
        'marketing.remainMemberSize': -1,
        'marketing.remainBalance': -cps,
        'marketing.consumedMemberSize': 1
      }
    }, { new: true }).exec();
  } else {//是运营商户
    condition.userId = venderId + '';
    condition['cps'] = { $gte: cps };
    condition['remainMemberSize'] = { $gt: 0 };
    condition['balance'] = { $gt: 0 };
    condition['remainBalance'] = { $gte: cps };
    return Shop.findOneAndUpdate(condition, {
      $inc: {
        'remainMemberSize': -1,
        'remainBalance': -cps,
        'consumedMemberSize': 1
      }
    }, { new: true }).exec()
      .then(function (_shop) {
        if (!_shop) {
          return false;
        }
        if (_shop.remainMemberSize < 1) {
          return Customer.findOneAndUpdate({ _id: venderId }, { $set: { shopProp: 0 } }, { new: true }).exec();
        } else {
          return true;
        }
      })
  }
};

CustomerService.prototype.buyVenderCoupon = function (userId, couponValue) {
  var condition = {};
  condition._id = userId;
  condition.isDeleted = false;
  condition['membership.balance'] = { $gte: couponValue };
  return Customer.findOneAndUpdate(condition, {
    $inc: {
      'membership.balance': -couponValue,
      'membership.cost': couponValue,
      'membership.boughtNum': 1
    }
  }, { new: true }).exec();
};

CustomerService.prototype.getUserPayPwdByID = function (ID, params) {
  var condition = {};
  condition._id = ID;
  condition.isDeleted = false;
  return Customer.findOne(condition, params).exec();
};

CustomerService.prototype.getMainInfoByID = function (ID, option) {
  var condition = {};
  condition._id = ID;
  condition.isDeleted = false;
  var fields = option && option.fields ? option.fields : Customer.selectFields;
  return Customer.findOne(condition, fields).exec();
};

var _getMainInfoByDocChatNum = function (docChatNum, option) {
  var condition = {};
  condition.docChatNum = docChatNum;
  condition.isDeleted = false;
  var fields = option && option.fields ? option.fields : Customer.selectFields;
  return Customer.findOne(condition, fields).exec();
};

CustomerService.prototype.getMainInfoByDocChatNum = _getMainInfoByDocChatNum;

CustomerService.prototype.isOldDocChatNumExists = function (docChatNum) {
  var condition = {};
  condition._docChatNum = docChatNum;
  condition.isDeleted = false;
  return Customer.findOne(condition, "_id _docChatNum docChatNum").exec();
};

CustomerService.prototype.getAllInfoByID = function (ID) {
  var condition = {};
  condition._id = ID;
  condition.isDeleted = false;
  return Customer.findOne(condition).populate("doctorRef").exec();
};

CustomerService.prototype.isDoctorRefExists = function (ID) {
  var condition = {};
  condition._id = ID;
  condition.isDeleted = false;

  return Customer.findOne(condition, Customer.selectFields).populate("doctorRef", Doctor.selectFields).exec();
};

var getInfoByIDs = function (IDs, option) {
  IDs = IDs || [];
  var condition = {};
  condition._id = { "$in": IDs };
  condition.isDeleted = false;
  var fields = option && option.fields || Customer.selectFields;
  return Customer.find(condition, fields).exec();
};
CustomerService.prototype.getInfoByIDs = getInfoByIDs;
CustomerService.prototype.query = function (conditions, pageSlice, fields) {
  conditions.isDeleted = false;
  if (!conditions.hospital) {
    conditions.hospital = {
      $exists: true,
      $ne: ""
    };
  }

  return Customer.find(conditions, {}, pageSlice).populate("doctorRef", "province city callPrice seedDoctor isOnline managerName").exec();
};

CustomerService.prototype.getInfoByIDsSelfFlied = function (IDs, fields) {
  IDs = IDs || [];
  var condition = {};
  condition._id = { "$in": IDs };
  condition.isDeleted = false;

  return Customer.find(condition, fields).exec();
};

CustomerService.prototype.getPubicInfoByDocIDs = function (IDs, option) {
  IDs = IDs || [];
  var condition = {};
  condition.doctorRef = { "$in": IDs };
  condition.isDeleted = false;
  var customerFields = option && option.customerFields ? option.customerFields : Customer.publicFields;
  var doctorFields = option && option.doctorFields ? option.doctorFields : Doctor.publicFields;
  return Customer.find(condition, customerFields).populate("doctorRef", doctorFields).lean().exec();
};

CustomerService.prototype.getPubicInfoByDocIDs_new = function (IDs, option) {
  IDs = IDs || [];
  var condition = {};
  condition.doctorRef = { "$in": IDs };
  condition.isDeleted = false;
  var customerFields = 'avatar sex name docChatNum currentMoment profile doctorRef';
  var doctorFields = 'isDeleted';
  return Customer.find(condition, customerFields).populate("doctorRef", doctorFields).exec();
};


CustomerService.prototype.getFavorites = function (IDs, keyword, pageSlice, type) {
  IDs = IDs || [];
  IDs = _.filter(IDs || [], function (d) {
    return commonUtil.isUUID24bit(d);
  });
  var condition = {};
  condition.doctorRef = { "$in": IDs };
  if (keyword) {
    condition['$or'] = [
      { name: new RegExp(keyword + '', 'i') },
      { occupation: new RegExp(keyword + '', 'i') },
      { hospital: new RegExp(keyword + '', 'i') },
      { department: new RegExp(keyword + '', 'i') },
      { position: new RegExp(keyword + '', 'i') }
    ];
  }
  if (type == 'shop') {
    condition.shopVenderApplyStatus = {
      $gte: 3
    };
    condition.shopType = { $ne: '医疗' };
  } else if (type == 'zlycare') {
    condition.shopType = '医疗'
  } else if (type == 'banking') {
    condition.docChatNum = /^806/
  } else if (type == 'personal') {
    condition.shopVenderApplyStatus = {
      $lt: 3
    };
    condition.shopType = {
      $ne: '医疗'
    };
    condition.docChatNum = /^(?!806).*$/;
  }
  if (!pageSlice) {
    pageSlice = { limit: 3, sort: { createdAt: -1 } }
  }
  condition.isDeleted = false;
  var customerFields = Customer.listFields;
  var result = { keyword: keyword };
  return Customer.count(condition, customerFields)
    .then(function (count) {
      result.count = count;
      return Customer.find(condition, customerFields, pageSlice).exec();
    })
    .then(function (customers) {
      customers = JSON.parse(JSON.stringify(customers));
      //customers.forEach(function(customer){
      //  customer.id = customer._id;
      //  delete customer._id;
      //});
      result.items = customers;
      result.hasMore = false;
      if (result.count > 3) {
        result.hasMore = true;
      }
      return result;
    });
};
// TODO: DEL
/*CustomerService.prototype.getFavorites_new = function (userId, IDs, keyword, pageSlice) {
 if (!pageSlice) {
 pageSlice = {limit: 3, sort: {createdAt: -1}, skip: 0}
 }
 var result = {keyword: keyword};
 var customerFields = Customer.listFields;
 var condition = {};
 var relUsers = [];
 var favIds = [];
 var relCount = 0;
 var needNum = 0; //关系表不足够所需查询, 还需的数量
 return SocialRelService.getFavoritesCountByUserIdAndNoteName(userId, keyword)
 .then(function(_count){
 relCount = _count;
 console.log(_count, pageSlice.skip + pageSlice.limit, pageSlice.skip, needNum);
 if(_count > (pageSlice.skip + pageSlice.limit) ){ //
 return SocialRelService.getFavoritesByUserIdAndNoteName(userId, keyword, 'relUser', pageSlice);
 }else if(_count > pageSlice.skip){
 needNum = pageSlice.limit - (_count - pageSlice.skip);
 return SocialRelService.getFavoritesByUserIdAndNoteName(userId, keyword, 'relUser', pageSlice);
 }else{
 needNum = pageSlice.limit;
 return [];
 }
 })
 .then(function(_rels) {
 console.log('needNum:', needNum);
 if(_rels && _rels.length > 0){
 _rels.forEach(function (_res) {
 if (_res.relUser) {
 favIds.push(_res.relUser);
 }
 });
 return getInfoByIDs(favIds, {fields: Customer.listFields});
 }
 pageSlice.skip = (pageSlice.skip - relCount) > 0 ? (pageSlice.skip - relCount) : 0;
 pageSlice.limit = needNum;
 console.log(pageSlice.skip, pageSlice.limit);
 return [];
 })
 .then(function(_users){
 relUsers = _users;
 condition.doctorRef = {"$in": IDs};
 condition._id = {"$nin": favIds};
 if (keyword) {
 condition['$or'] = [
 {name: new RegExp(keyword + '', 'i')},
 {shopName: new RegExp(keyword + '', 'i')},
 //{occupation: new RegExp(keyword + '', 'i')},
 //{hospital: new RegExp(keyword + '', 'i')},
 //{department: new RegExp(keyword + '', 'i')},
 //{position: new RegExp(keyword + '', 'i')}
 ];
 }
 condition.isDeleted = false;
 return Customer.count(condition, customerFields).exec();
 })
 .then(function (count) {
 result.count = count + relCount;
 console.log('count:', count, relCount);
 if(!needNum){
 return [];
 }
 return Customer.find(condition, customerFields, pageSlice).exec();
 })
 .then(function (customers) {
 customers = JSON.parse(JSON.stringify(customers));
 result.items = relUsers.concat(customers);
 var userIds = [];
 result.items.forEach(function(item){
 userIds.push(item._id);
 });
 result.hasMore = false;
 if (result.count > 3) {
 result.hasMore = true;
 }
 return SocialRelService.getNoteNameByIds(userId, userIds);
 })
 .then(function(_users){
 var idNameMap = _.indexBy(_users, 'relUser');
 result.items.forEach(function(item){
 var matchUser = idNameMap[item._id + ''];
 item.name = matchUser && matchUser.noteInfo && matchUser.noteInfo.noteName || item.name;
 if(constants.shopAuthorizedStatus.indexOf(item.shopVenderApplyStatus || '') > -1){}
 item.pinyinName = toPinYin(item.name);


 });
 return result;
 });
 };*/

CustomerService.prototype.getFavorites451 = function (userId, IDs, keyword, pageSlice) {
  var limitNum = 3;
  if (!pageSlice) {
    pageSlice = { limit: limitNum, sort: { createdAt: -1 }, skip: 0 }
  }
  var result = { keyword: keyword };
  var customerFields = Customer.listFields;
  var condition = {};
  var relUsers = [];
  var favIds = [];
  var relCount = 0;
  var needNum = 0; //关系表不足够所需查询, 还需的数量
  return SocialRelService.getFavoritesCountByUserIdAndNoteName(userId, keyword)
    .then(function (_count) {
      relCount = _count;
      console.log(_count, pageSlice.skip + pageSlice.limit, pageSlice.skip, needNum);
      if (_count > (pageSlice.skip + pageSlice.limit)) { //
        return SocialRelService.getFavoritesByUserIdAndNoteName(userId, keyword, 'relUser', pageSlice);
      } else if (_count > pageSlice.skip) {
        needNum = pageSlice.limit - (_count - pageSlice.skip);
        return SocialRelService.getFavoritesByUserIdAndNoteName(userId, keyword, 'relUser', pageSlice);
      } else {
        needNum = pageSlice.limit;
        return [];
      }
    })
    .then(function (_rels) {
      console.log('needNum:', needNum);
      if (_rels && _rels.length > 0) {
        _rels.forEach(function (_res) {
          if (_res.relUser) {
            favIds.push(_res.relUser);
          }
        });
        return getInfoByIDs(favIds, { fields: Customer.listFields });
      }
      pageSlice.skip = (pageSlice.skip - relCount) > 0 ? (pageSlice.skip - relCount) : 0;
      pageSlice.limit = needNum;
      console.log(pageSlice.skip, pageSlice.limit);
      return [];
    })
    .then(function (_users) {
      relUsers = _users;
      condition.doctorRef = { "$in": IDs };
      condition._id = { "$nin": favIds };
      if (keyword) {
        condition['$or'] = [
          { name: new RegExp(keyword + '', 'i') },
          { shopName: new RegExp(keyword + '', 'i') },
          //{occupation: new RegExp(keyword + '', 'i')},
          //{hospital: new RegExp(keyword + '', 'i')},
          //{department: new RegExp(keyword + '', 'i')},
          //{position: new RegExp(keyword + '', 'i')}
        ];
      }
      condition.isDeleted = false;
      return Customer.count(condition, customerFields).exec();
    })
    .then(function (count) {
      result.count = count + relCount;
      console.log('count:', count, relCount);
      if (!needNum) {
        return [];
      }
      return Customer.find(condition, customerFields, pageSlice).exec();
    })
    .then(function (customers) {
      customers = JSON.parse(JSON.stringify(customers));
      result.items = relUsers.concat(customers);
      var userIds = [];
      result.items.forEach(function (item) {
        userIds.push(item._id);
      });
      result.hasMore = false;
      if (result.count > limitNum) {
        result.hasMore = true;
      }
      return SocialRelService.getNoteNameByIds(userId, userIds);
    })
    .then(function (_users) {
      var idNameMap = _.indexBy(_users, 'relUser');
      result.items.forEach(function (item) {
        var matchUser = idNameMap[item._id + ''];
        item.name = matchUser && matchUser.noteInfo && matchUser.noteInfo.noteName || item.name || '';
        if (constants.shopAuthorizedStatus.indexOf(item.shopVenderApplyStatus || '') > -1) {
          //如果店铺审核通过, 显示店铺信息
          item.name = item.shopName || item.name;
          item.avatar = item.shopAvatar || item.avatar || '';
        }
        item.pinyinName = toPinYin(item.name);
      });
      return result;
    });
};

CustomerService.prototype.getFans = function (docId, keyword, pageSlice) {
  if (!pageSlice) {
    pageSlice = { limit: 3, sort: { createdAt: -1 } }
  }
  var condition = {
    "favoriteDocs": docId
  };
  if (keyword) {
    condition['$or'] = [
      { name: new RegExp(keyword + '', 'i') },
      { occupation: new RegExp(keyword + '', 'i') },
      { hospital: new RegExp(keyword + '', 'i') },
      { department: new RegExp(keyword + '', 'i') },
      { position: new RegExp(keyword + '', 'i') }
    ];
  }
  condition.isDeleted = false;
  var customerFields = Customer.listFields;
  var result = {};
  return Customer.count(condition, customerFields)
    .then(function (count) {
      result.count = count;
      return Customer.find(condition, customerFields, pageSlice).exec();
    })
    .then(function (customers) {
      customers = JSON.parse(JSON.stringify(customers));
      //customers.forEach(function(customer){
      //  customer.id = customer._id;
      //  delete customer._id;
      //});
      result.items = customers;
      if (keyword) {
        result.keyword = keyword;
        //result.hasMore = false;
        result.hasMore = result.count > 3;
      }

      return result;
    });
};

CustomerService.prototype.getFans_new = function (user, keyword, pageSlice) {
  if (!pageSlice) {
    pageSlice = { limit: 3, sort: { theTrueRelCreatedAt: -1, createdAt: -1 }, skip: 0 }
  }
  var userId = user._id;
  var result = { keyword: keyword };
  var customerFields = Customer.listFields;
  var condition = {
    isDeleted: false,
    "favoriteDocs": user.doctorRef._id
  };

  var fanIds = [];
  var fanUsers = [];
  var relCount = 0;
  var needNum = 0; //关系表不足够所需查询, 还需的数量
  return SocialRelService.getFansCountByUserId(userId, { notedName: keyword })
    .then(function (_count) {
      relCount = _count;
      if (_count > (pageSlice.skip + pageSlice.limit)) { //
        return SocialRelService.getFansByUserIdAndRelNoteName(userId, keyword, 'user', pageSlice);
      } else if (_count > pageSlice.skip) {
        needNum = pageSlice.limit - (_count - pageSlice.skip);
        return SocialRelService.getFansByUserIdAndRelNoteName(userId, keyword, 'user', pageSlice);
      } else {
        needNum = pageSlice.limit;
        return [];
      }
      console.log(_count, pageSlice.skip + pageSlice.limit, pageSlice.skip, needNum);
    })
    .then(function (_rels) {
      if (_rels && _rels.length > 0) {
        _rels.forEach(function (_res) {
          if (_res.user) {
            fanIds.push(_res.user);
          }
        });
        return getInfoByIDs(fanIds, { fields: Customer.listFields });
      }
      pageSlice.skip = (pageSlice.skip - relCount) > 0 ? (pageSlice.skip - relCount) : 0;
      pageSlice.limit = needNum;
      console.log(pageSlice.skip, pageSlice.limit);
      return [];
    })
    .then(function (_users) {
      fanUsers = _users;
      fanIds = _.union(fanIds, user.blackList);
      condition._id = { $nin: fanIds };
      if (keyword) {
        condition['$or'] = [
          { name: new RegExp(keyword + '', 'i') },
          { occupation: new RegExp(keyword + '', 'i') },
          { hospital: new RegExp(keyword + '', 'i') },
          { department: new RegExp(keyword + '', 'i') },
          { position: new RegExp(keyword + '', 'i') }
        ];
      }
      return Customer.count(condition, customerFields).exec();
    })
    .then(function (count) {
      result.count = count + relCount;
      console.log('count:', count, relCount);
      if (!needNum) {
        return [];
      }
      return Customer.find(condition, customerFields, pageSlice).exec();
    })
    .then(function (customers) {
      customers = JSON.parse(JSON.stringify(customers));
      result.items = fanUsers.concat(customers);
      var userIds = [];
      result.items.forEach(function (item) {
        userIds.push(item._id);
      });
      result.hasMore = false;
      if (result.count > 3) {
        result.hasMore = true;
      }
      return SocialRelService.getNoteNameByIds(userId, userIds);
    })
    .then(function (_users) {
      var idNameMap = _.indexBy(_users, 'relUser');
      result.items.forEach(function (item) {
        var matchUser = idNameMap[item._id + ''];
        console.log('matchUser:', matchUser);
        item.name = matchUser && matchUser.noteInfo && matchUser.noteInfo.noteName || item.name;
        item.pinyinName = toPinYin(item.name);
      });
      return result;
    });
};

CustomerService.prototype.getFans451 = function (user, keyword, pageSlice) {
  if (!pageSlice) {
    pageSlice = { limit: 3, sort: { theTrueRelCreatedAt: -1, createdAt: -1 }, skip: 0 }
  }
  var userId = user._id;
  var result = { keyword: keyword };
  var customerFields = Customer.listFields;
  var condition = {
    isDeleted: false,
    "favoriteDocs": user.doctorRef._id
  };

  var fanIds = [];
  var fanUsers = [];
  var relCount = 0;
  var needNum = 0; //关系表不足够所需查询, 还需的数量
  return SocialRelService.getFansCountByUserId(userId, { notedName: keyword })
    .then(function (_count) {
      relCount = _count;
      if (_count > (pageSlice.skip + pageSlice.limit)) { //
        return SocialRelService.getFansByUserIdAndRelNoteName(userId, keyword, 'user', pageSlice);
      } else if (_count > pageSlice.skip) {
        needNum = pageSlice.limit - (_count - pageSlice.skip);
        return SocialRelService.getFansByUserIdAndRelNoteName(userId, keyword, 'user', pageSlice);
      } else {
        needNum = pageSlice.limit;
        return [];
      }
      console.log(_count, pageSlice.skip + pageSlice.limit, pageSlice.skip, needNum);
    })
    .then(function (_rels) {
      if (_rels && _rels.length > 0) {
        _rels.forEach(function (_res) {
          if (_res.user) {
            fanIds.push(_res.user);
          }
        });
        return getInfoByIDs(fanIds, { fields: Customer.listFields });
      }
      pageSlice.skip = (pageSlice.skip - relCount) > 0 ? (pageSlice.skip - relCount) : 0;
      pageSlice.limit = needNum;
      console.log(pageSlice.skip, pageSlice.limit);
      return [];
    })
    .then(function (_users) {
      fanUsers = _users;
      fanIds = _.union(fanIds, user.blackList);
      condition._id = { $nin: fanIds };
      if (keyword) {
        condition['$or'] = [
          { name: new RegExp(keyword + '', 'i') },
          { shopName: new RegExp(keyword + '', 'i') },
          //{occupation: new RegExp(keyword + '', 'i')},
          //{hospital: new RegExp(keyword + '', 'i')},
          //{department: new RegExp(keyword + '', 'i')},
          //{position: new RegExp(keyword + '', 'i')}
        ];
      }
      return Customer.count(condition, customerFields).exec();
    })
    .then(function (count) {
      result.count = count + relCount;
      console.log('count:', count, relCount);
      if (!needNum) {
        return [];
      }
      return Customer.find(condition, customerFields, pageSlice).exec();
    })
    .then(function (customers) {
      customers = JSON.parse(JSON.stringify(customers));
      result.items = fanUsers.concat(customers);
      var userIds = [];
      result.items.forEach(function (item) {
        userIds.push(item._id);
      });
      result.hasMore = false;
      if (result.count > 3) {
        result.hasMore = true;
      }
      return SocialRelService.getNoteNameByIds(userId, userIds);
    })
    .then(function (_users) {
      var idNameMap = _.indexBy(_users, 'relUser');
      result.items.forEach(function (item) {
        var matchUser = idNameMap[item._id + ''];
        console.log('matchUser:', matchUser);
        item.name = matchUser && matchUser.noteInfo && matchUser.noteInfo.noteName || item.name;
        if (constants.shopAuthorizedStatus.indexOf(item.shopVenderApplyStatus || '') > -1) {
          //如果店铺审核通过, 显示店铺信息
          item.name = item.shopName || item.name;
          item.avatar = item.shopAvatar || item.avatar || '';
        }
        item.pinyinName = toPinYin(item.name);
      });
      return result;
    });
};

CustomerService.prototype.countFans = function (docId) {
  var condition = {
    "favoriteDocs": docId,
    isDeleted: false
  };
  return Customer.count(condition);
};

CustomerService.prototype.getSearch = function (keyword, pageSlice) {
  if (!pageSlice) {
    pageSlice = { limit: 3, sort: { createdAt: -1 } }
  }
  var Search = require('../models/Search');
  var condition = {
    key: new RegExp(keyword + '', 'i')
  };
  condition[globalSource] = neZS;

  var customerFields = Customer.listFields;
  var result = { keyword: keyword };
  var customerIds = [];
  return Search.distinct('user', condition, customerFields)
    .then(function (_customerIds) {
      customerIds = _customerIds;
      //总数
      return Customer.count({
        isDeleted: false,
        _id: { $in: customerIds },
        canSearched: true
      }, customerFields).exec();
    })
    .then(function (_count) {
      result.count = _count;
      return Customer.find({
        isDeleted: false,
        _id: { $in: customerIds },
        canSearched: true
      }, customerFields, pageSlice).exec();
    })
    .then(function (customers) {
      customers = JSON.parse(JSON.stringify(customers));
      //customers.forEach(function(customer){
      //  customer.id = customer._id;
      //  delete customer._id;
      //});
      result.items = customers;
      result.hasMore = false;
      if (result.count > 3) {
        result.hasMore = true;
      }
      return result;
    });
};

CustomerService.prototype.getSearch_new = function (userId, keyword, pageSlice) {
  if (!pageSlice) {
    pageSlice = { limit: 3, sort: { createdAt: -1 } }
  }
  var Search = require('../models/Search');
  var condition = {
    key: new RegExp(keyword + '', 'i')
  };
  condition[globalSource] = neZS;
  var customerFields = Customer.listFields;
  var result = { keyword: keyword };
  var customerIds = [];
  return Search.distinct('user', condition, customerFields)
    .then(function (_customerIds) {
      customerIds = _customerIds;
      //总数
      return Customer.count({
        isDeleted: false,
        _id: { $in: customerIds },
        canSearched: true
      }, customerFields).exec();
    })
    .then(function (_count) {
      result.count = _count;
      return Customer.find({
        isDeleted: false,
        _id: { $in: customerIds },
        canSearched: true
      }, customerFields, pageSlice).exec();
    })
    .then(function (customers) {
      customers = JSON.parse(JSON.stringify(customers));
      //customers.forEach(function(customer){
      //  customer.id = customer._id;
      //  delete customer._id;
      //});
      result.items = customers;
      result.hasMore = false;
      if (result.count > 3) {
        result.hasMore = true;
      }
      return result;
    })
};

CustomerService.prototype.getSearch451 = function (userId, keyword, pageSlice) {
  var limitNum = 10;
  if (!pageSlice) {
    pageSlice = { limit: limitNum, sort: { createdAt: -1 } }
  }
  var Search = require('../models/Search');
  var condition = {
    key: new RegExp(keyword + '', 'i'),
    keyType: { $in: ['name', 'shopName'] }
  };
  condition[globalSource] = neZS;
  var customerFields = Customer.listFields;
  var result = { keyword: keyword };
  var customerIds = [];
  return Search.distinct('user', condition, customerFields)
    .then(function (_customerIds) {
      customerIds = _customerIds;
      //总数
      return Customer.count({
        isDeleted: false,
        _id: { $in: customerIds },
        canSearched: true
      }, customerFields).exec();
    })
    .then(function (_count) {
      result.count = _count;
      return Customer.find({
        isDeleted: false,
        _id: { $in: customerIds },
        canSearched: true
      }, customerFields, pageSlice).exec();
    })
    .then(function (customers) {
      customers = JSON.parse(JSON.stringify(customers));
      customers.forEach(function (customer) {
        if (constants.shopAuthorizedStatus.indexOf(customer.shopVenderApplyStatus || '') > -1) {
          //如果店铺审核通过, 显示店铺信息
          customer.name = customer.shopName || customer.name;
          customer.avatar = customer.shopAvatar || customer.avatar || '';
        }
      });
      result.items = customers;
      result.hasMore = false;
      if (result.count > limitNum) {
        result.hasMore = true;
      }
      return result;
    })
};

CustomerService.prototype.getInfoByPhones = function (Phones) {
  var condition = {};
  condition.phoneNum = { "$in": Phones };
  condition.isDeleted = false;

  return Customer.find(condition, Customer.selectFields).exec();
};

CustomerService.prototype.getInfoByDocChatNum = function (docChatNum) {
  var condition = {};
  condition.docChatNum = docChatNum;
  condition.isDeleted = false;

  return Customer.findOne(condition, Customer.selectFields)
    .populate('doctorRef', Doctor.selectFields)
    .exec();
};

CustomerService.prototype.getPublicInfoByDocChatNum = function (docChatNum, option) {
  var condition = {};
  condition.docChatNum = docChatNum;
  condition.isDeleted = false;
  var customerFields = option && option.customerFields ? option.customerFields : Customer.publicFields;
  var doctorFields = option && option.doctorFields ? option.doctorFields : Doctor.publicFields;
  return Customer.findOne(condition, customerFields)
    .populate('doctorRef', doctorFields)
    .populate('momentRef', Moment.publicFields)
    .exec();
};

CustomerService.prototype.getPublicInfoById = function (ID, option) {
  var condition = {};
  condition._id = ID;
  condition.isDeleted = false;
  var customerFields = option && option.customerFields ? option.customerFields : Customer.publicFields;
  var doctorFields = option && option.doctorFields ? option.doctorFields : Doctor.publicFields;
  return Customer.findOne(condition, customerFields)
    .populate('doctorRef', doctorFields)
    .populate('momentRef', Moment.publicFields)
    .exec();
};

CustomerService.prototype.getPublicInfoByDocId = function (docId) {
  var condition = {};
  condition.doctorRef = docId;
  condition.isDeleted = false;

  return Customer.findOne(condition, Customer.publicFields)
    .populate('doctorRef', Doctor.publicFields)
    .populate('momentRef', Moment.publicFields)
    .exec();
};

CustomerService.prototype.getAllInfoByDocId = function (docId) {
  var condition = {};
  condition.doctorRef = docId;
  condition.isDeleted = false;

  return Customer.findOne(condition).populate('doctorRef').exec();
};

CustomerService.prototype.getInfoByPhone = function (phone, flields) {
  var condition = {};
  condition.phoneNum = phone;
  condition.isDeleted = false;
  var selectFields = flields || Customer.selectFields;
  return Customer.findOne(condition, selectFields).populate('doctorRef').exec();
};

CustomerService.prototype.getInfoByDeviceIds = function (deviceIds) {
  var condition = {};
  condition.deviceId = { "$in": deviceIds };
  condition.isDeleted = false;

  return Customer.find(condition, Customer.selectFields).exec();
};

var _updateBaseInfo = function (id, update) {
  var condition = {};
  condition._id = id;
  condition.isDeleted = false;

  if (update.name)
    update.pinyinName = toPinYin(update.name);

  return findOneAndUpdate(condition, update, { new: true });
};

/**
 * @param id
 * @param update
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
CustomerService.prototype.updateBasicInfoByCond = function (cond, update) {
  var condition = cond || {};
  //condition._id = id;
  condition.isDeleted = false;

  if (update.name)
    update.pinyinName = toPinYin(update.name);

  return Customer.findOneAndUpdate(condition, update, { new: true }).exec();
};

CustomerService.prototype.updateBaseInfo = _updateBaseInfo;
CustomerService.prototype.updateBaseInfoByCond = function (cond, update) {
  cond.isDeleted = false;
  if (update.name)
    update.pinyinName = toPinYin(update.name);

  return findOneAndUpdate(cond, update, { new: true });
};

var _updateBaseInfoByIds = function (ids, update) {
  var condition = {};
  condition._id = { $in: ids };
  condition.isDeleted = false;


  return Customer.update(condition, update, { multi: true }).exec();
};
CustomerService.prototype.updateBaseInfoByIds = _updateBaseInfoByIds;
CustomerService.prototype.updateBaseInfoByPhoneNum = function (phoneNum, update) {
  var condition = {};
  condition.phoneNum = phoneNum;
  condition.isDeleted = false;

  return findOneAndUpdate(condition, update, { new: true });
};

CustomerService.prototype.updateBaseInfoByDocId = function (docId, update) {
  var condition = {};
  condition.doctorRef = docId;
  condition.isDeleted = false;

  if (update.name)
    update.pinyinName = toPinYin(update.name);

  return findOneAndUpdate(condition, update, { new: true });
};

CustomerService.prototype.createCustomer = function (data) {
  if (data.name)
    data.pinyinName = toPinYin(data.name);

  return Customer.create(data);
};

/**
 * 创建SP(Service Provider)账户(主副账户表)
 * @param data
 * @returns {data}
 */
CustomerService.prototype.createServiceProviderAccount = function (data, recommendType) {
  var mainAccount = {};// 主账户
  var assAccount = {};// 副账户
  var doctor, user;
  if (!data.phoneNum || !data.name)
    throw ErrorHandler.genBackendError(8005);

  assAccount.source = mainAccount.source = data.source || CONS.SOURCE;
  assAccount.phoneNum = mainAccount.phoneNum = data.phoneNum || "";
  mainAccount.phoneType = commonUtil.isValidFixedPhone(data.phoneNum) ? "fixed" : (commonUtil.isValidPhone(data.phoneNum) ? "mobile" : "");
  assAccount.docChatNum = mainAccount.docChatNum = data.docChatNum || "";
  assAccount.sex = mainAccount.sex = data.sex || "";
  assAccount.realName = mainAccount.name = data.name || "";
  assAccount.avatar = mainAccount.avatar = data.avatar || "";
  assAccount.pinyinName = mainAccount.pinyinName = data.name ? (toPinYin(data.name)) : "";
  assAccount.profile = mainAccount.profile = data.profile || "";
  assAccount.from = mainAccount.from = data.from || "";

  assAccount.province = data.province || "";
  assAccount.city = data.city || "";
  assAccount.hospital = mainAccount.hospital = data.hospital || "";
  assAccount.department = mainAccount.department = data.department || "";
  assAccount.position = mainAccount.position = data.position || "";
  assAccount.systag = data.systag || "";
  assAccount.managerName = data.managerName || "";
  assAccount.callPrice = commonUtil.genCallPrice(data.level);
  if (recommendType == "shanghai") {
    assAccount.recommendConf = [
      constants.RECOMMEND_FANS_SH,
      constants.RECOMMEND_ASS_SH,
      constants.RECOMMEND_AD_SH
    ];
  } else {
    assAccount.recommendConf = [
      constants.RECOMMEND_BAK,
      constants.RECOMMEND_ASS,
      constants.RECOMMEND_AD
    ];
  }

  //  doctorRef: doctor._id,
  // 先尝试创建副账户
  var cond1 = {
    phoneNum: data.phoneNum,
    isDeleted: false,
    source: "docChat"
  };
  var cond2 = {
    phoneNum: data.phoneNum,
    isDeleted: false
  };
  return Promise.all([Doctor.findOne(cond1), Customer.findOne(cond2)])
    .then(function (_datas) {
      doctor = _datas[0];
      user = _datas[1];
      var cache = require("./CacheService");
      var key = "DocChatNums";
      if (!doctor) {
        var cond = {
          isDeleted: false,
          source: 'docChat',
          applyStatus: 'done'
        };
        var numbers = cache.getValueByKeyLocal(key);
        if (numbers) {
          return require("./DoctorService").genDoctorChatNum('801', 6, 1, null, null, numbers)
            .then(function (num) {
              numbers.push(num);
              cache.addKeyValueLocal(key, numbers);
              assAccount.docChatNum = num;
              return Doctor.create(assAccount);
            });
        } else {
          return Doctor.distinct('docChatNum', cond).exec()
            .then(function (nums) {
              numbers = nums;
              cache.addKeyValueLocal(key, nums);
              return require("./DoctorService").genDoctorChatNum('801', 6, 1, null, null, nums);
            })
            .then(function (num) {
              numbers.push(num);
              cache.addKeyValueLocal(key, numbers);
              assAccount.docChatNum = num;
              return Doctor.create(assAccount);
            });
        }

      }
    })
    .then(function (_doctor) {
      if (_doctor) doctor = _doctor;
      // 在尝试创建主账户,并关联主副账户
      if (user) {
        if (user.docChatNum) {
          throw ErrorHandler.genBackendError(200);
        } else {
          return Customer.findOneAndUpdate(cond2, {
            docChatNum: doctor.docChatNum,
            doctorRef: doctor._id
          }, { new: true }).exec();
        }
      } else {
        mainAccount.docChatNum = doctor.docChatNum;
        mainAccount.doctorRef = doctor._id;
        return Customer.create(mainAccount);
      }
    });
};

var _favoriteDoc = function (id, docId) {
  var condition = {};
  condition._id = id;
  condition.isDeleted = false;

  return Customer.update(condition, {
    $addToSet: { "favoriteDocs": docId, "collectedDocs": docId },
    updatedAt: Date.now()
  }).exec();
};
CustomerService.prototype.favoriteDoc = _favoriteDoc;
/**
 * 记录患者属于哪个医生
 * @param id
 * @param docId
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
CustomerService.prototype.collectedDoc = function (id, docId) {
  var condition = {};
  condition._id = id;
  condition.isDeleted = false;

  return Customer.update(condition, {
    $addToSet: { "collectedDocs": docId },
    updatedAt: Date.now()
  }).exec();
};


CustomerService.prototype.cancelFavoriteDoc = function (id, docId) {
  var condition = {};
  condition._id = id;
  condition.isDeleted = false;

  return Customer.update(condition, {
    $pull: { "favoriteDocs": docId },
    updatedAt: Date.now()
  }).exec();
};

CustomerService.prototype.favoriteDocs = function (id, docIds) {
  var condition = {};
  condition._id = id;
  condition.isDeleted = false;

  return Customer.update(condition, {
    $addToSet: {
      "favoriteDocs": { $each: docIds },
      "collectedDocs": { $each: docIds }
    },
    updatedAt: Date.now()
  }).exec();
};

CustomerService.prototype.addDocsToCollectedDocs = function (id, docIds) {
  var condition = {};
  condition._id = id;
  condition.isDeleted = false;

  return Customer.update(condition, {
    $addToSet: { "collectedDocs": { $each: docIds } },
    updatedAt: Date.now()
  }).exec();
};

CustomerService.prototype.clearFavoriteDocs = function (id) {
  var condition = {};
  condition._id = id;
  condition.isDeleted = false;

  return Customer.update(condition, {
    "favoriteDocs": [],
    updatedAt: Date.now()
  }).exec();
};

CustomerService.prototype.bindJPush = function (userId, pushId) {
  // 清空之前用户的j_push_id
  return Customer.update({
    "pushId": pushId,
    "accountType": { "$ne": "Temporary" }
  }, { $set: { pushId: '' } }, { multi: true }).exec()
    .then(function () {
      return findOneAndUpdate({ _id: userId }, { pushId: pushId }, { new: true });
    });
};

CustomerService.prototype.logout = function (id) {
  var condition = {};
  condition._id = id;
  condition.isDeleted = false;

  return findOneAndUpdate(condition, { $set: { pushId: '' } }, { new: true });
};

//获得收藏指定医生的所有用户
CustomerService.prototype.getAllFavoriteUserByDocId = function (docId, option) {
  var condition = { "favoriteDocs": docId, "isDeleted": false };
  var fields = Customer.selectFields;
  if (option && option.fields) {
    fields = option.fields;
  }
  var options = null;
  if (option && option.limit) {
    options = { limit: option.limit || 1000 }
  }
  return Customer.find(condition, fields, options).exec();
};

//获得收藏指定医生的所有用户(按拼音排序)
CustomerService.prototype.getAllFavoriteUserByDocIdSortPinYin = function (docId, pageSlice) {
  var condition = {
    "favoriteDocs": docId,
    "isDeleted": false
  };
  //, {sort: {pinyinName: 1}} 暂时去除拼音
  return Customer.find(condition, Customer.publicFields, pageSlice).populate('doctorRef', Doctor.publicFields).lean().exec();
};

//获得收藏过指定医生的所有用户
CustomerService.prototype.getAllFavoritedUserByDocId = function (docId) {
  var condition = {
    "$or": [{ "favoriteDocs": docId }, { "collectedDocs": docId }],
    "isDeleted": false
  };

  return Customer.find(condition, Customer.selectFields).exec();
};

var _changeDocsPushState = function (id, blockUserIds, isToBlock) {
  var condition = {
    _id: id,
    isDeleted: false
  };
  var updateData = {};
  if (isToBlock) {
    updateData['$addToSet'] = { blockDocs: { $each: blockUserIds } };
  } else {
    updateData['$pull'] = { blockDocs: { $in: blockUserIds } };
  }
  return Customer.update(condition, updateData).exec();
};

CustomerService.prototype.changeDocsPushState = _changeDocsPushState;
CustomerService.prototype.changeBlackList = function (id, blackUserIds, isBlack) {
  var condition = {
    _id: id,
    isDeleted: false
  };
  var updateData = {};
  if (isBlack) {
    updateData['$addToSet'] = { blackList: { $each: blackUserIds } };
  } else {
    updateData['$pull'] = { blackList: { $in: blackUserIds } };
  }
  return Customer.update(condition, updateData).exec();
};

CustomerService.prototype.setPayPWD = function (userId, password) {
  var condition = {};
  condition._id = userId;
  condition.isDeleted = false;

  return findOneAndUpdate(condition, {
    updatedAt: Date.now(),
    payPwd: password
  }, { new: true });
};
/**
 * 设置支付密码，朱李叶健康使用
 * @param userId
 * @param password
 */
CustomerService.prototype.setPayPassword = function (userId, password) {
  var condition = {};
  condition._id = userId;
  condition.isDeleted = false;

  return findOneAndUpdate(condition, {
    updatedAt: Date.now(),
    payPassword: password
  }, { new: true });
};
CustomerService.prototype.getAllInfoByDocChatNum = function (docChatNum) {
  var condition = {};
  //condition.source = 'docChat';
  condition.docChatNum = docChatNum;
  condition.isDeleted = false;

  return Customer.findOne(condition).populate('doctorRef', Doctor.docSelectFields).exec();

};

/**
 * 拨打要求的最低价格
 * @param doctor
 */
CustomerService.prototype.callMinimumPrice = function (callee) {
  //规则：患者余额大于要求的起步价就可以打电话
  return callee.callPrice.initiatePayment * (callee.callPrice.discount || 1);
};
var findOneAndUpdate = function (query, update, option) {
  var deferred = Q.defer();

  Customer.findOneAndUpdate(query, update, option)
    .populate("doctorRef", Doctor.selectFields)
    .populate("momentRef", Moment.publicFields)
    .exec()
    .then(function (user) {
      if (!user) {
        console.log("no user match" + JSON.stringify(query));
        deferred.reject(ErrorHandler.getBusinessErrorByCode(1503));
      } else {
        //修改name时,更新search
        //if(update && update.name){
        //  SearchService.updateSearch(user._id, {key: user.name});
        //}
        deferred.resolve(user);
      }
    }, function (err) {
      console.log("Error: " + err);
      deferred.reject(err);
    });

  return deferred.promise;
};

var toPinYin = function (oriStr) {
  "use strict";
  var arr = pinyin(oriStr, {
    style: pinyin.STYLE_NORMAL
  });
  var arr2 = _.flatten(arr, true);

  var str = arr2.reduce(function (prev, cur) {
    "use strict";
    if (typeof cur !== 'string' || cur.length < 1)
      return prev;
    cur = cur.charAt(0).toUpperCase() + cur.substr(1);
    return prev + cur;
  }, '');

  return str;
};

CustomerService.prototype.getUsersByDocIDsCreatedAtASC = function (IDs, pageSlice) {
  IDs = IDs || [];
  var condition = {};
  condition.doctorRef = { "$in": IDs };
  condition.isDeleted = false;
  return Customer.find(condition, Customer.publicFields, pageSlice).exec();
};

CustomerService.prototype.modifyCustomerNote = function (doctorId, customerId, note) {
  var condition = { "userNotes.customerId": customerId };
  condition._id = doctorId;
  condition.isDeleted = false;

  return Customer.update(condition, {
    $set: {
      "userNotes.$.note": note,
      "userNotes.$.updatedAt": Date.now()
    }
  }).exec();
};

CustomerService.prototype.addCustomerNote = function (doctorId, customerId, note) {
  var condition = {};
  condition._id = doctorId;
  condition.isDeleted = false;

  var customerNote = {
    customerId: customerId,
    note: note
  };
  return Customer.update(condition, { $addToSet: { "userNotes": customerNote } }).exec();
};

CustomerService.prototype.inviteToApplyAgain = function (userId, invitedId) {
  var condition = { "invitedUsers.userId": invitedId };
  condition._id = userId;
  condition.isDeleted = false;

  return Customer.update(condition, {
    $set: {
      "invitedUsers.$.latestInvitedAt": Date.now()
    }
  }).exec();
};

CustomerService.prototype.inviteToApply = function (userId, invitedId) {
  var condition = {};
  condition._id = userId;
  condition.isDeleted = false;
  var invitedUsers = {
    userId: invitedId,
    latestInvitedAt: Date.now()
  };
  return Customer.update(condition, { $addToSet: { "invitedUsers": invitedUsers } }).exec();
};

CustomerService.prototype.getLatestVerifiedAccount = function (timeFrom, timeEnd) {
  var conds = {
    docChatNum: { $exists: true },
    doctorRef: { $exists: true },
    createdAt: {
      $gt: timeFrom,
      $lt: timeEnd
    },
    isDeleted: false
  };
  return Customer.find(conds).limit(1000).exec();
};

CustomerService.prototype.payTheNonPayment = function (userId, userRefId) {
  //有入账且总额>=0时,触发平账, //充值, 转账, 购买广告位, 打电话, 领红包
  //1.账户余额大于0
  //2.先查询是否有待平账订单
  //3.进一步验证,查询交易明细是否有待支付交易明细
  //4.平账
  var order, trx;
  return TransactionMysqlService.getAccountByUserIdAndDoctorId(userId, userRefId)
    .then(function (_account) {
      console.log('_account:', _account);
      if (_account.amount < 0) {
        return;
      }
      var orderCond = {
        isDeleted: false,
        willIncome: { $gt: 0 },
        callerId: userId + ''
      };
      return NewPhoneOrder.find(orderCond).sort({ createdAt: -1 }).limit(1).exec();
    })
    .then(function (_orders) {
      if (!_orders || _orders.length == 0) {
        return;
      }
      order = _orders[0];
      return TransactionMysqlService.getTheNonPayment(order.calleeId, order._id + '');
    })
    .then(function (_trx) {
      console.log('_trx:', _trx);
      if (!_trx) {
        return;
      }
      trx = _trx;
      return TransactionMysqlService.payTheNonPayment(order);
    })
    .then(function () {
      if (order && trx) {
        return OrderService.updateOrderInfo(order._id, { willIncome: 0, payStatus: 'paid' });
      }
      return;
    });
}

CustomerService.prototype.checkAlipay = function (notify_id) {
  var PARTNER = '2088511286538612'
  var ALIPAY_CHECK_URL = 'https://mapi.alipay.com/gateway.do?service=notify_verify&partner=' + PARTNER;
  console.log('notify_id: ' + notify_id);
  var url = ALIPAY_CHECK_URL + '&notify_id=' + notify_id;
  var deferred = Q.defer();
  https.get(url, function (res) {
    res.on('data', function (d) {
      if ('true' === d.toString()) {
        deferred.resolve(true);
      } else {
        deferred.resolve(false);
      }
    });
  }).on('error', function (e) {
    deferred.resolve(false);
  });
  return deferred.promise;
};

CustomerService.prototype.checkWxPay = function (data) {
  var sign;
  var dataArray = [];
  var weixinKey = constants.weixinKey;
  Object.keys(data).forEach(function (key) {
    if (data[key][0]) {
      if (key == 'sign') {
        sign = data[key][0];
      } else {
        dataArray.push(key + "=" + data[key][0]);
      }
      
      if(key='mch_id'){
        if(data[key][0] == constants.assistantWeixinMchId){
          // 助理端 微信支付
          weixinKey = constants.assistantWeixinMchKey
        }else if(data[key][0] == constants.mcWeixinMchId){
          // 2030医疗圈 小程序 微信支付
          weixinKey = constants.mcWeixinMchKey
        }
      }
    }
  });
  var dataStr = dataArray.sort().join('&') + '&key=' + weixinKey;
  var genSign = commonUtil.genCommonMD5(dataStr, '', true);
  console.log('sign:', dataStr, sign, genSign);
  return genSign == sign;
};

CustomerService.prototype.isOfflineTime = function (offlineBeginTime, offlineEndTime) { //是否为离线时间
  if (!offlineBeginTime || !offlineEndTime || (offlineBeginTime === offlineEndTime)) {
    return false;
  }
  var now = new Date().format('hh:mm');
  console.log(now, offlineBeginTime, offlineEndTime);

  if (offlineBeginTime < offlineEndTime) { //离线时间段为当天
    if (offlineBeginTime <= now && now < offlineEndTime) {
      return true;
    }
  } else { //离线时间跨天
    if (offlineBeginTime <= now || now < offlineEndTime) {
      return true;
    }
  }
  return false;
}

//==================================from zlycare-web===================================================
/**
 *
 * @param conditions
 * @param userDoc
 * @param args
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
//userDoc,
CustomerService.prototype.updateUser = function (conditions, userDoc, args) {
  return Customer.findOneAndUpdate(conditions, userDoc, args).exec();
};

CustomerService.prototype.updateUserById = function (id, data) {
  var condition = {};
  condition._id = id;
  condition.isDeleted = false;
  data.updatedAt = Date.now();
  return Customer.findOneAndUpdate(condition, data, { new: true }).exec();
};

/**
 *
 * @param conditions
 * @param pageSlice
 * @param params
 * @returns {Array|{index: number, input: string}|Promise}
 */
CustomerService.prototype.findUserList = function (conditions, pageSlice, params) {
  return Customer.find(conditions, params, pageSlice).exec();
};
/** ljx
 * 查询商家列表
 * @param conditions
 * @param pageSlice
 * @param params
 * @returns {Promise}
 */
CustomerService.prototype.findBusinessList = function (conditions, pageSlice, params) {
  return Customer.find(conditions, params, pageSlice).populate("doctorRef", "province city").exec();
};
/**
 * 可领取代金券的商家所在的地区
 * 1.老数据,未经认证,且有有券可领 has been removed
 * 2.经过认证,且有有券可领
 * 3.为运营商家时,一定有券可领的
 * @returns {Promise}
 */
CustomerService.prototype.getVenderRegions = function () {
  var cond = null;
  /*cond = {
   isDeleted: false,
   'marketing.remainMemberSize': {$gt: 0},
   'marketing.cps': {$gte: 1},
   'province': {$nin: constants.specialCities},
   'marketing.isMarketingClosed': {$ne: true}
   }*/
  var cities = [];
  //return Customer.distinct('city', cond).exec()
  //  .then(function(_cities) {
  //    cities = _cities;
  //    console.log(_cities);
  cond = {
    isDeleted: false,
    'shopVenderApplyStatus': { $in: constants.shopAuthorizedStatus },
    $or: [
      {
        //'marketing.remainMemberSize': {$gt: 0},
        //'marketing.cps': {$gte: 1},
        'marketing.isMarketingClosed': { $ne: true },
        'shopProp': { $nin: constants.opShopProp },
      },
      {
        'shopProp': { $in: constants.opShopProp },
      }
    ]
  }
  cond[globalSource] = neZS;
  return Customer.distinct('shopCity', cond).exec()
    //})
    //.then(function(_shopCities){
    //  cities = _.union(cities, _shopCities);
    //  cond = {
    //    isDeleted: false,
    //    'marketing.remainMemberSize': {$gt: 0},
    //    'marketing.cps': {$gte: 1},
    //    'province': {$in: constants.specialCities},
    //    'marketing.isMarketingClosed': {$ne: true}
    //  }
    //  return Customer.distinct('province', cond).exec();
    //})
    .then(function (_provinces) {
      console.log(_provinces);
      return _.union(cities, _provinces);
    });
}
/**
 *
 * @param region
 * @param options
 * @returns {Promise|Array|{index: number, input: string}}
 */
CustomerService.prototype.getVendersFromRegion = function (region, options) {
  //兼容
  var fields = "avatar name marketing currentMoment shopName shopVenderApplyStatus shopAvatar";

  var version = options && options.version || '';
  var shopType = options && options.shopType || '';
  var keyword = options && options.keyword || '';
  //var lon = options && options.lon || 0;
  //var lat = options && options.keyword || 0;
  var exp = keyword ? new RegExp(keyword + '', 'i') : '';
  var defaultPageSlice = {
    limit: constants.DEFAULT_PAGE_SIZE
  };
  var pageSlice = options && options.pageSlice || defaultPageSlice;
  var cond = {
    isDeleted: false,
  }

  //运营商户而非认证商户
  var cond_op = {
    isDeleted: false,
    'remainMemberSize': { $gte: 1 },
    'cps': { $gte: 1 },
    'isMarketingClosed': { $ne: true },
  }
  console.log(region, shopType, version, keyword);
  if (shopType) {
    if (shopType == 1) {
      cond["shopType"] = constants.allShopType[7].name;
      cond_op["shopType"] = constants.allShopType[7].name;
    }
  } else {
    cond["shopType"] = { $nin: constants.specialShopType };
    cond_op["shopType"] = { $nin: constants.specialShopType };
  }

  //if(version > '4.5.0'){
  /*老数据,无商户认证,无运营商户
   var cond1 = {
   'marketing.remainMemberSize': {$gt: 0},
   'marketing.cps': {$gte: 1},
   'marketing.isMarketingClosed': {$ne: true},
   'shopVenderApplyStatus': {$nin: constants.shopAuthorizedStatus},
   'shopProp': {$nin: constants.opShopProp},
   }*/
  //认证商户而非运营商户
  var cond2 = {
    //'marketing.remainMemberSize': {$gt: 0},
    //'marketing.cps': {$gte: 1},
    'marketing.isMarketingClosed': { $ne: true },
    'shopVenderApplyStatus': { $in: constants.shopAuthorizedStatus },
    'shopProp': { $nin: constants.opShopProp },
  }
  if (region) {
    /* cond1['$or'] = [
     { city: region, province: {$nin: constants.specialCities} },
     { province: region }
     ];*/
    cond2.shopCity = region;
    cond_op.shopCity = region;
  }
  if (keyword) {
    /*cond1['$and'] = [
     {'$or': cond1['$or']},
     { city: exp, province: {$nin: constants.specialCities} },
     { province: exp }
     ]
     delete cond1['$or'];*/
    cond2['$or'] = [
      { shopName: exp },
      { shopType: exp },
      { shopSubType: exp },
    ];
    cond_op['$or'] = [
      { shopName: exp },
      { shopType: exp },
      { shopSubType: exp },
    ]
  }
  //cond['$or'] = [cond1, cond2];
  //cond = Object.assign(cond, cond2);
  cond = _.extend(cond, cond2);
  console.log(cond);

  //}
  /*else{
   //低版本没有通过keyword进行搜索,不分shopType, 非运营商户
   cond = {
   isDeleted: false,
   'marketing.remainMemberSize': {$gt: 0},
   'marketing.cps': {$gte: 1},
   'marketing.isMarketingClosed': {$ne: true},
   'shopProp': {$nin: constants.opShopProp}, //todo: @易翔
   }
   if(region){
   cond['$or'] = [
   {city: region, province: {$nin: constants.specialCities}},
   {province: region},
   {shopCity: region, 'shopVenderApplyStatus': {$in: constants.shopAuthorizedStatus}
   }
   ];
   }
   return Customer.find(cond, fields, pageSlice).exec();

   }*/
  var venders = [];
  var normalVenders = [];
  var opVenderIds = [];
  var opVenderIdMap = [];
  return Customer.find(cond, fields, pageSlice).exec()
    .then(function (_customers) {
      normalVenders = _customers;
      var limit_op = 4;
      var pageNum = parseInt(pageSlice.pageNum || 0);
      var pageSliceOp = {
        limit: limit_op,
        skip: pageNum * limit_op,
        sort: { cps: -1 }
      }
      if (normalVenders.length < pageSlice.limit) {
        //如果普通商户数量少于分页数量,返回所有的运营商户
        delete pageSliceOp.limit;
      }
      return Shop.find(cond_op, '_id userId cps remainMemberSize', pageSliceOp).exec();
    })
    .then(function (_shops) {
      opVenderIds = _shops.map(function (_shop) {
        return _shop.userId + '';
      });
      opVenderIdMap = _.indexBy(_shops, 'userId');
      return Customer.find({ _id: { $in: opVenderIds } }, fields);
    })
    .then(function (_opVenders) {
      //console.log(normalVenders, _opVenders);
      var _opVenders_pre = JSON.parse(JSON.stringify(_opVenders));
      _opVenders_pre = _.indexBy(_opVenders_pre, '_id');
      var opVenders = [];
      opVenderIds.forEach(function (opVenderId) {
        if (_opVenders_pre[opVenderId + '']) {
          opVenders.push(_opVenders_pre[opVenderId + '']);
        }
      });
      normalVenders.forEach(function (_vender, index) {
        if (index != 0 && (index % 5) == 0 && opVenders[0]) {
          var _opVender = opVenders.shift();
          _opVender.marketing = opVenderIdMap[_opVender._id + ''];
          venders.push(_opVender);
        }
        venders.push(_vender);
      })
      //运营商户没有分配完,也全部返回用户
      opVenders.forEach(function (_opVender) {
        _opVender.marketing = opVenderIdMap[_opVender._id + ''];
        venders.push(_opVender);
      });
      return venders;
    });
}

/**
 *
 * @param region
 * @param options
 * @returns {Promise|Array|{index: number, input: string}}
 */
CustomerService.prototype.getCityVendersFromRegion = function (region, options) {
  //兼容
  var fields = "avatar name marketing currentMoment shopName shopVenderApplyStatus shopAvatar shopLocation shopProp";

  var shopType = options && options.shopType || '';
  var shopSubType = options && options.shopSubType || '';
  var sortBy = options && options.sortBy || '';
  var keyword = options && options.keyword || '';
  var lon = options && options.lon || 0;
  var lat = options && options.lat || 0;
  var serviceType = options && options.serviceType || 'buying';
  var scope = options && options.scope || 20000; //默认是20km
  var exp = keyword ? new RegExp(keyword + '', 'i') : '';
  var defaultPageSlice = {
    limit: constants.DEFAULT_PAGE_SIZE
  };
  var version = options && options.version || ''; //todo: 版本
  var pageSlice = options && options.pageSlice || defaultPageSlice;
  var cond = {
    isDeleted: false,
    'shopVenderApplyStatus': { $in: constants.shopAuthorizedStatus },
    'marketing.remainMemberSize': { $gt: 0 },
    //'marketing.cps': {$gte: 1},
    'marketing.isMarketingClosed': { $ne: true },
    'shopProp': { $nin: constants.opShopProp },
  }
  var cond_without_coupon = {
    isDeleted: false,
    'shopVenderApplyStatus': { $in: constants.shopAuthorizedStatus },
    $or: [{ 'marketing.remainMemberSize': 0 }, { 'marketing.remainMemberSize': { $exists: false } }],
    'marketing.isMarketingClosed': { $ne: true },
    'shopProp': { $nin: constants.opShopProp },
  }
  var cond_sort = {
    isDeleted: false,
    'shopVenderApplyStatus': { $in: constants.shopAuthorizedStatus },
    '$or': [
      {
        //'marketing.remainMemberSize': {$gt: 0},
        //'marketing.cps': {$gte: 1},
        'marketing.isMarketingClosed': { $ne: true },
        'shopProp': { $nin: constants.opShopProp },
      },
      {
        'shopProp': { $in: constants.opShopProp }
      }
    ]
  }
  //运营商户而非认证商户
  var cond_op = {
    isDeleted: false,
    'remainMemberSize': { $gte: 1 },
    'cps': { $gte: 1 },
    'isMarketingClosed': { $ne: true },
  }
  console.log(region, options);
  if (serviceType == 'zlycare') {
    cond["shopType"] = { $in: constants.specialShopType };
    cond_without_coupon["shopType"] = { $in: constants.specialShopType };
    cond_sort["shopType"] = { $in: constants.specialShopType };
    cond_op["shopType"] = { $in: constants.specialShopType };
  } else if (serviceType == 'buying') {
    cond["shopType"] = { $nin: constants.specialShopType };
    cond_without_coupon["shopType"] = { $nin: constants.specialShopType };
    cond_sort["shopType"] = { $nin: constants.specialShopType };
    cond_op["shopType"] = { $nin: constants.specialShopType };
  }
  if (shopType) {
    cond["shopType"] = shopType;
    cond_without_coupon["shopType"] = shopType;
    cond_sort["shopType"] = shopType;
    cond_op["shopType"] = shopType;
  }
  if (shopSubType) {
    cond["shopSubType"] = shopSubType;
    cond_without_coupon["shopSubType"] = shopSubType;
    cond_sort["shopSubType"] = shopSubType;
    cond_op["shopSubType"] = shopSubType;
  }

  if (region) {
    cond.shopCity = region;
    cond_without_coupon.shopCity = region;
    cond_sort.shopCity = region;
    cond_op.shopCity = region;
  }
  if (keyword) {
    cond['$or'] = [
      { shopName: exp },
      { shopType: exp },
      { shopSubType: exp }
    ];
    /*cond_without_coupon['$or'] = [
     { shopName: exp},
     { shopType: exp},
     { shopSubType: exp}
     ];*/
    cond_without_coupon['$and'] = [
      {
        '$or': cond_without_coupon['$or']
      },
      {
        '$or': [
          { shopName: exp },
          { shopType: exp },
          { shopSubType: exp }
        ]
      }
    ];
    delete cond_without_coupon['$or'];
    cond_op['$or'] = [
      { shopName: exp },
      { shopType: exp },
      { shopSubType: exp }
    ];
    cond_sort['$and'] = [
      {
        '$or': cond_sort['$or']
      },
      {
        '$or': [
          { shopName: exp },
          { shopType: exp },
          { shopSubType: exp }
        ]
      }
    ];
    delete cond_sort['$or'];
  }
  console.log(cond_sort);
  if (sortBy == 'hot') {
    fields += ' shopCheckinNum';
    pageSlice.sort = { 'shopCheckinNum': -1, shopProp: 1 };
  } else if (sortBy == 'distance') {
    if (lat && lon) {
      cond_sort.shopLocation = {
        $near: [lon, lat]
      }
      if (scope && !region) {
        cond_sort.shopLocation = {
          $near: [lon, lat],
          //$maxDistance: 20 //按度数来算
          $maxDistance: (scope * 0.001) / 111.12 //按度数来算
        }
      }
      //pageSlice.sort = {shopProp: 1};
      delete pageSlice.sort;
    }
  }
  var venders = [];
  var normalVenders = [];
  var opVenderIds = [];
  var opVenderIdMap = {};
  var opShopMap = {};
  var currentCond = sortBy ? cond_sort : cond;
  var totalPage = 0;
  var options_without_coupon = { //无券商家options
    limit: pageSlice.limit,
    skip: 0,
    sort: { 'marketing.cps': -1 }
  }
  var need_shop_without_coupon = false;
  var venderIds = [];
  var sortShopIdLowestCostMap = {};
  return Promise.resolve()
    .then(function () {
      if (!sortBy) {
        return Customer.count(cond).exec();
      }
    })
    .then(function (_totalCount) {
      if (!sortBy) {
        totalPage = Math.floor(_totalCount / pageSlice.limit);
      }
      return Customer.find(currentCond, fields, pageSlice).exec()
    })
    .then(function (_customers) {
      //console.log("_customers:",_customers);
      normalVenders = JSON.parse(JSON.stringify(_customers));
      //未选定排序规则,默认5普通商户插入1个运营商户
      if (!sortBy) {
        var limit_op = 4; //todo:  测试修改,原值4
        var pageNum = parseInt(pageSlice.pageNum || 0);
        var pageSliceOp = {
          limit: limit_op,
          skip: pageNum * limit_op,
          sort: { cps: -1 }
        }
        console.log(pageSliceOp, options_without_coupon);

        console.log('current num:', normalVenders.length, 'limit:', pageSlice.limit);
        if (normalVenders.length < pageSlice.limit) {
          //如果普通商户数量少于分页数量,返回所有的运营商户
          delete pageSliceOp.limit;
          options_without_coupon.skip = (pageNum - totalPage) * pageSlice.limit;
          console.log('pageNum: ', pageNum, 'totalPage:', totalPage);
          if (pageNum > totalPage) {
            pageSliceOp.skip = 1000; //
          }
          need_shop_without_coupon = true;
          console.log(pageSliceOp, options_without_coupon);
        }
        return Shop.find(cond_op, '_id userId cps remainMemberSize', pageSliceOp).exec();
      }
      //选定排序规则,按照排序规则查询;并获取运营商户的推广信息
      var opShopIds = [];
      _customers.forEach(function (_customer) {
        if (_isOpShop(_customer.shopVenderApplyStatus, _customer.shopProp)) {
          sortShopIdLowestCostMap[_customer._id + ''] = _customer.marketing && _customer.marketing.lowestCost || -1;
          opShopIds.push(_customer._id + '');
        }
      });
      return Shop.find({ userId: { $in: opShopIds } }, '_id userId cps remainMemberSize').exec();
    })
    .then(function (_shops) {
      if (!_shops || _shops.length == 0) {
        return [];
      }
      if (!sortBy) {//用户未选定排序规则
        opVenderIds = _shops.map(function (_shop) {
          return _shop.userId + '';
        });
        opVenderIdMap = _.indexBy(_shops, 'userId');
        return Customer.find({ _id: { $in: opVenderIds } }, fields);
      }
      opShopMap = _.indexBy(_shops, 'userId');
      return [];
    })
    .then(function (_opVenders) {
      //用户未选定排序规则时,运营商户信息
      var _opVenders_pre = JSON.parse(JSON.stringify(_opVenders));
      if (_opVenders_pre.length > 0) {
        _opVenders_pre = _.indexBy(_opVenders_pre, '_id');
      }
      var opVenders = [];
      opVenderIds.forEach(function (opVenderId) {
        if (_opVenders_pre[opVenderId + '']) {
          opVenders.push(_opVenders_pre[opVenderId + '']);
        }
      });
      normalVenders.forEach(function (_vender, index) {
        if (index != 0 && (index % 5) == 0 && opVenders[0]) {
          var _opVender = opVenders.shift();
          var lowestCost = _opVender.marketing && _opVender.marketing.lowestCost || -1;
          _opVender.marketing = JSON.parse(JSON.stringify(opVenderIdMap[_opVender._id + '']));
          if (_opVender.marketing) {
            _opVender.marketing['lowestCost'] = lowestCost;
          }
          venders.push(_opVender);
        }
        venders.push(_vender);
      })
      //运营商户没有分配完,也全部返回用户
      opVenders.forEach(function (_opVender) {
        _opVender.marketing = opVenderIdMap[_opVender._id + ''];
        venders.push(_opVender);
      });

      //如果version >= 4.9.0,显示无券商家 todo: 版本号
      /*if(version >= '4.9.0' && !sortBy){
       return Customer.find(currentCond, fields, pageSlice).exec()
       }*/
      console.log('need_shop_without_coupon:', need_shop_without_coupon);
      if (!sortBy && need_shop_without_coupon) {
        //无券商家
        return Customer.find(cond_without_coupon, fields, options_without_coupon).exec();
      } else {
        return [];
      }
    })
    .then(function (_shops_without_coupon) {
      _shops_without_coupon = JSON.parse(JSON.stringify(_shops_without_coupon));
      console.log('_shops_without_coupon:', venders.length, _shops_without_coupon.length);
      venders = venders.concat(_shops_without_coupon);
      venders.forEach(function (vender) {
        if (vender._id) {
          venderIds.push(vender._id + '');
        }
      })
      var RemindService = Backend.service("1/city_buy", "remind_send_stamps");
      return RemindService.checkShops(options.userId, venderIds);
    })
    .then(function (remindedMap) {
      //console.log('remindedMap:', remindedMap);
      venders.forEach(function (_vender, index) {
        if (opShopMap[_vender._id + '']) {
          var lowestCost = sortShopIdLowestCostMap[_vender._id + ''] || -1;
          _vender.marketing = JSON.parse(JSON.stringify(opShopMap[_vender._id + '']));
          if (_vender.marketing) {
            _vender.marketing.lowestCost = lowestCost;
          }
        }
        if (lon & lat) {
          _vender.distance = commonUtil.getDistance([lon, lat], _vender.shopLocation);
          //console.log('distance:', _vender.distance);
          _vender.distance = commonUtil.formatDistance(_vender.distance);
          //console.log('formate distance:', _vender.distance);
          delete _vender.shopLocation;
        }
        _vender.isShopReminded = remindedMap && remindedMap[_vender._id + ''] || false;

      });
      return venders;
    });
}

CustomerService.prototype.getTheFirstThreeVenders = function (region) {
  var cond = {
    isDeleted: false,
    'marketing.remainMemberSize': { $gt: 0 },
    'marketing.cps': { $gte: 1 },
    city: region
  }
  var fields = "avatar name marketing";
  return Customer.find(cond, fields, { sort: { 'marketing.cps': -1 }, limit: 3 }).exec();
}

CustomerService.prototype.pushTransactionIncomeMsg = function (order) {
  //收款消息;如果有服务助理,跳转到其主页
  var msgs = [];
  var userIds = [order.doctorMainId];
  var msgContent_payee = order.customerName + '向您付款' + order.price + '元';
  var msgContent_assitant = '';
  var message = {
    userId: order.doctorMainId,
    type: 'sys',
    subType: 'income_tf',
    title: '收款',
    content: msgContent_payee,
    linkType: 'income_tf',
    trxType: '',
    orderId: order._id + '',
    orderValue: order.price
  };
  console.log('payee:', message);

  msgs.push(message);
  var assitant;
  console.log('productCode:', order.productCode);
  var fields = 'pushId';
  _getMainInfoByDocChatNum(order.productCode, { fields: fields })
    .then(function (_assistant) {
      if (_assistant) {
        assitant = _assistant;
        userIds.push(_assistant._id + '');
        msgContent_assitant = order.customerName + '付款时填写了您作为服务助理';
        message = {
          userId: _assistant._id,
          type: 'sys',
          subType: 'assistant',
          title: '服务助理通知',
          content: msgContent_assitant,
          linkType: 'assistant',
          trxType: '',
          orderId: '',
          orderValue: 0,
          linkData: order.doctorMainId + '',
        };
        console.log('assistant:', message);
        msgs.push(message);
      }
      return MessageService.createMessage(msgs);
    })
    .then(function () {
      _updateBaseInfoByIds(userIds, { hasNewMessage: true, 'msgReadStatus.sys': true, 'msgReadStatus.all': true });
      var notificationExtras = {
        type: 3, //type: 1-为收藏推送, 2-消息中心, 3-新消息
        contentType: "sys"
      };
      var msgExtras = {
        type: 2,
        contentType: 'sys'
      };
      if (order.doctorPushId) {
        JPushService.pushMessage(order.doctorPushId, msgContent_payee, '', msgExtras);
        JPushService.pushNotification(order.doctorPushId, msgContent_payee, '', notificationExtras);
      }
      if (assitant && assitant.pushId) {
        JPushService.pushMessage(assitant.pushId, msgContent_assitant, '', msgExtras);
        JPushService.pushNotification(assitant.pushId, msgContent_assitant, '', notificationExtras);
      }
    }, function (err) {
      console.log(JSON.stringify(err));
    });
};

CustomerService.prototype.pushCouponRewardMsg = function (userId, pushObj) {
  //用券返现
  var orderId = pushObj && pushObj.orderId;
  var pushId = pushObj && pushObj.pushId;
  var payVal = pushObj && pushObj.payVal;
  var rewardVal = pushObj && pushObj.rewardVal;
  if (!orderId || !payVal || !rewardVal) {
    return;
  }
  console.log('pushObj:', pushObj);
  var msgContent = '您使用优惠券支付' + payVal + '元' + '返现' + rewardVal + '元';
  var message = {
    userId: userId,
    type: 'sys',
    subType: 'couponReward',
    title: '用券返现',
    content: msgContent,
    linkType: 'couponReward',
    trxType: 'couponReward',
    orderId: orderId,
    orderValue: 0
  };
  console.log('message:', message);
  MessageService.createMessage(message);
  _updateBaseInfo(userId, { hasNewMessage: true, 'msgReadStatus.sys': true, 'msgReadStatus.all': true });

  if (pushId) {
    var notificationExtras = {
      type: 3, //type: 1-为收藏推送, 2-消息中心, 3-新消息
      contentType: "sys"
    };
    var messageNotification = msgContent;
    var msgExtras = {
      type: 2,
      contentType: 'sys'
    };
    JPushService.pushMessage(pushId, messageNotification, '', msgExtras);
    JPushService.pushNotification(pushId, messageNotification, '', notificationExtras);
  }
}

CustomerService.prototype.pushMarketingMsg = function (userId, pushObj) {
  //领取推广代金券
  var usedName = pushObj && pushObj.usedName;
  var pushId = pushObj && pushObj.pushId;
  var msgTitle = usedName + '领取了您的推广代金券';
  var msgContent = '用户到店出示后，请扫码确认收券';
  var message = {
    userId: userId,
    type: 'sys',
    subType: 'marketing',
    title: msgTitle,
    content: msgContent,
    linkType: 'marketing',
    trxType: '',
    orderId: '',
    orderValue: 0
  };
  console.log('message:', message);
  MessageService.createMessage(message);
  _updateBaseInfo(userId, { hasNewMessage: true, 'msgReadStatus.sys': true, 'msgReadStatus.all': true });

  if (pushId) {
    var messageNotification = msgContent;
    var notificationExtras = {
      type: 3, //type: 1-为收藏推送, 2-消息中心, 3-新消息
      contentType: "sys"
    };
    var msgExtras = {
      type: 2,
      contentType: 'sys'
    };
    JPushService.pushMessage(pushId, messageNotification, '', msgExtras);
    JPushService.pushNotification(pushId, msgTitle, '', notificationExtras);
  }
}

CustomerService.prototype.buildRel = function (user, favUser) {
  SocialRelService.getFavoriteCountById(user._id)
    .then(function (_count) {
      if (_count >= 2000) { //限制最多只能收藏2000个
        throw ErrorHandler.getBusinessErrorByCode(2001);
      }
      return SocialRelService.getRelByUserId(user._id, favUser._id);
    })
    .then(function (_rel) {
      if (!_rel) {
        var relData = {
          user: user._id,
          userDoctorRef: user.doctorRef,
          userDocChatNum: user.docChatNum,
          relUser: favUser._id,
          relUserDoctorRef: favUser.doctorRef,
          relUserDocChatNum: favUser.docChatNum,
          isRelUserFavorite: true,
          theTrueRelCreatedAt: Date.now()
        }
        SocialRelService.createRel(relData);
        DoctorService.modifyFavoritedNum(favUser.doctorRef, 1); //修改收藏数
      } else {
        if (!_rel.isRelUserFavorite) {
          SocialRelService.updateRel({ _id: _rel._id },
            {
              isRelUserFavorite: true,
              isRelUserBlacked: false,
              isRelUserBlocked: false,
              theTrueRelCreatedAt: Date.now()
            }
          );
        }
        console.log("already favorite");
      }
      if (!_.contains(user.favoriteDocs, "" + favUser.doctorRef)) {   //医生未被收藏则收藏
        console.log("favorite user doctorRef id", favUser.doctorRef);
        _changeDocsPushState(user._id, [favUser.doctorRef], false);
        return _favoriteDoc(user._id, favUser.doctorRef);
      }
    }, function (err) {
      console.log('buildRel err:', err);
    })
};

CustomerService.prototype.hasTheDeviceGot = function (deviceId, ignoredUserId, couponType, boundVenderId, appVersion, activityNO) {
  console.log(deviceId, couponType, appVersion, activityNO);

  if (!deviceId || appVersion < '4.4.2') {
    return false;
  }
  var now = Date.now();
  var nowTime = new Date();
  var dayBeginTS = new Date(commonUtil.dateFormat(now, 'yyyy-MM-dd 00:00:00:000')).getTime();
  var dayEndTS = new Date(commonUtil.dateFormat(now, 'yyyy-MM-dd 23:59:59:999')).getTime();
  console.log(dayBeginTS, dayEndTS);
  var deviceCond = {
    deviceId: deviceId,
    isDeleted: false
  };
  var userIds = [];
  var hasGot = false; //自定义,狂欢券 + 100元会员额度,couponType = -1
  return Customer.find(deviceCond, '_id marketing').exec()
    .then(function (_customers) {
      userIds = _.map(_customers, function (_customer) {
        if (_customer.marketing && _customer.marketing.isShareRewardReceived) {
          hasGot = true;
        }
        return _customer._id + '';
      });
      userIds = _.without(userIds, ignoredUserId + '');
      console.log(userIds, ignoredUserId);
      if (userIds && userIds.length == 0) {
        return false;
      }
      var couponCond = {
        isDeleted: false,
        boundUserId: { $in: userIds },
      };

      if (couponType == -1) {
        return hasGot;
      }
      if (activityNO) {
        couponCond.activityNO = activityNO;
      } else if (couponType) {
        couponCond.type = couponType;
        if (couponType == 8) { //返利代金券
          couponCond.boundVenderId = boundVenderId || '';
          couponCond['$or'] = [
            //今天领过
            {
              createdAt: { $gte: dayBeginTS, $lte: dayEndTS }
            },
            //以前领过,未使用且为过期
            {
              createdAt: { $lt: dayBeginTS },
              isConsumed: false,
              expiredAt: { $gt: now }
            }
          ];
        } else if (couponType == 5) { //一周只能领一次
          var day = nowTime.getDay();
          var weekBeginTS = new Date(commonUtil.dateFormat(new Date(nowTime.setDate(nowTime.getDate() - day + 1)), 'yyyy-MM-dd 00:00:00:000')).getTime();
          couponCond.createdAt = { $gte: weekBeginTS };
        } else {
          return false;
        }
      } else {
        return false;
      }
      return Coupon.findOne(couponCond).exec();
    })
    .then(function (_coupon) {
      if (couponType == -1) {
        return hasGot;
      }
      if (_coupon) {
        return true;
      }
      return false;
    })
}


CustomerService.prototype.isShopAuthorized = function (shopVenderApplyStatus) {
  return constants.shopAuthorizedStatus.indexOf(shopVenderApplyStatus) > -1;
}

var _isOpShop = function (shopVenderApplyStatus, shopProp) {
  return constants.shopAuthorizedStatus.indexOf(shopVenderApplyStatus) > -1 && shopProp == 1;
}

CustomerService.prototype.isOpShop = _isOpShop;
CustomerService.prototype.venderConsumedBalance = function (venderId, cps, shopProp) {
  var cond = null;
  var update = null;
  var nowTS = Date.now();
  if (shopProp == 1) {//运营商户
    cond = {
      isDeleted: false,
      userId: venderId,
      balance: { $gte: cps }
    }
    update = {
      $inc: {
        'balance': -cps,
        'checkinNum': 1
      },
      $set: {
        updatedAt: nowTS
      }
    }
    return Shop.findOneAndUpdate(cond, update, { new: true }).exec();
  } else { //普通商户
    cond = {
      isDeleted: false,
      _id: venderId,
      'marketing.balance': { $gte: cps }
    };
    update = {
      $inc: {
        'marketing.balance': -cps,
        'marketing.checkinNum': 1
      },
      $set: {
        updatedAt: nowTS
      }
    }
    return Customer.findOneAndUpdate(cond, update, { new: true }).exec();
  }
};

CustomerService.prototype.getLowestCost = function (lowestCost, cps, couponVal) {
  if (lowestCost > -1) {
    return lowestCost;
  }
  return Math.ceil(commonUtil.getNumsPlusResult([cps, couponVal]));
}

/**
 * 获取用户所在地附近可领取返利代金券的商家
 * @param coordinate 当前坐标
 * @param scope 范围  单位(米)  如果范围为0,则取消范围查询,改为普通查询
 * @param maxSize 最大数据量
 */
CustomerService.prototype.getCoordinateVenders = function (coordinate, scope, maxSize) {
  var d = Q.defer();
  coordinate = coordinate.split(",").reverse();
  maxSize = maxSize || 6;
  maxSize = parseInt(maxSize);
  try {
    scope = parseInt(scope) / 1000;
  } catch (e) {
    scope = 20000;
  }

  // 坐标范围查询
  var match = {
    'shopLocation': {
      $geoWithin: {
        $centerSphere: [coordinate, scope / 3963.2]
      }
    },
    'marketing.cps': { $ne: null },
    'isDeleted': false,
    'shopVenderApplyStatus': { $in: constants.shopAuthorizedStatus },
    '$or': [
      {
        //'marketing.remainMemberSize': {$gt: 0},
        //'marketing.cps': {$gte: 1},
        'marketing.isMarketingClosed': { $ne: true },
        'shopProp': { $nin: constants.opShopProp },
      },
      {
        'shopProp': { $in: constants.opShopProp }
      }]
  };

  // 如果范围为0,则取消范围查询,改为普通查询
  if (scope == 0 || scope == "0") {
    match.shopLocation = { $ne: null };
  }

  Customer.find(match, "_id marketing.cps shopName shopType shopLocation shopProp")
    .sort({ "marketing.cps": -1 })
    .exec()
    .then(function (data) {
      var defer = Q.defer();
      // 获取运营商户数据
      var ids = data.map(function (item) {
        return item._id + "";
      })
      // 获取运营商户 CPS,聚合商户 CPS
      Shop.find({ "userId": { $in: ids } }, "userId cps").exec().then(function (dt) {
        var map = {};
        dt.forEach(function (item) {
          map[item.userId] = item;
        })
        data = data.map(function (item) {
          if (item.shopProp == 1) {
            // 聚合商户CPS
            //item.marketing.cps += map[item._id].cps;
            // console.log('cps:',item.marketing.cps);
            item.marketing.cps = map[item._id].cps;
          }
          return item;
        })
        defer.resolve(data);
      })
      return defer.promise;
    })
    .then(function (data) {
      var result = data.map(function (item) {
        var obj = {
          _id: item._id,
          shopName: item.shopName,
          shopType: item.shopType,
          couponValue: item.marketing.cps,
          coordinate: item.shopLocation ? item.shopLocation.reverse() : []
        }
        obj.shopType = obj.shopType == "医疗" ? "1" : "0";
        obj.couponValueNum = CouponService.getRandomCoupon(obj.couponValue, false);
        obj.couponValue = obj.couponValueNum + '';
        return obj;
      })
      result.sort(function (x, y) {
        return x.couponValueNum - y.couponValueNum;
      })
      result = result.reverse().splice(0, maxSize);

      d.resolve({ items: result });
    })

  return d.promise;
}

CustomerService.prototype.canCheckInCommonCoupon = function (shopProp, marketing) {
  /* if(constants.opShopProp.indexOf(shopProp) > -1){
   return true;
   }*/
  //1.商户处于推广中状态（没有暂停推广）
  //2.商户可领券数大于零
  if (marketing && !marketing.isMarketingClosed && (marketing.remainMemberSize >= 1)) {
    return true;
  }
  return false;
}

/**
 * 如果用户不是第一次购买高级会员,购买金额为298
 * 购买高级会员或者vip会员,收藏801010866
 * @param cardType
 * @param userId
 * @param favorteDocChatNum
 */
CustomerService.prototype.buyMembershipAndFavorite = function (cardType, userId, favorteDocChatNum) {
  var user, favUser, doctor;
  Customer.findOne({ isDeleted: false, _id: userId })
    .populate('doctorRef')
    .exec()
    .then(function (_user) {
      user = _user;
      if (cardType == 'zlycare') {
        var _cond = {
          isDeleted: false,
          _id: userId,
          hasBoughtSenior: { $ne: true }
        }
        return Customer.findOneAndUpdate(_cond, { $set: { hasBoughtSenior: true } });
      }
    })
    .then(function () {
      return Customer.findOne({ isDeleted: false, docChatNum: favorteDocChatNum })
        .populate('doctorRef')
        .exec()
    })
    .then(function (d) {
      if (!d || !d.doctorRef || !d.doctorRef._id) {
        throw ErrorHandler.getBusinessErrorByCode(1205);
      } else {
        favUser = d;
        doctor = d.doctorRef;
        return SocialRelService.getFavoriteCountById(userId);
      }
    })
    .then(function (_count) {
      if (_count >= 2000) { //限制最多只能收藏2000个
        throw ErrorHandler.getBusinessErrorByCode(2001);
      }
      return SocialRelService.getRelByUserId(userId, favUser._id);
    })
    .then(function (_rel) {
      if (!_rel) {
        var relData = {
          user: userId,
          userDoctorRef: user.doctorRef._id,
          userDocChatNum: user.docChatNum,
          relUser: favUser._id,
          relUserDoctorRef: favUser.doctorRef._id,
          relUserDocChatNum: favUser.docChatNum,
          isRelUserFavorite: true,
          theTrueRelCreatedAt: Date.now()
        }
        SocialRelService.createRel(relData);
      } else {
        if (!_rel.isRelUserFavorite) {
          SocialRelService.updateRel({ _id: _rel._id }, {
            isRelUserFavorite: true,
            isRelUserBlacked: false,
            isRelUserBlocked: false,
            theTrueRelCreatedAt: Date.now()
          });
        }
        console.log("already favorite");
      }
      if (!_.contains(user.favoriteDocs, "" + doctor._id)) {   //医生未被收藏则收藏
        console.log("favorite user doctorRef id", doctor._id);
        _changeDocsPushState(user._id, [doctor._id], false);
        return _favoriteDoc(userId, doctor._id);
      }
    })
    .then(function (c) {
      if (c) {
        DoctorService.modifyFavoritedNum(doctor._id, 1); //修改收藏数
        doctor.favoritedNum += 1;
      }
      var hisFavs = user.collectedDocs || [];
      if (!_.contains(hisFavs, "" + doctor._id)) { //首次收藏
        DoctorService.sendFavoritedSms(doctor, user);
      }
    })
}

CustomerService.prototype.inviteReward = function (invitee) {

  var config_service = Backend.service('common', 'config_service');
  var invite_service = Backend.service('1/red_paper', 'invite_record_service');
  var isInviteActive = false;
  var inviterRewardLimit = 0;
  return config_service.getHeavenConfigInfo()
    .then(function (_res) {
      //console.log('_res:', _res);
      if (_res && _res.isInviteActive) {
        isInviteActive = true;
        inviterRewardLimit = _res.inviterRewardLimit || 0;
        return invite_service.setInviteRecordLogin(invitee);
      }
    })
    .then(function (_res) {
      //console.log('invite _res: ', _res);
      if (_res && (_res.inviteeReward > 0) && _res.inviter && _res.invitee) {
        var orderId = _res._id + '';//邀请纪录id作为内部订单号
        var inviteeReward = _res.inviteeReward;
        return invite_service.getInviterCount(_res.inviter)
          .then(function (_count) {
            if (inviterRewardLimit <= 0) {
              return;
            }
            //console.log('inviterRewardLimit:', inviterRewardLimit);
            if (_count <= inviterRewardLimit) {//
              //不满10次邀请双方都有奖励
              var sqls = TransactionMysqlService.genInviteRewardSqls(_res.inviter, _res.invitee, inviteeReward, inviteeReward, '', orderId)
              return TransactionMysqlService.execSqls(sqls);
            } else {
              //满10次后,邀请者无奖励, 被邀请者有奖励
              var sqls = TransactionMysqlService.genInviteRewardSqls(_res.inviter, _res.invitee, 0, inviteeReward, '', orderId)
              return TransactionMysqlService.execSqls(sqls);
            }
          })
      }
    })
}

CustomerService.prototype.sendMomentMsgs = function (userInfo, momentInfo) {
  //给我的粉丝发动态消息.粉丝block(fan.blockDocs)和我拉黑(me.blackList)的除外
  //已有动态消息纪录的更新; 没有动态消息的生成
  var userId = userInfo.userId;
  var doctorRefId = userInfo.doctorRefId;
  var blackList = userInfo.blackList;
  var msg_name = userInfo.msg_name;
  var newestCreatedAt = 0;
  var newestObjectId = 0;
  var cond = {
    "favoriteDocs": doctorRefId,
    "isDeleted": false,
  };
  var limit = 500;
  var fields = '_id pushId blockDocs';
  var options = { limit: limit, sort: { _id: 1 } };
  var hasMore = true;
  var hasSendSelf = false;
  async.whilst(
    function () {
      return hasMore;
    },
    function (cb) {
      var fanUserIds = [];
      var fanUserPushIds = [];
      console.log('cond: ', cond);
      Customer.find(cond, fields, options).exec()
        .then(function (fans) {
          if (fans.length == 0) {
            hasMore = false;
            //允许向自己发送动态消息
            //return cb();
          } else {
            cond._id = { $gt: fans[fans.length - 1]._id };
          }
          for (var i = 0; i < fans.length; i++) {
            var fan = fans[i];
            if ((!fan.blockDocs || (fan.blockDocs && fan.blockDocs.indexOf(userId + '') < 0))
              && (!blackList || blackList.indexOf(fan._id + '') < 0)) {
              fanUserIds.push(fan._id + "");
              if (fan.pushId && fan.pushId != "" && fan.pushId != undefined) {
                fanUserPushIds.push(fan.pushId);
              }
            }
          }
          //使用 uniq 去重
          fanUserIds = _.uniq(fanUserIds);
          //向自己发送动态消息
          if (!_.contains(fanUserIds, userId) && !hasSendSelf) {
            hasSendSelf = true;
            fanUserIds.push(userId)
          }
          if (_.contains(fanUserIds, userId)) {
            hasSendSelf = true;
          }
          fanUserPushIds = _.uniq(fanUserPushIds);
          return MomentMsgService.setExistMessage(fanUserIds, momentInfo._id, momentInfo.originalMomentId, userId)
            .then(function (_updExists) {
              //可以判断下更新的个数 _updExists, 避免查询
              if (_updExists.nModified == fanUserIds.length) {
                var exitInfo = "all";
                return exitInfo;
              } else {
                return MomentMsgService.getMsgByUserIdArray(fanUserIds)
              }
            })
            .then(function (_exitUserMsg) {
              if (_exitUserMsg != "all") {
                var noExistUsers = [], existUsers = [];
                if (_exitUserMsg) {

                  for (var i = 0; i < _exitUserMsg.length; i++) {
                    existUsers.push(_exitUserMsg[i].userId + "");
                  }
                  // 使用 _.difference
                  noExistUsers = _.difference(fanUserIds, existUsers);
                }
                ;
                return MomentMsgService.createNoExistMsg(noExistUsers, momentInfo._id, momentInfo.originalMomentId, userId)
              }
            })
            .then(function () {
              //粉丝
              return _updateBaseInfoByIds(fanUserIds, {
                'msgReadStatus.moment': true,
                'msgReadStatus.all': true
              });
            })
            .then(function () {
              var extras = {
                type: 1,//有新消息
                contentType: 'moment' //moment-动态, personal-个人留言, sys-系统通知
              };
              var message = msg_name + "发布了新动态";
              return JPushService.pushMessage(fanUserPushIds, message, '', extras);
            })
            .then(function () {
              var notificationExtras = {
                type: 3, //type: 1-为收藏推送, 2-消息中心, 3-新消息
                contentType: "moment"
              };
              //var messageNotification = msg_name + '发布了新动态：' + (data.message2Customer || mapMoment);
              var messageNotification = msg_name + '发布了新动态：' + momentInfo.content; //todo:
              if (messageNotification.length > 30) {
                messageNotification = messageNotification.substring(0, 29) + "...";
              }
              JPushService.pushNotification(fanUserPushIds, messageNotification, '', notificationExtras);
            })
            .then(function () {
              var timeOutId = setTimeout(function () {
                return cb();
              }, 5000);
            }, function () {
              console.log(e);
              return cb();
            })
        }, function (e) {
          console.log(e);
          return cb();
        })
    },
    function () {
      console.log('all has completed!');
    }
  )
  return true;
}
CustomerService.prototype.sendMomentTransferMsgs = function (userInfo, momentInfo) {
  //给我的粉丝发动态消息.粉丝block(fan.blockDocs)和我拉黑(me.blackList)的除外
  //已有动态消息纪录的更新; 没有动态消息的生成
  var userId = userInfo.userId;
  var doctorRefId = userInfo.doctorRefId;
  var blackList = userInfo.blackList;
  var msg_name = userInfo.msg_name;
  var newestCreatedAt = 0;
  var newestObjectId = 0;
  var cond = {
    "favoriteDocs": doctorRefId,
    "isDeleted": false,
  };
  var limit = 500;
  var fields = '_id pushId blockDocs';
  var options = { limit: limit, sort: { _id: 1 } };
  var hasMore = true;
  async.whilst(
    function () {
      return hasMore;
    },
    function (cb) {
      var fansUsers = [];
      var fansUsersPushId = [];
      var fans = [];
      console.log('cond: ', cond);
      Customer.find(cond, fields, options).exec()
        .then(function (_fans) {
          if (_fans.length == 0) {
            hasMore = false;
            return cb();
          }
          fans = _fans;
          cond._id = { $gt: fans[fans.length - 1]._id };
          return MomentMsgService.getMsgByUserIdArray(fans, "userId momentList")
            .then(function (_fansMomentMsgs) {
              //console.log('_fansMomentMsgs:', _fansMomentMsgs);
              _fansMomentMsgs = _.indexBy(_fansMomentMsgs, "userId");
              for (var i = 0; i < fans.length; i++) {
                if (!fans[i].blockDocs || (fans[i].blockDocs && fans[i].blockDocs.indexOf(userId + '') < 0)
                  && (!blackList || blackList.indexOf(fans[i]._id + '') < 0)) {
                  if (_fansMomentMsgs[fans[i]._id]) {
                    var isRepeat = false;
                    _fansMomentMsgs[fans[i]._id].momentList.forEach(function (item) {
                      if (item.originalMomentId == momentInfo.originalUserMoment) {
                        isRepeat = true;
                      }
                    })
                    if (!isRepeat) {
                      fansUsers.push(fans[i]._id + "");
                      if (fans[i].pushId && fans[i].pushId != "" && fans[i].pushId != undefined) {
                        fansUsersPushId.push(fans[i].pushId);
                      }
                    }
                  } else {
                    fansUsers.push(fans[i]._id + "");
                    if (fans[i].pushId && fans[i].pushId != "" && fans[i].pushId != undefined) {
                      fansUsersPushId.push(fans[i].pushId);
                    }
                  }
                }
              }
              //使用 uniq 去重
              fansUsers = _.uniq(fansUsers);
              //向自己发送动态消息
              if (!_.contains(fansUsers, userId)) {
                fansUsers.push(userId)
              }
              fansUsersPushId = _.uniq(fansUsersPushId);

              return MomentMsgService.setExistMessage(fansUsers, momentInfo._id, momentInfo.originalMomentId, userId)//todo: data.momentId
            })
            .then(function (_updExists) {
              //可以判断下更新的个数 _updExists, 避免查询
              if (_updExists.nModified == fansUsers.length) {
                var exitInfo = "all";
                return exitInfo;
              } else {
                //TODO: 使用 distinct("userid")
                return MomentMsgService.getMsgByUserIdArray(fansUsers) //查询已存在的momentMsg
              }
            })
            .then(function (_exitUserMsg) {
              if (_exitUserMsg != "all") {
                var noExistUsers = [], existUsers = [];
                if (_exitUserMsg) {
                  for (var i = 0; i < _exitUserMsg.length; i++) {
                    existUsers.push(_exitUserMsg[i].userId + "");
                  }
                  // 使用 _.difference
                  noExistUsers = _.difference(fansUsers, existUsers);
                }
                ;
                return MomentMsgService.createNoExistMsg(noExistUsers, momentInfo._id, momentInfo.originalMomentId, userId) //创建不存在的momentMsg
              }
            })
            .then(function () {
              //粉丝
              return _updateBaseInfoByIds(fansUsers, {
                'msgReadStatus.moment': true,
                'msgReadStatus.all': true
              });
            })
            .then(function () {
              var extras = {
                type: 1,//有新消息
                contentType: 'moment' //moment-动态, personal-个人留言, sys-系统通知
              };
              var message = msg_name + "发布了新动态";
              return JPushService.pushMessage(fansUsersPushId, message, '', extras);
            })
            .then(function () {
              var notificationExtras = {
                type: 3, //type: 1-为收藏推送, 2-消息中心, 3-新消息
                contentType: "moment"
              };
              //var messageNotification = msg_name + '发布了新动态：' + (data.message2Customer || mapMoment);
              var messageNotification = msg_name + '发布了新动态：' + momentInfo.content; //todo:
              if (messageNotification.length > 30) {
                messageNotification = messageNotification.substring(0, 29) + "...";
              }
              JPushService.pushNotification(fansUsersPushId, messageNotification, '', notificationExtras);
            })
            .then(function () {
              var timeOutId = setTimeout(function () {
                return cb();
              }, 5000);
            }, function () {
              console.log(e);
              return cb();
            })
        }, function (e) {
          console.log(e);
          return cb();
        })
    },
    function () {
      console.log('all has completed!');
    })
  return true;
};

/**
 * 用于同步jkLastestLoginTime时间
 * @returns {Promise}
 */
CustomerService.prototype.synLoginTime = function () {
  return Customer.find({
    jkLastestLoginTime: { $exists: false },
    lastestLoginTime: { $exists: true },
    isDeleted: false
  }).sort({ _id: -1 }).limit(10000).exec()
    .then(function (data) {
      console.log('本次查询数量', data.length);
      data.forEach(function (item) {
        Customer.update({ _id: item._id }, { jkLastestLoginTime: item.lastestLoginTime || 0 }).exec();
      });

      return data.length;
    });
};
/**
 * 通过第三方，获取用户信息
 * @param from
 * @param id
 * @param nickName
 * @param deviceId
 * @param name
 * @returns {Promise|Promise.<TResult>}
 */
CustomerService.prototype.getUserByThirdParty = function (from, id, nickName, deviceId, storeChannel) {
  var condition = {};
  condition["thirdParty." + from + ".id"] = id;
  condition.isDeleted = false;
  let openId;
  let user_center_service = Backend.service('user_center', 'handle_user_center');
  return user_center_service.login_third(from, id)
    .then(function (user_center) {
      openId = user_center && user_center.data && user_center.data.id || '';
      return Customer.findOne({ openId: openId, isDeleted: false });
    })
    .then(function (user) {
      if (user) {
        var now = Date.now();
        var updates = {
          deviceId: deviceId || user.deviceId,
          $addToSet: { "usedApp": 'docChat' },
          jkLastestLoginTime: now,
          updatedAt: now
        };
        //不需要多余的赋值
        // updates["thirdParty." + from + ".nickName"] = nickName;
        // updates["thirdParty." + from + ".updatedAt"] = now;
        // if (name) {
        //     updates.name = name;
        //     updates.pinyinName = toPinYin(name);
        // }
        if (storeChannel) {
          updates.storeChannel = storeChannel;
        }

        return findOneAndUpdate({ openId: openId, isDeleted: false }, updates, { new: true });
      }
    });
};

/**
 * 通过第三方，获取用户信息, 不包含单点登录内容
 * @param userId
 * @param from
 * @param id
 * @param name
 * @returns {Promise|Promise.<TResult>}
 */
CustomerService.prototype.getUserByThirdPartyPure = function (userId, from, id) {
  var condition = {
    _id: { $ne: userId }
  };
  condition["thirdParty." + from + ".id"] = id;
  condition.isDeleted = false;

  return Customer.findOne(condition, Customer.selectFields)
    .exec().then(function (user) {
      return user;
    });
};

/**
 * 更新第三方信息
 * @param userId
 * @param from
 * @param id
 * @param nickName
 */
CustomerService.prototype.updateThirdPartyById = function (userId, from, id, nickName) {
  var cond = {
    _id: userId,
    isDeleted: false
  };
  var updates = {};

  updates["thirdParty." + from + ".id"] = id;
  updates["thirdParty." + from + ".nickName"] = nickName;
  updates["thirdParty." + from + ".updatedAt"] = Date.now();

  return findOneAndUpdate(cond, updates, { new: true });
};
/**
 * 取消第三方绑定
 * @param userId
 * @param from
 */
CustomerService.prototype.cancelThirdPartyById = function (userId, from) {
  var cond = {
    _id: userId,
    isDeleted: false
  };
  var updates = {};
  switch (from) {
    case 'wx':
      updates = { $unset: { "thirdParty.wx": '' } };
      break;
    case 'qq':
      updates = { $unset: { "thirdParty.qq": '' } };
      break;
    case 'wb':
      updates = { $unset: { "thirdParty.wb": '' } };
      break;
  }

  return findOneAndUpdate(cond, updates, { new: true });
};

//获取用户所在城市
CustomerService.prototype.getCityList = function () {
  return Customer.distinct('location.city');
};

CustomerService.prototype.testCustomerCount = function (cond) {
  return Customer.find(cond).count();
};

CustomerService.prototype.testBalanceCount = function (cond, skip, limit) {
  return Customer.aggregate([
    { $match: cond },
    { $sort: { 'createdAt': -1 } },
    { $project: { _id: 1, pushId: 1 } },
    { $skip: skip },
    { $limit: limit }
  ]).exec();
};


CustomerService.prototype.modifyTagGroupBoss = function () {
  Customer.find({ tagGroup: { $exists: true } })
    .then(function (_user) {
      _user = JSON.parse(JSON.stringify(_user));
      console.log('wfefw', _user, _user.tagGroup);
      _user.forEach(function (item) {
        if (item.tagGroup && item.tagGroup.length > 0) {
          Customer.update({ _id: item._id }, {
            $set: {
              "tagGroup1.id": item.tagGroup[item.tagGroup.length - 1].id,
              // Customer.update({_id:ObjectId("5466f71e4b2a8c2d6257528a")},{$set:{"tagGroup1.id":_user.tagGroup[_user.tagGroup.length-1].id,
              "tagGroup1.title": item.tagGroup[item.tagGroup.length - 1].title,
              "tagGroup1.updatedAt": item.tagGroup[item.tagGroup.length - 1].updatedAt || 0,
              "tagGroup1._id": item.tagGroup[item.tagGroup.length - 1]._id
            }
          }).then(function (_o) {
            console.log('update', _o);
          })
        }
      });
    });

};
module.exports = exports = new CustomerService();
