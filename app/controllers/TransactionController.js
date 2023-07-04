var
  _ = require('underscore'),
  util = require('util'),
  async = require('async'),
    constants = require('../configs/constants'),
    commonUtil = require('../../lib/common-util'),
    apiHandler = require('../configs/ApiHandler'),
    ErrorHandler = require('../../lib/ErrorHandler'),
    configs = require('../configs/api'),
    xml2js = require('xml2js'),
    Q = require("q"),
    fs = require("fs"),
    path = require("path"),
    Promise = require('promise'),
    OrderService = require('../services/OrderService'),
    DoctorService = require('../services/DoctorService'),
    CustomerService = require('../services/CustomerService'),
    CouponService = require('../services/CouponService'),
    ChannelService = require('../services/ChannelService'),
    ApplicationService = require('../services/ApplicationService'),
    ValidateService = require('../services/ValidateService'),
    PayService = require('../services/PayService'),
    TransactionMysqlService = require('../services/TransactionMysqlService'),
    JPushService = require('../services/JPushService'),
    ProductService = require('../services/ProductService'),
    LoggerService = require('../services/LoggerService'),
    servicePackageOrderService = require('../services/service_package/servicePackageOrderService'),
    makeAppointmentOrderService = require('../services/service_package/makeAppointmentOrderService'),
    ServiceSignedDoctorsService = require('../services/service_package/serviceSignedDoctorsService'),
    ServicePackageDoctorAssistantRefService = require('../services/service_package/servicePackageDoctorAssistantRefService'),
    ServicePackageDoctorModel = require('../models/service_package/servicePackageDoctor'),
    MembershipService = require('../services/MembershipService');

var TransactionController = function () {};
TransactionController.prototype.constructor = TransactionController;

/**
 * 钱包账户
 * @param req
 * @param res
 * @returns {*}
 */
TransactionController.prototype.wallet = function (req, res) {
  var userId;
  var identity = req.identity;
  if (!commonUtil.isUUID24bit(identity.userId)) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }

  userId = identity.userId;
  CustomerService.getInfoByID(userId)
    .then(function (u) {
      if (!u) {
        throw ErrorHandler.getBusinessErrorByCode(1503);
      }

      return TransactionMysqlService.getAccountByUserIdAndDoctorId(userId + '');
    })
    .then(function (_account) {
      _account.amount = Math.floor(_account.amount * 100) / 100;
      _account.income = Math.floor(_account.income * 100) / 100;
      _account.payment = Math.floor(_account.payment * 100) / 100;
      _account.willIncome = Math.floor(_account.willIncome * 100) / 100;
      //提现额度
      _account.withdrawalsMax = constants.withdrawalsMax;
      _account.withdrawalsMin = constants.withdrawalsMin;

      apiHandler.OK(res, _account);
    }, function (err) {
      apiHandler.handleErr(res, err);
    });
};

/**
 * 支出明细
 * @param req
 * @param res
 * @returns {*}
 */
TransactionController.prototype.payment = function (req, res) {
  var size = parseInt(req.query.pageSize);
  var num = parseInt(req.query.pageNum);
  var from = 0;
  var pageSize = constants.DEFAULT_PAGE_SIZE;
  if ((typeof (size) === 'number') && size > 0)
    pageSize = size;
  if ((typeof (num) === 'number') && num > 0)
    from = num * pageSize;
  var type = TransactionMysqlService.CONS.TRANSACTION_TYPE_PAY;

  var userId, doctorId;
  var identity = req.identity;
  if (!commonUtil.isUUID24bit(identity.userId)) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }

  userId = identity.userId;
  CustomerService.getInfoByID(userId)
    .then(function (u) {
      if (!u) {
        throw ErrorHandler.getBusinessErrorByCode(1503);
      }
      //doctorId = u.doctorRef && u.doctorRef._id ? u.doctorRef._id : '';
      console.log('data:', userId, type, from, pageSize);
      return TransactionMysqlService.getTransactionsByUserIdAndDoctorId(userId + '', '', type, from, pageSize);
    })
    .then(function (trs) {
      for (var i = 0; i < trs.length; i++) {
        trs[i].payStatus = "paid";

        if (trs[i].title.indexOf(TransactionMysqlService.CONS.TRANSACTION_TYPE_WITHDRAW_CHECKING_TITLE) > -1) {
          trs[i].payStatus = "toPay";
        } else if (trs[i].title.indexOf(TransactionMysqlService.CONS.TRANSACTION_TYPE_WITHDRAW_REJECTED_TITLE) > -1) {
          trs[i].payStatus = "failed";
        }
      }

      console.log('支出明细', trs);
      return apiHandler.OK(res, trs);
    }, function (err) {
      return apiHandler.handleErr(res, err);
    });
};

/**
 * 充值明细
 * @param req
 * @param res
 * @returns {*}
 */
TransactionController.prototype.rechargeInfo = function (req, res) {
  getTransactionsByUserId(req, res, TransactionMysqlService.CONS.TRANSACTION_TYPE_RECHARGE)
    .then(function (trs) {
      console.log("trs:" + util.inspect(trs));
      return apiHandler.OK(res, trs);
    }, function (err) {
      return apiHandler.handleErr(res, err);
    });
};

/**
 * 收入明细
 * @param req
 * @param res
 * @returns {*}
 */
TransactionController.prototype.income = function (req, res) {
  var size = parseInt(req.query.pageSize);
  var num = parseInt(req.query.pageNum);
  var from = 0;
  var pageSize = constants.DEFAULT_PAGE_SIZE;
  if ((typeof (size) === 'number') && size > 0)
    pageSize = size;
  if ((typeof (num) === 'number') && num > 0)
    from = num * pageSize;

  var type = TransactionMysqlService.CONS.TRANSACTION_TYPE_INCOME;

  var userId, doctorId;
  var identity = req.identity;
  if (!commonUtil.isUUID24bit(identity.userId)) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }
  userId = identity.userId;
  CustomerService.getInfoByID(userId)
    .then(function (u) {
      if (!u) {
        throw ErrorHandler.getBusinessErrorByCode(1503);
      }
      //doctorId = u.doctorRef && u.doctorRef._id ? u.doctorRef._id : '';
      return TransactionMysqlService.getTransactionsByUserIdAndDoctorId(userId + '', '', type, from, pageSize);
    })
    .then(function (trs) {
      //console.log("trs:" + util.inspect(trs));
      return apiHandler.OK(res, trs);
    }, function (err) {
      return apiHandler.handleErr(res, err);
    });
};

TransactionController.prototype.transactions = function (req, res) {
  var size = parseInt(req.query.pageSize);
  var num = parseInt(req.query.pageNum);
  var from = 0;
  var pageSize = constants.DEFAULT_PAGE_SIZE;
  if ((typeof (size) === 'number') && size > 0)
    pageSize = size;
  if ((typeof (num) === 'number') && num > 0)
    from = num * pageSize;

  var type = TransactionMysqlService.CONS.TRANSACTION_TYPE_INCOME_AND_PAY;

  var userId, doctorId;
  var identity = req.identity;
  var account = null;
  if (!commonUtil.isUUID24bit(identity.userId)) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }
  userId = identity.userId;
  CustomerService.getInfoByID(userId)
    .then(function (u) {
      if (!u) {
        throw ErrorHandler.getBusinessErrorByCode(1503);
      }
      doctorId = u.doctorRef && u.doctorRef._id ? u.doctorRef._id : '';
      return TransactionMysqlService.getAccountByUserIdAndDoctorId(userId + '', doctorId + '');
    })
    .then(function (_account) {
      account = _account;
      return TransactionMysqlService.getTransactionsByUserIdAndDoctorId(userId + '', doctorId + '', type, from, pageSize);
    })
    .then(function (trs) {
      var allIncomeTypes = [TransactionMysqlService.CONS.TRANSACTION_TYPE_INCOME, TransactionMysqlService.CONS.TRANSACTION_TYPE_RECHARGE];
      var allPaymentTypes = [TransactionMysqlService.CONS.TRANSACTION_TYPE_PAY, TransactionMysqlService.CONS.TRANSACTION_TYPE_WITHDRAW];
      trs = JSON.parse(JSON.stringify(trs));
      var isRecord = false;
      if (trs && trs.length > 0) {
        trs.forEach(function (tr) {
          if (allIncomeTypes.indexOf(tr.type) > -1) { //
            tr.topType = 'income';
          } else if (allPaymentTypes.indexOf(tr.type) > -1) {
            tr.topType = 'payment';
            tr.payStatus = "paid";
            if (account.amount < 0 && !isRecord && tr.subType == TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_PAY_DC) {
              tr.payStatus = "toPay";
              isRecord = true;
            }
          } else {
            tr.topType = ''
          }
        });
      }
      var resData = {
        items: trs
      }
      //console.log("trs:" + util.inspect(trs));
      return apiHandler.OK(res, resData);
    }, function (err) {
      return apiHandler.handleErr(res, err);
    });
}

//申请提现
TransactionController.prototype.applyWithdraw = function (req, res) {
  var payload = req.body;
  var identity = req.identity; // 访问用户身份
  if (!commonUtil.isUUID24bit(identity.userId)) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
  }
  var fields = {
    required: ['cash'],
    optional: ['alipayNum', 'alipayName', 'alipaySid', 'bankCard', 'bankCardSid', 'bankCardName', 'bankName', 'area', 'subBankName', "payPwd", "authCode"]
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var user, applicationId;
    var userId, doctorId;
    data.userId = identity.userId;
    var option = {
      "customerFields": " "
    };

    CustomerService.getInfoByID(data.userId, option)
      .then(function (u) {
        if (!u) {
          throw ErrorHandler.getBusinessErrorByCode(1503);
        } else {
          user = u;
          userId = data.userId;
          doctorId = u.doctorRef && u.doctorRef._id ? u.doctorRef._id : '';
          if (user.frozen) {
            throw ErrorHandler.getBusinessErrorByCode(1521);
          } else {
            if (!data.authCode && !data.payPwd) {
              throw ErrorHandler.getBusinessErrorByCode(8005);
            }

            let sid = data.alipaySid || data.bankCardSid || '';

            if (sid) {
              if (!checkSid(sid)) {
                throw ErrorHandler.getBusinessErrorByCode(1525);
              }
            }


            console.log(user.payPwd);
            if (data.payPwd && data.payPwd != user.payPwd) {
              throw ErrorHandler.getBusinessErrorByCode(1524);
            }
            if (data.authCode) {
              return ValidateService.validateByPhone(user.phoneNum, data.authCode);
            }
          }
        }
      }) //判断用户余额是否够
      .then(function () {
        // 今天已经提现
        //  return ApplicationService.findTodayWithdrawByUserId(data.userId,20);
        //})
        //.then(function (_app) {
        //  if (_app) throw ErrorHandler.getBusinessErrorByCode(8008);

        return TransactionMysqlService.getAccountByUserIdAndDoctorId(userId + '', doctorId + '');
      })
      .then(function (account) {
        console.log("account:" + util.inspect(account));
        if (account.amount < data.cash) {
          throw ErrorHandler.getBusinessErrorByCode(1519);
        } else {
          var application = {
            status: 0, //提款进度, 0 新建申请; 1 已受理; 2 批准; －1 默认拒绝； -2 拒绝。
            future: Date.now() + constants.TIME7D,
            type: 20, //新版本朱李叶健康的提现申请

            applicantId: user._id,
            applicantName: user.name,
            applicantPhone: user.phoneNum,

            cash: data.cash,
            alipayNum: data.alipayNum, //支付宝账号

            alipayName: data.alipayName, //支付宝绑定姓名
            alipaySid: data.alipaySid, //支付宝身份证号
            bankCardNum: data.bankCard, //银行卡号

            bankCardName: data.bankCardName, //提款人开户行姓名

            bankCardSid: data.bankCardSid, //银行卡身份证号
            bankName: data.bankName,
            area: data.area,
            subBankName: data.subBankName
          };

          return ApplicationService.createApplication(application);
        }
      })
      .then(function (appl) {
        applicationId = appl._id;
        var subtype = appl.alipayNum ? TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_WITHDRAW_ALI : TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_WITHDRAW_BANK;

        return TransactionMysqlService.withdraw(user._id + '', doctorId, data.cash, applicationId + '', subtype);
      })
      .then(function () {
        return ApplicationService.updateStatus(applicationId, 1, "");
      })
      .then(function () {
        apiHandler.OK(res);
        LoggerService.trace(LoggerService.getTraceDataByReq(req)); //和发送验证码的log一起用，不能删
      }, function (err) {
        apiHandler.handleErr(res, err);

        if (applicationId)
          ApplicationService.updateStatus(applicationId, -1, err + "");
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};
//验证身份证号码
let checkSid = function (sid) {
  let regResult = false;
  if (sid) {
    var reg18 = RegExp('^[1-9]\\d{5}(18|19|([23]\\d))\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$');
    var reg15 = RegExp('^[1-9]\\d{5}\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{2}$');
    if (sid.length == 15) {
      regResult = reg15.test(sid);
    } else if (sid.length == 18) {
      regResult = reg18.test(sid);
    }
  }
  return regResult;
}
var getTransactionsByUserId = function (req, res, type) {
  var userId = req.query.userId;
  var size = parseInt(req.query.pageSize);
  var num = parseInt(req.query.pageNum);
  if (!userId)
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));

  var from = 0;
  var pageSize = constants.DEFAULT_PAGE_SIZE;
  if ((typeof (size) === 'number') && size > 0)
    pageSize = size;
  if ((typeof (num) === 'number') && num > 0)
    from = num * pageSize;

  return TransactionMysqlService.getTransactionsByUserId("" + userId, type, from, pageSize);
};

/**
 * 支付宝 充值/支付 回调
 * TODO 验证来自支付宝回调？？？？
 * @param req
 * @param res
 */
TransactionController.prototype.rechargeByALi = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['out_trade_no', 'total_fee', 'trade_status', 'trade_no', 'notify_id']
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };

  var onSuccess = function (handler, data) {

    console.log("rechargeByALi callback type: " + data.trade_status);
    // TODO: 0. 验证请求是支付宝的合法请求
    //var publicPem = fs.readFileSync(''); //读取公钥
    //var publicKey = publicPem.toString();
    res.notify_id = data.notify_id;
    switch (data.trade_status) {
      case PayService.CONS.ALI_STATUS.TRADE_SUCCESS: //支付成功
      case PayService.CONS.ALI_STATUS.TRADE_FINISHED: //交易成功
        console.log("AliPay Callback Status:  " + data.trade_status);
        var info = OrderService.getInfoFromTradeNo(data.out_trade_no);
        var userId = info.userId;
        info.price = parseFloat(data.total_fee);
        info.payType = PayService.CONS.PAY_TYPE.ALI;
        info.tradeNo = data.trade_no;
        info.outTradeNo = data.out_trade_no;
        if (userId) { // 充值
          recharge(res, userId, info.price, info.tradeNo, info.outTradeNo, TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_RECHARGE_ALI);
        } else { // 支付订单
          payOrder(res, info);
        }
        // else {
        //   buyExclusiveDoctor(res, data.out_trade_no, parseFloat(data.total_fee), data.trade_no, TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_RECHARGE_ALI);
        // }
        break;
      case PayService.CONS.ALI_STATUS.WAIT_BUYER_PAY: // 交易创建,等待付款
      case PayService.CONS.ALI_STATUS.TRADE_CLOSED: // 交易关闭
        console.log("AliPay Callback Status:  " + data.trade_status);
        return res.status(200).end("success");
      default: //break;
        console.log("AliPay Callback UnKnown Status:  " + data.trade_status);
    }
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

/**
 * 服务包订单、预约订单 支付宝 支付 回调
 * @param req
 * @param res
 */
TransactionController.prototype.servicePackageRechargeByALi = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['out_trade_no', 'total_fee', 'trade_status', 'trade_no', 'notify_id']
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };

  var onSuccess = function (handler, data) {

    console.log("rechargeByALi callback type: " + data.trade_status);
    // TODO: 0. 验证请求是支付宝的合法请求
    //var publicPem = fs.readFileSync(''); //读取公钥
    //var publicKey = publicPem.toString();
    res.notify_id = data.notify_id;
    switch (data.trade_status) {
      case PayService.CONS.ALI_STATUS.TRADE_SUCCESS: //支付成功
      case PayService.CONS.ALI_STATUS.TRADE_FINISHED: //交易成功
        console.log("AliPay Callback Status:  " + data.trade_status);
        var info = payServicePackageOrder(data.out_trade_no);
        info.price = parseFloat(data.total_fee);
        info.payType = PayService.CONS.PAY_TYPE.ALI;
        info.tradeNo = data.trade_no;
        info.outTradeNo = data.out_trade_no;
        payOrder(res, info);
        break;
      case PayService.CONS.ALI_STATUS.WAIT_BUYER_PAY: // 交易创建,等待付款
      case PayService.CONS.ALI_STATUS.TRADE_CLOSED: // 交易关闭
        console.log("AliPay Callback Status:  " + data.trade_status);
        return res.status(200).end("success");
      default: //break;
        console.log("AliPay Callback UnKnown Status:  " + data.trade_status);
    }
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};


/**
 * 微信 充值/支付 回调
 * TODO 验证来自微信回调？?
 * @param req
 * @param res
 */
TransactionController.prototype.rechargeByWX = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['xml']
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };

  var onSuccess = function (handler, data) {
    var isValid = CustomerService.checkWxPay(data.xml); //会删除data.sign
    console.log('isValid:', isValid);
    if (data.xml.return_code[0] == 'SUCCESS' && data.xml.result_code[0] == 'SUCCESS' && isValid) {
      console.log("WxPay Callback Success");
      var info = OrderService.getInfoFromTradeNo(data.xml.out_trade_no[0]);
      var userId = info.userId;
      info.price = parseFloat(data.xml.total_fee[0] / 100);
      info.payType = PayService.CONS.PAY_TYPE.WX;
      info.tradeNo = data.xml.transaction_id[0];
      info.outTradeNo = data.xml.out_trade_no[0];
      if (userId) { // 充值
        recharge(res, userId, info.price, info.tradeNo, info.outTradeNo, TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_RECHARGE_WX);
      } else { // 支付订单
        payOrder(res, info);
      }
      // } else {
      //   buyExclusiveDoctor(res, data.xml.out_trade_no[0], data.xml.total_fee[0] / 100, data.xml.transaction_id[0], TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_RECHARGE_WX);
      // }
    } else {
      var resData = "<xml>" +
        " <return_code><![CDATA[" + "FAIL" + "]]></return_code>" +
        " <return_msg><![CDATA[" + (isValid ? data.xml.return_msg[0] : '签名失败') + "]]></return_msg>" +
        "</xml>";
      apiHandler.OK(res, resData, "application/xml");
    }
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};


/**
 * 充值
 * @param res
 * @param userId
 * @param cash
 * @param outerTradeNo
 * @param innerTradeNo
 * @param subType
 */
var recharge = function (res, userId, cash, outerTradeNo, innerTradeNo, subType) {
  //console.log(userId + "->" + cash + "->" + outerTradeNo + "->" + innerTradeNo + "->" + subType);

  var hasDebts = false;
  var user, doctorId;

  //先查账户，如果amount为负，则需要充值成功后amount变成正后修改对应的订单！！！
  CustomerService.getInfoByID(userId)
    .then(function (u) {
      if (!u)
        throw ErrorHandler.getBusinessErrorByCode(1503);

      user = u;
      doctorId = user.doctorRef && user.doctorRef._id ? user.doctorRef._id : '';
      if (subType == TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_RECHARGE_ALI) {
        //支付宝验证回调是否有效
        return CustomerService.checkAlipay(res.notify_id);
      } else {
        return true;
      }
    })
    .then(function (_isValid) {
      if (!_isValid) {
        throw ErrorHandler.getBusinessErrorByCode(1809);
      }

      //  return TransactionMysqlService.getAccountByUserIdAndDoctorId(user._id + '', doctorId + '');
      //})
      //.then(function (account) {
      //  hasDebts = account.amount < 0;

      return TransactionMysqlService.getTransactionByOuterTradeNo(outerTradeNo); //查询是否重复充值
    })
    .then(function (t) {
      if (t.length <= 0) { //没有重复充值

        return Promise.resolve().then(function () {
          //if (user.channelCode) {  //给渠道分账
          //  return ChannelService.getInfoByChannelCode(user.channelCode);
          //}
        }).then(function (_channel) {
          var sql = "";
          /// 查询充值用户的渠道信息,奖励渠道
          //if (_channel) {
          //  sql += TransactionMysqlService.genUserRechargeRewardSql(
          //    _channel.manager._id,
          //    cash * 0.1,
          //    outerTradeNo,
          //    innerTradeNo,
          //    TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_RECHARGE_CHANNEL_REWARD,
          //    TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_RECHARGE_CHANNEL_REWARD_TITLE,
          //    TransactionMysqlService.CONS.TRANSACTION_SOURCE_ZLY
          //  );
          //}

          /// 查询充值活动具体设置,充值奖励
          //var rechargeOption = _.find(constants.RECHARGE_OPTS, function (d) {
          //  return d.price_pay == cash
          //});
          //if (rechargeOption && (rechargeOption.price_act > cash)) {
          //  var reward = rechargeOption.price_act - cash;
          //  sql += TransactionMysqlService.genUserRechargeRewardSql(
          //    userId,
          //    reward,
          //    outerTradeNo,
          //    innerTradeNo,
          //    TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_RECHARGE_REWARD,
          //    TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_RECHARGE_REWARD_TITLE,
          //    TransactionMysqlService.CONS.TRANSACTION_SOURCE_DOCCHAT,
          //    rechargeOption.desc);
          //}

          sql += TransactionMysqlService.genUserRechargeSql(
            userId,
            cash,
            outerTradeNo,
            innerTradeNo,
            subType);
          return sql;
        }).then(function (_sql) {
          return TransactionMysqlService.execSqlAndGetUserAccount(_sql, user._id + '', doctorId + '');
        });
      }
    })
    .then(function (account) {
      if (subType == TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_RECHARGE_ALI) {
        //充值成功,平欠费电话的账
        //CustomerService.payTheNonPayment(user._id, user.doctorId);
        res.status(200).end("success");

      } else if (subType == TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_RECHARGE_WX) {
        var resData = "<xml>" +
          " <return_code><![CDATA[" + "SUCCESS" + "]]></return_code>" +
          " <return_msg><![CDATA[" + "OK" + "]]></return_msg>" +
          "</xml>";
        //充值成功,平欠费电话的账
        //CustomerService.payTheNonPayment(user._id, user.doctorId);
        apiHandler.OK(res, resData, "application/xml");
      }

      //if (account && hasDebts && (account.amount >= 0)) {
      //  OrderService.updateAllPhoneOrderToPaid(userId);
      //}

    }, function (err) {
      //充值失败,给不同平台不同的返回格式
      if (subType == TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_RECHARGE_ALI) {
        apiHandler.handleErr(res, err);

      } else if (subType == TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_RECHARGE_WX) {
        var resData = "<xml>" +
          " <return_code><![CDATA[" + "FAIL" + "]]></return_code>" +
          " <return_msg><![CDATA[" + data.xml.return_msg[0] + "]]></return_msg>" +
          "</xml>";
        apiHandler.OK(res, resData, "application/xml");
      }
    });
};
var handlePaySuc = function (res, pay_type) {
  console.log("Init handler pay suc " + pay_type);
  return function () {
    console.log("Handler pay suc ...." + pay_type);
    if (pay_type == PayService.CONS.PAY_TYPE.ALI) {
      console.log("PayOKALI");
      res.status(200).end("success");
    } else if (pay_type == PayService.CONS.PAY_TYPE.WX) {
      var resData = "<xml>" +
        " <return_code><![CDATA[" + "SUCCESS" + "]]></return_code>" +
        " <return_msg><![CDATA[" + "OK" + "]]></return_msg>" +
        "</xml>";
      console.log("PayOKWX: " + resData);
      apiHandler.OK(res, resData, "application/xml");
    }
  };
};
var handlePayErr = function (res, pay_type) {
  console.log("Init handler pay err " + pay_type);
  return function (err) {
    console.log("Handler pay suc ...." + pay_type);
    if (pay_type == PayService.CONS.PAY_TYPE.ALI) { //TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_RECHARGE_ALI
      console.log("PayOKALI");
      apiHandler.handleErr(res, err);
    } else if (pay_type == PayService.CONS.PAY_TYPE.WX) { //
      var resData = "<xml>" +
        " <return_code><![CDATA[" + "FAIL" + "]]></return_code>" +
        " <return_msg><![CDATA[" + data.xml.return_msg[0] + "]]></return_msg>" +
        "</xml>";
      console.log("PayOKWX: " + resData);
      apiHandler.OK(res, resData, "application/xml");
    }
  };
};
var handleAdOrder = function (res, info) {
  var order;
  OrderService.commonFindOrderById(OrderService.CONS.TYPE.AD, info.orderId)
    .then(function (_order) { // 完成交易-记账-订单
      order = _order;
      if (!_order) throw ErrorHandler.getBusinessErrorByCode(8005);
      if (_order.price != info.price) throw ErrorHandler.getBusinessErrorByCode(8005);
      if (_order.payStatus == OrderService.CONS.PAY_STATUS.TO_PAY) { //防止重复记账
        // 交易明细
        var sqls = TransactionMysqlService.genAdPaymentSqls(_order.customerId,
          _order.doctorId,
          info.payType,
          info.price,
          constants.ORDER_AD_RADIO,
          info.tradeNo,
          info.orderId,
          "竞价广告;");
        return TransactionMysqlService.execSqls(sqls)
          .then(function () { // 更新订单状态
            // SEND SMS
            commonUtil.sendSms("1642410", _order.doctorPhoneNum,
              "#name#=" + _order.customerName);
            return OrderService.commonPayOrderById(info.orderId);
          });
      }
    })
    .then(function () {
      // 查询关系,判断是否已加权重,新增/更新关系
      return DoctorService.isRelExists(order.doctorId, order.customerDocId, "ad")
        .then(function (_rel) {
          if (!_rel) {
            return DoctorService.createRel({
              type: "ad",
              fromId: order.doctorId,
              fromRef: commonUtil.getObjectIdByStr(order.doctorId),
              toId: order.customerDocId,
              toRef: commonUtil.getObjectIdByStr(order.customerDocId),
              orderId: [order._id + ""],
              weight: info.price
            });
          } else {
            var historyOrder = _rel.orderId || [];
            if (historyOrder.indexOf(info.orderId) < 0) {
              historyOrder.push(order._id + "");
              // add weight
              return DoctorService.addRelWeight(_rel._id, info.price, null, [order._id + ""]);
            } // else do nothing
          }
        })
    })
    .then(
      handlePaySuc(res, info.payType),
      handlePayErr(res, info.payType));
};
var handleTransferOrder = function (res, info) {
  var order;
  OrderService.commonFindOrderById(OrderService.CONS.TYPE.TRANSFER, info.orderId)
    .then(function (_order) { // 完成交易-记账-订单
      order = _order;
      console.log(_order.price, info.price, _order.couponDeductedRMB, commonUtil.getNumsPlusResult([info.price, _order.couponDeductedRMB]));
      if (!_order) throw ErrorHandler.getBusinessErrorByCode(8005);
      if (_order.price != commonUtil.getNumsPlusResult([info.price, _order.couponDeductedRMB])) throw ErrorHandler.getBusinessErrorByCode(8005);
      if (_order.payStatus == OrderService.CONS.PAY_STATUS.TO_PAY) { //防止重复记账
        var payTitle = _order.doctorRealName;
        var incomeTitle = _order.customerName;
        if (_order.productCode) {
          payTitle += "(" + _order.productCode + ")";
          incomeTitle += "(" + _order.productCode + ")";
        }
        // 交易明细
        //购买代金券;使用代金券;正常
        var sqls = '';
        console.log('order:', order);
        console.log('info:', info);
        if (order.productId) { //购买代金券
          var productSnapshot = _order.productSnapshot;
          var assistantInfo = {
            productMainId: _order.productMainId + '',
            rewardPrice: productSnapshot.rewardPrice
          };
          sqls = TransactionMysqlService.genTransferPaymentForVoucherSqls(_order.customerId,
            productSnapshot.owner + '',
            info.payType,
            productSnapshot.actualPrice,
            '付款: ' + _order.doctorRealName + '(代金券)',
            '收款: ' + _order.customerName + '(代金券)',
            info.tradeNo,
            info.orderId,
            assistantInfo,
            "购买代金券;", _order.couponDeductedRMB);
        } else if (order.couponId) { //使用代金券
          sqls = TransactionMysqlService.genTransferPaymentSqls(_order.customerId,
            _order.doctorMainId,
            info.payType,
            order.price,
            payTitle,
            incomeTitle,
            info.tradeNo,
            info.orderId,
            "转账;", _order.couponDeductedRMB);
        } else { //正常
          sqls = TransactionMysqlService.genTransferPaymentSqls(_order.customerId,
            _order.doctorMainId,
            info.payType,
            order.price,
            payTitle,
            incomeTitle,
            info.tradeNo,
            info.orderId,
            "转账;");
        }
        console.log('sqls:', sqls);
        return TransactionMysqlService.execSqls(sqls)
          .then(function () { // 更新订单状态
            if (order.productId) { //购买代金券,需要创建全城购代金券
              var productSnapshot = order.productSnapshot;
              var coupon_new = {
                activityNo: constants.COUPON_ACTIVITYNO_PURCHASE,
                type: 5,
                title: productSnapshot.title,
                subTitle: '',
                description: '',
                manual: '',
                rmb: productSnapshot.displayPrice,
                rmbDescription: '¥' + productSnapshot.displayPrice,
                deductedRMB: productSnapshot.displayPrice,
                expiredAt: commonUtil.setValidAtSomeMonth(Date.now(), constants.COUPON_ACTIVITYNO_PURCHASE_TIME_MONTH),
                boundUserId: order.customerId,
                boundUserPhoneNum: order.customerPhoneNum,
                orderId: order._id + ''
              };
              console.log('coupon0:', coupon_new);
              CouponService.createCoupon(coupon_new);
              var prodCond = {
                _id: order.productId,
                isDeleted: false
              }
              ProductService.updateProduct(prodCond, {
                $inc: {
                  stock: -1,
                  soldNum: 1
                }
              });
            }
            if (order.couponId) { //使用代金券,需要创建24全城购特惠券
              if (order.couponId && order.couponType == 5) {
                var coupon_new = {
                  activityNo: constants.COUPON_ACTIVITYNO_SPECIAL,
                  type: 6,
                  title: constants.COUPON_ACTIVITYNO_SPECIAL_TITLE,
                  subTitle: '仅限24日当日使用',
                  description: '',
                  manual: '',
                  rmb: constants.COUPON_ACTIVITYNO_SPECIAL_RMB,
                  rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_SPECIAL_RMB,
                  deductedRMB: constants.COUPON_ACTIVITYNO_SPECIAL_RMB,
                  expiredAt: commonUtil.setExpiredAtSomeDate(24),
                  //dateBegin: 24,
                  //dateEnd: 24,
                  //timeBegin: 0,
                  //timeEnd: 24,
                  boundUserId: order.customerId,
                  boundUserPhoneNum: order.customerPhoneNum,
                  orderId: order._id + ''
                };
                console.log('coupon1:', coupon_new);
                CouponService.createCoupon(coupon_new);
              }
              //标记优惠券使用过
              CouponService.consumedCoupon(order.couponId, order.couponDeductedRMB);
              //如果isVender = true,记录优惠券抵扣金额
              CustomerService.updateBaseInfoByCond({
                _id: order.doctorMainId
              }, {
                $inc: {
                  couponDeductible: order.couponDeductedRMB
                }
              });
            }
            //收款消息;如果有服务助理,跳转到其主页
            CustomerService.pushTransactionIncomeMsg(order);

            return OrderService.commonPayOrderById(info.orderId);
          });
      }
    })
    .then(function () {
      // 无需处理关系
      if (!commonUtil.isUUID24bit(order.productDocId) ||
        !commonUtil.isUUID24bit(order.doctorId)) {
        return;
      }
      // 查询关系,判断是否已加权重,新增/更新关系
      return DoctorService.isRelExists(order.productDocId, order.doctorId, "ass")
        .then(function (_rel) {
          if (!_rel) {
            return DoctorService.createRel({
              type: "ass",
              fromId: order.productDocId,
              fromRef: commonUtil.getObjectIdByStr(order.productDocId),
              toId: order.doctorId,
              toRef: commonUtil.getObjectIdByStr(order.doctorId),
              orderId: [order._id + ""],
              weight: 1
            });
          } else {
            var historyOrder = _rel.orderId || [];
            if (historyOrder.indexOf(info.orderId) < 0) {
              historyOrder.push(order._id + "");
              console.log("orders: " + historyOrder.length);
              // add weight
              return DoctorService.addRelWeight(_rel._id, 1, null, historyOrder); //[order._id + ""]);
            } // else do nothing
          }
        })
    })
    .then(
      handlePaySuc(res, info.payType),
      handlePayErr(res, info.payType));
};
var handleHongbaoOrder = function (res, info) {
  var order;
  OrderService.commonFindOrderById(OrderService.CONS.TYPE.HONGBAO, info.orderId)
    .then(function (_order) { // 完成交易-记账-订单
      order = _order;
      if (!_order) throw ErrorHandler.getBusinessErrorByCode(8005);
      if (_order.totalValue != info.price) throw ErrorHandler.getBusinessErrorByCode(8005);
      if (_order.payStatus == OrderService.CONS.PAY_STATUS.TO_PAY) { //防止重复记账
        var payTitle = '';
        var incomeTitle = '';
        // 交易明细
        var sqls = TransactionMysqlService.genHongbaoPaymentSqls(_order.customerId + '',
          '',
          info.payType,
          info.price,
          payTitle,
          incomeTitle,
          info.tradeNo,
          info.orderId,
          "红包;");
        console.log('sqls: ', sqls);
        return TransactionMysqlService.execSqls(sqls)
          .then(function () { // 更新订单状态
            // SEND SMS
            //  commonUtil.sendSms("1637254",_order.customerPhoneNum,
            //      "#customer#=" + _order.customerName +
            //      "&#price#=" + _order.totalValue  );
            return OrderService.commonPayOrderById(info.orderId);
          });
      }
    })
    .then(
      handlePaySuc(res, info.payType),
      handlePayErr(res, info.payType));
};

var handleMemberShipOrder = function (res, info) {
  var order;
  OrderService.commonFindOrderById(OrderService.CONS.TYPE.MEMBERSHIP, info.orderId)
    .then(function (_order) { // 完成交易-记账-订单
      order = _order;
      if (!_order) throw ErrorHandler.getBusinessErrorByCode(8005);
      if (_order.price != info.price) throw ErrorHandler.getBusinessErrorByCode(8005);
      if (_order.payStatus == OrderService.CONS.PAY_STATUS.TO_PAY) { //防止重复记账
        var sqls = TransactionMysqlService.genServicePaymentSqls(
          _order.customerId,
          info.payType,
          info.price,
          info.tradeNo || "",
          _order._id + "",
          order.type);
        return TransactionMysqlService.execSqls(sqls)
      }
    })
    .then(function () {
      var newMembership = {
        userId: order.customerId,
        balance: order.serviceValue,
        totalVal: order.serviceValue
      };
      for (var i = 0; i < constants.membershipVals.length; i++) {
        if (order.cardType == constants.membershipVals[i].type) {
          newMembership.cardNo = constants.membershipVals[i].cardNo;
          var expiredTime = constants.membershipVals[i].expired30Days || constants.membershipVals[i].expiredTime
          newMembership.expiredAt = new Date(commonUtil.getDateMidnight(Date.now())).getTime() + expiredTime - 1;
          console.log('充值类型', i, constants.membershipVals[i].type);
          newMembership.type = constants.membershipVals[i].type
          break;
        }
      }
      console.log('会员卡订单', newMembership);
      return MembershipService.createMembership(newMembership);
    })
    .then(function (_membership) {
      var updateData = {
        membershipId: _membership._id,
        payStatus: OrderService.CONS.PAY_STATUS.PAID,
        updatedAt: Date.now()
      };
      return OrderService.updateServiceOrderInfo(order._id, updateData);
    })
    .then(function (order) {
      console.log('membership trade:', order.type);
      if (order.type == 'membership' && order.payStatus == OrderService.CONS.PAY_STATUS.PAID) {
        if (order.cardType == 'city_buy') {
          //生成会员额度生产明细
          var TradeService = Backend.service('1/membership', 'membership_trade');
          var _options = {
            orderId: order._id + '',
            memberships: [{
              membershipId: order.membershipId,
              cardNo: order.cardNo,
              cost: order.serviceValue
            }]
          }
          TradeService.genMembershipTrade(order.customerId, 'buy', order.serviceValue, _options);
        } else {
          var zlycareTradeService = Backend.service('1/zlycare', 'member_trade_service');
          var trade = {
            userId: order.customerId,
            type: 'buy',
            value: order.serviceValue,
            orderId: order._id + '',
            memberships: [{
              membershipId: order.membershipId,
              cardNo: order.cardNo,
              cost: order.serviceValue
            }],
            vipType: order.cardType
          };
          zlycareTradeService.genVipMembershipTrade(trade);

          //如果用户不是第一次购买高级会员,购买金额为298
          //购买高级会员或者vip会员,收藏801010866
          CustomerService.buyMembershipAndFavorite(order.cardType, order.customerId, '801010866');
          commonUtil.sendSms("1907890", order.customerPhoneNum, '', true);
        }
      }
    })
    .then(
      handlePaySuc(res, info.payType),
      handlePayErr(res, info.payType));
};

var handleMarketingOrder = function (res, info) {
  var order;
  var updateData = {};
  OrderService.commonFindOrderById(OrderService.CONS.TYPE.MARKETING, info.orderId)
    .then(function (_order) { // 完成交易-记账-订单
      order = _order;
      if (!_order) throw ErrorHandler.getBusinessErrorByCode(8005);
      if (_order.price != info.price) throw ErrorHandler.getBusinessErrorByCode(8005);
      if (_order.payStatus == OrderService.CONS.PAY_STATUS.TO_PAY) { //防止重复记账
        var sqls = TransactionMysqlService.genServicePaymentSqls(
          _order.customerId,
          info.payType,
          info.price,
          info.tradeNo || '',
          _order._id + "",
          order.type);
        return TransactionMysqlService.execSqls(sqls)
      }
    })
    .then(function () {
      updateData = {
        $inc: {
          "marketing.balance": order.serviceValue,
          "marketing.remainBalance": order.serviceValue,
          "marketing.boughtNum": 1
        }
      };
      return CustomerService.getInfoByID(order.customerId, "marketing")
    })
    .then(function (_user) {
      if (_user.marketing && _user.marketing.cps) {
        var balance = _user.marketing.remainBalance || 0;
        updateData["marketing.remainMemberSize"] = Math.floor((balance + order.serviceValue) / _user.marketing.cps)
      }
      return CustomerService.updateUserById(_user._id, updateData)
    })
    .then(function (_user) {
      if (_user) {
        return OrderService.commonPayOrderById(info.orderId);
      }
    })
    .then(function (_order) {
      if (_order) {
        order = JSON.parse(JSON.stringify(_order));
      }
      if (order.type == 'marketing' && order.payStatus == OrderService.CONS.PAY_STATUS.PAID) {
        //优惠券数量>1 ?充值通知想领券的顾客
        var RemindService = Backend.service("1/city_buy", "remind_send_stamps");
        RemindService.sendMsgToUser(order.customerId);
      }
    })
    .then(
      handlePaySuc(res, info.payType),
      handlePayErr(res, info.payType));
};

var handleServicePackageOrder = function (res, info) {
  console.log('进入支付', info);
  var order;
  var updateData = {};
  servicePackageOrderService.findOrderByOrderIdSample(info.orderId)
    .then(function (_order) { // 完成交易-记账-订单
      order = _order;
      if (!_order) throw ErrorHandler.getBusinessErrorByCode(8005);
      console.log(info.price);
      console.log(_order.mountOfRealPay);
      console.log(_order.orderStatus);
      if (_order.mountOfRealPay != (info.price * 100)) throw ErrorHandler.getBusinessErrorByCode(8005);

      if (_order.orderStatus == 100) { //防止重复记账
        var sqls = TransactionMysqlService.genServicePackagePaymentSqls(
          _order.userId + "",
          info.payType,
          info.price,
          info.tradeNo || '',
          _order.orderId,
          info.type);
        return TransactionMysqlService.execSqls(sqls)
      }
    })
    .then(function () {
      //todo: sms_template
      //2377950 title=医生名 ＋ 服务名
      console.log(order.userPhoneNum, order.doctorName, order.servicePackageName);
      commonUtil.sendSms("2377950", order.userPhoneNum, '#title#=' + order.doctorName + order.servicePackageName);

      return servicePackageOrderService.commonPayOrderById(info.orderId, info.payType, order.duration);
    })
    // 查询医生信息
    .then(function () {
      return ServicePackageDoctorModel.findOne({
        isDeleted: false,
        _id: order.doctorId
      });
    })
    .then(function (_doctor) {
      let dateStr = dateFormat(Date.now(), 'MM月dd日hh时mm分')
      //  如果医生有手机号 给医生发短信
      if (_doctor && _doctor.phone) {
        commonUtil.sendSms("2461524", _doctor.phone,
          '#docname#=' + _doctor.name +
          "&#name#=" + order.userName +
          "&#date#=" + dateStr +
          "&#package#=" + order.servicePackageName
        );
      }
      //支付完成后 成为会员
      if (order.serviceType == 'zs') {
        let vip_member_model = Backend.model('service_package', undefined, 'vip_member');
        return vip_member_model.methods.insertMember(order.userId)
      }
    })
    .then(function () {
      //支付完成后掉用 boss
      let boss_service = Backend.service('boss', 'sp_order');
      return boss_service.spPayAfterSendBoss(order._id + '')
    })
    .then(
      handlePaySuc(res, info.payType),
      handlePayErr(res, info.payType));
};


var handleMakeAppointmentOrder = function (res, info) {
  var order;
  var updateData = {};
  makeAppointmentOrderService.findOrderByOrderIdSample(info.orderId)
    .then(function (_order) { // 完成交易-记账-订单
      order = _order;
      if (!_order) throw ErrorHandler.getBusinessErrorByCode(8005);
      console.log(info);
      console.log(_order.price);
      if (_order.price != info.price * 100) throw ErrorHandler.getBusinessErrorByCode(8005);
      if (_order.status == 100) { //防止重复记账
        var sqls = TransactionMysqlService.genServicePackagePaymentSqls(
          _order.userId + "",
          info.payType,
          info.price,
          info.tradeNo || '',
          _order.orderId,
          info.type);
        return TransactionMysqlService.execSqls(sqls)
      }
    })
    .then(function () {
      console.log('预约支付', order);

      console.log('info信息', info, info.orderId, info.payType);
      return makeAppointmentOrderService.commonPayOrderById(info.orderId, info.payType);
    })
    .then(function (_upmk) {
      console.log('更新预约订单', _upmk);

      return ServicePackageDoctorAssistantRefService.findOneAssistantInfo(order.doctorId + '');
    })
    .then(function (_ass) {
      _ass = _ass;
      console.log('助理信息', _ass[0].assistantInfo);

      if ((_ass.length > 0) && (_ass[0].assistantInfo.length > 0) && (_ass[0].assistantInfo[0].phoneNum)) {
        ServicePackageDoctorAssistantRefService.sendMASms(order.userPhoneNum, order.doctorName, order.orderTime, _ass[0].assistantInfo[0].phoneNum, order.userName);
      } else { //助理信息不存在，就只给用户发送
        ServicePackageDoctorAssistantRefService.sendMASms(order.userPhoneNum, order.doctorName, order.orderTime);
      }
      //return makeAppointmentOrderService.commonPayOrderById(info.orderId, info.payType);       
    })
    .then(
      handlePaySuc(res, info.payType),
      handlePayErr(res, info.payType));
};

var handleTPSERVICE = function (res, info) {
  console.log('进入支付', info);
  var order;
  var updateData = {};
  const tp_service_order_service = Backend.service('tp_memberships', 'service_order');
  const tp_service_order_model = Backend.model('tp_memberships', undefined, 'tp_service_order');
  tp_service_order_model.findOne({
      isDeleted: false,
      orderId: info.orderId
    })
    .then(function (_order) { // 完成交易-记账-订单
      order = _order;
      if (!_order) throw ErrorHandler.getBusinessErrorByCode(8005);
      console.log(_order.price);
      console.log(info.price);
      if (_order.price != (info.price * 100)) throw ErrorHandler.getBusinessErrorByCode(8005);
      if (_order.orderStatus == 100) { //防止重复记账
        var sqls = TransactionMysqlService.genTPSerivceAndCardPaymentSqls(
          _order.userId + "",
          info.payType,
          info.price,
          info.tradeNo || '',
          _order.orderId,
          info.type);
        return TransactionMysqlService.execSqls(sqls)
      }
    })
    .then(function () {
      return tp_service_order_service.pay_serivce_order(info.orderId, info.payType, order.serviceId);
    })
    .then(
      handlePaySuc(res, info.payType),
      handlePayErr(res, info.payType));
};

var handleTPCard = function (res, info) {
  console.log('进入支付', info);
  var order;
  var updateData = {};
  const tp_card_order_service = Backend.service('tp_memberships', 'card_order');
  const tp_card_order_model = Backend.model('tp_memberships', undefined, 'tp_membership_card_order');
  tp_card_order_model.findOne({
      isDeleted: false,
      orderId: info.orderId
    })
    .then(function (_order) { // 完成交易-记账-订单
      order = _order;
      if (!_order) throw ErrorHandler.getBusinessErrorByCode(8005);
      console.log(_order.price);
      console.log(info.price);
      if (_order.price != (info.price * 100)) throw ErrorHandler.getBusinessErrorByCode(8005);
      if (_order.orderStatus == 100) { //防止重复记账
        var sqls = TransactionMysqlService.genTPSerivceAndCardPaymentSqls(
          _order.userId + "",
          info.payType,
          info.price,
          info.tradeNo || '',
          _order.orderId,
          info.type);
        return TransactionMysqlService.execSqls(sqls)
      }
    })
    .then(function () {
      return tp_card_order_service.pay_order(order, info.payType);
    })
    .then(
      handlePaySuc(res, info.payType),
      handlePayErr(res, info.payType));
};

var handleMCSERVICE = function (res, info) {
  console.log('进入支付', info);
  var order;
  var updateData = {};
  const order_service = Backend.service('mc_weapp', 'order');
  const order_model = Backend.model('mc_weapp', undefined, 'mc_order');
  order_model.findOne({
      isDeleted: false,
      orderId: info.orderId
    })
    .then(function (_order) { // 完成交易-记账-订单
      order = _order;
      if (!_order) throw ErrorHandler.getBusinessErrorByCode(8005);
      console.log(_order.price);
      console.log(info.price);
      if (_order.price != (info.price * 100)) throw ErrorHandler.getBusinessErrorByCode(8005);
      if (_order.status == 100) { //防止重复记账
        var sqls = TransactionMysqlService.genMCServicePaymentSqls(
          _order.userId + "",
          info.price,
          info.tradeNo || '',
          _order.orderId, );
        return TransactionMysqlService.execSqls(sqls)
      }
    })
    .then(function () {
      return order_service.pay_order(order);
    })
    .then(
      handlePaySuc(res, info.payType),
      handlePayErr(res, info.payType));
};

var MCACTIVITY = function (res, info) {
  console.log('进入支付', info);
  var order;
  var updateData = {};
  const order_service = Backend.service('mc_weapp', 'price_ctrl_order');;
  const order_model = Backend.model('mc_weapp', undefined, 'mc_activity_order');
  order_model.findOne({
      isDeleted: false,
      orderId: info.orderId
    })
    .then(function (_order) { // 完成交易-记账-订单
      order = _order;
      if (!_order) throw ErrorHandler.getBusinessErrorByCode(8005);
      console.log(_order.price);
      console.log(info.price);
      if (_order.price != (info.price * 100)) throw ErrorHandler.getBusinessErrorByCode(8005);
      if (_order.status == 100) { //防止重复记账
        var sqls = TransactionMysqlService.genMCServicePaymentSqls(
          _order.userId + "",
          info.price,
          info.tradeNo || '',
          _order.orderId, );
        return TransactionMysqlService.execSqls(sqls)
      }
    })
    .then(function () {
      return order_service.payActivitySuccess(order.orderId);
    })
    .then(
      handlePaySuc(res, info.payType),
      handlePayErr(res, info.payType));
};

var MCSCENE = function (res, info) {
  console.log('进入支付', info);
  var order;
  var updateData = {};
  const order_service = Backend.service('mc_weapp', 'price_ctrl_order');
  const order_model = Backend.model('mc_weapp', undefined, 'mc_scene_order');
  order_model.findOne({
      isDeleted: false,
      orderId: info.orderId
    })
    .then(function (_order) { // 完成交易-记账-订单
      order = _order;
      if (!_order) throw ErrorHandler.getBusinessErrorByCode(8005);
      console.log(_order.price);
      console.log(info.price);
      console.log(`${parseInt(_order.price)} ////---//// ${Math.round(info.price * 100,1)} ////---//// ${parseInt(_order.price) != Math.round(info.price * 100,1)}`)
      if (parseInt(_order.price) != Math.round(info.price * 100,1)) throw ErrorHandler.getBusinessErrorByCode(8005);
      if (_order.status == 100) { //防止重复记账
        var sqls = TransactionMysqlService.genMCServicePaymentSqls(
          _order.userId + "",
          info.price,
          info.tradeNo || '',
          _order.orderId, );
        return TransactionMysqlService.execSqls(sqls)
      }
    })
    .then(function () {
      if (order.status == 100 && order.type == 1) {
        //修改order内商品的对应清单的总库存
       return order_service.cutStock(order.orderId);
      }
      return Promise.resolve()
    })
    .then(function () {
      console.log(order.orderId + "看看是否重复！！！！")
      if (order.status == 100) {
        return order_service.paySceneSuccess(order.orderId);
      }
      return Promise.resolve()
    })
    .then(
      handlePaySuc(res, info.payType),
      handlePayErr(res, info.payType));
};

var MCDIRECTOR = function (res, info) {
  console.log('进入支付', info);
  var order;
  var updateData = {};
  const order_service = Backend.service('mc_weapp', 'price_ctrl_order');;
  const order_model = Backend.model('mc_weapp', undefined, 'mc_director_order');
  order_model.findOne({
      isDeleted: false,
      orderId: info.orderId
    })
    .then(function (_order) { // 完成交易-记账-订单
      order = _order;
      if (!_order) throw ErrorHandler.getBusinessErrorByCode(8005);
      console.log(_order.price);
      console.log(info.price);
      if (_order.price != (info.price * 100)) throw ErrorHandler.getBusinessErrorByCode(8005);
      if (_order.status == 100) { //防止重复记账
        var sqls = TransactionMysqlService.genMCServicePaymentSqls(
          _order.userId + "",
          info.price,
          info.tradeNo || '',
          _order.orderId, );
        return TransactionMysqlService.execSqls(sqls)
      }
    })
    .then(function () {
      return order_service.payDirectorSuccess(order.orderId, order.userId);
    })
    .then(
      handlePaySuc(res, info.payType),
      handlePayErr(res, info.payType));
};
var handleMCProduct = function (res, info) {
  console.log('进入支付', info);
  var order;
  var updateData = {};
  const order_service = Backend.service('mc_weapp', 'price_ctrl_order');;
  const order_model = Backend.model('mc_weapp', undefined, 'mc_price_ctrl_member_order');
  order_model.findOne({
      isDeleted: false,
      orderId: info.orderId
    })
    .then(function (_order) { // 完成交易-记账-订单
      order = _order;
      if (!_order) throw ErrorHandler.getBusinessErrorByCode(8005);
      console.log(_order.price);
      console.log(info.price);
      if (_order.price != (info.price * 100)) throw ErrorHandler.getBusinessErrorByCode(8005);
      if (_order.status == 100) { //防止重复记账
        var sqls = TransactionMysqlService.genMCServicePaymentSqls(
          _order.userId + "",
          info.price,
          info.tradeNo || '',
          _order.orderId, );
        return TransactionMysqlService.execSqls(sqls)
      }
    })
    .then(function () {
      return order_service.paySuccess(order.orderId, order.userId, info.price);
    })
    .then(
      handlePaySuc(res, info.payType),
      handlePayErr(res, info.payType));
};

/**
 * 支付订单
 */
var payOrder = function (res, info) {
  var order;
  switch (info.type) { // 订单类型
    case OrderService.CONS.TYPE.AD:
      console.log("Order Type AD");
      // TODO 查询订单
      handleAdOrder(res, info);
      break;
    case OrderService.CONS.TYPE.TRANSFER:
      // TODO
      console.log("Order Type Transfer");
      handleTransferOrder(res, info);
      break;
    case OrderService.CONS.TYPE.HONGBAO:
      // TODO
      console.log("Order Type Hongbao");
      handleHongbaoOrder(res, info);
      break;
    case OrderService.CONS.TYPE.SPU:
      // TODO
      console.log("Err: Order Type SPU");
      break;
    case OrderService.CONS.TYPE.VOIP:
      // TODO
      console.log("Err: Order Type VOIP");
      break;
    case OrderService.CONS.TYPE.MEMBERSHIP:
      console.log("Order Type Membership");
      handleMemberShipOrder(res, info);
      break;
    case OrderService.CONS.TYPE.SERVICEPACKAGE:
      console.log("Order Type SERVICEPACKAGE");
      handleServicePackageOrder(res, info);
      break;
    case OrderService.CONS.TYPE.MAKEAPPOINTMENT:
      console.log("Order Type MAKEAPPOINTMENT");
      handleMakeAppointmentOrder(res, info);
      break;
    case OrderService.CONS.TYPE.TPSERVICE:
      console.log("Order Type TPSERVICE");
      handleTPSERVICE(res, info);
      break;
    case OrderService.CONS.TYPE.TPCARD:
      console.log("Order Type TPCARD");
      handleTPCard(res, info);
      break;
    case OrderService.CONS.TYPE.MCSERVICE:
      console.log("Order Type MCSERVICE");
      handleMCSERVICE(res, info);
      break;
    case OrderService.CONS.TYPE.MCPRODUCT:
      console.log("Order Type handleMCProduct");
      handleMCProduct(res, info);
      break;
    case OrderService.CONS.TYPE.MCDIRECTOR:
      console.log("Order Type MCDIRECTOR");
      MCDIRECTOR(res, info);
      break;
    case OrderService.CONS.TYPE.MCSCENE:
      console.log("Order Type MCSCENE");
      MCSCENE(res, info);
      break;
    case OrderService.CONS.TYPE.MCACTIVITY:
      console.log("Order Type MCACTIVITY");
      MCACTIVITY(res, info);
      break;
    default:
      console.log("Err: UnKnown Order Type " + info.type);
  }
  // 2. 根据不同类型区分处理
  // 3. 记账
};

TransactionController.prototype.payOrder = payOrder;
var payServicePackageOrder = function (trade_no) {
  var info = {
    type: null,
    orderId: null
  };
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
  }
  return info;
}


TransactionController.prototype.authIAP = function (req, res) {

  var payload = req.body;
  var fields = {
    required: ["receipt", 'prepareId']
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var pushObj = {};
  var onSuccess = function (handler, data) {
    var identity = req.identity;
    var appUser = identity ? identity.user : '';
    var appUserId = (identity && identity.userId) ? identity.userId : '';
    var prepareId = data.prepareId || '';
    var order = null;
    var receipt = data.receipt || ''; //The base64 encoded receipt data.
    var password = ''; //Only used for receipts that contain auto-renewable subscriptions. Your app’s shared secret (a hexadecimal string).
    if (!commonUtil.isUUID24bit(appUserId) || !commonUtil.isExist(appUser) || !commonUtil.isUUID24bit(prepareId.replace('tf-', ''))) {
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    //先判断有没有存储
    var hasExists = false;
    var orderType = OrderService.CONS.TYPE.MEMBERSHIP;
    if (prepareId.indexOf(OrderService.CONS.TYPE.MARKETING) > -1) {
      orderType = OrderService.CONS.TYPE.MARKETING;
    }
    OrderService.commonFindOrderById(orderType, null, prepareId)
      .then(function (_order) {
        if (!_order || _order.customerId != appUserId) {
          throw ErrorHandler.getBusinessErrorByCode(8005);
        }
        order = _order;
        if (!_order.receipt) {
          return PayService.authIAP(receipt);
        }
        if (_order.receipt == receipt) {
          hasExists = true;
          return;
        } else {
          console.log('ios iap receipt not match');
          throw ErrorHandler.getBusinessErrorByCode(5005);
        }
      })
      .then(function (_res) {
        if (hasExists) {
          return;
        }
        if (!_res) {
          throw ErrorHandler.getBusinessErrorByCode(8005);
        }

        console.log(_res, typeof _res, _res.status, typeof _res.status);
        var update = {
          updatedAt: Date.now(),
          iapResStatus: _res.status || -10, //
          iapRes: _res
        };
        if ([-1, 0, 21006].indexOf(_res.status) > -1) { //TODO:21006,有效但过期
          var info = {
            orderId: order._id + '',
            price: order.price,
            payType: OrderService.CONS.PAY_TYPES.IOS_IAP,
            type: orderType
          }
          payOrder(res, info);
          update.receipt = receipt;
          return OrderService.updateMembershipOrderInfo(order._id, update);
        } else {
          OrderService.updateMembershipOrderInfo(order._id, update);
          throw ErrorHandler.getBusinessErrorByCode(5004);
        }
      })
      .then(function () {
        apiHandler.OK(res);
      }, function (err) {
        apiHandler.handleErr(res, err);
      });;
  }
  commonUtil.validate(payload, fields, onSuccess, onFailure);
}
module.exports = exports = new TransactionController();