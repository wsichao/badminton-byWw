var
  mysql = require('mysql'),
  ErrorHandler = require('../../lib/ErrorHandler'),
  Q = require("q"),
  util = require("util"),
  Promise = require('promise'),
  constants = require('../configs/constants'),
  configs = require('../configs/server'),
  PayService = require('./PayService');

var connectionPool = mysql.createPool({
  connectionLimit: 10,
  multipleStatements: true,
  acquireTimeout: 1000 * 5,
  host: configs.MYSQL_URL,
  user: configs.MYSQL_DB_USER,
  password: configs.MYSQL_DB_PWD,
  database: configs.MYSQL_DB_NAME,
  port: configs.MYSQL_DB_PORT,
  supportBigNumbers: true//Support bigint or decimal type!
});

var CONS = {
  TRANSACTION_TYPE_RECHARGE: 'recharge', //充值
  TRANSACTION_TYPE_WITHDRAW: 'withdraw', //提现
  TRANSACTION_TYPE_PAY: 'pay', //支出
  TRANSACTION_TYPE_INCOME: 'income',//收入
  TRANSACTION_TYPE_INCOME_AND_PAY: 'incomeAndPay',//收入和支出


  TRANSACTION_SUBTYPE_PAY_FINE: 'fine',//罚款
  TRANSACTION_SUBTYPE_PAY_DC: 'payByDocChat', //患者电话问诊支出（注：2015.12.25之前所有支出都是用的这个subtype）
  // TRANSACTION_SUBTYPE_PAY_EC: 'payByExclusiveDoctor', //患者购买专属医生支出
  TRANSACTION_SUBTYPE_PAY_REFUND: 'payByRefund', //患者申请退款(直接在数据库中操作)
  TRANSACTION_SUBTYPE_PAY_PLATFORM: 'payByplatform', //平台电话问诊补贴
  TRANSACTION_SUBTYPE_PAY_COUPON: 'coupon', //优惠券支出
  TRANSACTION_SUBTYPE_PAY_COUPON_TITLE: '平台补贴优惠券', //优惠券支出

  TRANSACTION_SUBTYPE_DRUG_REIMBURSEMENT : 'drugReimbursement', //药品报销

  TRANSACTION_SUBTYPE_INCOME_TO_PAY: 'toPay', //待支付
  TRANSACTION_SUBTYPE_INCOME_TO_PAY_TITLE: '待支付', //待支付
  TRANSACTION_SUBTYPE_INCOME_PAID: 'paid', //待支付
  TRANSACTION_SUBTYPE_INCOME_PAID_TITLE: '已支付', //待支付

  TRANSACTION_SUBTYPE_PAY_HONGBAO: 'hongbao', // 用户购买动态红包
  TRANSACTION_SUBTYPE_PAY_HONGBAO_TITLE: '红包付款', // 用户购买动态红包
  TRANSACTION_SUBTYPE_INCOME_HONGBAO: 'hongbao', // 用户成功转发动态后,收到红包
  TRANSACTION_SUBTYPE_INCOME_HONGBAO_TITLE: '红包', //
  TRANSACTION_SUBTYPE_PAY_HONGBAO_REFUND: 'hongbaoRefund',
  TRANSACTION_SUBTYPE_PAY_HONGBAO_REFUND_TITLE: '红包退款',
  TRANSACTION_SUBTYPE_INCOME_HONGBAO_REFUND: 'hongbaoRefund',
  TRANSACTION_SUBTYPE_INCOME_HONGBAO_REFUND_TITLE: '红包退款',



  TRANSACTION_SUBTYPE_PAY_AD: 'buyAD', // 用户购买广告位支出
  TRANSACTION_SUBTYPE_PAY_AD_TITLE: '推广竞价', // 用户购买广告位支出
  TRANSACTION_SUBTYPE_INCOME_AD: 'buyAD', // 用户购买广告位支出
  TRANSACTION_SUBTYPE_INCOME_AD_TITLE: '推广收入', // 用户购买广告位支出

  TRANSACTION_SUBTYPE_PAY_MS: 'buyMS', // 用户购买会员额度支出
  TRANSACTION_SUBTYPE_PAY_MS_TITLE: '购买会员额度', // 用户购买会员额度支出
  TRANSACTION_SUBTYPE_INCOME_MS: 'buyMS', // 用户购买会员额度时,平台收入
  TRANSACTION_SUBTYPE_INCOME_MS_TITLE: '平台收入:会员额度', // 用户购买会员额度时,平台收入

  TRANSACTION_SUBTYPE_PAY_SP: 'buySP', // 用户购买服务包支出
  TRANSACTION_SUBTYPE_PAY_SP_TITLE: '购买服务包', // 用户购买服务包支出
  TRANSACTION_SUBTYPE_INCOME_SP: 'buySP', // 用户服务包时,平台收入
  TRANSACTION_SUBTYPE_INCOME_SP_TITLE: '平台收入:服务包', // 用户购买服务包,平台收入

  TRANSACTION_SUBTYPE_PAY_TPS: 'buyTPS', // 用户购买tp服务支出
  TRANSACTION_SUBTYPE_PAY_TPS_TITLE: '购买服务', // 用户购买tp服务支出
  TRANSACTION_SUBTYPE_INCOME_TPS: 'buyTPS', // 用户tp服务时,平台收入
  TRANSACTION_SUBTYPE_INCOME_TPS_TITLE: '平台收入:购买服务', // 用户购买tp服务,平台收入

  TRANSACTION_SUBTYPE_PAY_TPC: 'buyTPC', // 用户购买tp会员支出
  TRANSACTION_SUBTYPE_PAY_TPC_TITLE: '购买会员', // 用户购买tp会员支出
  TRANSACTION_SUBTYPE_INCOME_TPC: 'buyTPC', // 用户tp会员时,平台收入
  TRANSACTION_SUBTYPE_INCOME_TPC_TITLE: '平台收入:购买会员', // 用户购买tp会员,平台收入

  TRANSACTION_SUBTYPE_PAY_MCSERVICE: 'buyMCSERVICE', // 用户购买mc支出
  TRANSACTION_SUBTYPE_PAY_MCSERVICE_TITLE: '购买2030服务订单', // 用户购买mc支出
  TRANSACTION_SUBTYPE_INCOME_MCSERVICE: 'buyMCSERVICE', // 用户mc时,平台收入
  TRANSACTION_SUBTYPE_INCOME_MCSERVICE_TITLE: '平台收入:购买2030服务', // 用户购买mc,平台收入

  TRANSACTION_SUBTYPE_PAY_MA: 'buyMA', // 用户购买预约医生支出
  TRANSACTION_SUBTYPE_PAY_MA_TITLE: '购买预约医生', // 用户购买预约医生支出
  TRANSACTION_SUBTYPE_INCOME_MA: 'buyMA', // 用户服预约医生,平台收入
  TRANSACTION_SUBTYPE_INCOME_MA_TITLE: '平台收入:预约医生', // 用户购买预约医生,平台收入
  //new
  TRANSACTION_SUBTYPE_PAY_MA_REFUND: 'maRefund',
  TRANSACTION_SUBTYPE_PAY_MA_REFUND_TITLE: '预约医生退款',
  TRANSACTION_SUBTYPE_INCOME_MA_REFUND: 'maRefund',
  TRANSACTION_SUBTYPE_INCOME_MA_REFUND_TITLE: '预约医生退款',

  TRANSACTION_SUBTYPE_PAY_MKT: 'buyMKT', // 用户购买商家额度支出
  TRANSACTION_SUBTYPE_PAY_MKT_TITLE: '推广费用', // 用户购买商家额度支出
  TRANSACTION_SUBTYPE_INCOME_MKT: 'buyMKT', // 用户购买商家额度支出,平台收入
  TRANSACTION_SUBTYPE_INCOME_MKT_TITLE: '平台收入:推广费用', // 用户购买商家额度支出,平台收入

  TRANSACTION_SUBTYPE_PAY_TRANS: 'transfer', // 用户给医生转账
  TRANSACTION_SUBTYPE_PAY_TRANS_TITLE: '付款: ', // 用户给医生转账标题
  TRANSACTION_SUBTYPE_INCOME_TRANS: 'transfer', // 医生收到转账
  TRANSACTION_SUBTYPE_INCOME_TRANS_TITLE: '收款: ', // 医生收到转账标题

  TRANSACTION_SUBTYPE_PAY_PRODUCT_COUPON: 'buyCoupon', //用户购买代金券

  TRANSACTION_SUBTYPE_INCOME_PRODUCT_COUPON: 'soldCoupon', //售卖优惠券运营号收入

  TRANSACTION_SUBTYPE_PAY_24GO_REFERRER_REWARD: '24GoReferrerReward', //购买商品的平台补贴
  TRANSACTION_SUBTYPE_PAY_24GO_REFERRER_REWARD_TITLE: '平台补贴推手', //购买商品的平台补贴

  TRANSACTION_SUBTYPE_INCOME_24GO_REFERRER_REWARD: '24GoReferrerReward', //购买商品的推手奖励
  TRANSACTION_SUBTYPE_INCOME_24GO_REFERRER_REWARD_TITLE: '推广收入(全城购)', //购买商品的推手奖励

  TRANSACTION_SUBTYPE_INCOME_COUPON_REWARD: 'couponReward', //购买商品的推手奖励
  TRANSACTION_SUBTYPE_INCOME_COUPON_REWARD_TITLE: '返现', //购买商品的推手奖励

  TRANSACTION_SUBTYPE_INCOME_INVTIER_REWARD: 'inviteReward', //邀请好友,邀请者奖励,
  TRANSACTION_SUBTYPE_INCOME_INVTIER_REWARD_TITLE: '邀请奖励', //邀请好友,邀请者奖励
  TRANSACTION_SUBTYPE_INCOME_INVITEE_REWARD: 'inviteReward', //邀请好友,被邀请者奖励
  TRANSACTION_SUBTYPE_INCOME_INVITEE_REWARD_TITLE: '新用户福利', //邀请好友,被邀请者奖励
  TRANSACTION_SUBTYPE_PAY_INVITE_REWARD: 'inviteReward',
  TRANSACTION_SUBTYPE_PAY_INVITE_REWARD_TITLE: '邀请好友,平台补贴',

  TRANSACTION_SUBTYPE_INCOME_REDPAPER_REWARD: 'redpaperReward',//动态红包,获得奖励
  TRANSACTION_SUBTYPE_PAY_REDPAPER_REWARD: 'redpaperReward',//动态红包,获得奖励

  TRANSACTION_SUBTYPE_INCOME_DC: 'incomeByDocChat', //医生电话问诊收入（注：2015.12.25之后所有收入都是用的这个subtype）
  TRANSACTION_SUBTYPE_INCOME_PLATFORM: 'platformImcomeByDocChat', //平台电话问诊收入（注：2015.12.25之前所有收入都是用的这个subtype）
  TRANSACTION_SUBTYPE_FAVORITED: 'incomeByFavorited', //收藏（医生为正，平台为负）

  TRANSACTION_SUBTYPE_RECHARGE_IAP: 'iap', //支付宝充值
  TRANSACTION_SUBTYPE_RECHARGE_ALI: 'rechargeali', //支付宝充值
  TRANSACTION_SUBTYPE_RECHARGE_WX: 'rechargeWX', //微信充值
  TRANSACTION_SUBTYPE_RECHARGE_BOSS: 'rechargeBoss', //Boss充值
  TRANSACTION_SUBTYPE_RECHARGE_REWARD: 'rechargeReward', //充值奖励，对应type为income
  TRANSACTION_SUBTYPE_RECHARGE_REWARD_TITLE: '充值奖励',

  TRANSACTION_SUBTYPE_WITHDRAW_ALI: 'withdrawali', //支付宝提现
  TRANSACTION_SUBTYPE_RECHARGE_BANK: 'rechargebank', //银联充值
  TRANSACTION_SUBTYPE_WITHDRAW_BANK: 'withdrawbank', //银联提现
  TRANSACTION_SUBTYPE_WITHDRAW_BACK: 'withdrawBack', //提现失败退款
  TRANSACTION_SUBTYPE_RECHARGE_CHANNEL_REWARD: 'rechargeChannelReward', //用户充值渠道奖励
  TRANSACTION_SUBTYPE_RECHARGE_CHANNEL_REWARD_TITLE: '用户充值奖励',//用户充值奖励

  //TRANSACTION_SOURCE_DOCCHAT: "docChat",
  //TRANSACTION_SOURCE_ZLY: "zly",
  TRANSACTION_SOURCE_ZLY_HEALTH: "zly_health", //TODO 以后朱李叶健康钱只要这个source，之前的docchat和zly都不要的

  FAV_REWARD_MAX_NUM: 300, // 收藏奖励的最大次数
  FAV_REWARD_MAX_NUM_PER_DAY: 20, // 每日收藏奖励的最大次数

  TRANSACTION_TYPE_WITHDRAW_SUCCESS_TITLE : '提现(审核已通过)',
  TRANSACTION_TYPE_WITHDRAW_CHECKING_TITLE : '提现(审核中)',
  TRANSACTION_TYPE_WITHDRAW_REJECTED_TITLE : '提现(审核未通过)'
};

var TRANSACTION_DETAILS_TABLE = 'transaction_details';
var TRANSACTION_TYPE_RECHARGE_TITLE = '充值';
var TRANSACTION_TYPE_WITHDRAW_TITLE = '提现';

var TRANSACTION_TYPE_PAY_TITLE = '电话问诊支出';
var TRANSACTION_TYPE_INCOME_TITLE = '电话问诊收入';

var TRANSACTION_SUBTYPE_RECHARGE_ALI_TITLE = '支付宝充值'; //充值
var TRANSACTION_SUBTYPE_WITHDRAW_ALI_TITLE = '支付宝提现'; //提现
var TRANSACTION_SUBTYPE_RECHARGE_BANK_TITLE = '银联充值'; //充值
var TRANSACTION_SUBTYPE_WITHDRAW_BANK_TITLE = '银联提现'; //提现
var TRANSACTION_SUBTYPE_WITHDRAW_BACK_TITLE = '提现失败退款'; //提现失败退款
var TRANSACTION_SUBTYPE_FAVORITED_TITLE = '收藏奖励';//患者收藏奖励

var TRANSACTION_SUBTYPE_FINE_TITLE = '平台罚款';

var that;

var TransactionMysqlService = function () {
  that = this;
};
TransactionMysqlService.prototype.constructor = TransactionMysqlService;

var getConnection = function () {
  var deferred = Q.defer();
  connectionPool.getConnection(function (err, connection) {
    if (err) {
      deferred.reject(err);
    }
    deferred.resolve(connection);
  });
  return deferred.promise;
};

/**
 * mysql promise function
 * @param connection
 * @param sql
 * @returns {*}
 */
var queryPromise = function (connection, sql) {
  var deferred = Q.defer();
  //Better Rule: Only query use timeout!!
  connection.query({sql: sql, timeout: 6000}, function (err, rows, fields) {
    if (err) {
      deferred.reject(err);
    }
    deferred.resolve([rows, fields]);
  });

  return deferred.promise;
};

var updateOnePromise = function (connection, sql) {
  var deferred = Q.defer();

  connection.query(sql, function (err, rows, fields) {
    if (err) {
      deferred.reject(err);
    } else {
      var num = rows.affectedRows;
      if (num === 0) {
        deferred.reject("no row update");
      } else {
        deferred.resolve(num);
      }
    }
  });
  return deferred.promise;
};

var insertPromise = function (connection, sql) {
  var deferred = Q.defer();

  connection.query(sql, function (err, rows, fields) {
    if (err) {
      deferred.reject(err);
    } else {
      var num = rows.affectedRows;
      if (num === 0) {
        deferred.reject("no row insert");
      } else {
        deferred.resolve(num);
      }
    }
  });
  return deferred.promise;
};

var startTransactionPromise = function (connection) {
  var deferred = Q.defer();
  var options = {};
  options.sql = 'START TRANSACTION';
  options.values = null;
  connection.query(options, function (err) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve();
    }

  });
  return deferred.promise;
};

var commit = function (connection) {
  var deferred = Q.defer();
  if (connection) {
    connection.commit(function (err) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve();
      }

    });
  } else {
    deferred.reject();
  }
  return deferred.promise;
};
var rollback = function (connection) {
  var deferred = Q.defer();
  if (connection) {
    connection.rollback(function (err) {
      connection.release();
      if (err) {
        connection.release();
        deferred.reject(err);
      } else {
        deferred.resolve();
      }

    });
  } else {
    deferred.resolve();
  }
  return deferred.promise;
};

/**
 * 获取资金账户,合并同时有customer和doctor的用户  TODO 新版本的朱李叶健康doctorId基本废弃了
 * @param userID
 * @param doctorID
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|r.promise|promise|d.promise}
 */
TransactionMysqlService.prototype.getAccountByUserIdAndDoctorId = function (userID, doctorID) {
  var deferred = Q.defer();
  var now = Date.now();
  var account = {
    amount: 0,  // 总余额
    income: 0,  // 充值(患者)/服务收入(医生)
    payment: 0,  // 服务支出(患者)/提现(医生)
    willIncome: 0 //待入账
  };

  var condition = [userID + '', now];
  var baseSqlStr = "userId = ?";
  if(doctorID){
    condition = [userID + '', doctorID + '', now];
    baseSqlStr = "userId in ( ?, ? )";
  }

  var total_amount_sql = "select sum(cash) as cash from " + TRANSACTION_DETAILS_TABLE + " where " + baseSqlStr + " and subType != '" + CONS.TRANSACTION_SUBTYPE_INCOME_TO_PAY + "' and isDeleted = 0 and ( future < ? OR type = 'withdraw' ) and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "';";
  total_amount_sql = mysql.format(total_amount_sql, condition);

  var total_payment_sql = "select sum(cash) as cash from " + TRANSACTION_DETAILS_TABLE + " where " + baseSqlStr + " and isDeleted = 0 and cash < 0 and (future < ? OR type = 'withdraw' ) and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "';";
  total_payment_sql = mysql.format(total_payment_sql, condition);

  var total_income_sql = "select sum(cash) as cash from " + TRANSACTION_DETAILS_TABLE + " where " + baseSqlStr + " and isDeleted = 0 and cash > 0 and future < ? and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "';";
  total_income_sql = mysql.format(total_income_sql, condition);

  //var total_willIncome_sql = "select sum(cash) as cash from " + TRANSACTION_DETAILS_TABLE + " where " + baseSqlStr + " and subType = '" + CONS.TRANSACTION_SUBTYPE_INCOME_TO_PAY + "' and isDeleted = 0 and cash > 0 and future < ? and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "';";
  //total_willIncome_sql = mysql.format(total_willIncome_sql, condition);

  console.log("sql:" + total_amount_sql);
  console.log("sql:" + total_payment_sql);
  console.log("sql:" + total_income_sql);
  //console.log("sql:" + total_willIncome_sql);

  var _connection = null;
  getConnection()
    .then(function (connection) {
      _connection = connection;
      return queryPromise(connection, total_amount_sql);
    })
    .then(function (results) {
      //console.log("amount:" + util.inspect(results));

      if (results[0][0].cash) {
        account.amount = results[0][0].cash;
      }
      return queryPromise(_connection, total_payment_sql);
    })
    .then(function (results) {
      //console.log("payment:" + util.inspect(results));

      if (results[0][0].cash) {
        account.payment = results[0][0].cash;
      }
      return queryPromise(_connection, total_income_sql);
    })
    .then(function (results) {
      //console.log("payment:" + util.inspect(results));

      if (results[0][0].cash) {
        account.income = results[0][0].cash;
      }
    //  return queryPromise(_connection, total_willIncome_sql);
    //})
    //.then(function (results) {
    //  //console.log("income:" + util.inspect(results));
    //
    //  if (results[0][0].cash) {
    //    account.willIncome = results[0][0].cash;
    //  }

      _connection.release();
      deferred.resolve(account);
    }, function (err) {
      rollback(_connection);
      deferred.reject(err);
    });
  return deferred.promise;
};
/**
 * 获取用户充值sql语句
 * @param userId
 * @param cash
 * @param outerTradeNo
 * @param innerTradeNo
 * @param subType
 */
TransactionMysqlService.prototype.genUserRechargeSql = function (userId,
                                                                 cash,
                                                                 outerTradeNo,
                                                                 innerTradeNo,
                                                                 subType) {
  var _sql = "";

  var insertData = [userId, CONS.TRANSACTION_SOURCE_ZLY_HEALTH, outerTradeNo, cash,
    CONS.TRANSACTION_TYPE_RECHARGE, Date.now(), innerTradeNo || "",
    TRANSACTION_TYPE_RECHARGE_TITLE, subType];
  var sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, source, outerTradeNo, cash, type, createdAt, innerTradeNo, title, subType) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);

  return _sql;
};
TransactionMysqlService.prototype.genFindFavRewardSql = function () {
  var _sql = "";

  var data = [
    CONS.TRANSACTION_SUBTYPE_FAVORITED,
    CONS.TRANSACTION_SOURCE_ZLY_HEALTH,
  ];
  // select userId as fromId, outerTradeNo as userId from  where isDeleted=false and subType = CONS.TRANSACTION_SUBTYPE_FAVORITED
  //  source = 
  var sql = " select userId as fromId, outerTradeNo as userId, createdAt from " + TRANSACTION_DETAILS_TABLE +   
  " where id>431567 and isDeleted=0 and userId !='' and outerTradeNo!= '' and subType=? and source=? order by id asc limit 10000;";
  // 分段执行
  // -- 0
  // -- 126366
  // -- 150308
  // -- 258967
  // -- 281970
  // -- 304285
  // -- 325926
  // -- 347600
  // -- 369224
  // -- 391838
  // -- 414285
  // -- 431567
  _sql += mysql.format(sql, data);

  return _sql;
};
/**
 *
 * @param sqls
 * @param userId
 * @returns {*|promise}
 */
TransactionMysqlService.prototype.execSqls = function (sqls) {
  var deferred = Q.defer();
  var _connection = null;
  var results;
  console.log("Begin exec sqls");
  getConnection()
    .then(function (connection) {
      _connection = connection;
      return startTransactionPromise(connection);
    }).then(function () {
      console.log("sqls: " + sqls);
      return queryPromise(_connection, sqls);
    }).then(function (_results) {
      results = _results;
      console.log("Get results ");
      return commit(_connection);
    }).then(function () {
      _connection.release();
      // }).then(function (account) {
      //console.log("Return sql results ");
      deferred.resolve(results[0]);
    }, function (err) {
      console.log("Error!!! " + err);
      rollback(_connection);
      deferred.reject(err);
    });
  return deferred.promise;
};
/**
 *
 * @param sqls
 * @param userId
 * @returns {*|promise}
 */
TransactionMysqlService.prototype.execSqlAndGetUserAccount = function (sqls, userId,userRefId) {
  var deferred = Q.defer();
  var _connection = null;

  getConnection()
    .then(function (connection) {
      _connection = connection;
      return startTransactionPromise(connection);
    }).then(function () {
      console.log(sqls);
      return queryPromise(_connection, sqls);
    }).then(function (results) {
      return commit(_connection);
    }).then(function () {
      _connection.release();
      return that.getAccountByUserIdAndDoctorId(userId,userRefId);
    }).then(function (account) {
      deferred.resolve(account);
    }, function (err) {
      rollback(_connection);
      deferred.reject(err);
    });
  return deferred.promise;
};
/**
 * 充值
 * @param userId
 * @param userRefId   副账户id
 * @param cash
 * @param outerTradeNo
 * @param innerTradeNo
 * @param subType
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|promise|Q.promise}
 */
TransactionMysqlService.prototype.recharge = function (userId,userRefId, cash, outerTradeNo, innerTradeNo, subType) {
  var error = null;
  var deferred = Q.defer();
  if (cash <= 0) {
    error = ErrorHandler.getBusinessErrorByCode(8005);
    error.detail = "金额小于等于零";
    deferred.reject(error);
    return deferred.promise;
  }

  if (!subType) {
    subType = CONS.TRANSACTION_SUBTYPE_RECHARGE_ALI;
  }
  var _connection = null;

  getConnection()
    .then(function (connection) {
      _connection = connection;
      return startTransactionPromise(connection);
    }).then(function () {
      var _sql = "";
      var insertData = [userId, CONS.TRANSACTION_SOURCE_ZLY_HEALTH, outerTradeNo, cash, CONS.TRANSACTION_TYPE_RECHARGE, Date.now(), innerTradeNo || "", TRANSACTION_TYPE_RECHARGE_TITLE, subType];
      var sql2 = " insert into " + TRANSACTION_DETAILS_TABLE +
        " (userId, source, outerTradeNo, cash, type, createdAt, innerTradeNo, title, subType) " +
        "values( ?, ?, ?, ?, ?, ?, ?, ?, ?);";
      _sql += mysql.format(sql2, insertData);

      console.log(_sql);
      return queryPromise(_connection, _sql);
    }).then(function (results) {
      return commit(_connection);
    }).then(function () {
      _connection.release();
      return that.getAccountByUserIdAndDoctorId(userId,userRefId);
    }).then(function (account) {
      deferred.resolve(account);
    }, function (err) {
      rollback(_connection);
      deferred.reject(err);
    });
  return deferred.promise;
};
/**
 * 获取用户充值奖励的sql语句
 * rewardTo
 *  1. 奖励给渠道
 *  2. 奖励给用户
 * @param userId
 * @param rewardCash
 * @param outerTradeNo
 * @param innerTradeNo
 * @param memo
 * @param source
 * @returns {string}
 */
//TransactionMysqlService.prototype.genUserRechargeRewardSql = function (userId,
//                                                                       rewardCash,
//                                                                       outerTradeNo,
//                                                                       innerTradeNo,
//                                                                       subType,
//                                                                       title,
//                                                                       source,
//                                                                       memo) {
//  var accountId, type, now, _sql = "";
//
//  memo = memo || '';
//  accountId = userId;
//  type = CONS.TRANSACTION_TYPE_INCOME;
//  now = Date.now();
//
//
//  var insertData = [accountId, source, outerTradeNo, rewardCash, type, now,
//    innerTradeNo || "", title, subType, memo];
//  var sql = " insert into " + TRANSACTION_DETAILS_TABLE +
//    " (userId, source, outerTradeNo, cash, type, createdAt, innerTradeNo, title, subType, memo) " +
//    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
//  _sql += mysql.format(sql, insertData);
//
//
//  type = CONS.TRANSACTION_TYPE_PAY;
//
//  if (source == CONS.TRANSACTION_SOURCE_ZLY) {
//    accountId = constants.zlyCouponId;
//  } else {
//    accountId = constants.zlyDocChatId;
//  }
//
//  insertData = [accountId, source, outerTradeNo, -rewardCash, type, now,
//    innerTradeNo || "", title, subType, memo];
//  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
//  " (userId, source, outerTradeNo, cash, type, createdAt, innerTradeNo, title, subType, memo) " +
//  "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
//  _sql += mysql.format(sql, insertData);
//
//  return _sql;
//};

/**
 * 获取用户转账交易明细的sql语句
 * 账单明细
 *  1. 用户充值
 *  2. 用户支出
 *  3. 商家分层 price * 1
 *  4. 如使用优惠券,平台补贴
 * @param userId
 * @param doctorId
 * @param payType 支付类型 
 * @param price
 * @param payTitle
 * @param incomeTitle
 * @param outerTradeNo
 * @param innerTradeNo
 * @param couponDeductedRMB 优惠券抵扣金额
 * @returns {string}
 */
TransactionMysqlService.prototype.genTransferPaymentSqls = function (userId,
                                                              doctorId,
                                                              payType,
                                                              price,
                                                              payTitle,
                                                              incomeTitle,
                                                              outerTradeNo,
                                                              innerTradeNo,
                                                              memo, couponDeductedRMB ) {

  var source, type, now, rechargeType, insertData, sql, _sql = "";

  memo = memo || '';
  source = CONS.TRANSACTION_SOURCE_ZLY_HEALTH;
  now = Date.now();
  couponDeductedRMB = couponDeductedRMB || 0;
  var payPrice = Math.round(price * 100 - couponDeductedRMB * 100) / 100;
  var incomePrice = price;
 var _recharge = function(){
   // TODO 1. 用户充值 payPrice
   insertData = [
     userId,
     CONS.TRANSACTION_TYPE_RECHARGE,
     rechargeType,
     TRANSACTION_TYPE_RECHARGE_TITLE,
     payPrice,
     outerTradeNo,
     innerTradeNo,
     source,
     now,
     memo ];
   sql = " insert into " + TRANSACTION_DETAILS_TABLE +
       " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
       "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
   _sql += mysql.format(sql, insertData);
 }
  if (PayService.CONS.PAY_TYPE.WX == payType) {
    rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_WX;
    _recharge();

  }else if (PayService.CONS.PAY_TYPE.ALI == payType){
    rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_ALI;
    _recharge();

  }else if(PayService.CONS.PAY_TYPE.SYS == payType){
    //do nothing;
  }else{
    rechargeType = "unknown";
  }
  // TODO 2. 用户消费 payPrice
  insertData = [
    userId,
    CONS.TRANSACTION_TYPE_PAY,
    CONS.TRANSACTION_SUBTYPE_PAY_TRANS,
    CONS.TRANSACTION_SUBTYPE_PAY_TRANS_TITLE + payTitle,
    -payPrice,
    outerTradeNo,
    innerTradeNo,
    source,
    now,
    memo ];
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);
  // TODO 3. 医生分层
  insertData = [
    doctorId,
    CONS.TRANSACTION_TYPE_INCOME,
    CONS.TRANSACTION_SUBTYPE_INCOME_TRANS,
    CONS.TRANSACTION_SUBTYPE_INCOME_TRANS_TITLE + incomeTitle,
    incomePrice * 1,
    outerTradeNo,
    innerTradeNo,
    source,
    now,
    memo ];
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);
  if(couponDeductedRMB){
    // TODO 4. 如使用优惠券,平台补贴
    insertData = [
      constants.zlyCouponId,
      CONS.TRANSACTION_TYPE_PAY,
      CONS.TRANSACTION_SUBTYPE_PAY_COUPON,
      CONS.TRANSACTION_SUBTYPE_PAY_COUPON_TITLE,
      -couponDeductedRMB,
      outerTradeNo,
      innerTradeNo,
      source,
      now,
      memo ];
    sql = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
      "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    _sql += mysql.format(sql, insertData);
  }
  return _sql;
};

/**
 * 商家收券
 */
TransactionMysqlService.prototype.genVenderCheckInSqls = function (userId,
                                                              doctorId,
                                                              payType,
                                                              incomeObj,
                                                              customerIncomTitle,
                                                              venderIncomeTitle,
                                                              outerTradeNo,
                                                              innerTradeNo,
                                                              memo ) {

  var source, type, now, rechargeType, insertData, sql, _sql = "";

  memo = memo || '';
  source = CONS.TRANSACTION_SOURCE_ZLY_HEALTH;
  now = Date.now();

  // 用户用代金券支付
  insertData = [
    userId,
    CONS.TRANSACTION_TYPE_PAY,
    CONS.TRANSACTION_SUBTYPE_PAY_TRANS,
    CONS.TRANSACTION_SUBTYPE_PAY_TRANS_TITLE,
    0,
    outerTradeNo,
    innerTradeNo,
    source,
    now,
    memo ];
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);

  // 商家收券的金额
  insertData = [
    doctorId,
    CONS.TRANSACTION_TYPE_INCOME,
    CONS.TRANSACTION_SUBTYPE_INCOME_TRANS,
    CONS.TRANSACTION_SUBTYPE_INCOME_TRANS_TITLE + venderIncomeTitle,
    incomeObj.venderIncome,
    outerTradeNo,
    innerTradeNo,
    source,
    now,
    memo ];
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);

  //平台补贴该代金券
  insertData = [
    constants.zlyCouponId,
    CONS.TRANSACTION_TYPE_PAY,
    CONS.TRANSACTION_SUBTYPE_PAY_COUPON,
    CONS.TRANSACTION_SUBTYPE_PAY_COUPON_TITLE,
    -incomeObj.venderIncome,
    outerTradeNo,
    innerTradeNo,
    source,
    now,
    '商家收券,平台补贴;' ];
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);

  // 用户收取奖励
  if(incomeObj.customerIncome){
    insertData = [
      userId,
      CONS.TRANSACTION_TYPE_INCOME,
      CONS.TRANSACTION_SUBTYPE_INCOME_COUPON_REWARD,
      CONS.TRANSACTION_SUBTYPE_INCOME_COUPON_REWARD_TITLE,
      incomeObj.customerIncome,//支付代金券的金额
      '',
      innerTradeNo,
      source,
      now,
      memo ];
    sql = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
      "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    _sql += mysql.format(sql, insertData);
  }

  if(incomeObj.platformIncome){
    //用户使用商家返利代金券平台补贴
    insertData = [
      constants.rebateAccountId,
      CONS.TRANSACTION_TYPE_PAY,
      CONS.TRANSACTION_SUBTYPE_PAY_COUPON,
      CONS.TRANSACTION_SUBTYPE_PAY_COUPON_TITLE,
      incomeObj.platformIncome,
      outerTradeNo,
      innerTradeNo,
      source,
      now,
      '用券返利;' ];
    sql = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
      "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    _sql += mysql.format(sql, insertData);
  }
  return _sql;
};

/**
 * 获取用户转账交易明细的sql语句,该转帐为购买代金券
 * 账单明细
 *  1. 非余额支付,用户先充值;否则余额支付,不生成充值记录
 *  2. 用户支出
 *  3. 售卖优惠券运营号收入
 *  4. 有服务助理且对服务助理有补偿,服务助理收入,平台补贴
 * @param userId
 * @param doctorId
 * @param payType 支付类型
 * @param price
 * @param payTitle
 * @param incomeTitle
 * @param outerTradeNo
 * @param innerTradeNo
 * @returns {string}
 */
TransactionMysqlService.prototype.genTransferPaymentForVoucherSqls = function (userId,
                                                              merchantId,
                                                              payType,
                                                              price,
                                                              payTitle,
                                                              incomeTitle,
                                                              outerTradeNo,
                                                              innerTradeNo,
                                                              assistantInfo,
                                                              memo,couponDeductedRMB ) {

  var source, type, now, rechargeType, insertData, sql, _sql = "";

  memo = memo || '';
  couponDeductedRMB = couponDeductedRMB || 0;
  var payPrice = Math.round(price * 100 - couponDeductedRMB * 100) / 100;
  var incomePrice = price;
  source = CONS.TRANSACTION_SOURCE_ZLY_HEALTH;
  now = Date.now();

 var _recharge = function(){
   // TODO 1. 用户充值 price
   insertData = [
     userId,
     CONS.TRANSACTION_TYPE_RECHARGE,
     rechargeType,
     TRANSACTION_TYPE_RECHARGE_TITLE,
     payPrice,
     outerTradeNo,
     innerTradeNo,
     source,
     now,
     memo ];
   sql = " insert into " + TRANSACTION_DETAILS_TABLE +
       " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
       "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
   _sql += mysql.format(sql, insertData);
 }
  if (PayService.CONS.PAY_TYPE.WX == payType) {
    rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_WX;
    _recharge();

  }else if (PayService.CONS.PAY_TYPE.ALI == payType){
    rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_ALI;
    _recharge();

  }else if(PayService.CONS.PAY_TYPE.SYS == payType){
    //do nothing;
  }else{
    rechargeType = "unknown";
  }
  // TODO 2. 用户消费 price
  insertData = [
    userId,
    CONS.TRANSACTION_TYPE_PAY,
    CONS.TRANSACTION_SUBTYPE_PAY_TRANS,
    payTitle,
    -payPrice,
    outerTradeNo,
    innerTradeNo,
    source,
    now,
    memo ];
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);
  // TODO 3. 售卖优惠券运营号收入
  insertData = [
    merchantId,
    CONS.TRANSACTION_TYPE_INCOME,
    CONS.TRANSACTION_SUBTYPE_INCOME_TRANS,
    incomeTitle,
    incomePrice * 1,
    outerTradeNo,
    innerTradeNo,
    source,
    now,
    memo ];
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);

  // TODO 4. 有服务助理且对服务助理有补偿
  if(assistantInfo && assistantInfo.productMainId &&  assistantInfo.rewardPrice){
    // TODO 4.1. 服务助理收入
    insertData = [
      assistantInfo.productMainId,
      CONS.TRANSACTION_TYPE_INCOME,
      CONS.TRANSACTION_SUBTYPE_INCOME_24GO_REFERRER_REWARD,
      CONS.TRANSACTION_SUBTYPE_INCOME_24GO_REFERRER_REWARD_TITLE,
      assistantInfo.rewardPrice * 1,
      outerTradeNo,
      innerTradeNo,
      source,
      now,
      memo ];
    sql = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
      "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    _sql += mysql.format(sql, insertData);

    // TODO 4.3. 平台补贴
    insertData = [
      constants.zlyDocChatId,
      CONS.TRANSACTION_TYPE_PAY,
      CONS.TRANSACTION_SUBTYPE_PAY_24GO_REFERRER_REWARD,
      CONS.TRANSACTION_SUBTYPE_PAY_24GO_REFERRER_REWARD_TITLE,
      -assistantInfo.rewardPrice * 1,
      outerTradeNo,
      innerTradeNo,
      source,
      now,
      memo ];
    sql = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
      "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    _sql += mysql.format(sql, insertData);
  }
  //
  if(couponDeductedRMB){
    // TODO 5. 如使用优惠券,平台补贴
    insertData = [
      constants.zlyCouponId,
      CONS.TRANSACTION_TYPE_PAY,
      CONS.TRANSACTION_SUBTYPE_PAY_COUPON,
      CONS.TRANSACTION_SUBTYPE_PAY_COUPON_TITLE,
      -couponDeductedRMB,
      outerTradeNo,
      innerTradeNo,
      source,
      now,
      memo ];
    sql = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
      "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    _sql += mysql.format(sql, insertData);
  }
  return _sql;
};

/**
 * 获取购买红包交易明细的sql语句
 * 账单明细
 *  1. 用户充值
 *  2. 用户支出
 *  3. 平台收入(非即时到账,平台管理用户账务)
 * @param userId
 * @param doctorId
 * @param payType 支付类型
 * @param price
 * @param payTitle
 * @param incomeTitle
 * @param outerTradeNo
 * @param innerTradeNo
 * @returns {string}
 */
TransactionMysqlService.prototype.genHongbaoPaymentSqls = function (userId,
                                                              doctorId,
                                                              payType,
                                                              price,
                                                              payTitle,
                                                              incomeTitle,
                                                              outerTradeNo,
                                                              innerTradeNo,
                                                              memo ) {

  var source, type, now, rechargeType, insertData, sql, _sql = "";

  memo = memo || '';
  source = CONS.TRANSACTION_SOURCE_ZLY_HEALTH;
  now = Date.now();

 var _recharge = function(){
   // TODO 1. 用户充值 price
   insertData = [
     userId,
     CONS.TRANSACTION_TYPE_RECHARGE,
     rechargeType,
     TRANSACTION_TYPE_RECHARGE_TITLE,
     price,
     outerTradeNo,
     innerTradeNo,
     source,
     now,
     memo ];
   sql = " insert into " + TRANSACTION_DETAILS_TABLE +
       " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
       "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
   _sql += mysql.format(sql, insertData);
 }
  if (PayService.CONS.PAY_TYPE.WX == payType) {
    rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_WX;
    _recharge();

  }else if (PayService.CONS.PAY_TYPE.ALI == payType){
    rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_ALI;
    _recharge();

  }else if(PayService.CONS.PAY_TYPE.SYS == payType){
    //do nothing;
  }else{
    rechargeType = "unknown";
  }
  // TODO 2. 用户消费 price
  insertData = [
    userId,
    CONS.TRANSACTION_TYPE_PAY,
    CONS.TRANSACTION_SUBTYPE_PAY_HONGBAO,
    CONS.TRANSACTION_SUBTYPE_PAY_HONGBAO_TITLE,
    -price,
    outerTradeNo,
    innerTradeNo,
    source,
    now,
    memo ];
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);
  //用来财务平账,用户的购买红包的支出,暂由平台收入
  insertData = [
    constants.hongbaoAccountId,
    CONS.TRANSACTION_TYPE_INCOME,
    CONS.TRANSACTION_SUBTYPE_INCOME_HONGBAO,
    CONS.TRANSACTION_SUBTYPE_INCOME_HONGBAO_TITLE,
    price,
    outerTradeNo,
    innerTradeNo,
    source,
    now,
    memo ];
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
      "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);
  return _sql;
};
/**
 * 退返用户的红包--交易明细的sql语句
 * 账单明细
 *  1. 用户收入红包退款
 *  2. 平台支出(非即时到账,平台管理用户账务)
 * @param userId
 * @param price
 * @param outerTradeNo
 * @param innerTradeNo
 * @param isRefunded 是否为退款收入
 * @returns {string}
 */
TransactionMysqlService.prototype.genHongbaoIncomeSqls = function (userId,
                                                              price,
                                                              innerTradeNo,
                                                              memo, isRefunded, option) {

  var source, type, now, rechargeType, insertData, sql, _sql = "";

  memo = memo || '';
  source = CONS.TRANSACTION_SOURCE_ZLY_HEALTH;
  now = Date.now();
  //1.用户收入红包退款 红包-来自于克强...
  var hongbaoTitle = CONS.TRANSACTION_SUBTYPE_INCOME_HONGBAO_TITLE;
  if(option && option.hongbaoFrom){
    hongbaoTitle += '-来自于' + (option.hongbaoFrom.length > 6 ? option.hongbaoFrom.substr(0,6) + '...' : option.hongbaoFrom);
  }
  insertData = [
    userId,
    CONS.TRANSACTION_TYPE_INCOME,
    isRefunded ? CONS.TRANSACTION_SUBTYPE_INCOME_HONGBAO_REFUND : CONS.TRANSACTION_SUBTYPE_INCOME_HONGBAO,
    isRefunded ? CONS.TRANSACTION_SUBTYPE_INCOME_HONGBAO_REFUND_TITLE : hongbaoTitle,
    price,
    '',
    innerTradeNo,
    source,
    now,
    memo ];
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);
  //2.用来财务平账,平台支出
  insertData = [
    constants.hongbaoAccountId,
    CONS.TRANSACTION_TYPE_PAY,
    isRefunded ? CONS.TRANSACTION_SUBTYPE_PAY_HONGBAO_REFUND : CONS.TRANSACTION_SUBTYPE_PAY_HONGBAO,
    isRefunded ? CONS.TRANSACTION_SUBTYPE_PAY_HONGBAO_REFUND_TITLE : hongbaoTitle,
    -price,
    '',
    innerTradeNo,
    source,
    now,
    memo ];
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
      "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);
  console.log('_sql:', _sql);
  return _sql;
};

/**
 * 退返用户的预约医生费用（退回至用户钱包）--交易明细的sql语句
 * 账单明细
 *  1. 用户收入退款
 *  2. 平台支出(非即时到账,平台管理用户账务)
 * @param userId
 * @param price
 * @param outerTradeNo
 * @param innerTradeNo
 * @param isRefunded 是否为退款收入
 * @returns {string}
 */
TransactionMysqlService.prototype.genMAIncomeSqls = function (userId,
                                                                   price,
                                                                   innerTradeNo,
                                                                   memo, option) {

  var source, type, now, rechargeType, insertData, sql, _sql = "";

  memo = memo || '';
  source = CONS.TRANSACTION_SOURCE_ZLY_HEALTH;
  now = Date.now();
  //1.用户收入红包退款 红包-来自于克强...
  var maTitle = CONS.TRANSACTION_SUBTYPE_INCOME_MA_REFUND_TITLE;
  insertData = [
    userId,
    CONS.TRANSACTION_TYPE_INCOME,
    CONS.TRANSACTION_SUBTYPE_INCOME_MA_REFUND,
    CONS.TRANSACTION_SUBTYPE_INCOME_MA_REFUND_TITLE,
    price,
    '',
    innerTradeNo,
    source,
    now,
    memo ];
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);
  //2.用来财务平账,平台支出
  insertData = [
    constants.zlyDocChatId,
    CONS.TRANSACTION_TYPE_PAY,
    CONS.TRANSACTION_SUBTYPE_PAY_MA_REFUND,
    CONS.TRANSACTION_SUBTYPE_PAY_MA_REFUND_TITLE,
    -price,
    '',
    innerTradeNo,
    source,
    now,
    memo ];
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);
  console.log('_sql:', _sql);
  return _sql;
};




/**
 * v4.14抢动态红包--交易明细的sql语句
 * 账单明细
 *  1. 用户收入红包
 *  2. 平台支出(非即时到账,平台管理用户账务)
 * @param userId
 * @param price
 * @param outerTradeNo
 * @param innerTradeNo
 * @returns {string}
 */
TransactionMysqlService.prototype.genMomentRedPaperSqls = function (userId,
                                                                    price,
                                                                    innerTradeNo,
                                                                    memo, isRefunded, option) {

  var source, type, now, rechargeType, insertData, sql, _sql = "";

  memo = memo || '';
  source = CONS.TRANSACTION_SOURCE_ZLY_HEALTH;
  now = Date.now();
  //1.用户收入红包退款 红包-来自于克强...
  var hongbaoTitle = CONS.TRANSACTION_SUBTYPE_INCOME_HONGBAO_TITLE;
  if(option && option.hongbaoFrom){
    hongbaoTitle += '-来自于' + (option.hongbaoFrom.length > 6 ? option.hongbaoFrom.substr(0,6) + '...' : option.hongbaoFrom);
  }
  insertData = [
    userId,
    CONS.TRANSACTION_TYPE_INCOME,
    CONS.TRANSACTION_SUBTYPE_INCOME_REDPAPER_REWARD,
    hongbaoTitle,
    price,
    '',
    innerTradeNo,
    source,
    now,
    memo ];
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);
  //2.用来财务平账,平台支出
  insertData = [
    constants.zlyDocChatId,
    CONS.TRANSACTION_TYPE_PAY,
    CONS.TRANSACTION_SUBTYPE_PAY_REDPAPER_REWARD,
    hongbaoTitle,
    -price,
    '',
    innerTradeNo,
    source,
    now,
    memo ];
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);
  console.log('_sql:', _sql);
  return _sql;
};



//查询交易明细中领取此红包的用户

TransactionMysqlService.prototype.genHongbaoCatchUsersSqls = function (innerTradeNo
                                                                     ) {
  var sql
  sql = " select userId from " + TRANSACTION_DETAILS_TABLE +
      " where innerTradeNo = \""+ innerTradeNo + "\" and type = 'income' and userId <> '1005'";
  return sql;
};

//查询交易明细中领取此红包的用户

TransactionMysqlService.prototype.genHongbaosCatchUsersSqls = function (innerTradeNos
) {
  var innerTradeNosStr = "";
  innerTradeNos.forEach(function(item){
    innerTradeNosStr += '\"' + item + '\"' + ','
  });
  innerTradeNosStr = innerTradeNosStr.substr(0,innerTradeNosStr.length-1);
  var sql
  sql = " select userId , innerTradeNo from " + TRANSACTION_DETAILS_TABLE +
    " where innerTradeNo IN ("+ innerTradeNosStr + ") and type = 'income' and userId <> '1005'";
  return sql;
};



/**
 * 获取用户购买广告位交易明细的sql语句
 * 账单明细
 *  1. 用户充值 (如果是余额支付则不需要)
 *  2. 用户支出
 *  3. 医生收入 price * ratio
 *  4. 平台分层 price * (1-ratio)
 * @param userId
 * @param doctorId
 * @param payType 支付类型 
 * @param price
 * @param ratio 分账比例
 * @param outerTradeNo
 * @param innerTradeNo
 * @returns {string}
 */
TransactionMysqlService.prototype.genAdPaymentSqls = function (userId,
                                                              doctorId,
                                                              payType,
                                                              price,
                                                              ratio,
                                                              outerTradeNo,
                                                              innerTradeNo,
                                                              memo ) {

  var source, type, now, rechargeType, insertData, sql, _sql = "";

  memo = memo || '';
  source = CONS.TRANSACTION_SOURCE_ZLY_HEALTH;
  now = Date.now();

  function recharge (){
    // TODO 1. 用户充值 price
    insertData = [
      userId,
      CONS.TRANSACTION_TYPE_RECHARGE,
      rechargeType,
      TRANSACTION_TYPE_RECHARGE_TITLE,
      price,
      outerTradeNo,
      innerTradeNo,
      source,
      now,
      memo ];
    sql = " insert into " + TRANSACTION_DETAILS_TABLE +
        " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
        "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    _sql += mysql.format(sql, insertData);
  }

  if (PayService.CONS.PAY_TYPE.WX == payType) {
    rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_WX;
    recharge ()
  }else if (PayService.CONS.PAY_TYPE.ALI == payType){
    rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_ALI;
    recharge ()
  }else if(PayService.CONS.PAY_TYPE.SYS == payType){
    //do nothing;
  }else{
    rechargeType = "unknown";
  }


  // TODO 2. 用户消费 price
  insertData = [
    userId,
    CONS.TRANSACTION_TYPE_PAY,
    CONS.TRANSACTION_SUBTYPE_PAY_AD,
    CONS.TRANSACTION_SUBTYPE_PAY_AD_TITLE,
    -price,
    outerTradeNo,
    innerTradeNo,
    source,
    now,
    memo ];
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);
  // TODO 3. 医生分层
  insertData = [
    doctorId,
    CONS.TRANSACTION_TYPE_INCOME,
    CONS.TRANSACTION_SUBTYPE_INCOME_AD,
    CONS.TRANSACTION_SUBTYPE_INCOME_AD_TITLE,
    price * ratio,
    outerTradeNo,
    innerTradeNo,
    source,
    now,
    memo ];
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);
  // TODO 4. 平台分层
  insertData = [
    constants.zlyDocChatId,
    CONS.TRANSACTION_TYPE_INCOME,
    CONS.TRANSACTION_SUBTYPE_INCOME_AD,
    CONS.TRANSACTION_SUBTYPE_INCOME_AD_TITLE,
    price * (1 - ratio),
    outerTradeNo,
    innerTradeNo,
    source,
    now,
    memo ];
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);

  return _sql;
};

/**
 *
 * @param userId 用户id
 * @param payType 支付类型
 * @param price 金额
 * @param outerTradeNo 第三方支付的订单
 * @param innerTradeNo 内部订单id
 * @param type
 * @return {string}
 */
TransactionMysqlService.prototype.genServicePaymentSqls = function (userId,
                                                               payType,
                                                               price,
                                                               outerTradeNo,
                                                               innerTradeNo,
                                                                type) {

    var source, now, rechargeType, insertData, sql, _sql = "";

    source = CONS.TRANSACTION_SOURCE_ZLY_HEALTH;
    now = Date.now();

    function recharge (){
        // TODO 1. 用户充值 price
        insertData = [
            userId,
            CONS.TRANSACTION_TYPE_RECHARGE,
            rechargeType,
            TRANSACTION_TYPE_RECHARGE_TITLE,
            price,
            outerTradeNo,
            innerTradeNo,
            source,
            now ];
        sql = " insert into " + TRANSACTION_DETAILS_TABLE +
            " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt) " +
            "values( ?, ?, ?, ?, ?, ?, ?, ?, ?);";
        _sql += mysql.format(sql, insertData);
    }

    if (PayService.CONS.PAY_TYPE.WX == payType) {
        rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_WX;
        recharge ()
    }else if (PayService.CONS.PAY_TYPE.ALI == payType){
        rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_ALI;
        recharge ()
    }else if (PayService.CONS.PAY_TYPE.IAP == payType){
        rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_IAP;
        recharge ()
    }else if(PayService.CONS.PAY_TYPE.SYS == payType){
        //do nothing;
    }else{
        rechargeType = "unknown";
    }


    // TODO 2. 用户消费 price
    if(type == "membership"){
        insertData = [
            userId,
            CONS.TRANSACTION_TYPE_PAY,
            CONS.TRANSACTION_SUBTYPE_PAY_MS,
            CONS.TRANSACTION_SUBTYPE_PAY_MS_TITLE,
            -price,
            outerTradeNo,
            innerTradeNo,
            source,
            now];
    }else if(type == "marketing"){
        insertData = [
            userId,
            CONS.TRANSACTION_TYPE_PAY,
            CONS.TRANSACTION_SUBTYPE_PAY_MKT,
            CONS.TRANSACTION_SUBTYPE_PAY_MKT_TITLE,
            -price,
            outerTradeNo,
            innerTradeNo,
            source,
            now ];
    }
    // 服务包订单
    // 预约订单
    console.log(insertData);
    sql = " insert into " + TRANSACTION_DETAILS_TABLE +
        " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt) " +
        "values( ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    _sql += mysql.format(sql, insertData);

  //3. 平台收入
  var platIncomeSubType = '', platIncomeTittle = '';
  if(type == "membership"){
    platIncomeSubType = CONS.TRANSACTION_SUBTYPE_INCOME_MS;
    platIncomeTittle = CONS.TRANSACTION_SUBTYPE_INCOME_MS_TITLE;
  }else if(type == "marketing"){
    platIncomeSubType = CONS.TRANSACTION_SUBTYPE_INCOME_MKT;
    platIncomeTittle = CONS.TRANSACTION_SUBTYPE_INCOME_MKT_TITLE;
  }
  if(platIncomeSubType && platIncomeTittle){
    insertData = [
      constants.zlyDocChatId,
      CONS.TRANSACTION_TYPE_INCOME,
      platIncomeSubType,
      platIncomeTittle,
      price,
      outerTradeNo,
      innerTradeNo,
      source,
      now,
      '' ];
    sql = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
      "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  }

  _sql += mysql.format(sql, insertData);
    return _sql;
};

/**
 *
 * @param userId 用户id
 * @param payType 支付类型
 * @param price 金额
 * @param outerTradeNo 第三方支付的订单
 * @param innerTradeNo 内部订单id
 * @param type
 * @return {string}
 */
TransactionMysqlService.prototype.genServicePaymentSqls = function (userId,
                                                                    payType,
                                                                    price,
                                                                    outerTradeNo,
                                                                    innerTradeNo,
                                                                    type) {

  var source, now, rechargeType, insertData, sql, _sql = "";

  source = CONS.TRANSACTION_SOURCE_ZLY_HEALTH;
  now = Date.now();

  function recharge (){
    // TODO 1. 用户充值 price
    insertData = [
      userId,
      CONS.TRANSACTION_TYPE_RECHARGE,
      rechargeType,
      TRANSACTION_TYPE_RECHARGE_TITLE,
      price,
      outerTradeNo,
      innerTradeNo,
      source,
      now ];
    sql = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt) " +
      "values( ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    _sql += mysql.format(sql, insertData);
  }

  if (PayService.CONS.PAY_TYPE.WX == payType) {
    rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_WX;
    recharge ()
  }else if (PayService.CONS.PAY_TYPE.ALI == payType){
    rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_ALI;
    recharge ()
  }else if (PayService.CONS.PAY_TYPE.IAP == payType){
    rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_IAP;
    recharge ()
  }else if(PayService.CONS.PAY_TYPE.SYS == payType){
    //do nothing;
  }else{
    rechargeType = "unknown";
  }


  // TODO 2. 用户消费 price
  if(type == "membership"){
    insertData = [
      userId,
      CONS.TRANSACTION_TYPE_PAY,
      CONS.TRANSACTION_SUBTYPE_PAY_MS,
      CONS.TRANSACTION_SUBTYPE_PAY_MS_TITLE,
      -price,
      outerTradeNo,
      innerTradeNo,
      source,
      now];
  }else if(type == "marketing"){
    insertData = [
      userId,
      CONS.TRANSACTION_TYPE_PAY,
      CONS.TRANSACTION_SUBTYPE_PAY_MKT,
      CONS.TRANSACTION_SUBTYPE_PAY_MKT_TITLE,
      -price,
      outerTradeNo,
      innerTradeNo,
      source,
      now ];
  }
  // 服务包订单
  // 预约订单
  console.log(insertData);
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);

  //3. 平台收入
  var platIncomeSubType = '', platIncomeTittle = '';
  if(type == "membership"){
    platIncomeSubType = CONS.TRANSACTION_SUBTYPE_INCOME_MS;
    platIncomeTittle = CONS.TRANSACTION_SUBTYPE_INCOME_MS_TITLE;
  }else if(type == "marketing"){
    platIncomeSubType = CONS.TRANSACTION_SUBTYPE_INCOME_MKT;
    platIncomeTittle = CONS.TRANSACTION_SUBTYPE_INCOME_MKT_TITLE;
  }
  if(platIncomeSubType && platIncomeTittle){
    insertData = [
      constants.zlyDocChatId,
      CONS.TRANSACTION_TYPE_INCOME,
      platIncomeSubType,
      platIncomeTittle,
      price,
      outerTradeNo,
      innerTradeNo,
      source,
      now,
      '' ];
    sql = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
      "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  }

  _sql += mysql.format(sql, insertData);
  return _sql;
};




/**
 *
 *
 * 服务包、预约订单支付拼装sql
 * @param userId 用户id
 * @param payType 支付类型 （wx-微信 ali-支付宝）
 * @param price 金额
 * @param outerTradeNo 第三方支付的订单
 * @param innerTradeNo 内部订单id
 * @param type 订单类型（sp - 服务包订单 ma - 预约订单）
 * @return {string}
 */
TransactionMysqlService.prototype.genServicePackagePaymentSqls = function (userId,
                                                                    payType,
                                                                    price,
                                                                    outerTradeNo,
                                                                    innerTradeNo,
                                                                    type) {

  var source, now, rechargeType, insertData, sql, _sql = "";
  source = CONS.TRANSACTION_SOURCE_ZLY_HEALTH;
  now = Date.now();

  function recharge (){
    // TODO 1. 用户充值 price
    insertData = [
      userId,
      CONS.TRANSACTION_TYPE_RECHARGE,
      rechargeType,
      TRANSACTION_TYPE_RECHARGE_TITLE,
      price,
      outerTradeNo,
      innerTradeNo,
      source,
      now ];
    sql = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt) " +
      "values( ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    _sql += mysql.format(sql, insertData);
  }

  if (PayService.CONS.PAY_TYPE.WX == payType) {
    rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_WX;
    recharge ()
  }else if (PayService.CONS.PAY_TYPE.ALI == payType){
    rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_ALI;
    recharge ()
  }else if (PayService.CONS.PAY_TYPE.IAP == payType){
    rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_IAP;
    recharge ()
  }else if(PayService.CONS.PAY_TYPE.SYS == payType){
    //do nothing;
  }else{
    rechargeType = "unknown";
  }


  // TODO 2. 用户消费 price
  if(type == "sp"){
    insertData = [
      userId,
      CONS.TRANSACTION_TYPE_PAY,
      CONS.TRANSACTION_SUBTYPE_PAY_SP,
      CONS.TRANSACTION_SUBTYPE_PAY_SP_TITLE,
      -price,
      outerTradeNo,
      innerTradeNo,
      source,
      now];
  }else if(type == "ma"){
    insertData = [
      userId,
      CONS.TRANSACTION_TYPE_PAY,
      CONS.TRANSACTION_SUBTYPE_PAY_MA,
      CONS.TRANSACTION_SUBTYPE_PAY_MA_TITLE,
      -price,
      outerTradeNo,
      innerTradeNo,
      source,
      now ];
  }
  // 服务包订单
  // 预约订单
  console.log(insertData);
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);

  //3. 平台收入
  var platIncomeSubType = '', platIncomeTittle = '';
  if(type == "sp"){
    platIncomeSubType = CONS.TRANSACTION_SUBTYPE_INCOME_SP;
    platIncomeTittle = CONS.TRANSACTION_SUBTYPE_INCOME_SP_TITLE;
  }else if(type == "ma"){
    platIncomeSubType = CONS.TRANSACTION_SUBTYPE_INCOME_MA;
    platIncomeTittle = CONS.TRANSACTION_SUBTYPE_INCOME_MA_TITLE;
  }
  if(platIncomeSubType && platIncomeTittle){
    insertData = [
      constants.zlyDocChatId,
      CONS.TRANSACTION_TYPE_INCOME,
      platIncomeSubType,
      platIncomeTittle,
      price,
      outerTradeNo,
      innerTradeNo,
      source,
      now,
      '' ];
    sql = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
      "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  }

  _sql += mysql.format(sql, insertData);
  return _sql;
};

/**
 *
 *
 * 2030医疗圈支付拼装sql
 * @param userId 用户id
 * @param price 金额
 * @param outerTradeNo 第三方支付的订单
 * @param innerTradeNo 内部订单id
 * @return {string}
 */
TransactionMysqlService.prototype.genMCServicePaymentSqls = function (userId,
  price,
  outerTradeNo,
  innerTradeNo,
) {

var source, now, rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_WX,
 insertData, sql, _sql = "";
source = CONS.TRANSACTION_SOURCE_ZLY_HEALTH;
now = Date.now();

function recharge (){
// TODO 1. 用户充值 price
insertData = [
userId,
CONS.TRANSACTION_TYPE_RECHARGE,
rechargeType,
TRANSACTION_TYPE_RECHARGE_TITLE,
price,
outerTradeNo,
innerTradeNo,
source,
now ];
sql = " insert into " + TRANSACTION_DETAILS_TABLE +
" (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt) " +
"values( ?, ?, ?, ?, ?, ?, ?, ?, ?);";
_sql += mysql.format(sql, insertData);
}
recharge ()


// TODO 2. 用户消费 price
insertData = [
userId,
CONS.TRANSACTION_TYPE_PAY,
CONS.TRANSACTION_SUBTYPE_PAY_MCSERVICE,
CONS.TRANSACTION_SUBTYPE_PAY_MCSERVICE_TITLE,
-price,
outerTradeNo,
innerTradeNo,
source,
now];
sql = " insert into " + TRANSACTION_DETAILS_TABLE +
" (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt) " +
"values( ?, ?, ?, ?, ?, ?, ?, ?, ?);";
_sql += mysql.format(sql, insertData);

//3. 平台收入
var platIncomeSubType = '', platIncomeTittle = '';
platIncomeSubType = CONS.TRANSACTION_SUBTYPE_PAY_MCSERVICE;
platIncomeTittle = CONS.TRANSACTION_SUBTYPE_INCOME_MCSERVICE_TITLE;
if(platIncomeSubType && platIncomeTittle){
insertData = [
constants.zlyDocChatId,
CONS.TRANSACTION_TYPE_INCOME,
platIncomeSubType,
platIncomeTittle,
price,
outerTradeNo,
innerTradeNo,
source,
now,
'' ];
sql = " insert into " + TRANSACTION_DETAILS_TABLE +
" (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
"values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
}

_sql += mysql.format(sql, insertData);
return _sql;
};


/**
 *
 *
 * tp 服务订单 会员订单 支付拼装sql
 * @param userId 用户id
 * @param payType 支付类型 （wx-微信 ali-支付宝）
 * @param price 金额
 * @param outerTradeNo 第三方支付的订单
 * @param innerTradeNo 内部订单id
 * @param type 订单类型（tps - 服务包订单 tpc - 预约订单）
 * @return {string}
 */
TransactionMysqlService.prototype.genTPSerivceAndCardPaymentSqls = function (userId,
  payType,
  price,
  outerTradeNo,
  innerTradeNo,
  type) {

var source, now, rechargeType, insertData, sql, _sql = "";
source = CONS.TRANSACTION_SOURCE_ZLY_HEALTH;
now = Date.now();

function recharge (){
// TODO 1. 用户充值 price
insertData = [
userId,
CONS.TRANSACTION_TYPE_RECHARGE,
rechargeType,
TRANSACTION_TYPE_RECHARGE_TITLE,
price,
outerTradeNo,
innerTradeNo,
source,
now ];
sql = " insert into " + TRANSACTION_DETAILS_TABLE +
" (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt) " +
"values( ?, ?, ?, ?, ?, ?, ?, ?, ?);";
_sql += mysql.format(sql, insertData);
}

if (PayService.CONS.PAY_TYPE.WX == payType) {
rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_WX;
recharge ()
}else if (PayService.CONS.PAY_TYPE.ALI == payType){
rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_ALI;
recharge ()
}else if (PayService.CONS.PAY_TYPE.IAP == payType){
rechargeType = CONS.TRANSACTION_SUBTYPE_RECHARGE_IAP;
recharge ()
}else if(PayService.CONS.PAY_TYPE.SYS == payType){
//do nothing;
}else{
rechargeType = "unknown";
}


// TODO 2. 用户消费 price
if(type == "tps"){
insertData = [
userId,
CONS.TRANSACTION_TYPE_PAY,
CONS.TRANSACTION_SUBTYPE_PAY_TPS,
CONS.TRANSACTION_SUBTYPE_PAY_TPS_TITLE,
-price,
outerTradeNo,
innerTradeNo,
source,
now];
}else if(type == "tpc"){
insertData = [
userId,
CONS.TRANSACTION_TYPE_PAY,
CONS.TRANSACTION_SUBTYPE_PAY_TPC,
CONS.TRANSACTION_SUBTYPE_PAY_TPC_TITLE,
-price,
outerTradeNo,
innerTradeNo,
source,
now ];
}
// 服务包订单
// 预约订单
console.log(insertData);
sql = " insert into " + TRANSACTION_DETAILS_TABLE +
" (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt) " +
"values( ?, ?, ?, ?, ?, ?, ?, ?, ?);";
_sql += mysql.format(sql, insertData);

//3. 平台收入
var platIncomeSubType = '', platIncomeTittle = '';
if(type == "tps"){
platIncomeSubType = CONS.TRANSACTION_SUBTYPE_INCOME_TPS;
platIncomeTittle = CONS.TRANSACTION_SUBTYPE_INCOME_TPS_TITLE;
}else if(type == "tpc"){
platIncomeSubType = CONS.TRANSACTION_SUBTYPE_INCOME_TPC;
platIncomeTittle = CONS.TRANSACTION_SUBTYPE_INCOME_TPC_TITLE;
}
if(platIncomeSubType && platIncomeTittle){
insertData = [
constants.zlyDocChatId,
CONS.TRANSACTION_TYPE_INCOME,
platIncomeSubType,
platIncomeTittle,
price,
outerTradeNo,
innerTradeNo,
source,
now,
'' ];
sql = " insert into " + TRANSACTION_DETAILS_TABLE +
" (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
"values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
}

_sql += mysql.format(sql, insertData);
return _sql;
};




/**
 * 邀请好友,邀请者和被邀请者获取奖励
 * @param inviter 邀请者
 * @param invitee 被邀请者
 * @param inviteReward 邀请奖励
 * @param outerTradeNo
 * @param innerTradeNo 内部订单号:此处为邀请纪录id,inviteRecords表id
 * @returns {string}
 */
TransactionMysqlService.prototype.genInviteRewardSqls = function (inviter, invitee, inviterReward, inviteeReward,
                                                               outerTradeNo,
                                                               innerTradeNo) {

    var source, now, rechargeType, insertData, sql, _sql = "";
    var memo = '邀请有奖,邀请者和被邀请者获取奖励,平台补贴'
    source = CONS.TRANSACTION_SOURCE_ZLY_HEALTH;
    now = Date.now();
  // 用户收取奖励

  if(inviterReward > 0){
    insertData = [
      inviter,
      CONS.TRANSACTION_TYPE_INCOME,
      CONS.TRANSACTION_SUBTYPE_INCOME_INVTIER_REWARD,
      CONS.TRANSACTION_SUBTYPE_INCOME_INVTIER_REWARD_TITLE,
      inviterReward,//支付代金券的金额
      '',
      innerTradeNo || '',
      source,
      now,
      memo ];
    sql = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
      "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    _sql += mysql.format(sql, insertData);

    //平台补贴, 邀请者和被邀请者获取奖励
    insertData = [
      constants.zlyDocChatId,
      CONS.TRANSACTION_TYPE_PAY,
      CONS.TRANSACTION_SUBTYPE_PAY_INVITE_REWARD,
      CONS.TRANSACTION_SUBTYPE_PAY_INVITE_REWARD_TITLE,
      -inviterReward,
      outerTradeNo || '',
      innerTradeNo || '',
      source,
      now,
      memo ];
    sql = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
      "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    _sql += mysql.format(sql, insertData);
  }
  if(inviteeReward > 0){
    insertData = [
      invitee,
      CONS.TRANSACTION_TYPE_INCOME,
      CONS.TRANSACTION_SUBTYPE_INCOME_INVITEE_REWARD,
      CONS.TRANSACTION_SUBTYPE_INCOME_INVITEE_REWARD_TITLE,
      inviteeReward,//支付代金券的金额
      '',
      innerTradeNo || '',
      source,
      now,
      memo ];
    sql = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
      "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    _sql += mysql.format(sql, insertData);

    //平台补贴, 邀请者和被邀请者获取奖励
    insertData = [
      constants.zlyDocChatId,
      CONS.TRANSACTION_TYPE_PAY,
      CONS.TRANSACTION_SUBTYPE_PAY_INVITE_REWARD,
      CONS.TRANSACTION_SUBTYPE_PAY_INVITE_REWARD_TITLE,
      -inviteeReward,
      outerTradeNo || '',
      innerTradeNo || '',
      source,
      now,
      memo ];
    sql = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, type, subType, title, cash, outerTradeNo, innerTradeNo, source, createdAt, memo) " +
      "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    _sql += mysql.format(sql, insertData);
  }
    return _sql;
};

/**
 * 充值给渠道奖励
 * @param channelId
 * @param rewardCash
 * @param tradeNo
 *
 */
//TransactionMysqlService.prototype.channelRechargeReward = function (channelId, rewardCash, outerTradeNo, innerTradeNo) {
//  var error = null;
//  var deferred = Q.defer();
//  if (rewardCash <= 0) {
//    error = ErrorHandler.getBusinessErrorByCode(8005);
//    error.detail = "金额小于等于零";
//    deferred.reject(error);
//    return deferred.promise;
//  }
//
//  var _connection = null;
//
//  getConnection()
//    .then(function (connection) {
//      _connection = connection;
//      return startTransactionPromise(connection);
//    }).then(function () {
//      var _sql = "";
//
//      var insertData = [channelId, CONS.TRANSACTION_SOURCE_ZLY, outerTradeNo, rewardCash, CONS.TRANSACTION_TYPE_INCOME, Date.now(), innerTradeNo || "", CONS.TRANSACTION_SUBTYPE_RECHARGE_CHANNEL_REWARD_TITLE, CONS.TRANSACTION_SUBTYPE_RECHARGE_CHANNEL_REWARD];
//      var sql2 = " insert into " + TRANSACTION_DETAILS_TABLE +
//        " (userId, source, outerTradeNo, cash, type, createdAt, innerTradeNo, title, subType) " +
//        "values( ?, ?, ?, ?, ?, ?, ?, ?, ?);";
//      _sql += mysql.format(sql2, insertData);
//
//
//      var insertData3 = [constants.zlyCouponId, CONS.TRANSACTION_SOURCE_ZLY, outerTradeNo, -rewardCash, CONS.TRANSACTION_TYPE_PAY, Date.now(), innerTradeNo || "", CONS.TRANSACTION_SUBTYPE_RECHARGE_CHANNEL_REWARD_TITLE, CONS.TRANSACTION_SUBTYPE_RECHARGE_CHANNEL_REWARD];
//      var sql3 = " insert into " + TRANSACTION_DETAILS_TABLE +
//        " (userId, source, outerTradeNo, cash, type, createdAt, innerTradeNo, title, subType) " +
//        "values( ?, ?, ?, ?, ?, ?, ?, ?, ?);";
//      _sql += mysql.format(sql3, insertData3);
//
//      console.log(_sql);
//      return queryPromise(_connection, _sql);
//    }).then(function (results) {
//      return commit(_connection);
//    }).then(function () {
//      _connection.release();
//      deferred.resolve();
//    }, function (err) {
//      rollback(_connection);
//      deferred.reject(err);
//    });
//  return deferred.promise;
//};

/**
 * 患者收藏奖励
 * @param docId
 * @param cash
 * @param tradeNo
 * @param memo
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|d.promise|promise|r.promise}
 */
TransactionMysqlService.prototype.incomeByFavorited = function (docId, cash, tradeNo, customerId, memo) {
  var error = null;
  var deferred = Q.defer();
  if (cash <= 0) {
    error = ErrorHandler.getBusinessErrorByCode(8005);
    error.detail = "金额小于等于零";
    deferred.reject(error);
    return deferred.promise;
  }

  var _connection = null;
  var isInsert = false;
  var dateFormat = new Date(Date.now()).format("yyyy-MM-dd 00:00:00");
  var today = new Date(dateFormat).getTime();

  getConnection()
    .then(function (connection) {
      _connection = connection;
      return startTransactionPromise(connection);
    })
    .then(function () {
      // 该用户是否有过关注奖励
      var updateData = [customerId, CONS.TRANSACTION_SUBTYPE_FAVORITED];
      var sql = " select count(*) as count from " + TRANSACTION_DETAILS_TABLE +
        " WHERE isDeleted = 0 and outerTradeNo = ? and subType = ? and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "' ORDER BY createdAt desc;";
      var _sql = mysql.format(sql, updateData);
      // 该医生共有多少奖励记录
      updateData = [docId, CONS.TRANSACTION_SUBTYPE_FAVORITED];
      sql = " select count(*) as count  from " + TRANSACTION_DETAILS_TABLE +
      " WHERE isDeleted = 0 and userId = ? and subType = ? and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "';";
      _sql += mysql.format(sql, updateData);
      // 该医生今天共有多少奖励记录
      updateData = [docId, CONS.TRANSACTION_SUBTYPE_FAVORITED];
      sql = " select count(*) as count  from " + TRANSACTION_DETAILS_TABLE +
      " WHERE isDeleted = 0 and userId = ? and subType = ? and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "' and createdAt >= " + today + ";";
      _sql += mysql.format(sql, updateData);

      console.log(_sql);
      return queryPromise(_connection, _sql);
    }).then(function (results) {
      if (results && results[0] && results[0][0] && results[0][0][0]) {
        console.log(results[0][0][0].count);
      }
      if (results && results[0] && results[0][1] && results[0][1][0]) {
        console.log(results[0][1][0].count);
      }
      if (results && results[0] && results[0][2] && results[0][2][0]) {
        console.log(results[0][2][0].count);
      }

      if (results && results[0] && results[0][0] && results[0][0][0] && (results[0][0][0].count > 0)) {  //不是新用户(每个用户只能给医生一次奖励)
        return;
      } else if (results && results[0] && results[0][1] && results[0][1][0] && (results[0][1][0].count >= CONS.FAV_REWARD_MAX_NUM)) {  //医生已经获得500次收藏奖励
        return;
      } else if (results && results[0] && results[0][2] && results[0][2][0] && (results[0][2][0].count >= CONS.FAV_REWARD_MAX_NUM_PER_DAY)) {  //医生已经获得500次收藏奖励
        return;
      }
      isInsert = true;

      var _sql = "";
      var insertData = [docId, CONS.TRANSACTION_SOURCE_ZLY_HEALTH, tradeNo, cash, CONS.TRANSACTION_TYPE_INCOME, Date.now(), customerId, TRANSACTION_SUBTYPE_FAVORITED_TITLE, CONS.TRANSACTION_SUBTYPE_FAVORITED, memo];
      var sql2 = " insert into " + TRANSACTION_DETAILS_TABLE +
        " (userId, source, innerTradeNo, cash, type, createdAt,outerTradeNo , title, subType, memo) " +
        "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
      _sql += mysql.format(sql2, insertData);

      var insertData3 = [constants.zlyDocChatId, CONS.TRANSACTION_SOURCE_ZLY_HEALTH, tradeNo, -cash, CONS.TRANSACTION_TYPE_PAY, Date.now(), "", TRANSACTION_SUBTYPE_FAVORITED_TITLE, CONS.TRANSACTION_SUBTYPE_FAVORITED, memo];
      var sql3 = " insert into " + TRANSACTION_DETAILS_TABLE +
        " (userId, source, innerTradeNo, cash, type, createdAt, outerTradeNo, title, subType, memo) " +
        "values( ?, ?, ?, ?, ?, ?, ?,?,?,?);";
      _sql += mysql.format(sql3, insertData3);

      console.log(_sql);
      return queryPromise(_connection, _sql);
    }).then(function (results) {
      return commit(_connection);
    }).then(function () {
      _connection.release();
      deferred.resolve(isInsert);
    }, function (err) {
      console.log("----------->>>>>>incomeByFavorited err:" + util.stringify(err));
      rollback(_connection);
      deferred.reject(err);
    });
  return deferred.promise;
};
/**
 * 提现
 * @param userId
 * @param cash
 * @param outerTradeNo
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|promise|Q.promise}
 */
TransactionMysqlService.prototype.withdraw = function (userId,userRefId, cash, innerTradeNo, subType) {
  var deferred = Q.defer();
  var _connection = null;

  if (!subType) {
    subType = CONS.TRANSACTION_SUBTYPE_WITHDRAW_ALI;
  }

  that.getAccountByUserIdAndDoctorId(userId,userRefId).then(function (account) {
    if (account.amount < cash) {
      throw ErrorHandler.getBusinessErrorByCode(1519);
    }
    return getConnection();
  }).then(function (connection) {
    _connection = connection;
    return startTransactionPromise(connection);
  }).then(function () {
    var nowTS = Date.now(),
        future = nowTS + constants.TIME1Y;
    var insertData = [userId, CONS.TRANSACTION_SOURCE_ZLY_HEALTH, "", -cash, CONS.TRANSACTION_TYPE_WITHDRAW,
      nowTS, innerTradeNo, CONS.TRANSACTION_TYPE_WITHDRAW_CHECKING_TITLE, subType, future];
    var sql2 = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, source, outerTradeNo, cash, type, createdAt, innerTradeNo, title, subType, future) " +
      "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    var _sql = mysql.format(sql2, insertData);

    console.log(_sql);
    return queryPromise(_connection, _sql);
  }).then(function (results) {
    return commit(_connection);
  }).then(function (results) {
    _connection.release();
    deferred.resolve();
  }, function (err) {
    rollback(_connection);
    deferred.reject(err);
  });
  return deferred.promise;
};

/**
 * 获取提现/充值/消费/收入纪录
 * @param conditions
 * @param fields
 * @param page
 * @returns {*|Promise|Array|{index: number, input: string}}
 */
TransactionMysqlService.prototype.getTransactionsByUserId = function (userID, type, pagestart, pageNum) {
  var deferred = Q.defer();
  var typeCondition = " ";

  if (type) {
    switch (type) {
      case CONS.TRANSACTION_TYPE_RECHARGE:
        typeCondition = " and type = '" + CONS.TRANSACTION_TYPE_RECHARGE + "' ";
        break;
      case CONS.TRANSACTION_TYPE_WITHDRAW:
        typeCondition = " and type = '" + CONS.TRANSACTION_TYPE_WITHDRAW + "' ";
        break;
      case CONS.TRANSACTION_TYPE_PAY:
        typeCondition = " and (type = '" + CONS.TRANSACTION_TYPE_PAY + "' or type = '" + CONS.TRANSACTION_TYPE_WITHDRAW + "') ";
        break;
      case CONS.TRANSACTION_TYPE_INCOME:
        typeCondition = " and (type = '" + CONS.TRANSACTION_TYPE_INCOME + "' or type = '" + CONS.TRANSACTION_TYPE_RECHARGE + "') ";
        break;
      default :
        break;
    }
  }

  var _connection = null;
  getConnection().then(function (connection) {
    _connection = connection;
    var updateData = [userID, pagestart, pageNum];

    var sql1 = " select outerTradeNo , innerTradeNo, userId, cash, type, createdAt, title, subType, future, memo from " + TRANSACTION_DETAILS_TABLE +
      " WHERE isDeleted = 0 and userId =?  and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "' " + typeCondition + " ORDER BY createdAt desc limit ? , ? ;";
    var _sql = mysql.format(sql1, updateData);
    console.log(_sql);
    return queryPromise(_connection, _sql);
  }).then(function (results) {
    for (var i = 0; i < results[0].length; i++) {
      if (results[0][i].subType === CONS.TRANSACTION_SUBTYPE_RECHARGE_ALI) {
        results[0][i].memo = TRANSACTION_SUBTYPE_RECHARGE_ALI_TITLE;
      }
      if (results[0][i].subType === CONS.TRANSACTION_SUBTYPE_WITHDRAW_ALI) {
        results[0][i].memo = TRANSACTION_SUBTYPE_WITHDRAW_ALI_TITLE;
      }
      if (results[0][i].subType === CONS.TRANSACTION_SUBTYPE_RECHARGE_BANK) {
        results[0][i].memo = TRANSACTION_SUBTYPE_RECHARGE_BANK_TITLE;
      }
      if (results[0][i].subType === CONS.TRANSACTION_SUBTYPE_WITHDRAW_BANK) {
        results[0][i].memo = TRANSACTION_SUBTYPE_WITHDRAW_BANK_TITLE;
      }
      if (results[0][i].subType === CONS.TRANSACTION_SUBTYPE_WITHDRAW_BACK) {
        results[0][i].memo = TRANSACTION_SUBTYPE_WITHDRAW_BACK_TITLE;
      }
      if (!results[0][i].subType) {
        results[0][i].memo = results[0][i].title;
        //results[0][i].subType = results[0][i].type;
        //results[0][i].innerTradeNo = results[0][i].outerTradeNo;
      }
      //if (results[0][i].future > Date.now()) { //TODO 可以不要
      //  results[0][i].title = results[0][i].title + "(即将到账)";
      //}
    }

    _connection.release();
    deferred.resolve(results[0]);
  });
  return deferred.promise;
};

/**
 * 获取提现/充值/消费/收入纪录 用户同时有customer和doctor
 * @param conditions
 * @param fields
 * @param page
 * @returns {*|Promise|Array|{index: number, input: string}}
 */
TransactionMysqlService.prototype.getTransactionsByUserIdAndDoctorId = function (userID, doctorID, type, pagestart, pageNum) {
  var deferred = Q.defer();
  var typeCondition = " ";
  var selectFields = "";

  if (type) {
    switch (type) {
      case CONS.TRANSACTION_TYPE_INCOME_AND_PAY:
        var incomeTypeCond = " and (((type = '" + CONS.TRANSACTION_TYPE_INCOME + "' or type = '" + CONS.TRANSACTION_TYPE_RECHARGE + "') " +
          " and subType != '" + CONS.TRANSACTION_SUBTYPE_INCOME_TO_PAY + "' and subType != '" + CONS.TRANSACTION_SUBTYPE_INCOME_PAID + "')";
        var payTypeCond = " or (type = '" + CONS.TRANSACTION_TYPE_PAY + "' or type = '" + CONS.TRANSACTION_TYPE_WITHDRAW + "')) ";
        typeCondition = incomeTypeCond + payTypeCond;
        console.log(typeCondition);
        break;
      case CONS.TRANSACTION_TYPE_RECHARGE:
        typeCondition = " and type = '" + CONS.TRANSACTION_TYPE_RECHARGE + "' ";
        break;
      case CONS.TRANSACTION_TYPE_WITHDRAW:
        typeCondition = " and type = '" + CONS.TRANSACTION_TYPE_WITHDRAW + "' ";
        break;
      case CONS.TRANSACTION_TYPE_PAY:
        typeCondition = " and (type = '" + CONS.TRANSACTION_TYPE_PAY + "' or type = '" + CONS.TRANSACTION_TYPE_WITHDRAW + "') ";
        break;
      case CONS.TRANSACTION_TYPE_INCOME:
        typeCondition = " and (type = '" + CONS.TRANSACTION_TYPE_INCOME + "' or type = '" + CONS.TRANSACTION_TYPE_RECHARGE + "') " + " and subType != '" + CONS.TRANSACTION_SUBTYPE_INCOME_TO_PAY + "' and subType != '" + CONS.TRANSACTION_SUBTYPE_INCOME_PAID + "'";
        break;
      default :
        break;
    }
  }

  var _connection = null;
  getConnection().then(function (connection) {
    _connection = connection;
    var updateData = [userID, pagestart, pageNum];
    var userSqlStr = "userId =?";
    if(doctorID){
      updateData = [userID, doctorID, pagestart, pageNum];
      userSqlStr = "(userId in ( ?, ?))";
    }
    var sql1 = " select outerTradeNo , innerTradeNo, userId, cash + abs(cashToPay) as cash , type, createdAt, title, subType, future, memo, (case when cashToPay < 0 then 0 else cashToPay end) as willIncome from " + TRANSACTION_DETAILS_TABLE +
      " WHERE isDeleted = 0 and " + userSqlStr + " and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "' " + typeCondition + " ORDER BY createdAt desc , id desc limit ? , ? ;";
    var _sql = mysql.format(sql1, updateData);
    console.log(_sql);
    return queryPromise(_connection, _sql);
  }).then(function (results) {
    for (var i = 0; i < results[0].length; i++) {
      if (results[0][i].subType === CONS.TRANSACTION_SUBTYPE_RECHARGE_ALI) {
        results[0][i].memo = TRANSACTION_SUBTYPE_RECHARGE_ALI_TITLE;
      }
      if (results[0][i].subType === CONS.TRANSACTION_SUBTYPE_WITHDRAW_ALI) {
        results[0][i].memo = TRANSACTION_SUBTYPE_WITHDRAW_ALI_TITLE;
      }
      if (results[0][i].subType === CONS.TRANSACTION_SUBTYPE_RECHARGE_BANK) {
        results[0][i].memo = TRANSACTION_SUBTYPE_RECHARGE_BANK_TITLE;
      }
      if (results[0][i].subType === CONS.TRANSACTION_SUBTYPE_WITHDRAW_BANK) {
        results[0][i].memo = TRANSACTION_SUBTYPE_WITHDRAW_BANK_TITLE;
      }
      if (results[0][i].subType === CONS.TRANSACTION_SUBTYPE_WITHDRAW_BACK) {
        results[0][i].memo = TRANSACTION_SUBTYPE_WITHDRAW_BACK_TITLE;
      }
      if (!results[0][i].subType) {
        results[0][i].memo = results[0][i].title;
        //results[0][i].subType = results[0][i].type;
        //results[0][i].innerTradeNo = results[0][i].outerTradeNo;
      }
      //if (results[0][i].future > Date.now()) { //TODO 可以不要
        //results[0][i].title = results[0][i].title + "(即将到账)";
      //}
    }

    _connection.release();
    deferred.resolve(results[0]);
  });
  return deferred.promise;
};
/**
 * 获取患者累计充值/医生累计收入/患者累计实际支出
 * @param type
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|d.promise|promise|r.promise}
 */
TransactionMysqlService.prototype.getExpiryDateTransactionsSum = function (type, expiryDate) {
  var deferred = Q.defer();
  var typeCondition = " ";

  if (type) {
    switch (type) {
      case CONS.TRANSACTION_TYPE_RECHARGE:
        typeCondition = " and type = '" + CONS.TRANSACTION_TYPE_RECHARGE + "' ";
        break;
      case CONS.TRANSACTION_SUBTYPE_INCOME_DC://医生收入统计(由于数据遗留问题，所有不是直接使用subtype判断)
        typeCondition = " and userId != '" + constants.zlyDocChatId + "' and userId != '" + constants.zlyCouponId + "' and (subType = '" + CONS.TRANSACTION_SUBTYPE_INCOME_DC + "' or subType = '" + CONS.TRANSACTION_SUBTYPE_INCOME_PLATFORM + "' or subType = '" + CONS.TRANSACTION_SUBTYPE_FAVORITED + "') ";
        break;
      case CONS.TRANSACTION_SUBTYPE_PAY_DC: //只统计患者的支出(由于数据遗留问题，所有不是直接使用subtype判断)
        typeCondition = " and userId != '" + constants.zlyDocChatId + "' and userId != '" + constants.zlyCouponId + "' and type = '" + CONS.TRANSACTION_TYPE_PAY + "' ";
      default :
        break;
    }
  }

  var _connection = null;
  getConnection().then(function (connection) {
    _connection = connection;

    var _sql = " select sum(cash) as cash from " + TRANSACTION_DETAILS_TABLE +
      " WHERE isDeleted = 0 and createdAt <= " + expiryDate + " and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "' " + typeCondition + ";";
    console.log(_sql);

    return queryPromise(_connection, _sql);
  }).then(function (results) {
    _connection.release();
    deferred.resolve(results[0]);
  }, function (err) {
    rollback(_connection);
    deferred.reject(err);
  });

  return deferred.promise;
};
/**
 * 获取大于某一时间患者累计充值/医生累计收入/患者累计实际支出
 * @param type
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|d.promise|promise|r.promise}
 */
TransactionMysqlService.prototype.getGTDateTransactionsSum = function (type, gtDate) {
  var deferred = Q.defer();
  var typeCondition = " ";

  if (type) {
    switch (type) {
      case CONS.TRANSACTION_TYPE_RECHARGE:
        typeCondition = " and type = '" + CONS.TRANSACTION_TYPE_RECHARGE + "' ";
        break;
      case CONS.TRANSACTION_SUBTYPE_INCOME_DC://医生收入统计(由于数据遗留问题，所有不是直接使用subtype判断)
        typeCondition = " and userId != '" + constants.zlyDocChatId + "' and userId != '" + constants.zlyCouponId + "' and (subType = '" + CONS.TRANSACTION_SUBTYPE_INCOME_DC + "' or subType = '" + CONS.TRANSACTION_SUBTYPE_INCOME_PLATFORM + "' or subType = '" + CONS.TRANSACTION_SUBTYPE_FAVORITED + "') ";
        break;
      case CONS.TRANSACTION_SUBTYPE_PAY_DC: //只统计患者的支出(由于数据遗留问题，所有不是直接使用subtype判断)
        typeCondition = " and userId != '" + constants.zlyDocChatId + "' and userId != '" + constants.zlyCouponId + "' and type = '" + CONS.TRANSACTION_TYPE_PAY + "' ";
      default :
        break;
    }
  }

  var _connection = null;
  getConnection().then(function (connection) {
    _connection = connection;

    var _sql = " select sum(cash) as cash from " + TRANSACTION_DETAILS_TABLE +
      " WHERE isDeleted = 0 and createdAt > " + gtDate + " and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "' " + typeCondition + ";";
    console.log(_sql);

    return queryPromise(_connection, _sql);
  }).then(function (results) {
    _connection.release();
    deferred.resolve(results[0]);
  }, function (err) {
    rollback(_connection);
    deferred.reject(err);
  });

  return deferred.promise;
};
/**
 * 用innerTradeNo查找交易记录
 * @param tradeNo
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|promise|Q.promise}
 */
TransactionMysqlService.prototype.getTransactionByInnerTradeNo = function (innerTradeNo) {
  var _connection = null;
  var deferred = Q.defer();

  getConnection().then(function (connection) {
    _connection = connection;

    var updateData = [innerTradeNo];
    var sql1 = " select * from " + TRANSACTION_DETAILS_TABLE +
      " WHERE isDeleted = 0 and innerTradeNo = ? and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "' ORDER BY createdAt desc;";
    var _sql = mysql.format(sql1, updateData);

    console.log(_sql);
    return queryPromise(_connection, _sql);
  }).then(function (results) {
    _connection.release();
    deferred.resolve(results[0]);
  });
  return deferred.promise;
};

TransactionMysqlService.prototype.getToPayTrxs = function (calleeUserId) {
  var _connection = null;
  var deferred = Q.defer();

  getConnection().then(function (connection) {
    _connection = connection;

    var updateData = [calleeUserId];
    var sql1 = "select  innerTradeNo from " + TRANSACTION_DETAILS_TABLE +
        " WHERE isDeleted = 0 and userId = ? and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH
        + "' and type = '" + CONS.TRANSACTION_TYPE_INCOME + "' and subType = '" + CONS.TRANSACTION_SUBTYPE_INCOME_TO_PAY + "' ORDER BY createdAt desc limit 1;";
    var _sql = mysql.format(sql1, updateData);
    console.log(_sql);
    return queryPromise(_connection, _sql);
  }).then(function (results) {
    _connection.release();
    deferred.resolve(results[0]);
  });
  return deferred.promise;
};
/**
 * 用outerTradeNo查找交易记录
 * @param outerTradeNo
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|promise|Q.promise}
 */
TransactionMysqlService.prototype.getTransactionByOuterTradeNo = function (outerTradeNo) {
  var _connection = null;
  var deferred = Q.defer();

  getConnection().then(function (connection) {
    _connection = connection;

    var updateData = [outerTradeNo];
    var sql1 = " select * from " + TRANSACTION_DETAILS_TABLE +
      " WHERE isDeleted = 0 and outerTradeNo = ? and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "' ORDER BY createdAt desc;";
    var _sql = mysql.format(sql1, updateData);

    console.log(_sql);
    return queryPromise(_connection, _sql);
  }).then(function (results) {
    _connection.release();
    deferred.resolve(results[0]);
  });
  return deferred.promise;
};
/**
 * 通话结束后分账（返回分账后患者的账户信息）
 * @param customerId
 * @param doctorId
 * @param customerCash
 * @param doctorCash
 * @param orderId
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|r.promise|promise|d.promise}
 */
TransactionMysqlService.prototype.distribute = function (customerId, customerRefId,doctorId, customerCash, doctorCash, couponDeductedRMB, orderId, customerTransactionTitle, doctorTransactionTitle) {
  var deferred = Q.defer();
  var _connection = null;

  getConnection()
    .then(function (connection) {
      _connection = connection;
      return startTransactionPromise(connection);
    }).then(function () {
      var _sql = "";
      //患者扣钱
      var insertData1 = [customerId, CONS.TRANSACTION_SOURCE_ZLY_HEALTH, orderId, -customerCash, CONS.TRANSACTION_TYPE_PAY, Date.now(), customerTransactionTitle, CONS.TRANSACTION_SUBTYPE_PAY_DC, ""];
      var sql1 = " insert into " + TRANSACTION_DETAILS_TABLE +
        " (userId, source,innerTradeNo, cash, type, createdAt, title,subType,outerTradeNo) " +
        "values( ?, ?, ?, ?, ?, ?, ?,?,?);";
      _sql += mysql.format(sql1, insertData1);
      //医生收钱
      var insertData2 = [doctorId, CONS.TRANSACTION_SOURCE_ZLY_HEALTH, orderId, doctorCash, CONS.TRANSACTION_TYPE_INCOME, Date.now(), doctorTransactionTitle, CONS.TRANSACTION_SUBTYPE_INCOME_DC, ""];
      var sql2 = " insert into " + TRANSACTION_DETAILS_TABLE +
        " (userId, source,innerTradeNo, cash, type, createdAt, title,subType,outerTradeNo) " +
        "values( ?, ?, ?, ?, ?, ?, ?,?,?);";
      _sql += mysql.format(sql2, insertData2);

      //平台收入
      var platformCash = (customerCash * 100 + couponDeductedRMB * 100 - doctorCash * 100) / 100;
      if (platformCash != 0) {
        var type = platformCash > 0 ? CONS.TRANSACTION_TYPE_INCOME : CONS.TRANSACTION_TYPE_PAY;
        var title = platformCash > 0 ? TRANSACTION_TYPE_INCOME_TITLE : TRANSACTION_TYPE_PAY_TITLE;
        var subType = platformCash > 0 ? CONS.TRANSACTION_SUBTYPE_INCOME_PLATFORM : CONS.TRANSACTION_SUBTYPE_PAY_PLATFORM;

        var insertData3 = [constants.zlyDocChatId, CONS.TRANSACTION_SOURCE_ZLY_HEALTH, orderId, platformCash, type, Date.now(), title, subType, ""];
        var sql3 = " insert into " + TRANSACTION_DETAILS_TABLE +
          " (userId, source, innerTradeNo, cash, type, createdAt, title, subType, outerTradeNo) " +
          "values( ?, ?, ?, ?, ?, ?, ?,?,?);";
        _sql += mysql.format(sql3, insertData3);
      }

      //使用优惠券
      if (couponDeductedRMB > 0) {
        var insertData4 = [constants.zlyCouponId, CONS.TRANSACTION_SOURCE_ZLY_HEALTH, orderId, -couponDeductedRMB, CONS.TRANSACTION_TYPE_PAY, Date.now(), '优惠券支付', CONS.TRANSACTION_SUBTYPE_PAY_COUPON, ""];
        var sql4 = " insert into " + TRANSACTION_DETAILS_TABLE +
          " (userId, source,innerTradeNo, cash, type, createdAt, title,subType,outerTradeNo) " +
          "values( ?, ?, ?, ?, ?, ?, ?,?,?);";
        _sql += mysql.format(sql4, insertData4);
      }

      console.log(_sql);
      return queryPromise(_connection, _sql);
    }).then(function (results) {
      return commit(_connection);
    }).then(function () {
      _connection.release();
      return that.getAccountByUserIdAndDoctorId(customerId,customerRefId);
    }).then(function (account) {
      deferred.resolve(account);
    }, function (err) {
      rollback(_connection);
      deferred.reject(err);
    });
  return deferred.promise;
};

/**
 * (剩余金额 + 优惠券)不足以支付通话费用
 * *1.主叫支付全部剩余金额
 * *2.被叫和平台按比例收款
 * *3.不足金额,按比例生成待付款交易明细
 * 新通话结束后分账（返回分账后患者的账户信息）
 * @param callerId
 * @param calleeId
 * @param callerRestCash
 * @param orderId
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|r.promise|promise|d.promise}
 */
TransactionMysqlService.prototype.distribute_when_not_enough = function (callerId, callerRefId, calleeId, callerRestCash, couponDeductedRMB, orderId, callerTransactionTitle, calleeTransactionTitle, option) {
  var deferred = Q.defer();
  var _connection = null;

  getConnection()
    .then(function (connection) {
      _connection = connection;
      return startTransactionPromise(connection);
    }).then(function () {
      var _sql = "";
      //主叫支付全部剩余金额
      var insertData1 = [callerId, CONS.TRANSACTION_SOURCE_ZLY_HEALTH, orderId, -callerRestCash, CONS.TRANSACTION_TYPE_PAY, Date.now(), callerTransactionTitle, CONS.TRANSACTION_SUBTYPE_PAY_DC, ""];
      var sql1 = " insert into " + TRANSACTION_DETAILS_TABLE +
        " (userId, source,innerTradeNo, cash, type, createdAt, title,subType,outerTradeNo) " +
        "values( ?, ?, ?, ?, ?, ?, ?,?,?);";
      _sql += mysql.format(sql1, insertData1);
      //如果患者金额不够,医生和平台先收取起步价,再按照比例收取剩余金额

      //被叫按比例收款
      var insertData2 = [calleeId, CONS.TRANSACTION_SOURCE_ZLY_HEALTH, orderId, option.calleeIncome, CONS.TRANSACTION_TYPE_INCOME, Date.now(), calleeTransactionTitle, CONS.TRANSACTION_SUBTYPE_INCOME_DC, "", option.payingCalleeIncome];
      var sql2 = " insert into " + TRANSACTION_DETAILS_TABLE +
        " (userId, source,innerTradeNo, cash, type, createdAt, title,subType,outerTradeNo,cashToPay) " +
        "values( ?, ?, ?, ?, ?, ?, ?,?,?, ?);";
      _sql += mysql.format(sql2, insertData2);

      //平台按比例收款
      var platformCash = option.platIncome;
      if (platformCash != 0) {
        var type = platformCash > 0 ? CONS.TRANSACTION_TYPE_INCOME : CONS.TRANSACTION_TYPE_PAY;
        var title = platformCash > 0 ? TRANSACTION_TYPE_INCOME_TITLE : TRANSACTION_TYPE_PAY_TITLE;
        var subType = platformCash > 0 ? CONS.TRANSACTION_SUBTYPE_INCOME_PLATFORM : CONS.TRANSACTION_SUBTYPE_PAY_PLATFORM;

        var insertData3 = [constants.zlyDocChatId, CONS.TRANSACTION_SOURCE_ZLY_HEALTH, orderId, platformCash, type, Date.now(), title, subType, ""];
        var sql3 = " insert into " + TRANSACTION_DETAILS_TABLE +
          " (userId, source, innerTradeNo, cash, type, createdAt, title, subType, outerTradeNo) " +
          "values( ?, ?, ?, ?, ?, ?, ?,?,?);";
        _sql += mysql.format(sql3, insertData3);
      }

      //使用优惠券
      if (couponDeductedRMB > 0) {
        var insertData4 = [constants.zlyCouponId, CONS.TRANSACTION_SOURCE_ZLY_HEALTH, orderId, -couponDeductedRMB, CONS.TRANSACTION_TYPE_PAY, Date.now(), '优惠券支付', CONS.TRANSACTION_SUBTYPE_PAY_COUPON, ""];
        var sql4 = " insert into " + TRANSACTION_DETAILS_TABLE +
          " (userId, source,innerTradeNo, cash, type, createdAt, title,subType,outerTradeNo) " +
          "values( ?, ?, ?, ?, ?, ?, ?,?,?);";
        _sql += mysql.format(sql4, insertData4);
      }

    //不足金额,按比例生成 待支付被叫 交易明细
    var insertData5 = [calleeId, CONS.TRANSACTION_SOURCE_ZLY_HEALTH, orderId, option.payingCalleeIncome, CONS.TRANSACTION_TYPE_INCOME, Date.now(), calleeTransactionTitle, CONS.TRANSACTION_SUBTYPE_INCOME_TO_PAY, ""];
    var sql5 = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, source,innerTradeNo, cash, type, createdAt, title,subType,outerTradeNo) " +
      "values( ?, ?, ?, ?, ?, ?, ?,?,?);";
    _sql += mysql.format(sql5, insertData5);
    //不足金额,按比例生成 待支付平台 交易明细
    var insertData6 = [constants.zlyDocChatId, CONS.TRANSACTION_SOURCE_ZLY_HEALTH, orderId, option.payingPlatIncome, CONS.TRANSACTION_TYPE_INCOME, Date.now(), CONS.TRANSACTION_SUBTYPE_INCOME_PLATFORM, CONS.TRANSACTION_SUBTYPE_INCOME_TO_PAY, ""];
    var sql6 = " insert into " + TRANSACTION_DETAILS_TABLE +
      " (userId, source,innerTradeNo, cash, type, createdAt, title,subType,outerTradeNo) " +
      "values( ?, ?, ?, ?, ?, ?, ?,?,?);";
    _sql += mysql.format(sql6, insertData6);

      console.log(_sql);
      return queryPromise(_connection, _sql);
    }).then(function (results) {
      return commit(_connection);
    }).then(function () {
      _connection.release();
      return that.getAccountByUserIdAndDoctorId(callerId ,callerRefId);
    }).then(function (account) {
      account.callerPaid = Math.round(option.platIncome * 100 + option.calleeIncome * 100) / 100;
      account.callerDebt = Math.round(option.payingCalleeIncome * 100 + option.payingPlatIncome * 100) / 100;
      console.log('caller pay:', option.callerPayment, callerRestCash, account.callerDebt);
      deferred.resolve(account);
    }, function (err) {
      rollback(_connection);
      deferred.reject(err);
    });
  return deferred.promise;
};
/**
 * 支付待支付交易明细
 * @param order
 * @returns {*|promise}
 */
TransactionMysqlService.prototype.payTheNonPayment = function (order) {
  var deferred = Q.defer();
  var _connection = null;

  getConnection()
    .then(function (connection) {
      _connection = connection;
      return startTransactionPromise(connection);
    }).then(function () {
    var now = Date.now();
      var _sql = "";
    //更新已支付交易明细中的CashToPay
      var updateData0 = [-order.willIncome, now, order.calleeId, order._id + '', CONS.TRANSACTION_TYPE_INCOME, CONS.TRANSACTION_SUBTYPE_INCOME_DC];
      var sql0 = " UPDATE " + TRANSACTION_DETAILS_TABLE + " SET cashToPay = ? , updatedAt = ? " +
      " WHERE userId = ? and innerTradeNo = ? and type = ? and subType = ? and isDeleted = 0 and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "';";
      _sql += mysql.format(sql0, updateData0);
      //支付被叫
      var updateData1 = [now , CONS.TRANSACTION_SUBTYPE_INCOME_PAID, order.calleeId, order._id + '', CONS.TRANSACTION_TYPE_INCOME, CONS.TRANSACTION_SUBTYPE_INCOME_TO_PAY];
      var sql1 = " UPDATE " + TRANSACTION_DETAILS_TABLE + " SET updatedAt = ? , subType = ? " +
      " WHERE userId = ? and innerTradeNo = ? and type = ? and subType = ? and isDeleted = 0 and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "';";
      _sql += mysql.format(sql1, updateData1);
      //支付平台
      var updateData2 = [now, CONS.TRANSACTION_SUBTYPE_INCOME_PAID, constants.zlyDocChatId, order._id + '', CONS.TRANSACTION_TYPE_INCOME, CONS.TRANSACTION_SUBTYPE_INCOME_TO_PAY];
      var sql2 = " UPDATE " + TRANSACTION_DETAILS_TABLE + " SET updatedAt = ? , subType = ? " +
      " WHERE userId = ? and innerTradeNo = ? and type = ? and subType = ? and isDeleted = 0 and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "';";
      _sql += mysql.format(sql2, updateData2);

      console.log(_sql);
      return queryPromise(_connection, _sql);
    }).then(function (results) {
      return commit(_connection);
    }).then(function () {
      _connection.release();
      deferred.resolve();
    }, function (err) {
      rollback(_connection);
      deferred.reject(err);
    });
  return deferred.promise;
};

TransactionMysqlService.prototype.getTheNonPayment = function (userID, orderId) {
  orderId = orderId + '';
  var deferred = Q.defer();
  var now = Date.now();
  var condition = [userID + '', orderId, now];
  var _sql = "select sum(cash) as cash from " + TRANSACTION_DETAILS_TABLE + " where userId = ? and innerTradeNo = ? and subType = '" + CONS.TRANSACTION_SUBTYPE_INCOME_TO_PAY + "' and isDeleted = 0 and cash > 0 and future < ? and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "';";
  _sql = mysql.format(_sql, condition);

  console.log("sql:" + _sql);
  var _connection = null;
  getConnection()
    .then(function (connection) {
      _connection = connection;
      return queryPromise(connection, _sql);
    })
    .then(function (results) {
      _connection.release();
      deferred.resolve(results[0][0]);
    }, function (err) {
      rollback(_connection);
      deferred.reject(err);
    });
  return deferred.promise;
};
/**
 * 获取账户列表的余额
 * @param userIDS
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|d.promise|promise|r.promise}
 */
TransactionMysqlService.prototype.getAmountByUserIds = function (userIDS) {
  var deferred = Q.defer();
  var now = Date.now();

  var condition = [userIDS, now];
  var total_amount_sql = "select userId,sum(cash) as cash from " + TRANSACTION_DETAILS_TABLE + " where userId in (?) and isDeleted = 0 and future < ? and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "' group by userId;";
  total_amount_sql = mysql.format(total_amount_sql, condition);

  console.log("sql:" + total_amount_sql);

  var _connection = null;
  getConnection()
    .then(function (connection) {
      _connection = connection;
      return queryPromise(connection, total_amount_sql);
    })
    .then(function (results) {
      //console.log("results:" + util.inspect(results));

      _connection.release();
      deferred.resolve(results[0]);
    }, function (err) {
      rollback(_connection);
      deferred.reject(err);
    });
  return deferred.promise;
};
/**
 * 获取医生的实际收入
 * @param userIDS
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|d.promise|promise|r.promise}
 */
TransactionMysqlService.prototype.getIncomeByUserIds = function (userIDS) {
  var deferred = Q.defer();

  var condition = [userIDS];
  var total_income_sql = "select userId,sum(cash) as cash from " + TRANSACTION_DETAILS_TABLE + " where userId in (?) and isDeleted = 0 and type = '" + CONS.TRANSACTION_TYPE_INCOME + "' and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "' group by userId;";
  total_income_sql = mysql.format(total_income_sql, condition);

  console.log("sql:" + total_income_sql);

  var _connection = null;
  getConnection()
    .then(function (connection) {
      _connection = connection;
      return queryPromise(connection, total_income_sql);
    })
    .then(function (results) {
      //console.log("results:" + util.inspect(results));

      _connection.release();
      deferred.resolve(results[0]);
    }, function (err) {
      rollback(_connection);
      deferred.reject(err);
    });
  return deferred.promise;
};
/**
 * 获取平台针对每个医生的收入
 * @param userIDS
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|d.promise|promise|r.promise}
 */
TransactionMysqlService.prototype.getPlatformIncomeByUserIds = function (userIDS) {
  var deferred = Q.defer();
  var now = Date.now();

  var condition = [now, now, constants.zlyDocChatId, userIDS];
  var income_sql = "select d.userId,sum(p.cash) as cash from " + TRANSACTION_DETAILS_TABLE +
    " as d left join " + TRANSACTION_DETAILS_TABLE + " as p on d.innerTradeNo = p.innerTradeNo" +
    " where d.isDeleted = 0 and p.isDeleted = 0 and d.future < ? and p.future < ? " +
    " and p.userId = ? and d.userId in (?)" +
    " and p.source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "' and p.source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "'" +
    " group by d.userId";

  income_sql = mysql.format(income_sql, condition);

  console.log("sql:" + income_sql);

  var _connection = null;
  getConnection()
    .then(function (connection) {
      _connection = connection;
      return queryPromise(connection, income_sql);
    })
    .then(function (results) {
      //console.log("results:" + util.inspect(results));

      _connection.release();
      deferred.resolve(results[0]);
    }, function (err) {
      rollback(_connection);
      deferred.reject(err);
    });
  return deferred.promise;
};
/**
 * 获取所有充值账户
 * @param pagestart
 * @param pageNum
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|d.promise|promise|r.promise}
 */
TransactionMysqlService.prototype.getAllRechargeUser = function (pagestart, pageNum) {
  var deferred = Q.defer();

  var condition = [pagestart, pageNum];
  var sql = " select userId,sum(cash) recharge from " + TRANSACTION_DETAILS_TABLE +
    " WHERE isDeleted = 0 and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "' and type = '" + CONS.TRANSACTION_TYPE_RECHARGE + "' group by userId ORDER BY createdAt desc limit ? , ?;";
  sql = mysql.format(sql, condition);

  console.log("sql:" + sql);

  var _connection = null;
  getConnection()
    .then(function (connection) {
      _connection = connection;
      return queryPromise(connection, sql);
    })
    .then(function (results) {
      //console.log("results:" + util.inspect(results));

      _connection.release();
      deferred.resolve(results[0]);
    }, function (err) {
      rollback(_connection);
      deferred.reject(err);
    });
  return deferred.promise;
};
/**
 * 获取所有消费用户
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|d.promise|promise|r.promise}
 */
TransactionMysqlService.prototype.getAllPaymentUser = function () {
  var deferred = Q.defer();

  var sql = " select userId,sum(cash) payment from " + TRANSACTION_DETAILS_TABLE +
    " WHERE isDeleted = 0 and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "' and type = '" + CONS.TRANSACTION_TYPE_PAY + "' group by userId ORDER BY createdAt desc;";

  console.log("sql:" + sql);

  var _connection = null;
  getConnection()
    .then(function (connection) {
      _connection = connection;
      return queryPromise(connection, sql);
    })
    .then(function (results) {
      //console.log("results:" + util.inspect(results));

      _connection.release();
      deferred.resolve(results[0]);
    }, function (err) {
      rollback(_connection);
      deferred.reject(err);
    });
  return deferred.promise;
};
/**
 * 获取用户的消费金额
 * @param userIDS
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|d.promise|promise|r.promise}
 */
TransactionMysqlService.prototype.getPaymentByUserIds = function (userIDS) {
  var deferred = Q.defer();

  var condition = [userIDS];
  var sql = " select userId,sum(cash) payment from " + TRANSACTION_DETAILS_TABLE +
    " WHERE userId in (?) and isDeleted = 0 and source = '" + CONS.TRANSACTION_SOURCE_ZLY_HEALTH + "' and type = '" + CONS.TRANSACTION_TYPE_PAY + "' group by userId ORDER BY createdAt desc;";
  sql = mysql.format(sql, condition);

  console.log("sql:" + sql);

  var _connection = null;
  getConnection()
    .then(function (connection) {
      _connection = connection;
      return queryPromise(connection, sql);
    })
    .then(function (results) {
      //console.log("results:" + util.inspect(results));

      _connection.release();
      deferred.resolve(results[0]);
    }, function (err) {
      rollback(_connection);
      deferred.reject(err);
    });
  return deferred.promise;
};

/**
 * 撤销提款：更新交易明细,新增对冲交易明细
 *
 * @param applId
 * @returns {*|promise}
 */
TransactionMysqlService.prototype.rollbackWithdraw = function (applId) {

  var deferred = Q.defer();
  var _connection = null;
  var innerTradeNo = applId || "";
  var type = CONS.TRANSACTION_TYPE_WITHDRAW;
  var now = Date.now();
  var title = TRANSACTION_TYPE_WITHDRAW_TITLE + " (失败)";
  var _sql = "", trx = {};

  if (innerTradeNo.length < 1)
    throw new Error("Illegal trade number !!");

  _sql = "SELECT * from " + TRANSACTION_DETAILS_TABLE + " WHERE innerTradeNo = ? and type = ? and future >= ? and source = ?;";
  _sql = mysql.format(_sql, [innerTradeNo, CONS.TRANSACTION_TYPE_WITHDRAW, now, CONS.TRANSACTION_SOURCE_ZLY_HEALTH]);
  console.log('_sql:', _sql);
  getConnection().then(function (connection) {
    _connection = connection;
    return queryPromise(_connection, _sql);
  }).then(function (results) {
    var len = results[0].length;
    console.log('transaction count:',len);
    if (len != 1)
      throw new Error("Illegal transaction count!!");
    trx = results[0][0];
    return startTransactionPromise(_connection);
  }).then(function () {
    _sql = "";
    var sql, updateData = [now, CONS.TRANSACTION_TYPE_WITHDRAW_REJECTED_TITLE, innerTradeNo, CONS.TRANSACTION_TYPE_WITHDRAW, now, CONS.TRANSACTION_SOURCE_ZLY_HEALTH];
    sql = " UPDATE " + TRANSACTION_DETAILS_TABLE + " SET future = ? , title = ? " +
        " WHERE innerTradeNo = ? and type = ? and future >= ? and source = ?;";
    _sql += mysql.format(sql, updateData);

    var insertData = [
      trx.userId, "", Math.abs(trx.cash), CONS.TRANSACTION_TYPE_INCOME, now,
      trx.innerTradeNo, TRANSACTION_SUBTYPE_WITHDRAW_BACK_TITLE, CONS.TRANSACTION_SUBTYPE_WITHDRAW_BACK, 0, CONS.TRANSACTION_SOURCE_ZLY_HEALTH];

    sql = " INSERT INTO " + TRANSACTION_DETAILS_TABLE +
        " (userId, outerTradeNo, cash, type, createdAt, innerTradeNo, title, subType, future, source) " +
        " values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    _sql += mysql.format(sql, insertData);

    console.log(_sql);
    return queryPromise(_connection, _sql);
  }).then(function (results) {
    return commit(_connection);
  }).then(function (results) {
    _connection.release();
    deferred.resolve();
  }, function (err) {
    rollback(_connection);
    deferred.reject(err);
  });
  return deferred.promise;
};

/**
 * 确认提款: 更新交易明细状态
 *
 * @param applId
 * @returns {*|promise}
 */
TransactionMysqlService.prototype.confirmWithdraw = function (applId, txnId) {

  var deferred = Q.defer();
  var _connection = null;
  var innerTradeNo = applId || "";
  var now = Date.now();
  if (innerTradeNo.length < 1)
    throw new Error("Illegal trade number !!");

  txnId = txnId || '';
  getConnection().then(function (connection) {
    _connection = connection;
    return startTransactionPromise(connection);
  }).then(function () {
    var _sql = "";
    var updateData = [now, txnId, CONS.TRANSACTION_TYPE_WITHDRAW_SUCCESS_TITLE, innerTradeNo, CONS.TRANSACTION_TYPE_WITHDRAW, now, CONS.TRANSACTION_SOURCE_ZLY_HEALTH];
    var sql = " UPDATE " + TRANSACTION_DETAILS_TABLE + " SET future = ? , outerTradeNo = ?  , title = ? " +
        " WHERE innerTradeNo = ? and type = ? and future >= ? and source = ?;";
    _sql += mysql.format(sql, updateData);

    console.log(_sql);
    return queryPromise(_connection, _sql);
  }).then(function (results) {
    return commit(_connection);
  }).then(function (results) {
    _connection.release();
    deferred.resolve();
  }, function (err) {
    rollback(_connection);
    deferred.reject(err);
  });
  return deferred.promise;
};

TransactionMysqlService.prototype.genUsersCashSQL = function(userIds, ts){
  console.log('ts:', ts, " : " , userIds.length);
  var _sql = "";
  if (!userIds || userIds.length <= 0) {
    return _sql;
  } else if (userIds.length == 1) {
    userIds = "('" + userIds[0] + "')";
  } else {
    userIds = userIds.reduce(function(x, y){
      return x + "','" + y;
    });
    userIds = "('" + userIds + "')";
  }
  console.log("userIds:  " + userIds);
  var selectData = [CONS.TRANSACTION_SOURCE_ZLY_HEALTH, ts];
  var sql = " select userId, sum(cash) as sum from " + TRANSACTION_DETAILS_TABLE +
    " WHERE source = ? and isDeleted = 0 and createdAt <= ? ";
  _sql += mysql.format(sql, selectData);
  _sql +=  " and userId in " + userIds + "  group by userId;";
  return _sql;
};

TransactionMysqlService.prototype.genGetDelTransactionsSQL = function(tsStart, tsEnd, userId){
  //console.log('ts:', tsStart, " : ",tsEnd);
  var _sql = "";
  var selectData = [userId, tsStart, tsEnd,CONS.TRANSACTION_SOURCE_ZLY_HEALTH];
  var sql = " select id, userId, innerTradeNo  from " + TRANSACTION_DETAILS_TABLE +
    " WHERE isDeleted = 1 and userId = ? and type = 'income' and " +
    " subType!='incomeByFavorited' and createdAt > ? and createdAt < ? and " +
    " source = ?;";
  _sql += mysql.format(sql, selectData);
  //console.log(_sql);
  return _sql;
};

TransactionMysqlService.prototype.genGetOrderTransactions = function(innerTradeNo){
  console.log('order: ', innerTradeNo);
  var _sql = "";
  var selectData = [innerTradeNo,CONS.TRANSACTION_SOURCE_ZLY_HEALTH];
  var sql = " select id from " + TRANSACTION_DETAILS_TABLE +
    " WHERE isDeleted = 0 and innerTradeNo = ? and source = ?;";
  _sql += mysql.format(sql, selectData);
  console.log(_sql);
  return _sql;
};

TransactionMysqlService.prototype.genGetOrderAllInfoTransaction = function(userId, innerTradeNo ,type){
  console.log('order: ', innerTradeNo);
  //var sql_part = trxType == 'hongbaoRefund' ? 'innerTradeNo = ?' : 'id = ?';
  //innerTradeNo = trxType == 'hongbaoRefund' ? innerTradeNo : Number(innerTradeNo);
  var _sql = "";
  var selectData = [userId, innerTradeNo, CONS.TRANSACTION_SOURCE_ZLY_HEALTH];
  var sql = " select * from " + TRANSACTION_DETAILS_TABLE +
    " WHERE isDeleted = 0 and userId = ? and innerTradeNo = ? and source = ? ";
  if(type){
    selectData.push(type);
    sql += 'and type = ? '
  }
  _sql += mysql.format(sql, selectData);
  console.log(_sql);
  return _sql;
};

TransactionMysqlService.prototype.genRemoveDelTransactions = function (trxId, memo) {
  var _sql = "";
  memo = memo || '误删除恢复@20170116';
  var selectData = [memo, trxId];

  var sql = " UPDATE " + TRANSACTION_DETAILS_TABLE + " SET isDeleted = 0 , memo= ? " +
    " WHERE id = ?;";

  _sql += mysql.format(sql, selectData);
  //console.log(_sql);
  return _sql;
};

TransactionMysqlService.prototype.genRemoveDelSomeTransactions = function (trxIds, memo) {
  var _sql = "";
  memo = memo || '';
  var selectData = [memo];
  var inStr = [];
  trxIds.forEach(function(trxId){
    selectData.push(trxId);
    inStr.push('?');
  });
  var sql = " UPDATE " + TRANSACTION_DETAILS_TABLE + " SET isDeleted = 0 , memo= ? " +
    " WHERE id in (" + inStr.join(',') + ");";

  _sql += mysql.format(sql, selectData);
  console.log(_sql);
  return _sql;
};

TransactionMysqlService.prototype.getUserTransactions = function(userId, innerTradeNo, ignoredId){
  console.log('argv:', userId, innerTradeNo, ignoredId);
  var deferred = Q.defer();
  var _connection = null;
  var type = CONS.TRANSACTION_TYPE_WITHDRAW;
  var now = Date.now();
  var deadlineTS = 1479686400000;
  //new Date('2016-11-20 00:00:00:000').getTime();
  console.log('deadlineTS:', deadlineTS);
  var ts = [];
  getConnection().then(function (connection) {
    _connection = connection;
    var _sql = "";
    var selectData = [userId, innerTradeNo, CONS.TRANSACTION_SOURCE_ZLY_HEALTH, ignoredId];//and (innerTradeNo is not null or innerTradeNo <> '')
    var sql = " select id from " + TRANSACTION_DETAILS_TABLE +
        " WHERE userId = ? and isDeleted = 0 and innerTradeNo = ? and source = ? and id != ?;";
    _sql += mysql.format(sql, selectData);
    console.log(_sql);
    return queryPromise(_connection, _sql);
  }).then(function(results){
    ts = results[0];
    console.log('transaction count ::',results[0].length,results[0]);
    return startTransactionPromise(_connection);//?
  }).then(function(){
    console.log('come in 12');
    if(ts.length == 0){
      console.log('come in 13');

      return;
    }
    var _sql = "";
    var selectData = [ignoredId];//and (innerTradeNo is not null or innerTradeNo <> '')
    var sql = " UPDATE " + TRANSACTION_DETAILS_TABLE + " SET isDeleted = 0 WHERE id = ?";
    _sql += mysql.format(sql, selectData);
    console.log('come in 14');
    console.log(_sql);
    return queryPromise(_connection, _sql);
  }).then(function (result) {
    console.log('come in 15');
    return commit(_connection);
  }).then(function (results) {
    _connection.release();
    deferred.resolve();
  }, function (err) {
    rollback(_connection);
    deferred.reject(err);
  });
  return deferred.promise;
};
/**
 * 获取待罚款用户的账户余额
 * @param userId
 * @param cash
 * @param memo
 * @param time
 * @returns {string}
 */
TransactionMysqlService.prototype.genFineUserCash = function (userId, cash, memo, time){

  if (!cash || cash <= 0) return "";

  memo = memo || '误删除恢复后罚款@20170116';
  time = time || Date.now();
  var _sql = "";
  var selectData = [
    userId,  "", "", CONS.TRANSACTION_TYPE_PAY, CONS.TRANSACTION_SUBTYPE_PAY_FINE,
    -cash, TRANSACTION_SUBTYPE_FINE_TITLE, CONS.TRANSACTION_SOURCE_ZLY_HEALTH,
    time, time, memo
  ];
  var sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, outerTradeNo, innerTradeNo, type, subType, cash, title, source, " +
    " createdAt, updatedAt, memo) values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, selectData);
  return _sql;
};

TransactionMysqlService.prototype.getRegion = function () {

  var deferred = Q.defer();
  var _connection = null;
  getConnection().then(function (connection) {
    _connection = connection;
    return startTransactionPromise(connection);
  }).then(function () {
    var sql = " select * from area";
    console.log(sql);
    return queryPromise(_connection, sql);
  }).then(function (results) {
    _connection.release();
    deferred.resolve(results);
  }, function (err) {
    rollback(_connection);
    deferred.reject(err);
  });
  return deferred.promise;
};


/*
 * 用户获得药品报销补贴sql语句
 */
TransactionMysqlService.prototype.genUserDrugReimbursementSql = function (userId,
                                                                          orderId,
                                                                          title,
                                                                          cash,
                                                                          memo) {
  var now= Date.now();
  var _sql = "";
  memo = memo || "";

  var insertData = [userId, CONS.TRANSACTION_SOURCE_ZLY_HEALTH, "", cash, CONS.TRANSACTION_TYPE_INCOME, now,
    orderId, title, CONS.TRANSACTION_SUBTYPE_DRUG_REIMBURSEMENT,memo];
  var sql = " insert into " + TRANSACTION_DETAILS_TABLE +
    " (userId, source, outerTradeNo, cash, type, createdAt, innerTradeNo, title, subType, memo) " +
    "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);


  insertData = [constants.zlyCouponId, CONS.TRANSACTION_SOURCE_ZLY_HEALTH, "", -cash, CONS.TRANSACTION_TYPE_PAY, now,
    orderId, title, CONS.TRANSACTION_SUBTYPE_DRUG_REIMBURSEMENT,memo];
  sql = " insert into " + TRANSACTION_DETAILS_TABLE +
  " (userId, source, outerTradeNo, cash, type, createdAt, innerTradeNo, title, subType,memo) " +
  "values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
  _sql += mysql.format(sql, insertData);

  return _sql;
};

TransactionMysqlService.prototype.CONS = CONS;

module.exports = exports = new TransactionMysqlService();