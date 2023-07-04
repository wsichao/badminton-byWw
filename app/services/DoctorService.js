var
  _ = require('underscore'),
  Q = require("q"),
  commonUtil = require('../../lib/common-util'),
  encrypt = commonUtil.commonMD5,
  serverconfigs = require('../../app/configs/server'),
  constants = require('../configs/constants'),
  Doctor = require('../models/Doctor'),
  DoctorGrp = require('../models/DoctorGrp'),
  Customer = require('../models/Customer')
  reservedDocChatNum = require('../json/reservedDocChatNum');
  //Relation = require('../models/RelRecmndFan'),
  RelRecmndFan = require('../models/RelRecmndFan'),
  Application = require('../models/Application'),
  JPushService = require('../services/JPushService'),
  TransactionMysqlService = require('./TransactionMysqlService'),
  ErrorHandler = require('../../lib/ErrorHandler')
  Promise = require('promise');


var
  logger = require('../configs/logger'),
  filename = 'app/services/AuthService',
  TAG = logger.getTag(logger.categorys.SERVICE, filename);

var DoctorService = function () {
};
DoctorService.prototype.constructor = DoctorService;

var findOneAndUpdate = function (query, update, option) {
  var deferred = Q.defer();
  //FIXME : 需要封装一个方法单独populate  moment
  Doctor.findOneAndUpdate(query, update, option).populate("moment").exec()
    .then(function (user) {
      if (!user) {
        console.log("no user match" + JSON.stringify(query));
        deferred.reject(ErrorHandler.getBusinessErrorByCode(1503));
      } else {
        deferred.resolve(user);
      }
    }, function (err) {
      console.log("Error: " + err);
      deferred.reject(err);
    });

  return deferred.promise;
};

DoctorService.prototype.token = function (doctor) {
  // return encrypt(doctor._id + doctor.lastestLoginTime, serverconfigs.secret, true);
  return encrypt(doctor._id + doctor.jkLastestLoginTime, serverconfigs.secret, true);
};

DoctorService.prototype.callPriceDescription = function (doctor) {
  if (doctor.callPrice.initiatePayment == 0 && doctor.callPrice.paymentPerMin == 0)
    return '免费咨询';

  var callPrice = doctor.callPrice.customerInitiateTime + "分钟内" + doctor.callPrice.initiatePayment + "元，超出部分" + doctor.callPrice.paymentPerMin + "元/分钟";
  if (doctor.callPrice.discount < 1)
    callPrice += "\n当前折扣：" + doctor.callPrice.discount * 10 + "折";

  return callPrice;
};

DoctorService.prototype.createDoctor = function (doctor) {
  doctor.recommendConf = [
    constants.RECOMMEND_BAK,
    constants.RECOMMEND_ASS,
    constants.RECOMMEND_AD
  ];
  return Doctor.create(doctor);
};

DoctorService.prototype.validDoctor = function (phoneNum, password, deviceId) {
  var condition = {};
  condition.source = 'docChat';
  condition.phoneNum = phoneNum;
  condition.applyStatus = 'done';
  condition.isDeleted = false;

  return Doctor.findOne(condition).exec().then(function (doctor) {
    console.log('docor:', doctor);
    if (!doctor) {
      throw ErrorHandler.getBusinessErrorByCode(1510);
    } else if (doctor.password != password) {
      throw ErrorHandler.getBusinessErrorByCode(1505);
    }
    //else if (doctor.applyStatus == 'handling') {
    //  throw ErrorHandler.getBusinessErrorByCode(1518);
    //}
    else {
      return findOneAndUpdate(condition, {
        deviceId: deviceId,
        isOnline: doctor.isOnlineOnLogout,
        // lastestLoginTime: Date.now(),
          jkLastestLoginTime: Date.now(),
        updatedAt: Date.now()
      }, {new: true});
    }
  });
};
/**
 * 生成24热线号码
 * 规则:
 * 1. 0~
 * 2. 1~
 * 3. 2~
 * 4. 60~
 * @ 20161025 UCOM号段由7开头改为8开头
 * 5. 800000 - 819999 批量导入的UCOM账户
 * 6. 820000 - 849999 自X动注册的UCOM账户
 * @ 20170103 UCOM号段8开头提升为9位,补三个0
 * 7. 800000000 - 800019999 批量导入的UCOM账户
 * 8. 800020000 - 800049999 自动注册的UCOM账户
 *
 * @param prefix 指定前缀
 * @param infixNum 指定中缀个数,大于等于3
 * @param postfix 指定后缀
 * @returns {*}
 */
DoctorService.prototype.genDoctorChatNum = function (prefix, infixNum, infixMin, infixMax, postfix, existsDocChatNums) {

  prefix = prefix || "";
  postfix = postfix || "";
  if (!infixNum || infixNum <= 1) {
    throw new ErrorHandler.genBackendError(8005);//请求参数有误
  }
  var min = 1;
  var max;
  var infixLen = infixNum;

  if (infixMin)
    min = infixMin;

  if (infixMax) {
    max = infixMax;
  } else {
    max = "";
    while (infixNum--) max += "9";
    max = Number(max);
  }

  // 查询现有的号码
  if(existsDocChatNums && existsDocChatNums.length > 0){
    var defer = Q.defer();
    for (var i = 0; i < 1000; i++) {// 限尝试1000次,否则失败 @fixme
      var docChatNum = prefix + commonUtil.getRandomNumByStr(min, max, infixLen) + postfix;
      if (!_.contains(existsDocChatNums, docChatNum) && !_.contains(reservedDocChatNum, docChatNum)){
        defer.resolve(docChatNum);
        break;
      }
    }
    return defer.promise;
  }else{
    return _distinctDocChatNum()
        .then(function (_chatNums) { //分配号码
          //Return
          for (var i = 0; i < 1000; i++) {// 限尝试1000次,否则失败 @fixme
            var docChatNum = prefix + commonUtil.getRandomNumByStr(min, max, infixLen) + postfix;
            if (!_.contains(_chatNums, docChatNum) && !_.contains(reservedDocChatNum, docChatNum))
              return docChatNum;
          }
          //请求处理失败
          throw new ErrorHandler.genBackendError(8007);
        })
  }

};

DoctorService.prototype.publicRegDoctor = function (data) {
  var condition = {};
  condition.source = 'docChat';
  condition.phoneNum = data.phoneNum;
  condition.applyStatus = "done";

  data.applyStatus = "done";
  data.recommendConf = [
    constants.RECOMMEND_BAK,
    constants.RECOMMEND_ASS,
    constants.RECOMMEND_AD
  ];
  return Doctor.findOne(condition).exec().then(function (u) {
    if (u) {
      data.updatedAt = Date.now();
      return findOneAndUpdate(condition, data, {new: true});
    } else {
      return Doctor.create(data);
    }
  });
};
DoctorService.prototype.applyTobeDoctor = function (data) {
  var condition = {};
  condition.source = 'docChat';
  condition.phoneNum = data.phoneNum;
  condition.applyStatus = "handling";
  condition.isDeleted = false;
  return Doctor.findOne(condition,"_id").exec().then(function (u) {
    if (u) {
      data.updatedAt = Date.now();
      return findOneAndUpdate(condition, data, {new: true});
    } else {
      data.recommendConf = [
        constants.RECOMMEND_BAK,
        constants.RECOMMEND_ASS,
        constants.RECOMMEND_AD
      ];
      return Doctor.create(data);
    }
  });
};
DoctorService.prototype.doctorSts = function (conditions, pageSlice) {
  conditions.source = 'docChat',
    conditions.isDeleted = false,
    conditions.applyStatus = "done";
  return Doctor.find(conditions, Doctor.selectFields, pageSlice).exec();
};
DoctorService.prototype.getAllDoctorInfo = function (pageSlice) {
  var condition = {};
  condition.source = 'docChat';
  condition.isDeleted = false;
  condition.applyStatus = "done";

  return Doctor.find(condition, Doctor.selectFields, pageSlice).exec();
};
DoctorService.prototype.query = function (conditions, pageSlice, fields) {
  conditions.source = 'docChat';
  conditions.isDeleted = false;
  conditions.applyStatus = "done";

  return Doctor.find(conditions, {}, pageSlice).exec();
};
DoctorService.prototype.getAllDoctorAllInfo = function (pageSlice) {
  var condition = {};
  condition.source = 'docChat';
  condition.isDeleted = false;
  condition.applyStatus = "done";

  return Doctor.find(condition, "-password", pageSlice).exec();
};

DoctorService.prototype.getExpiryDateDoctorNum = function (expiryDate) {
  var condition = {};
  condition.source = 'docChat';
  condition.isDeleted = false;
  condition.applyStatus = "done";
  condition.createdAt = {$lte: expiryDate};

  return Doctor.find(condition).count().exec();
};

DoctorService.prototype.getGTDateDoctorNum = function (gtDate) {
  var condition = {};
  condition.source = 'docChat';
  condition.isDeleted = false;
  condition.applyStatus = "done";
  condition.createdAt = {$gt: gtDate};

  return Doctor.find(condition).count().exec();
};

DoctorService.prototype.getAllDotorApply = function (pageSlice) {
  var condition = {};
  condition.source = 'docChat';
  condition.isDeleted = false;
  condition.applyStatus = "handling";

  return Doctor.find(condition, "-password", pageSlice).exec();
};

DoctorService.prototype.getDotorApplyById = function (ID) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = ID;
  condition.isDeleted = false;
  condition.applyStatus = "handling";

  return Doctor.findOne(condition).exec();
};

DoctorService.prototype.getInfoByID = function (ID) {
  if (!commonUtil.isUUID24bit(ID)) return null;
  var condition = {};
  condition.source = 'docChat';
  condition._id = ID;
  condition.isDeleted = false;
  condition.applyStatus = "done";

  return Doctor.findOne(condition, Doctor.docSelectFields).lean().exec();
};

DoctorService.prototype.bindJPush = function (userId, pushId) {
  // 清空之前用户的j_push_id
  if (!pushId) throw ErrorHandler.getBusinessErrorByCode(8005);
  
  return Doctor.update({
    "pushId": pushId,
    "source": 'docChat',
    "isDeleted": false,
    "applyStatus": "done"
  }, {$set: {pushId: ''}}, {multi: true}).exec()
    .then(function () {
      return findOneAndUpdate({_id: userId}, {pushId: pushId}, {new: true});
    });
};

DoctorService.prototype.getAllInfoByID = function (ID) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = ID;
  condition.isDeleted = false;
  condition.applyStatus = "done";

  return Doctor.findOne(condition, "-password").exec();
};

DoctorService.prototype.getInfoByDocChatNum = function (docChatNum) {

  if (!docChatNum) {
    var deferred = Q.defer();
    deferred.resolve();
    return deferred.promise;
  }
  
  var condition = {};
  condition.source = 'docChat';
  condition.docChatNum = docChatNum;
  condition.isDeleted = false;
  condition.applyStatus = "done";

  return Doctor.findOne(condition, Doctor.selectFields).exec();
};

//获得所有是公司员工的顾问
DoctorService.prototype.getAllEmployeeDoctor = function () {
  var condition = {};
  condition.source = 'docChat';
  condition.isDeleted = false;
  condition.applyStatus = "done";
  condition.systag = 'employee';

  return Doctor.find(condition, Doctor.selectFields).exec();
};
var _distinctDocChatNum = function () {
  return Doctor.distinct('docChatNum', {
    isDeleted: false,
    source: 'docChat',
    applyStatus: 'done'
  }).exec();
};
DoctorService.prototype.distinctDocChatNum = _distinctDocChatNum;


DoctorService.prototype.getAllInfoByDocChatNum = function (docChatNum) {
  var deferred = Q.defer();
  if (!docChatNum) {
    deferred.resolve();
    return deferred.promise;
  }
  var condition = {};
  condition.source = 'docChat';
  condition.docChatNum = docChatNum;
  condition.isDeleted = false;
  condition.applyStatus = "done";

  return Doctor.findOne(condition, "-password").exec();
};

//TODO: 应用于查询特定字段信息
DoctorService.prototype.getSelectedInfoByPhone = function (phone, selectFields) {
  var condition = {};
  condition.source = 'docChat';
  condition.phoneNum = phone;
  condition.isDeleted = false;
  condition.applyStatus = "done";
  selectFields = selectFields || "-password";

  return Doctor.findOne(condition, selectFields).exec();
};
DoctorService.prototype.getSelectedInfoById = function (id, selectFields) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = id;
  condition.isDeleted = false;
  condition.applyStatus = "done";
  selectFields = selectFields || "-password";

  return Doctor.findOne(condition, selectFields).exec();
};


DoctorService.prototype.getInfoByPhone = function (phone) {
  var condition = {};
  condition.source = 'docChat';
  condition.phoneNum = phone;
  condition.isDeleted = false;
  condition.applyStatus = "done";

  return Doctor.findOne(condition, "-password").exec();
};

DoctorService.prototype.getUsersByIDs = function (IDs) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = {"$in": IDs};
  condition.isDeleted = false;
  condition.applyStatus = "done";

  return Doctor.find(condition, Doctor.selectFields).exec();
};

DoctorService.prototype.getUsersByIDsCreatedAtASC = function (IDs,pageSlice) {
  IDs = IDs || [];
  var condition = {};
  condition.source = 'docChat';
  condition._id = {"$in": IDs};
  condition.isDeleted = false;
  condition.applyStatus = "done";
  return Doctor.find(condition, Doctor.publicFields, pageSlice).lean().exec();
};

DoctorService.prototype.resetPWD = function (phoneNum, password) {
  var condition = {};
  condition.source = 'docChat';
  condition.phoneNum = phoneNum;
  condition.isDeleted = false;

  return findOneAndUpdate(condition, {
    updatedAt: Date.now(),
    password: password
  }, {new: true});
};
DoctorService.prototype.bathModifyFavoritedNum = function (ids, num) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = {$in: ids || []};
  condition.isDeleted = false;

  return Doctor.update(condition, {
    $inc: {"favoritedNum": num},
    updatedAt: Date.now()
  }, {multi: true}).exec();
};
DoctorService.prototype.modifyFavoritedNum = function (id, num) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = id;
  condition.isDeleted = false;

  return Doctor.update(condition, {
    $inc: {"favoritedNum": num},
    updatedAt: Date.now()
  }).exec();
};
/**
 * TODO: fake func
 * @param docGrpId
 * @param params
 * @returns {*}
 */
DoctorService.prototype.getDocListByDocGrpNum = function (docGrpId, params) {
  var condition = {};
  condition._id = docGrpId;
  condition.isDeleted = false;
  return DoctorGrp.findOne(condition, "docChatList").exec()
    .then(function (_grp) {
      if (_grp) {
        condition = {
          docChatNum: {$in: _grp.docChatList},
          isDeleted: false
        };
        return Customer.find(condition, params).populate("doctorRef").exec()
      } else {
        throw ErrorHandler.genBackendError(8005);
      }
    });
  //return Promise.resolve().then(function () {
  //  return [
  //    {_id: ObjectId("55d68d9b8faee0fbe0c4be97")},
  //    {_id: ObjectId("55dbdc828faee0fbe0c4bea8")},
  //    {_id: ObjectId("55dd39848faee0fbe0c4bee7")},
  //    {_id: ObjectId("562856dd8faee0fbe0c4cba0")},
  //    {_id: ObjectId("55f425d78faee0fbe0c4c449")}
  //  ];
  //})
};

DoctorService.prototype.getInfoByDocGrpId = function (docGrpId, params) {
  var condition = {};
  condition._id = docGrpId;
  condition.isDeleted = false;
  var description;
  var docChatList;
  return DoctorGrp.findOne(condition, "docChatList description").exec()
    .then(function (_grp) {
      if (_grp) {
        description = _grp.description;
        docChatList = _grp.docChatList;
        condition = {
          docChatNum: {$in: _grp.docChatList},
          isDeleted: false
        };
        return Doctor.find(condition, params).exec()
      } else {
        throw ErrorHandler.genBackendError(8005);
      }
    })
    .then(function (_docList) {
      var docList = {};
      _docList = JSON.parse(JSON.stringify(_docList));
      for (var i = 0; i < docChatList.length; i++) {
        for (var j = 0; j < _docList.length; j++) {
          if (docChatList[i] == _docList[j].docChatNum) {
            var flag;
            flag = _docList[i];
            _docList[i] = _docList[j];
            _docList[j] = flag;
          }
        }
      }
      docList.list = _docList;
      docList.description = description;
      return docList;
    })

};

DoctorService.prototype.getDocGrpList = function (params, pageSlice) {
  return DoctorGrp.find({}, params, pageSlice).exec()
    .then(function (_grp) {
      return _grp;
    })
};

DoctorService.prototype.updateDocGrp = function (data) {
  var condition = {
    _id: data._id,
    isDeleted: false
  }
  return DoctorGrp.update(condition, {
    docChatList: data.docChatList,
    description: data.description,
    memo: data.memo,
    updatedAt: Date.now()
  }).exec()
};

DoctorService.prototype.insertDocGrp = function (data) {
  return DoctorGrp.create(data);
};

DoctorService.prototype.modifyListDoctorFavoritedNum = function (IDs, num) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = {"$in": IDs};
  condition.isDeleted = false;

  return Doctor.update(condition, {
    $inc: {"favoritedNum": num},
    updatedAt: Date.now()
  }, {multi: true}).exec();
};

DoctorService.prototype.modifyApplyStatus = function (id, applyStatus) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = id;
  condition.isDeleted = false;

  return Doctor.update(condition, {
    applyStatus: applyStatus,
    updatedAt: Date.now()
  }).exec();
};

DoctorService.prototype.logout = function (id) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = id;
  condition.isDeleted = false;
  //注：现在医生端没有使用到推送
  return findOneAndUpdate(condition, {
    $set: {pushId: ''},
    isOnline: false,
  }, {new: true});
};


DoctorService.prototype.updateBaseInfo = function (id, update) {
  var condition = {};
  condition._id = id;
  condition.isDeleted = false;

  return findOneAndUpdate(condition, update, {new: true});
};

/**
 * 拨打医生要求的最低价格
 * @param doctor
 */
DoctorService.prototype.callDocMinimumPrice = function (doctor) {
  //规则：患者余额大于要求的起步价就可以打电话
  return doctor.callPrice.initiatePayment * (doctor.callPrice.discount || 1);
};

DoctorService.prototype.addOfflineCallers = function (id, customerPhone) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = id;
  condition.isDeleted = false;

  return Doctor.update(condition, {
    $addToSet: {"offlineCallers": customerPhone},
    updatedAt: Date.now()
  }).exec();
};

DoctorService.prototype.cleanOnflineCallers = function (id) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = id;
  condition.isDeleted = false;

  return Doctor.update(condition, {
    "offlineCallers": [],
    updatedAt: Date.now()
  }).exec();
};

DoctorService.prototype.addBusyCallers = function (id, customerPhone) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = id;
  condition.isDeleted = false;

  return Doctor.update(condition, {
    $addToSet: {"busyCallers": customerPhone},
    updatedAt: Date.now()
  }).exec();
};

DoctorService.prototype.cleanBusyCallers = function (id) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = id;
  condition.isDeleted = false;

  return Doctor.update(condition, {
    "busyCallers": [],
    updatedAt: Date.now()
  }).exec();
};

DoctorService.prototype.addQueryDeviceId = function (id, deviceId) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = id;
  condition.isDeleted = false;

  return Doctor.update(condition, {
    $addToSet: {"queryByDeviceIds": deviceId},
    updatedAt: Date.now()
  }).exec();
};

//DoctorService.prototype.applyWithdraw = function (doctor) {
//  return Application.create({
//    status: 0,
//    future: Date.now() + constants.TIME7D,
//    applicantId: doctor._id,
//    applicantName: doctor.realName
//    //cash: cash,
//    //alipayNum: alipay,//支付宝账号 
//    //alipayName: alipayName,//支付宝绑定姓名
//    //bankCardNum: bankCard,//银行卡号 
//    //bankCardName: bankCardName,//提款人开户行姓名 
//    //bankName: bankName,
//    //area: area,
//    //subBankName: subBankName
//  });
//};

DoctorService.prototype.getAllWithdrawApply = function (pageSlice) {
  var fields = 'applicantId applicantName status createdAt';
  var condition = {};
  condition.source = 'docChat';
  condition.isDeleted = false;

  return Application.find(condition, fields, pageSlice).exec();
};

DoctorService.prototype.addScannedNum = function (docChatNum) {
  var condition = {};
  condition.source = 'docChat';
  condition.docChatNum = docChatNum;
  condition.isDeleted = false;

  return Doctor.update(condition, {$inc: {"scannedNum": 1}}).exec();
};

DoctorService.prototype.addDownloadNum = function (docChatNum) {
  var condition = {};
  condition.source = 'docChat';
  condition.docChatNum = docChatNum;
  condition.isDeleted = false;

  return Doctor.update(condition, {$inc: {"downloadNum": 1}}).exec();
};

DoctorService.prototype.addOrderNum = function (id) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = id;
  condition.isDeleted = false;

  return Doctor.update(condition, {$inc: {"orderNum": 1}}).exec();
};

DoctorService.prototype.addSharedNum = function (id) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = id;
  condition.isDeleted = false;

  return Doctor.update(condition, {$inc: {"sharedNum": 1}}).exec();
};

DoctorService.prototype.addCustomerNote = function (doctorId, customerId, note) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = doctorId;
  condition.isDeleted = false;

  var customerNote = {
    customerId: customerId,
    note: note
  };

  return Doctor.update(condition, {$addToSet: {"customerNote": customerNote}}).exec();
};

DoctorService.prototype.modifyCustomerNote = function (doctorId, customerId, note) {
  var condition = {"customerNote.customerId": customerId};
  condition.source = 'docChat';
  condition._id = doctorId;
  condition.isDeleted = false;

  return Doctor.update(condition, {
    $set: {
      "customerNote.$.note": note,
      "customerNote.$.updatedAt": Date.now()
    }
  }).exec();
};


/**
 * 更新医生的评价信息
 * @param data
 * @returns {Promise}
 */
DoctorService.prototype.updateDoctorCommentInfo = function (data) {
  var conditions = {
    _id: data.calleeRefId,
    source: "docChat",
    isDeleted: {$ne: true}
  };
  var updates = {
    "$inc": {
      "commentNum": 1,
      "zanNum": data.rank || 0
    }
  };
  var options = {
    new: true
  };
  var projection = {
    commentedTags: 1
  };
  if (data.tags && data.tags.length > 0) {
    return Doctor.findOne(conditions, projection).exec()
      .then(function (_doctor) {
        if (!_doctor) throw ErrorHandler.getBusinessErrorByCode(8005);
        var commented = _doctor.commentedTags || {};
        //var upset = {};
        _.each(data.tags, function (tag) {
          commented[tag] = commented[tag] ? (commented[tag] + 1) : 1;
        });
        updates["$set"] = {commentedTags: commented};
        return findOneAndUpdate(conditions, updates, options);
      });
  } else {
    return findOneAndUpdate(conditions, updates, options);
  }
};

DoctorService.prototype.findCommentInfo = function (doctorId) {
  var conditions = {
    _id: doctorId,
    source: "docChat",
    isDeleted: {$ne: true}
  };
  var projection = {
    commentNum: 1,
    zanNum: 1,
    commentedTags: 1
  };
  return Doctor.findOne(conditions, projection).exec();
};

DoctorService.prototype.updateStatus = function (doctorId,appId,status) {
  var conditions = {
    _id: doctorId
  };
  var updateData =  {
    updatedAt : Date.now(),
    applicationId: appId,
    profileModifyAppStatus: status
  };
  return Doctor.findOneAndUpdate(conditions,{$set:updateData}).exec();
};

//TODO 改成推送
DoctorService.prototype.sendFavoritedSms = function (doctor, user) {
  var sendPhone = (serverconfigs.env == 1) ? doctor.phoneNum : constants.zly400Phone;

  var pushUser;
  Customer.findOne({docChatNum:doctor.docChatNum , isDeleted:false},"pushId")
  .then(function(du){
    if(!du){
      throw ErrorHandler.getBusinessErrorByCode(1503);
    }
    pushUser = du ;
    var condition = {
      favoriteDocs: doctor._id,
    }
    return Customer.count(condition)
  })
  .then(function(count){

    //if (doctor.favoritedReward && user.collectedDocs.length < 2) {  //新用户收藏才给奖励
    //  var money = 5;
    //  var ran = commonUtil.getRandomNum(1, 100);
    //  if (ran > 90) {  //90%概率给5元
    //    money = commonUtil.getRandomNum(5, 8);
    //  }
    //
    //  var tradeNo = Date.now() + commonUtil.getRandomNum(0, 100);
    //
    //  TransactionMysqlService.incomeByFavorited("" + doctor._id, money, tradeNo, user._id + "", user.name)
    //      .then(function (isInsert) {
    //        if (isInsert) {
    //          JPushService.pushNotification(du.pushId, "您的粉丝" + user.name + "查找并收藏了您，系统随机奖励给您" + money + "元。",JPushService.CONS.APP.CUS);
    //          // commonUtil.sendSms("1054325", sendPhone,
    //          //   "#doctorName#=" + doctor.realName +
    //          //   "&#customerName#=" + user.name +
    //          //   "&#money#=" + money +
    //          //   "&#customerNumber#=" + doctor.favoritedNum);
    //        } else {
    //          JPushService.pushNotification(du.pushId, "您的粉丝" + user.name + "查找并收藏了您，您的粉丝群已有" + doctor.favoritedNum + "位成员啦～",JPushService.CONS.APP.CUS);
    //          // commonUtil.sendSms("1054329", sendPhone,
    //          //   "#doctorName#=" + doctor.realName +
    //          //   "&#customerName#=" + user.name +
    //          //   "&#customerNumber#=" + doctor.favoritedNum);
    //        }
    //      });
    //} else {

      JPushService.pushNotification(pushUser.pushId, "您的粉丝" + user.name + "查找并收藏了您，您的粉丝群已有" + count + "位成员啦～",JPushService.CONS.APP.CUS);
      // commonUtil.sendSms("1054329", sendPhone,
      //   "#doctorName#=" + doctor.realName +
      //   "&#customerName#=" + user.name +
      //   "&#customerNumber#=" + doctor.favoritedNum);
    //}
  })

};
/**
 * 根据医疗号查询医生列表
 * 默认只返回_id docChatNum
 */
DoctorService.prototype.getDoctorListByDcNum = function (nums, params) {
  if (!nums || nums.length < 1) throw ErrorHandler.getBusinessErrorByCode(8005);
  var conditions = {
    docChatNum: {$in: nums},
    source: "docChat",
    isDeleted: false
  };
  params = params || "_id docChatNum" ;
  return Doctor.find(conditions, params).exec();
};
DoctorService.prototype.getDocRelByIds = function (type, fromId, toId) {

  return RelRecmndFan.findOne({
    type: type || "recmnd_fans",
    fromId: fromId, 
    toId: toId,
    isDeleted: false
  },"_id weight").exec();
};
DoctorService.prototype.createRel = function (rel) {
  return RelRecmndFan.create(rel);
};

DoctorService.prototype.updateRel = function (cond, update) {
  return RelRecmndFan.findOneAndUpdate(cond, update).exec();
};
DoctorService.prototype.addRelWeight = function (relId, weight, fansIds, orderIds) {
  var conds = {
    _id: relId
  };
  var upds = {
    $inc: {"weight": weight},
    //$addToSet: {"fansId": {$each: fansId}},
    updatedAt: Date.now()
  };
  
  if (fansIds) upds["$addToSet"] = {"fansId": {$each: fansIds}};
  if (orderIds) upds["$addToSet"] = {"orderId": {$each: orderIds}};

  return RelRecmndFan.update(conds,upds).exec();
};

DoctorService.prototype.getTopWeightRecommendByIdAndType = function (type, id, num) {
  var condition = {
    type: type,
    fromId: id + '',
    isDeleted: false
  };
  return RelRecmndFan.find(condition)
      .populate('toRef','realName avatar docChatNum hospital department position').sort({weight: -1, createdAt: 1}).limit(num).exec();
};
DoctorService.prototype.getTopWeightRelByFromIdsAndType = function (type, ids) {
  var match = {
    type: type,
    fromId: {$in: ids},
    source: "docChat",
    isDeleted: false
  };
  var sort = {
    fromId: -1,
    weight: -1
  };
  var group = {
    "_id": "$fromId",
    "toId": {$first: "$toId"}
  };
  return RelRecmndFan.aggregate(
    {'$match': match},
    {'$sort': sort},
    {'$group': group}).exec();
};
/**
 * 判断关系是否存在
 */
DoctorService.prototype.isRelExists = function (fromId, toId, type) {
  var deferred = Q.defer();
  if (!fromId || !toId) {
    deferred.resolve();
    return deferred.promise;
  }
  var condition = {
    fromId: fromId,
    toId: toId,
    type: type,
    isDeleted: false
  };
  return RelRecmndFan.findOne(condition, "weight").exec();
};

DoctorService.prototype.getDocRecommendListBak = function (id,pageSlice) {
  var condition = {
    type: 'recmnd_fans',
    fromId: id + '',
    isDeleted: false
  };
  //console.log('condition:',condition);
  return RelRecmndFan.find(condition,"toRef",pageSlice)
      //.populate('toRef',Doctor.selectFields)
      .exec();
};

DoctorService.prototype.getDocRecommendListAss = function (id,pageSlice) {
  var condition = {
    type: 'ass',
    fromId: id + '',
    isDeleted: false
  };
  //console.log('condition:',condition);
  return RelRecmndFan.find(condition,"toRef",pageSlice)
      //.populate('toRef',Doctor.selectFields)
      .exec();
};

DoctorService.prototype.getDocRecommendListAd = function (id,pageSlice) {
  var condition = {
    type: 'ad',
    fromId: id + '',
    isDeleted: false
  };

  //console.log('condition:',condition);
  return RelRecmndFan.find(condition,"toRef",pageSlice)
      //.populate('toRef',Doctor.selectFields)
      .exec();
};

DoctorService.prototype.getDocRecommendListType = function (id, type, pageSlice) {
  var condition = {
    type: type,
    fromId: id + '',
    isDeleted: false
  };

  //console.log('condition:',condition);
  return RelRecmndFan.find(condition,"toRef",pageSlice)
      //.populate('toRef',Doctor.selectFields)
      .exec();
};

DoctorService.prototype.getDocRecommendListType_new = function (id, type, pageSlice) {
  var condition = {
    type: type,
    fromId: id + '',
    isDeleted: false
  };

  //console.log('condition:',condition);
  return RelRecmndFan.find(condition,"toRef",pageSlice)
      //.populate('toRef',Doctor.selectFields)
      .exec();
};

DoctorService.prototype.createDocInfoModifyApp = function (docInfo) {
  return DocInfoModifyApp.create(docInfo);
};

/*
 * seanliu
 * 查询12月1日(1480521600000)后所有,没有介绍人introducer的顾问
 * 为了统计顾问的发展人
 */
DoctorService.prototype.getAllDoctorHasNoIntroducer = function () {
  var condition = {};
  condition.createdAt = {$gt:1488211200000};
  condition.introducerId = {$exists:false};
  condition.source = 'docChat';
  condition.isDeleted = false;
  condition.applyStatus = "done";
  var project = "_id createdAt docChatNum";
  return Doctor.find(condition, project, {
    // skip: 0,
    // limit:10000,
  }).exec();
};

DoctorService.prototype.fetchDoctorUsers = function (doctorIds) {
  return Customer.find({
    doctorRef: {$in: doctorIds}
  }, {
    _id: 1,
    doctorRef:1,
    collectedDocs: 1,
  })
}

/*
 * seanliu
 * 查询所有,有介绍人introducer,没有operator的顾问
 * 为了统计顾问的发展人
 */
DoctorService.prototype.getAllDoctorHasNoOperator = function () {
  var condition = {};
  condition.introducerId = {$exists:true};
  condition.operatorId = {$exists:false};
  condition.source = 'docChat';
  condition.isDeleted = false;
  condition.applyStatus = "done";
  var project = "_id createdAt introducerId";
  return Doctor.find(condition, project, {
    sort: {createdAt: 1},
  }).exec();
};

/*
 * seanliu
 * 更新没有介绍人introducer的D的introducerId和introducerName
 * 为了统计顾问的发展人
 */
DoctorService.prototype.updateIntroducer = function (_id, _introducerId,_introducerName) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = _id;
  condition.isDeleted = false;
  condition.introducerId = {$exists:false};

  return findOneAndUpdate(condition, {
    updatedAt: Date.now(),
    introducerId: _introducerId,
    introducerName: _introducerName
  }, {new: true});
};
/*
 * seanliu
 * 查询所有,有介绍人introducer,没有operator的顾问
 * 为了统计顾问的发展人
 */
DoctorService.prototype.updateOperator = function (_id,_operatorId,_operatorName) {
  var condition = {};
  condition.source = 'docChat';
  condition._id = _id;
  condition.isDeleted = false;
  condition.opratorId = {$exists:false};
  condition.introducerId = {$exists:true};

  return findOneAndUpdate(condition, {
    updatedAt: Date.now(),
    operatorId: _operatorId,
    operatorName: _operatorName,
    operatorCreatedAt:Date.now()
  }, {new: true});
};


module.exports = exports = new DoctorService();
