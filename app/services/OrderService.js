var
  _ = require('underscore'),
  Q = require("q"),
  commonUtil = require('../../lib/common-util'),
  serverconfigs = require('../../app/configs/server'),
  constants = require('../configs/constants'),
  // 老版语音通话订单
  Order = require('../models/Order').Order,
  // 新版语音通话订单
  NewPhoneOrder = require('../models/Order').NewPhoneOrder,
  CommonOrder = require('../models/Order').CommonOrder,
  AdOrder = require('../models/Order').AdOrder,
  HongbaoOrder = require('../models/Order').HongbaoOrder,
  TransferOrder = require('../models/Order').TransferOrder,
  ErrorHandler = require('../../lib/ErrorHandler'),
  Promise = require('promise'),
  ServiceOrder = require('../models/Order').ServiceOrder;

var CONS = {
  NULL: "",
  TYPE: {
    NULL: "",
    RECHARGE: "recharge", // 充值订单,会生成订单号,但不会有订单数据
    PHONE: "phone", // phone - 电话订单;
    VOIP: "voip", // voip - 网络通话;
    SPU: "spu", // spu - 标准化服务产品, Standard Product Unit 标准产品单元
    FAMILY_DOC: "exclusiveDoctor", // exclusiveDoctor - 专属医生订单; ??? TODO: 废弃
    AD: "ad", // ad - 广告位购买; 顾问以用户的身份消费,建立顾问和顾问间的ad关系;
    TRANSFER: "tf", //transfer - 转账,用户向顾问转账
    HONGBAO: "hb", //hongbao - 支付红包
    MEMBERSHIP: "ms", // 会员额度
    MARKETING: "mkt", //推广额度
    SERVICEPACKAGE: 'sp', //服务包
    MAKEAPPOINTMENT: 'ma', //预约医生
    TPSERVICE: 'tps', //tp服务
    TPCARD: 'tpc', //tp会员卡
    MCSERVICE: 'mc', //2030 医疗圈 服务订单
    MCPRODUCT: 'mcd', //2030 购买商品
    MCDIRECTOR: 'mcdirector', //2030 购买主管
    MCSCENE: 'mcscene', // 2030 购买商品
    MCACTIVITY: 'mcactivity', // 2030 购买活动
  },
  PAY_TYPES: {
    NULL: '', // null 未付款,
    ALI_PAY: 'ali_pay', // ali_pay - 支付宝付款;
    SYS_PAY: 'sys_pay', // sys_pay - 系统账户余额付款;
    UNION_PAY: 'union_pay', // union_pay - 银联付款;
    WX_PAY: 'wx_pay', // wx_pay - 微信支付;
    WX_PUB_PAY: 'wx_pub_pay', // wx_pub_pay - 微信公众号支付;
    WX_SCAN_PAY: 'wx_scan_pay', // wx_scan_pay - 微信扫码支付
    SYS_CARD: 'sys_card', // sys_card - 系统礼品卡支付;
    OFFLINE_CASH: 'cash', // cash - 线下沟通付款;
    IOS_IAP: 'iap', // cash - 线下沟通付款;
  },
  PAY_STATUS: {
    NULL: '', // null-初始状态
    TO_PAY: 'toPay', // toPay-待支付
    PAID: 'paid' // paid-支付成功
  },
  SOURCE: {
    DOC_CHAT: "docChat"
  },
  CALL_DIRECTION: {
    C2D: "C2D",
    D2C: "D2C"
  },
  CALL_STATUS: {
    FAIL: "failed", //未发起双向回拨
    WAIT: "waitingSS", //等待发起服务
    BUSY: "busy", //通话中
    OVER: "over" //通话结束(包括未接通)
  },
  COMMENT: {
    RANK: 3,
    CONT_TXT_SIZE: 60,
    CONT_HINT: "感谢的话,说给Ta听~",
    TAGS: ["亲和力强", "很有帮助", "解答不厌其烦", "咨询后放心了", "解决了我的问题"] //["给了详细建议","消除了我的困惑","顾问很给力","牛牛牛!!","羊羊羊!!!"]
  }
};

var OrderService = function () {};
OrderService.prototype.constructor = OrderService;

OrderService.prototype.CONS = CONS;

var findOneAndUpdate = function (query, update, option, isOld) {
  var deferred = Q.defer();
  var orderModel = isOld ? Order : NewPhoneOrder;
  orderModel.findOneAndUpdate(query, update, option).exec()
    .then(function (order) {
      if (!order) {
        console.log("no order match:" + JSON.stringify(query));
        deferred.reject(ErrorHandler.getBusinessErrorByCode(1401));
      } else {
        deferred.resolve(order);
      }
    }, function (err) {
      console.log("Error: " + err);
      deferred.reject(err);
    });

  return deferred.promise;
};

OrderService.prototype.createOrder = function (order) {
  /**
   * 获取自增的唯一数字id，作为订单的编号
   * {
   *    _id: 54be1f11031c5c861c90b37a,
   *    seq: 100000
   * }
   * **/
  return NewPhoneOrder.findByIdAndUpdate(constants.ORDER_AUTH_INC_ID, {
      $inc: {
        orderNo: 1
      }
    }).exec()
    .then(function (data) {
      var date = commonUtil.getyyyyMMddhhmm(Date.now()).substring(2, 12);
      order.orderNo = date + data.orderNo;
      console.log("order:" + JSON.stringify(order));

      return NewPhoneOrder.create(order);
    });
};


/**
 * 查询当前用户是否有欠费订单
 * @param customerId
 * @param deviceId
 * @returns {Promise}
 */
OrderService.prototype.getArrearPhoneOrder = function (callerId, deviceId, type) {
  var condition = {
    "source": "docChat",
    "isDeleted": false,
    "type": 'phone',
    "callerId": callerId
    //"$or": [{"customerId": customerId}, {"customerDeviceId": deviceId}]  很多设备deviceId都一样
  };
  condition.payStatus = "toPay";

  return NewPhoneOrder.findOne(condition, NewPhoneOrder.selectFields).exec();
};

/**
 * 获得所有欠费订单
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
OrderService.prototype.getAllArrearPhoneOrder = function () {
  var condition = {
    "source": "docChat",
    "payStatus": "toPay",
    "type": "phone",
    "isDeleted": false
  };

  return Order.find(condition, Order.selectFields).exec();
};

/**
 * 将患者的所有订单都设置为支付
 * @param customerId
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
OrderService.prototype.updateAllPhoneOrderToPaid = function (callerId) {
  var condition = {
    "source": "docChat",
    "callerId": callerId,
    "type": "phone",
    "isDeleted": false
  };
  condition.payStatus = "toPay";

  return Order.update(condition, {
    payStatus: 'paid',
    updatedAt: Date.now()
  }, {
    multi: true
  }).exec();
};

/**
 * 查询患者或者医生是否有正在发生的订单
 * @param customerId
 * @param doctorId
 * @param ignoreOrderId
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
OrderService.prototype.getBusyPhoneOrder = function (callerId, calleeId, ignoreOrderId) {
  var condition = {
    "$and": [{
        "source": "docChat",
        "type": 'phone',
        "isDeleted": false
      },
      //{"$or": [{"callerId": callerId}, {"calleeId": calleeId}]},
      {
        "$or": [{
          "callerId": {
            $in: [callerId, calleeId]
          }
        }, {
          "calleeId": {
            $in: [callerId, calleeId]
          }
        }]
      },
      {
        "$or": [{
            "callStatus": "waitingSS",
            createdAt: {
              '$gte': Date.now() - constants.TIME15S
            }
          },
          {
            "callStatus": "busy",
            createdAt: {
              '$gte': Date.now() - constants.TIME30M
            }
          }
        ]
      }
    ]
  };

  if (ignoreOrderId)
    condition._id = {
      '$ne': ignoreOrderId
    };

  return NewPhoneOrder.findOne(condition, NewPhoneOrder.selectFields).exec();
};

OrderService.prototype.getNotBusyList = function (grp) {

  var condition = {
    "$and": [{
        "source": "docChat",
        "type": 'phone',
        "isDeleted": false
      },
      {
        "$or": [{
          "callerId": {
            $in: grp
          }
        }, {
          "calleeId": {
            $in: grp
          }
        }]
      },
      {
        "$or": [{
            "callStatus": "waitingSS",
            createdAt: {
              '$gte': Date.now() - constants.TIME15S
            }
          },
          {
            "callStatus": "busy",
            createdAt: {
              '$gte': Date.now() - constants.TIME30M
            }
          }
        ]
      }
    ]
  };
  return NewPhoneOrder.find(condition, NewPhoneOrder.selectFields)
    .then(function (orderGrp) {
      if (orderGrp) {
        ;
        for (var i = 0; i < orderGrp.length; i++) {
          if (grp.indexOf(orderGrp[i].callerId) != -1 || grp.indexOf(orderGrp[i].calleeId) != -1) {
            if (grp.indexOf(orderGrp[i].callerId) != -1) {
              grp.splice(grp.indexOf(orderGrp[i].callerId), 1);
            }
            if (grp.indexOf(orderGrp[i].calleeId) != -1) {
              grp.splice(grp.indexOf(orderGrp[i].calleeId), 1);
            }
          }
        }
      }
      return grp
    })
}

OrderService.prototype.getBusyPhoneOrderAllInfoByPhoneNum = function (phoneNum) {
  var condition = {
    "$and": [{
        "source": "docChat",
        "type": "phone",
        "isDeleted": false
      },
      {
        "$or": [{
          "calleePhoneNum": phoneNum
        }, {
          "callerPhoneNum": phoneNum
        }]
      },
      {
        "$or": [{
            "callStatus": "waitingSS",
            createdAt: {
              '$gte': Date.now() - constants.TIME15S
            }
          },
          {
            "callStatus": "busy",
            createdAt: {
              '$gte': Date.now() - constants.TIME30M
            }
          }
        ]
      }
    ]
  };

  return Order.findOne(condition).exec();
};

OrderService.prototype.getNotBusyList = function (grp) {

  var condition = {
    "$and": [{
        "source": "docChat",
        "type": 'phone',
        "isDeleted": false
      },
      {
        "$or": [{
          "customerId": {
            $in: grp
          }
        }, {
          "doctorId": {
            $in: grp
          }
        }]
      },
      {
        "$or": [{
            "callStatus": "waitingSS",
            createdAt: {
              '$gte': Date.now() - constants.TIME15S
            }
          },
          {
            "callStatus": "busy",
            createdAt: {
              '$gte': Date.now() - constants.TIME30M
            }
          }
        ]
      }
    ]
  };
  return NewPhoneOrder.find(condition, NewPhoneOrder.selectFields)
    .then(function (orderGrp) {
      if (orderGrp) {
        ;
        for (var i = 0; i < orderGrp.length; i++) {
          if (grp.indexOf(orderGrp[i].customerId) != -1 || grp.indexOf(orderGrp[i].doctorId) != -1) {
            if (grp.indexOf(orderGrp[i].customerId) != -1) {
              grp.splice(grp.indexOf(orderGrp[i].customerId), 1);
            }
            if (grp.indexOf(orderGrp[i].doctorId) != -1) {
              grp.splice(grp.indexOf(orderGrp[i].doctorId), 1);
            }
          }
        }
      }
      return grp
    })
}

OrderService.prototype.getOrderByID = function (ID, option) {
  var condition = {
    "source": "docChat",
    "isDeleted": false
  };
  condition._id = ID;
  var fields = option && option.fields || NewPhoneOrder.selectFields;
  return NewPhoneOrder.findOne(condition, fields).exec();
};

OrderService.prototype.getOrderByIDs = function (IDs, option) {
  IDs = IDs || [];
  var condition = {
    _id: {
      $in: IDs
    },
    "source": "docChat",
    "isDeleted": false
  };
  var fields = option && option.fields || NewPhoneOrder.selectFields;
  return NewPhoneOrder.find(condition, fields).exec();
};

OrderService.prototype.getOrderAllInfoByID = function (ID) {
  var condition = {
    "source": "docChat",
    "isDeleted": false
  };
  condition._id = ID;

  return Order.findOne(condition).exec();
};

OrderService.prototype.getOrderByCallbackID = function (callbackId) {
  var condition = {
    "source": "docChat",
    "isDeleted": false
  };
  condition['$or'] = [{
      channelId: callbackId
    },
    {
      callbackId: callbackId
    }
  ];

  return NewPhoneOrder.findOne(condition, Order.selectFields).exec();
};

OrderService.prototype.getOrderByChannelId = function (channelId) {
  var condition = {
    "source": "docChat",
    "isDeleted": false,
    type: 'phone',
    callWay: 'voip',
    channelId: channelId
  };
  return Order.findOne(condition, 'channelId').sort({
    createdAt: -1
  }).exec();
};

OrderService.prototype.getOrderByAccids = function (callerAccid, calleeAccid, copyCreateTime) {
  var interval = 60 * 1000;
  var condition = {
    "source": "docChat",
    "isDeleted": false,
    "type": 'phone',
    callWay: 'voip',
    callStatus: 'busy',
    callerAccid: callerAccid,
    calleeAccid: calleeAccid,
    createdAt: {
      $gte: copyCreateTime - interval,
      $lte: copyCreateTime
    }
  };
  return NewPhoneOrder.findOne(condition, Order.selectFields).sort({
      createdAt: -1
    }).exec()
    .then(function (_order) {
      if (_order && commonUtil.isUUID24bit(_order.callerId)) {
        return _order;
      } else {
        return Order.findOne(condition, Order.selectFields).sort({
          createdAt: -1
        }).exec();
      }
    });
};
/**
 * 获取通话订单
 *
 * Usage:
 *  1. 获取账户App端可显示的通话记录
 *  2. (统计使用?) 获取某账户所有的通话记录
 *
 * @param accountId
 * @param pageSlice
 * @param showAll
 * @returns {Promise|Array|{index: number, input: string}}
 */
OrderService.prototype.getPhoneOrdersByAccountID = function (accountId, pageSlice, showAll) {
  var condition = {
    "source": "docChat",
    "type": "phone",
    "isDeleted": false
  };

  if (!showAll) { // 客户端显示的订单列表
    condition['$and'] = [{
        $or: [{
            callerId: accountId
          }, {
            calleeId: accountId,
            byetype: {
              '$nin': ['-10', '-11']
            }
          },
          {
            calleeId: accountId,
            failedReason: 1301
          }
        ]
      },
      {
        $or: [{
            failedReason: 1301
          },
          {
            callWay: 'voip',
            callStatus: {
              $nin: ['failed', 'busy']
            }
          }, {
            callWay: 'call_both',
            callStatus: {
              '$ne': 'failed'
            }
          }
        ]
      }
    ];
  } else {
    condition["$or"] = [{
      callerId: accountId
    }, {
      calleeId: accountId
    }];
  }
  return NewPhoneOrder.find(condition, NewPhoneOrder.selectFields, pageSlice).exec();
};

OrderService.prototype.getPhoneOrdersByAccountIDAndBookmark = function (accountId, bookmark) {
  var condition = {
    "source": "docChat",
    "type": "phone",
    "isDeleted": false,
    "createdAt": {
      $gt: bookmark
    }
  };

  condition['$and'] = [{
      $or: [{
          callerId: accountId,
          isDeletedByCaller: {
            $ne: true
          }
        }, {
          calleeId: accountId,
          byetype: {
            '$nin': ['-10', '-11']
          },
          isDeletedByCallee: {
            $ne: true
          }
        },
        {
          calleeId: accountId,
          failedReason: 1301
        }
      ]
    },
    {
      $or: [{
          failedReason: 1301
        },
        {
          callWay: 'voip',
          callStatus: {
            $nin: ['failed', 'busy']
          }
        }, {
          callWay: 'call_both',
          callStatus: {
            '$ne': 'failed'
          }
        }
      ]
    }
  ];
  return NewPhoneOrder.find(condition, NewPhoneOrder.listSelectFields, {
    limit: 1000,
    sort: {
      createdAt: -1
    }
  }).exec();
};


/**
 * 获取最近1H内的最近一次通话,并标记
 * @param customerId
 * @returns {Promise|Array|{index: number, input: string}}
 */
OrderService.prototype.getLatestCallAndMark = function (customerId) {
  var now = Date.now();
  var latest = 60 * 60 * 1000;

  var conditions = {
    "type": CONS.TYPE.PHONE,
    "callerId": customerId,
    "createdAt": {
      $gte: now - latest
    },
    "source": CONS.SOURCE.DOC_CHAT,
    "$or": [{
      callerPayment: {
        $ne: 0
      }
    }, {
      calleeIncome: {
        $ne: 0
      }
    }],
    "isDeleted": false
  };
  var updates = {
    "updatedAt": now,
    "isCommentHint": true
  };
  var fields = "_id calleeId calleeName calleeDocChatNum " +
    "calleeAvatar calleeSex createdAt callerPayment time isCommentHint callStatus";
  var options = {
    "new": false,
    "upsert": false,
    "fields": fields,
    "sort": {
      "createdAt": -1
    }
  };

  return Order.findOneAndUpdate(conditions, updates, options).exec();
  //return Order.findOne(condition, Order.selectFields, {sort: {'createdAt': -1}}).exec();
};
OrderService.prototype.addComment = function (data) {
  var now = Date.now();
  var condition = {
    _id: data.orderId,
    isCommentHint: true, // 已有提示
    isCommented: {
      $ne: true
    }, // 是否评论过
    callerId: data.callerId,
    calleeId: data.calleeId,
    type: 'phone',
    source: "docChat",
    isDeleted: false
  };
  var updates = {
    isCommented: true,
    updatedAt: now,
    comment: {
      rank: data.rank,
      tags: data.tags,
      tagStr: data.tagStr,
      //isContentChecked: false,
      content: data.content,
      createdAt: now
    }
  };
  return NewPhoneOrder.findOneAndUpdate(condition, updates).exec();
};
OrderService.prototype.findCommentList = function (doctorId, page) {
  var conditions = {
    calleeRefId: doctorId,
    isCommentHint: true, // 已有提示
    isCommented: true, // 是否评论过
    type: 'phone',
    source: "docChat",
    isDeleted: false
  };
  var projection = {
    callerName: 1,
    comment: 1
  };
  return NewPhoneOrder.find(conditions, projection, page).exec();
};
//OrderService.prototype.findCommentByOrderId = function (orderId) {
//  var conditions = {
//    _id: orderId,
//    isCommentHint: true, // 已有提示
//    isCommented: true, // 是否评论过
//    type: 'phone',
//    source: "docChat",
//    isDeleted: false
//  };
//  var projection = {
//    customerName: 1,
//    customerPhoneNum: 1,
//    doctorRealName: 1,
//    doctorDocChatNum: 1,
//    comment: 1
//  };
//  return Order.find(conditions, projection).exec();
//};
OrderService.prototype.findAllCommentList = function (page) {
  var conditions = {
    isCommentHint: true, // 已有提示
    isCommented: true, // 是否评论过
    type: 'phone',
    source: "docChat",
    isDeleted: false
  };
  var projection = {
    calleeName: 1,
    calleePhoneNum: 1,
    callerName: 1,
    calleeDocChatNum: 1,
    comment: 1
  };
  return Order.find(conditions, projection, page).exec();
};
OrderService.prototype.checkComment = function (orderId, check) {
  var conditions = {
    _id: orderId,
    isCommentHint: true, // 已有提示
    isCommented: true, // 是否评论过
    type: 'phone',
    source: "docChat",
    isDeleted: false
  };
  var projection = {
    callerName: 1,
    callerPhoneNum: 1,
    calleeName: 1,
    callerDocChatNum: 1,
    comment: 1
  };
  return Order.findOne(conditions, projection).exec()
    .then(function (_order) {

      if (!_order)
        throw ErrorHandler.getBusinessErrorByCode(8005);
      if (!_order.comment)
        throw ErrorHandler.getBusinessErrorByCode(8005);
      if (typeof _order.comment.isContentChecked === "boolean")
        return _order;

      check = check ? true : false;
      var updates = {
        "updatedAt": Date.now(),
        "comment.isContentChecked": check
      }
      return Order.findOneAndUpdate(conditions, updates);
    });
};
OrderService.prototype.getValidPhoneOrdersByCustomerID = function (customerId, pageSlice) {
  var condition = {
    "source": "docChat",
    "isDeleted": false
  };
  condition.customerId = customerId;
  condition.callStatus = 'over';
  condition.time = {
    '$gt': 0
  };
  condition.type = 'phone';

  return Order.find(condition, Order.selectFields, pageSlice).exec();
};
// TODO: Deprecated!!!
OrderService.prototype.getPhoneOrdersByDoctorID = function (doctorId, pageSlice, showAll) {
  var condition = {
    "source": "docChat",
    "isDeleted": false
  };
  condition.doctorId = doctorId;
  condition.type = 'phone';
  if (!showAll) { //医生端显示的订单
    condition['$and'] = [
      //患者发起并且不接听双向回拨的不显示  voip通话failed,busy的不显示
      {
        $or: [{
          callWay: 'voip',
          callStatus: {
            $nin: ['failed', 'busy']
          }
        }, {
          callWay: 'call_both',
          callStatus: {
            '$ne': 'failed'
          }
        }]
      },
      {
        $or: [{
          "byetype": {
            '$ne': '-10'
          }
        }, {
          "direction": 'D2C'
        }]
      } //患者发起并且不接听双向回拨的不显示
    ];
    //condition['$or'] = [
    //  {callWay: 'call_both', callStatus: {'$ne': 'failed'}, '$or' : [{"byetype": {'$ne': '-10'}}, {"direction": 'D2C'}]},
    //  {callWay: 'voip', callStatus: {$nin: ['failed','busy']}, '$or' : [{"byetype": {'$ne': '-10'}}, {"direction": 'D2C'}]}
    //]
  }

  return Order.find(condition, Order.selectFields, pageSlice).exec();
};

OrderService.prototype.getValidPhoneOrdersByDoctorID = function (doctorId, pageSlice) {
  var condition = {
    "source": "docChat",
    "isDeleted": false
  };
  condition.doctorId = doctorId;
  condition.callStatus = 'over';
  condition.time = {
    '$gt': 0
  };
  condition.type = 'phone';

  return Order.find(condition, Order.selectFields, pageSlice).exec();
};

OrderService.prototype.getValidPhoneOrderCountByDoctorID = function (doctorId) {
  var condition = {
    "source": "docChat",
    "isDeleted": false
  };
  condition.doctorId = doctorId;
  condition.callStatus = 'over';
  condition.time = {
    '$gt': 0
  };
  condition.type = 'phone';

  return Order.count(condition).exec();
};

OrderService.prototype.getAllPhoneOrders = function (pageSlice) {
  var condition = {
    "source": "docChat",
    "type": "phone",
    "isDeleted": false
  };
  return Order.find(condition, Order.selectFields, pageSlice).exec();
};
OrderService.prototype.orders = function (conditions, pageSlice) {
  return Order.find(conditions, Order.selectFields, pageSlice).exec();
};
OrderService.prototype.commonFindOrders = function (type, conditions, pageSlice) {
  switch (type) {
    case CONS.TYPE.AD:
      return AdOrder.find(conditions, null, pageSlice).exec();
      break;
    case CONS.TYPE.PHONE:
    default:
      return Order.find(conditions, Order.selectFields, pageSlice).exec();
  }
};

OrderService.prototype.getAllValidPhoneOrders = function (pageSlice) {
  var condition = {
    "source": "docChat",
    "type": "phone",
    "isDeleted": false
  };
  condition.callStatus = 'over';
  condition.time = {
    '$gt': 0
  };

  return Order.find(condition, Order.selectFields, pageSlice).exec();
};

OrderService.prototype.getExpiryDatePhoneOrders = function (expiryDate) {
  var condition = {
    "source": "docChat",
    "type": "phone",
    "isDeleted": false
  };
  condition.createdAt = {
    $lte: expiryDate
  };

  return Order.find(condition).exec();
};

OrderService.prototype.getExpiryDatePhoneOrderNum = function (expiryDate) {
  var condition = {
    "source": "docChat",
    "type": "phone",
    "isDeleted": false
  };
  condition.createdAt = {
    $lte: expiryDate
  };

  return Order.count(condition).exec();
};

OrderService.prototype.getExpiryDateValidPhoneOrders = function (expiryDate) {
  var condition = {
    "source": "docChat",
    "isDeleted": false
  };
  condition.callStatus = 'over';
  condition.type = "phone";
  condition.time = {
    '$gt': 0
  };
  condition.createdAt = {
    $lte: expiryDate
  };

  return Order.count(condition).exec();
};

OrderService.prototype.getGTDateValidPhoneOrders = function (gtDate) {
  var condition = {
    "source": "docChat",
    "isDeleted": false
  };
  condition.callStatus = 'over';
  condition.type = "phone";
  condition.time = {
    '$gt': 0
  };
  condition.createdAt = {
    $gt: gtDate
  };

  return Order.find(condition).exec();
};

OrderService.prototype.getGTDateNonEmployeeValidPhoneOrders = function (gtDate, employeeIds) {
  var condition = {
    "source": "docChat",
    "isDeleted": false
  };
  condition.callStatus = 'over';
  condition.type = "phone";
  condition.time = {
    '$gt': 0
  };
  condition.doctorId = {
    '$nin': employeeIds
  };
  condition.createdAt = {
    $gt: gtDate
  };

  return Order.count(condition).exec();
};

OrderService.prototype.getExpiryDateValidPhoneOrderNum = function (expiryDate) {
  var condition = {
    "source": "docChat",
    "isDeleted": false
  };
  condition.callStatus = 'over';
  condition.type = "phone";
  condition.time = {
    '$gt': 0
  };
  condition.createdAt = {
    $lte: expiryDate
  };

  return Order.count(condition).exec();
};

OrderService.prototype.getExpiryDateNon120ValidPhoneOrderNum = function (expiryDate) {
  var condition = {
    "source": "docChat",
    "isDeleted": false
  };
  condition.callStatus = 'over';
  condition.type = "phone";
  condition.time = {
    '$gt': 0
  };
  condition.doctorDocChatNum = {
    '$ne': "00120"
  };
  condition.createdAt = {
    $lte: expiryDate
  };

  return Order.count(condition).exec();
};

OrderService.prototype.getExpiryDateNonEmployeeConnectedOrderNum = function (expiryDate, employeeIds) {
  var condition = {
    "source": "docChat",
    "isDeleted": false
  };
  condition.callStatus = 'over';
  condition.type = "phone";
  condition.time = {
    '$gt': 0
  };
  condition.doctorId = {
    '$nin': employeeIds
  };
  condition.createdAt = {
    $lte: expiryDate
  };

  return Order.count(condition).exec();
};

//截止到指定日期用户总的付款支出
OrderService.prototype.getExpiryDateTFSum = function (expiryDate) {
  var match = {
    "source": "docChat",
    "isDeleted": false
  };
  match.type = "tf";
  match.createdAt = {
    $lte: expiryDate
  };
  match.payStatus = "paid";

  var group = {};
  group._id = "";
  group.sum = {
    $sum: "$price"
  };

  return Order.aggregate({
    '$match': match
  }, {
    '$group': group
  }).exec();
};

//截止到指定日期用户总的广告支出
OrderService.prototype.getExpiryDateADSum = function (expiryDate) {
  var match = {
    "source": "docChat",
    "isDeleted": false
  };
  match.type = "ad";
  match.createdAt = {
    $lte: expiryDate
  };
  match.payStatus = "paid";

  var group = {};
  group._id = "";
  group.sum = {
    $sum: "$price"
  };

  return Order.aggregate({
    '$match': match
  }, {
    '$group': group
  }).exec();
};

OrderService.prototype.updateOrderInfo = function (id, update, isOld) {
  var condition = {
    "source": "docChat"
  };
  condition._id = id;
  condition.isDeleted = false;
  update.updatedAt = update.updatedAt || Date.now();
  return findOneAndUpdate(condition, update, {
    new: true
  }, isOld);
};

OrderService.prototype.updateServiceOrderInfo = function (id, update) {
  var condition = {
    "source": "docChat"
  };
  condition._id = id;
  condition.isDeleted = false;
  update.updatedAt = update.updatedAt || Date.now();
  return ServiceOrder.findOneAndUpdate(condition, update, {
    new: true
  }).exec();
};

OrderService.prototype.updateNotOverOrderInfo = function (id, update, isOld) {
  var condition = {
    "source": "docChat"
  };
  condition._id = id;
  condition.callStatus = {
    $ne: 'over'
  };
  condition.isDeleted = false;
  update.updatedAt = update.updatedAt || Date.now();
  return findOneAndUpdate(condition, update, {
    new: true
  }, isOld);
};

/**
 * 获得指定医生指定日期的订单数
 * @param IDs
 * @param dateBegin
 * @param dateEnd
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
OrderService.prototype.getSpecialTimePhoneOrderNumByDoctorIds = function (IDs, dateBegin, dateEnd) {
  var match = {};
  match.doctorId = {
    "$in": IDs
  };
  match.createdAt = {
    '$gte': dateBegin,
    '$lt': dateEnd
  };
  match.source = "docChat";
  match.type = "phone";
  match.isDeleted = false;
  var group = {};
  group._id = "$doctorId";
  group.count = {
    $sum: 1
  };

  return Order.aggregate({
    '$match': match
  }, {
    '$group': group
  }).exec();
};

/**
 * 获取顾问的总的成单数和今日订单数
 * @param ids
 * @param time
 * @returns {*}
 */
OrderService.prototype.brokerStics = function (ids, time) {
  var match = {
    source: 'docChat',
    time: {
      $gt: 0
    },
    type: 'phone',
    isDeleted: false,
    doctorId: {
      $in: ids
    }
  };
  time && (match.createdAt = {
    $gt: time
  });
  return Order.aggregate({
    $match: match
  }, {
    $group: {
      _id: '$doctorId',
      count: {
        $sum: 1
      }
    }
  }).exec();
};
/**
 * 用户成单统计
 * @param ids
 * @returns {*}
 */
OrderService.prototype.customerStics = function (ids) {
  return Order.aggregate({
    $match: {
      source: 'docChat',
      time: {
        $gt: 0
      },
      type: 'phone',
      isDeleted: false,
      customerId: {
        $in: ids
      }
    }
  }, {
    $group: {
      _id: '$customerId',
      count: {
        $sum: 1
      }
    }
  }).exec();
};
/**
 * 根据时间来算收费
 *
 */
OrderService.prototype.getCustomerPayment = function (time, order) {
  if (time == 0)
    return 0;

  var price;
  if (time < order.callPrice.customerInitiateTime * 60) // 起步价
    price = order.callPrice.initiatePayment;
  else
    price = (order.callPrice.initiatePayment + ((time - order.callPrice.customerInitiateTime * 60) / 60) * order.callPrice.paymentPerMin).toFixed(2);

  return price * (order.callPrice.discount || 1);
};
/**
 * 根据callPrice设置以及用户余额判断能够打多长时间的电话
 */
OrderService.prototype.getCustomerCanPayCallTime = function (cash, callPrice) {

  if (!cash || cash < callPrice.initiatePayment) return 0;
  if (callPrice.paymentPerMin <= 0) return constants.callbackMaxCallTime;
  if (!callPrice.discount || callPrice.discount >= 1 || callPrice.discount <= 0) callPrice.discount = 1;
  cash = Math.round(cash / callPrice.discount);

  var afterInitiateCash = cash - callPrice.initiatePayment;
  var afterInitiateTime = Math.round((afterInitiateCash / callPrice.paymentPerMin) * 60); //单位s
  var extraTime = 0;
  if (callPrice.canLackMoney) { //如果被叫允许欠费,默认可额外拨打15min,如果设置了可欠费金额,则按收费计算可额外拨打的时间
    extraTime = constants.callback15MinCallTime * 60; //单位s
    if (callPrice.lackedMoney) {
      extraTime = Math.round((callPrice.lackedMoney / callPrice.incomePerMin) * 60); //单位s
    }
  }
  return callPrice.customerInitiateTime * 60 + afterInitiateTime + extraTime;
  // var price;
  // if (time < order.callPrice.customerInitiateTime * 60)
  //   price = order.callPrice.initiatePayment;
  // else
  //   price = (order.callPrice.initiatePayment + ((time - order.callPrice.customerInitiateTime * 60) / 60) * order.callPrice.paymentPerMin).toFixed(2);
  // return price * (order.callPrice.discount || 1);
};
/**
 * 计算今天使用种子优惠券的订单个数
 */
OrderService.prototype.countC2DOrderUseSeedCoupon = function (calleeId, isOrderOld) {
  var dateFormat = new Date(Date.now()).format("yyyy-MM-dd 00:00:00");
  var today = new Date(dateFormat).getTime();
  var conditions = {
    source: "docChat",
    type: "phone",
    callStatus: "over",
    couponType: 3,
    isDeleted: false
  };
  var field = isOrderOld ? 'doctorId' : 'calleeId';
  conditions[field] = calleeId;
  var result = {
    today: 0,
    all: 0
  };
  return NewPhoneOrder.count(conditions).exec()
    .then(function (_all) {
      result.all = _all || 0;
      conditions.createdAt = {
        $gt: today
      };
      return NewPhoneOrder.count(conditions).exec();
    }).then(function (_today) {
      result.today = _today || 0;
      return result;
    });
};
/**
 * 医生所有收藏患者的电话数
 * @param docId
 * @param customerIds
 * @returns {Promise|Array|{index: number, input: string}|*}
 * @constructor
 */
OrderService.prototype.favoriteDoctorCustomerPhoneOrderNum = function (docId, customerIds) {
  var match = {};
  match.source = "docChat";
  match.isDeleted = false;
  match.type = "phone";
  //match.callStatus = {'$ne': "failed"};
  match.time = {
    "$gt": 0
  };
  match.doctorId = docId;
  match.customerId = {
    "$in": customerIds
  };

  var group = {};
  group._id = "$customerId";
  group.count = {
    $sum: 1
  };
  var project = {
    '_id': 1,
    'count': 1
  };

  return Order.aggregate({
    '$match': match
  }, {
    '$group': group
  }, {
    '$project': project
  }).exec();
};

OrderService.prototype.getDocIncome = function (time, order) {
  if (time == 0)
    return 0;

  var price;
  if (time < order.callPrice.doctorInitiateTime * 60)
    price = order.callPrice.initiateIncome;
  else
    price = (order.callPrice.initiateIncome + ((time - order.callPrice.doctorInitiateTime * 60) / 60) * order.callPrice.incomePerMin).toFixed(2);

  return price;
};

OrderService.prototype.doctorValidPhoneOrderNumAndCustomers = function () {
  var match = {};
  match.source = "docChat";
  match.isDeleted = false;
  match.type = "phone";
  match.callStatus = "over";
  match.time = {
    "$gt": 0
  };

  var group = {};
  group._id = "$doctorRealName";
  group.orderNum = {
    $sum: 1
  };
  group.customer = {
    $push: "$customerName"
  };

  var project = {
    '_id': 1,
    'orderNum': 1,
    'customer': 1
  };
  var sort = {
    orderNum: -1
  };

  return Order.aggregate({
    '$match': match
  }, {
    '$group': group
  }, {
    '$project': project
  }, {
    '$sort': sort
  }).exec();
};

OrderService.prototype.commonFindOne = function (conds, params) {
  params = params || "doctorId";
  // 查询最近一次通话
  return NewPhoneOrder.findOne(conds, params, {
    "sort": {
      "createdAt": -1
    }
  }).exec();
};
OrderService.prototype.createADOrder = function (order) {
  order.type = CONS.TYPE.AD;
  order.payStatus = CONS.PAY_STATUS.TO_PAY;
  return AdOrder.findByIdAndUpdate(constants.ORDER_AUTH_INC_ID, {
      $inc: {
        orderNo: 1
      }
    }).exec()
    .then(function (data) {
      var date = commonUtil.getyyyyMMddhhmm(Date.now()).substring(2, 12);
      order.orderNo = date + data.orderNo;
      console.log("order:" + JSON.stringify(order));
      return AdOrder.create(order);
    })

};
OrderService.prototype.createServiceOrder = function (order) {
  return AdOrder.findByIdAndUpdate(constants.ORDER_AUTH_INC_ID, {
      $inc: {
        orderNo: 1
      }
    }).exec()
    .then(function (data) {
      var date = commonUtil.getyyyyMMddhhmm(Date.now()).substring(2, 12);
      order.orderNo = date + data.orderNo;
      console.log("order:" + JSON.stringify(order));
      return ServiceOrder.create(order);
    })

};
OrderService.prototype.createHongbaoOrder = function (order) {
  order.type = CONS.TYPE.HONGBAO;
  order.payStatus = CONS.PAY_STATUS.TO_PAY;
  return HongbaoOrder.findByIdAndUpdate(constants.ORDER_AUTH_INC_ID, {
      $inc: {
        orderNo: 1
      }
    }).exec()
    .then(function (data) {
      var date = commonUtil.getyyyyMMddhhmm(Date.now()).substring(2, 12);
      order.orderNo = date + data.orderNo;
      console.log("order:" + JSON.stringify(order));
      return HongbaoOrder.create(order);
    })

};
OrderService.prototype.createTransferOrder = function (order) {
  order.type = CONS.TYPE.TRANSFER;
  order.payStatus = CONS.PAY_STATUS.TO_PAY;
  return TransferOrder.findByIdAndUpdate(constants.ORDER_AUTH_INC_ID, {
      $inc: {
        orderNo: 1
      }
    }).exec()
    .then(function (data) {
      var date = commonUtil.getyyyyMMddhhmm(Date.now()).substring(2, 12);
      order.orderNo = date + data.orderNo;
      console.log("order:" + JSON.stringify(order));
      return TransferOrder.create(order);
    })

};
OrderService.prototype.createPaidTransferOrder = function (order) {
  order.type = CONS.TYPE.TRANSFER;
  order.payStatus = CONS.PAY_STATUS.PAID;
  return TransferOrder.findByIdAndUpdate(constants.ORDER_AUTH_INC_ID, {
      $inc: {
        orderNo: 1
      }
    }).exec()
    .then(function (data) {
      var date = commonUtil.getyyyyMMddhhmm(Date.now()).substring(2, 12);
      order.orderNo = date + data.orderNo;
      //console.log("order:" + JSON.stringify(order));
      return TransferOrder.create(order);
    })

};
/**
 * 根据TradeNo获取信息
 * */
OrderService.prototype.getInfoFromTradeNo = function (trade_no) {
  var info = {
    type: CONS.TYPE.NULL,
    userId: CONS.NULL,
    orderId: CONS.NULL
  };
  if (trade_no && (typeof trade_no == 'string')) {
    var splits = trade_no.split("-");
    if (splits.length == 3 && commonUtil.isUUID24bit(splits[1])) {
      // 数据格式: "timeStr-userId-randNumber"
      info.type = CONS.TYPE.RECHARGE;
      info.userId = splits[1];
    } else if (splits.length == 2 && commonUtil.isUUID24bit(splits[1])) {
      // 数据格式 "type-orderId"
      info.type = splits[0];
      info.orderId = splits[1];
    } else if (splits.length == 1) {
      var typeLetter = trade_no.substring(0, 1);
      if (typeLetter == 'S') {
        info = {
          type: 'sp',
          orderId: trade_no
        };
      } else if (typeLetter == 'M') {
        info = {
          type: 'ma',
          orderId: trade_no
        };
      } else if (typeLetter == 'R') {
        info = {
          type: 'tps',
          orderId: trade_no
        };
      } else if (typeLetter == 'C') {
        info = {
          type: 'tpc',
          orderId: trade_no
        };
      } else if (typeLetter == 'T') {
        info = {
          type: 'mc',
          orderId: trade_no
        };
      } else if (typeLetter == 'D') {
        info = {
          type: 'mcd',
          orderId: trade_no
        };
      } else if (typeLetter == 'A') {
        info = {
          type: 'mcdirector',
          orderId: trade_no
        };
      } else if (typeLetter == 'P') {
        info = {
          type: 'mcscene',
          orderId: trade_no
        };
      } else if (typeLetter == 'B') {
        info = {
          type: 'mcactivity',
          orderId: trade_no
        };
      }
    }
  }
  return info;
};
/**
 * 通过order_id查询订单
 */
OrderService.prototype.commonFindOrderById = function (type, orderId, prepareId) {
  var cond = {
    isDeleted: false,
    source: CONS.SOURCE.DOC_CHAT
  }
  console.log("00000");
  console.log(type);
  if (orderId) cond._id = orderId;
  if (prepareId) cond.prepareId = prepareId;
  switch (type) {
    case CONS.TYPE.AD:
      cond.type = CONS.TYPE.AD;
      return AdOrder.findOne(cond).exec();
    case CONS.TYPE.TRANSFER:
      cond.type = CONS.TYPE.TRANSFER;
      return TransferOrder.findOne(cond).exec();
    case CONS.TYPE.PHONE:
      cond.type = CONS.TYPE.PHONE;
      return NewPhoneOrder.findOne(cond).exec();
    case CONS.TYPE.HONGBAO:
      cond.type = CONS.TYPE.HONGBAO;
      return HongbaoOrder.findOne(cond).exec();
    case CONS.TYPE.MEMBERSHIP:
      cond.type = "membership";
      return ServiceOrder.findOne(cond).exec();
    case CONS.TYPE.MARKETING:
      cond.type = "marketing";
      return ServiceOrder.findOne(cond).exec();
    default:
      return Order.findOne(cond).exec();
  }
}
/**
 * 通过order_id查询订单
 */
OrderService.prototype.commonPayOrderById = function (orderId) {
  var cond = {
    _id: orderId,
    isDeleted: false,
    source: CONS.SOURCE.DOC_CHAT
  }
  var upd = {
    payStatus: CONS.PAY_STATUS.PAID,
    updatedAt: Date.now()
  }
  return CommonOrder.findOneAndUpdate(cond, upd, {
    new: true
  }).exec();
  // switch(type){
  //   case CONS.TYPE.AD:
  //     cond.type = CONS.TYPE.AD;
  //     return adOrder.findOne(cond).exec();
  //   case CONS.TYPE.PHONE:
  //     cond.type = CONS.TYPE.PHONE;
  //     return Order.findOne(cond).exec();
  //   default:
  //     throw ErrorHandler.getBusinessErrorByCode(8005);
  // }
}

/**
 * 获取广告订单
 */
OrderService.prototype.getBidList = function (conditions, pageSlice) {
  return AdOrder.find(conditions, {}, pageSlice).exec();
}

OrderService.prototype.getTransferList = function (conditions, pageSlice) {
  return TransferOrder.find(conditions, {}, pageSlice).exec();
}

OrderService.prototype.newPhoneOrderAppMap = function () {
  var appMap = {
    "callerId": "customerId",
    "callerName": "customerName",
    "callerDocChatNum": "customerDocChatNum",
    "callerSex": "customerSex",
    "callerAvatar": "customerAvatar",
    "callerDeviceId": "customerDeviceId",
    "calleeId": "doctorId",
    "calleeName": "doctorRealName",
    "calleeDocChatNum": "doctorDocChatNum",
    "calleeSex": "doctorSex",
    "calleeAvatar": "doctorAvatar",
    "callerPayment": "customerPayment",
    "calleeIncome": "doctorIncome"
  };
  return appMap;
};

OrderService.prototype.getOrderByHongbaoId = function (hongbaoId) {
  return HongbaoOrder.findOne({
    hongbao: hongbaoId
  }).exec();
}

OrderService.prototype.getLatestTransferOrderByCustomerId = function (userId) {
  if (!userId) {
    var deferred = Q.defer();
    deferred.resolve();
    return deferred.promise;
  }
  var condition = {
    isDeleted: false,
    customerId: userId,
    transferType: 'product',
    payStatus: "paid"
  }
  return TransferOrder.find(condition).sort({
    createdAt: -1
  }).limit(1).exec();
}

OrderService.prototype.updatePhoneOrderInfo = function (_id, update) {
  var condition = {
    _id: _id,
    type: 'phone',
    source: "docChat",
    isDeleted: false
  }
  console.log(update);
  return NewPhoneOrder.findOneAndUpdate(condition, update).exec();
}

OrderService.prototype.updateTransferOrderInfo = function (_id, update) {
  var condition = {
    _id: _id,
    type: 'tf',
    source: "docChat",
    isDeleted: false
  }
  console.log(update);
  return TransferOrder.findOneAndUpdate(condition, update).exec();
}

OrderService.prototype.updateMembershipOrderInfo = function (_id, update) {
  var condition = {
    _id: _id,
    source: "docChat",
    isDeleted: false
  }
  console.log(update);
  return ServiceOrder.findOneAndUpdate(condition, update).exec();
}

OrderService.prototype.getTransferOrderInfo = function (id, option) {
  var condition = {
    _id: id,
    type: 'tf',
    source: "docChat",
    isDeleted: false
  };
  var fields = option && option.fields || null;
  return TransferOrder.findOne(condition, fields).exec();
}

OrderService.prototype.getActivityReward = function (userId, orderId) {
  'use strict';
  let now_ts = Date.now();
  //todo: 测试用
  //now_ts = getDateBeginTS(new Date(activity_test_day)) + 1 * 60 * 1000;
  //console.log(new Date(now_ts));
  let activity_begin_at = getDateBeginTS('2017-06-23');
  let activity_end_at = getDateEndTS('2017-06-26');
  //是否为活动期间
  if (now_ts < activity_begin_at || now_ts > activity_end_at) {
    return 0;
  }
  //是否为当天第一单
  let current_day_begin_at = getDateBeginTS(now_ts);
  let current_day_begin_end = getDateEndTS(now_ts);
  let cond = {
    type: 'tf',
    transferType: 'checkin',
    customerId: userId,
    createdAt: {
      $gte: current_day_begin_at,
      $lte: current_day_begin_end
    }
  }
  return TransferOrder.count(cond).exec()
    .then(function (_count) {
      console.log('_count:', _count);
      if (_count !== 0) {
        return 0;
      }
      //获取普通的返现额度
      let reward_service = Backend.service('1/activity', 'reward_service');
      return reward_service.getTodayNormalReward(userId, orderId);
    })
    .then(function (_reward) {
      console.log('ActivityReward:', _reward);
      return _reward;
    }, function (e) {
      console.log(e);
      return 0;
    })
}


OrderService.prototype.getActivityReward624 = function (userId, orderId) {
  'use strict';
  let now_ts = Date.now();
  //todo: 测试用
  //now_ts = getDateBeginTS(new Date(activity_test_day)) + 1 * 60 * 1000;
  let activity_begin_at = getDateBeginTS('2017-06-23');
  let activity_end_at = getDateEndTS('2017-06-26');
  //是否为活动期间
  if (now_ts < activity_begin_at || now_ts > activity_end_at) {
    return 0;
  }
  let reward624_service = Backend.service('1/activity', 'reward_624');
  //存储redis 领取记录，返回值当前领取记录order arrary
  return reward624_service.saveRedisOrder(userId, orderId)
    .then(function (orderArr) {
      //是否为活动期间第三单
      if (orderArr.length !== 3) {
        console.log('不是三单')
        return 0;
      }
      console.log('是三单')
      return reward624_service.saveRewardRecord(userId, orderId);
    })
    .then(function (_reward) {
      console.log('ActivityReward:', _reward);
      return _reward;
    }, function (e) {
      console.log(e);
      return 0;
    })
}
OrderService.prototype.CONS = CONS;
module.exports = exports = new OrderService();