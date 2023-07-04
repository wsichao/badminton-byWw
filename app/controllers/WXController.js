var
  util = require('util'),
  commonUtil = require('../../lib/common-util'),
  apiHandler = require('../configs/ApiHandler'),
  ErrorHandler = require('../../lib/ErrorHandler'),
  constants = require('../configs/constants'),
  Server = require('../configs/server'),
  httpHandler = require('../../lib/CommonRequest'),
  Q = require("q"),
  xml2js = require('xml2js'),
  CustomerService = require('../services/CustomerService'),
  LoggerService = require('../services/LoggerService'),
  JPushService = require('../services/JPushService');

var
  appId = 'wxb042e08b7ffe1091',
  secret = '53fae89a945e81e7a5bebec2cce22b0e',
  noncestr = 'Wm3WZYTPz34dsfkjkd', //TODO 随即生成
  jsApiList = ['onMenuShareTimeline', 'onMenuShareAppMessage'],

  payAppId = "wxe9f40b6239381eb4", //开发平台appId
  applet_appid = "wx399814b31170f329",
  mchId = "1299268401", //商户id
  mchKey = "BJZLYCAREhiejl34n53kCCXPE94859lp", //商户key
  payNotifyUrl = Server.HOST + "/1/transactions/wxRechargeNotify", //Server.HOST

  // payNotifyUrl = "https://dev.mtxhcare.com/1/transactions/wxRechargeNotify", //Server.HOST

  assistant_app_id = 'wx82cac9599ad59885',
  assistant_app_secret = 'aec3d88ccbf8bcf71a9543aca44014a1',
  assistant_mch_id = '1509440451',
  assistant_mch_key = 'Rjayd2NX3JN8J4qOK8XxCrcIU3vf9Zxt';

// 2030 健康圈微信小程序信息
mc_applet_appid = 'wxd3f4975292f64d62';
mc_applet_app_secret = '76a181cd0649120ed49fade49a25124c';
mc_mchId = '1513373921';
mc_mchKey = "mantianxinghui2019mantianxinghui";



var WXController = function () {};
WXController.prototype.constructor = WXController;

/**
 * 微信支付
 * @param data
 * {
 *   money:支付金额(元)
 *   tradeNo:内部订单号
 *   body:充值提示
 * }
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|d.promise|promise|r.promise}
 */
WXController.prototype.WXPay = function (req, data) {
  var deferred = Q.defer();

  if (data.money <= 0)
    throw ErrorHandler.getBusinessErrorByCode(1206);

  var rechargeMoney = Math.floor(data.money * 100); //微信充值单位为分
  var outTradeNo = data.tradeNo;
  var body = data.body;
  var ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
  var tradeType = "APP";
  //body = '123'
  console.log("ip: " + req.get("X-Real-IP") + " : " + req.get("X-Forwarded-For") + " : " + req.ip);
  var stringA = "appid=" + payAppId + "&" +
    "body=" + body + "&" +
    "mch_id=" + mchId + "&" +
    "nonce_str=" + noncestr + "&" +
    "notify_url=" + payNotifyUrl + "&" +
    "out_trade_no=" + outTradeNo + "&" +
    "spbill_create_ip=" + ip + "&" +
    "total_fee=" + rechargeMoney + "&" +
    "trade_type=" + tradeType + "&" +
    "key=" + mchKey;

  //stringA = (new Buffer(stringA)).toString('UTF-8');
  var sign = commonUtil.commonMD5(stringA, "", true);

  console.log("stringA-->" + stringA + "-----" + sign);

  var payload = '<xml> ' +
    '<appid>' + payAppId + '</appid> ' +
    '<mch_id>' + mchId + '</mch_id> ' +
    '<nonce_str>' + noncestr + '</nonce_str> ' +
    '<sign>' + sign + '</sign> ' +
    '<body>' + body + '</body> ' +
    '<out_trade_no>' + outTradeNo + '</out_trade_no> ' +
    '<total_fee>' + rechargeMoney + '</total_fee> ' +
    '<spbill_create_ip>' + ip + '</spbill_create_ip> ' +
    '<notify_url>' + payNotifyUrl + '</notify_url> ' +
    '<trade_type>' + tradeType + '</trade_type> ' +
    '</xml>';

  //console.log("payload-->" + payload);

  httpHandler.sendRequest(httpHandler.genOptions('api.mch.weixin.qq.com', null, "/pay/unifiedorder", 'POST', payload, "application/xml"), payload, function (error) {
    console.log(error);
    deferred.reject(ErrorHandler.getBusinessErrorByCode(1207));
  }, function (data) {
    parseXml(data)
      .then(function (result) {
        console.log(result);
        if (result.xml.return_code == 'SUCCESS' && result.xml.result_code == 'SUCCESS') { //下单成功
          var result = {
            "prepayId": result.xml.prepay_id,
            "timestamp": Math.round(Date.now() / 1000)
          };
          deferred.resolve(result);
        } else {
          var payError = ErrorHandler.getBusinessErrorByCode(1207);
          payError.message += "," + (result.xml.err_code_des || result.xml.return_msg);

          deferred.reject(payError);
        }

        LoggerService.trace(LoggerService.getTraceDataByReq(req));
      });
  });

  return deferred.promise;
};

/**
 * 微信支付 app 2030商户信息
 * @param data
 * {
 *   money:支付金额(元)
 *   tradeNo:内部订单号
 *   body:充值提示
 * }
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|d.promise|promise|r.promise}
 */
WXController.prototype.WXPayApp2030 = function (req, data) {
  var deferred = Q.defer();

  if (data.money <= 0)
    throw ErrorHandler.getBusinessErrorByCode(1206);

  var rechargeMoney = data.money; //微信充值单位为分
  var outTradeNo = data.tradeNo;
  var body = data.body;
  var ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
  var tradeType = "APP";
  //body = '123'
  console.log("ip: " + req.get("X-Real-IP") + " : " + req.get("X-Forwarded-For") + " : " + req.ip);
  var stringA = "appid=" + payAppId + "&" +
    "body=" + body + "&" +
    "mch_id=" + mc_mchId + "&" +
    "nonce_str=" + noncestr + "&" +
    "notify_url=" + payNotifyUrl + "&" +
    "out_trade_no=" + outTradeNo + "&" +
    "spbill_create_ip=" + ip + "&" +
    "total_fee=" + rechargeMoney + "&" +
    "trade_type=" + tradeType + "&" +
    "key=" + mc_mchKey;

  //stringA = (new Buffer(stringA)).toString('UTF-8');
  var sign = commonUtil.commonMD5(stringA, "", true);

  console.log("stringA-->" + stringA + "-----" + sign);

  var payload = '<xml> ' +
    '<appid>' + payAppId + '</appid> ' +
    '<mch_id>' + mc_mchId + '</mch_id> ' +
    '<nonce_str>' + noncestr + '</nonce_str> ' +
    '<sign>' + sign + '</sign> ' +
    '<body>' + body + '</body> ' +
    '<out_trade_no>' + outTradeNo + '</out_trade_no> ' +
    '<total_fee>' + rechargeMoney + '</total_fee> ' +
    '<spbill_create_ip>' + ip + '</spbill_create_ip> ' +
    '<notify_url>' + payNotifyUrl + '</notify_url> ' +
    '<trade_type>' + tradeType + '</trade_type> ' +
    '</xml>';

  //console.log("payload-->" + payload);

  httpHandler.sendRequest(httpHandler.genOptions('api.mch.weixin.qq.com', null, "/pay/unifiedorder", 'POST', payload, "application/xml"), payload, function (error) {
    console.log(error);
    deferred.reject(ErrorHandler.getBusinessErrorByCode(1207));
  }, function (data) {
    parseXml(data)
      .then(function (result) {
        console.log(result);
        if (result.xml.return_code == 'SUCCESS' && result.xml.result_code == 'SUCCESS') { //下单成功
          var result = {
            "prepayId": result.xml.prepay_id,
            "timestamp": Math.round(Date.now() / 1000)
          };
          deferred.resolve(result);
        } else {
          var payError = ErrorHandler.getBusinessErrorByCode(1207);
          payError.message += "," + (result.xml.err_code_des || result.xml.return_msg);

          deferred.reject(payError);
        }

        LoggerService.trace(LoggerService.getTraceDataByReq(req));
      });
  });

  return deferred.promise;
};


/**
 * 微信小程序支付
 * @param data
 * {
 *   money:支付金额(元)
 *   tradeNo:内部订单号
 *   body:充值提示
 *   openid : 微信唯一标识
 * }
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|d.promise|promise|r.promise}
 */
WXController.prototype.WXPayApplet = function (req, data) {
  var deferred = Q.defer();

  if (data.money <= 0)
    throw ErrorHandler.getBusinessErrorByCode(1206);

  var rechargeMoney = data.money * 100; //微信充值单位为分
  var outTradeNo = data.tradeNo;
  var body = data.body;
  var openid = data.openid
  var ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
  var tradeType = "JSAPI";
  //body = '123'
  console.log("ip: " + req.get("X-Real-IP") + " : " + req.get("X-Forwarded-For") + " : " + req.ip);
  var stringA = "appid=" + applet_appid + "&" +
    "body=" + body + "&" +
    "mch_id=" + mchId + "&" +
    "nonce_str=" + noncestr + "&" +
    "notify_url=" + payNotifyUrl + "&" +
    "openid=" + openid + "&" +
    "out_trade_no=" + outTradeNo + "&" +
    "spbill_create_ip=" + ip + "&" +
    "total_fee=" + rechargeMoney + "&" +
    "trade_type=" + tradeType + "&" +
    "key=" + mchKey;

  //stringA = (new Buffer(stringA)).toString('UTF-8');
  var sign = commonUtil.commonMD5(stringA, "", true);

  console.log("stringA-->" + stringA + "-----" + sign);

  var payload = '<xml> ' +
    '<appid>' + applet_appid + '</appid> ' +
    '<mch_id>' + mchId + '</mch_id> ' +
    '<nonce_str>' + noncestr + '</nonce_str> ' +
    '<sign>' + sign + '</sign> ' +
    '<body>' + body + '</body> ' +
    '<out_trade_no>' + outTradeNo + '</out_trade_no> ' +
    '<total_fee>' + rechargeMoney + '</total_fee> ' +
    '<spbill_create_ip>' + ip + '</spbill_create_ip> ' +
    '<notify_url>' + payNotifyUrl + '</notify_url> ' +
    '<trade_type>' + tradeType + '</trade_type> ' +
    '<openid>' + openid + '</openid>' +
    '</xml>';

  //console.log("payload-->" + payload);

  httpHandler.sendRequest(httpHandler.genOptions('api.mch.weixin.qq.com', null, "/pay/unifiedorder", 'POST', payload, "application/xml"), payload, function (error) {
    console.log(error);
    deferred.reject(ErrorHandler.getBusinessErrorByCode(1207));
  }, function (data) {
    parseXml(data)
      .then(function (result) {
        console.log(result);
        if (result.xml.return_code == 'SUCCESS' && result.xml.result_code == 'SUCCESS') { //下单成功
          var result = {
            "prepayId": result.xml.prepay_id,
            "timestamp": Math.round(Date.now() / 1000)
          };
          deferred.resolve(result);
        } else {
          var payError = ErrorHandler.getBusinessErrorByCode(1207);
          payError.message += "," + (result.xml.err_code_des || result.xml.return_msg);

          deferred.reject(payError);
        }

        LoggerService.trace(LoggerService.getTraceDataByReq(req));
      });
  });

  return deferred.promise;
};

/**
 * 微信 2030 健康圈 小程序支付
 * @param data
 * {
 *   money:支付金额(元)
 *   tradeNo:内部订单号
 *   body:充值提示
 *   openid : 微信唯一标识
 * }
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|d.promise|promise|r.promise}
 */
WXController.prototype.WXPayApplet2030 = function (req, data) {
  var deferred = Q.defer();

  if (data.money <= 0)
    throw ErrorHandler.getBusinessErrorByCode(1206);

  var rechargeMoney = data.money; //微信充值单位为分
  var outTradeNo = data.tradeNo;
  var body = data.body;
  var openid = data.openid
  var ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
  var tradeType = "JSAPI";
  //body = '123'
  console.log("ip: " + req.get("X-Real-IP") + " : " + req.get("X-Forwarded-For") + " : " + req.ip);
  var stringA = "appid=" + mc_applet_appid + "&" +
    "body=" + body + "&" +
    "mch_id=" + mc_mchId + "&" +
    "nonce_str=" + noncestr + "&" +
    "notify_url=" + payNotifyUrl + "&" +
    "openid=" + openid + "&" +
    "out_trade_no=" + outTradeNo + "&" +
    "spbill_create_ip=" + ip + "&" +
    "total_fee=" + rechargeMoney + "&" +
    "trade_type=" + tradeType + "&" +
    "key=" + mc_mchKey;

  //stringA = (new Buffer(stringA)).toString('UTF-8');
  var sign = commonUtil.commonMD5(stringA, "", true);

  console.log("stringA-->" + stringA + "-----" + sign);

  var payload = '<xml> ' +
    '<appid>' + mc_applet_appid + '</appid> ' +
    '<mch_id>' + mc_mchId + '</mch_id> ' +
    '<nonce_str>' + noncestr + '</nonce_str> ' +
    '<sign>' + sign + '</sign> ' +
    '<body>' + body + '</body> ' +
    '<out_trade_no>' + outTradeNo + '</out_trade_no> ' +
    '<total_fee>' + rechargeMoney + '</total_fee> ' +
    '<spbill_create_ip>' + ip + '</spbill_create_ip> ' +
    '<notify_url>' + payNotifyUrl + '</notify_url> ' +
    '<trade_type>' + tradeType + '</trade_type> ' +
    '<openid>' + openid + '</openid>' +
    '</xml>';

  //console.log("payload-->" + payload);

  httpHandler.sendRequest(httpHandler.genOptions('api.mch.weixin.qq.com', null, "/pay/unifiedorder", 'POST', payload, "application/xml"), payload, function (error) {
    console.log(error);
    deferred.reject(ErrorHandler.getBusinessErrorByCode(1207));
  }, function (data) {
    parseXml(data)
      .then(function (result) {
        console.log(result);
        if (result.xml.return_code == 'SUCCESS' && result.xml.result_code == 'SUCCESS') { //下单成功
          var result = {
            "prepayId": result.xml.prepay_id,
            "timestamp": Math.round(Date.now() / 1000)
          };
          deferred.resolve(result);
        } else {
          var payError = ErrorHandler.getBusinessErrorByCode(1207);
          payError.message += "," + (result.xml.err_code_des || result.xml.return_msg);

          deferred.reject(payError);
        }

        LoggerService.trace(LoggerService.getTraceDataByReq(req));
      });
  });

  return deferred.promise;
};




/**
 * 微信 2030 健康圈 会员 小程序支付
 * @param data
 * {
 *   money:支付金额(元)
 *   tradeNo:内部订单号
 *   body:充值提示
 *   openid : 微信唯一标识
 * }
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|d.promise|promise|r.promise}
 */
WXController.prototype.WXPayApplet2030Member = function (req, data) {
  var deferred = Q.defer();

  if (data.money <= 0)
    throw ErrorHandler.getBusinessErrorByCode(1206);

  var rechargeMoney = data.money; //微信充值单位为分
  var outTradeNo = data.tradeNo;
  var body = data.body;
  var openid = data.openid
  var ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
  var tradeType = "JSAPI";
  //body = '123'
  console.log("ip: " + req.get("X-Real-IP") + " : " + req.get("X-Forwarded-For") + " : " + req.ip);
  var stringA = "appid=" + mc_applet_appid + "&" +
    "body=" + body + "&" +
    "mch_id=" + mc_mchId + "&" +
    "nonce_str=" + noncestr + "&" +
    "notify_url=" + payNotifyUrl + "&" +
    "openid=" + openid + "&" +
    "out_trade_no=" + outTradeNo + "&" +
    "spbill_create_ip=" + ip + "&" +
    "total_fee=" + rechargeMoney + "&" +
    "trade_type=" + tradeType + "&" +
    "key=" + mc_mchKey;

  //stringA = (new Buffer(stringA)).toString('UTF-8');
  var sign = commonUtil.commonMD5(stringA, "", true);

  console.log("stringA-->" + stringA + "-----" + sign);

  var payload = '<xml> ' +
    '<appid>' + mc_applet_appid + '</appid> ' +
    '<mch_id>' + mc_mchId + '</mch_id> ' +
    '<nonce_str>' + noncestr + '</nonce_str> ' +
    '<sign>' + sign + '</sign> ' +
    '<body>' + body + '</body> ' +
    '<out_trade_no>' + outTradeNo + '</out_trade_no> ' +
    '<total_fee>' + rechargeMoney + '</total_fee> ' +
    '<spbill_create_ip>' + ip + '</spbill_create_ip> ' +
    '<notify_url>' + payNotifyUrl + '</notify_url> ' +
    '<trade_type>' + tradeType + '</trade_type> ' +
    '<openid>' + openid + '</openid>' +
    '</xml>';

  //console.log("payload-->" + payload);

  httpHandler.sendRequest(httpHandler.genOptions('api.mch.weixin.qq.com', null, "/pay/unifiedorder", 'POST', payload, "application/xml"), payload, function (error) {
    console.log(error);
    deferred.reject(ErrorHandler.getBusinessErrorByCode(1207));
  }, function (data) {
    parseXml(data)
      .then(function (result) {
        console.log(result);
        if (result.xml.return_code == 'SUCCESS' && result.xml.result_code == 'SUCCESS') { //下单成功
          var result = {
            "prepayId": result.xml.prepay_id,
            "timestamp": Math.round(Date.now() / 1000)
          };
          deferred.resolve(result);
        } else {
          var payError = ErrorHandler.getBusinessErrorByCode(1207);
          payError.message += "," + (result.xml.err_code_des || result.xml.return_msg);

          deferred.reject(payError);
        }

        LoggerService.trace(LoggerService.getTraceDataByReq(req));
      });
  });

  return deferred.promise;
};



/**
 * 助理端微信支付
 * @param data
 * {
 *   money:支付金额(元)
 *   tradeNo:内部订单号
 *   body:充值提示
 * }
 * @returns {adapter.deferred.promise|*|Promise.deferred.promise|d.promise|promise|r.promise}
 */
WXController.prototype.WXAssistantPay = function (req, data) {
  var deferred = Q.defer();

  if (data.money <= 0)
    throw ErrorHandler.getBusinessErrorByCode(1206);

  var rechargeMoney = data.money * 100; //微信充值单位为分
  var outTradeNo = data.tradeNo;
  var body = data.body;
  var ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
  var tradeType = "APP";
  //body = '123'
  console.log("ip: " + req.get("X-Real-IP") + " : " + req.get("X-Forwarded-For") + " : " + req.ip);
  var stringA = "appid=" + assistant_app_id + "&" +
    "body=" + body + "&" +
    "mch_id=" + assistant_mch_id + "&" +
    "nonce_str=" + noncestr + "&" +
    "notify_url=" + payNotifyUrl + "&" +
    "out_trade_no=" + outTradeNo + "&" +
    "spbill_create_ip=" + ip + "&" +
    "total_fee=" + rechargeMoney + "&" +
    "trade_type=" + tradeType + "&" +
    "key=" + assistant_mch_key;

  //stringA = (new Buffer(stringA)).toString('UTF-8');
  var sign = commonUtil.commonMD5(stringA, "", true);

  console.log("stringA-->" + stringA + "-----" + sign);

  var payload = '<xml> ' +
    '<appid>' + assistant_app_id + '</appid> ' +
    '<mch_id>' + assistant_mch_id + '</mch_id> ' +
    '<nonce_str>' + noncestr + '</nonce_str> ' +
    '<sign>' + sign + '</sign> ' +
    '<body>' + body + '</body> ' +
    '<out_trade_no>' + outTradeNo + '</out_trade_no> ' +
    '<total_fee>' + rechargeMoney + '</total_fee> ' +
    '<spbill_create_ip>' + ip + '</spbill_create_ip> ' +
    '<notify_url>' + payNotifyUrl + '</notify_url> ' +
    '<trade_type>' + tradeType + '</trade_type> ' +
    '</xml>';

  //console.log("payload-->" + payload);

  httpHandler.sendRequest(httpHandler.genOptions('api.mch.weixin.qq.com', null, "/pay/unifiedorder", 'POST', payload, "application/xml"), payload, function (error) {
    console.log(error);
    deferred.reject(ErrorHandler.getBusinessErrorByCode(1207));
  }, function (data) {
    parseXml(data)
      .then(function (result) {
        console.log(result);
        if (result.xml.return_code == 'SUCCESS' && result.xml.result_code == 'SUCCESS') { //下单成功
          var result = {
            "prepayId": result.xml.prepay_id,
            "timestamp": Math.round(Date.now() / 1000)
          };
          deferred.resolve(result);
        } else {
          var payError = ErrorHandler.getBusinessErrorByCode(1207);
          payError.message += "," + (result.xml.err_code_des || result.xml.return_msg);

          deferred.reject(payError);
        }

        LoggerService.trace(LoggerService.getTraceDataByReq(req));
      });
  });

  return deferred.promise;
};



/**
 * 获得微信内二次分享的JS配置信息
 * TODO 最好把分享的内容也发送给web端
 * @param req
 * @param res
 */
WXController.prototype.getWXConfig = function (req, res) {
  console.log(Server.WX_TICKET + "," + Server.WX_TICKET_TIME);

  var reqWebUrl = req.query.url;

  if (!Server.WX_TICKET || ((Date.now() - Server.WX_TICKET_TIME) > constants.TIME2H)) {
    var tokenPath = '/cgi-bin/token?grant_type=client_credential&appid=' + appId + '&secret=' + secret;
    httpHandler.sendRequest(httpHandler.genOptions('api.weixin.qq.com', null, tokenPath, 'GET', null, null), null, function (error) {
      console.log(error);
    }, function (data) {
      //console.log(data);
      data = JSON.parse(data);

      var ticketPath = '/cgi-bin/ticket/getticket?access_token=' + data.access_token + '&type=jsapi';
      httpHandler.sendRequest(httpHandler.genOptions('api.weixin.qq.com', null, ticketPath, 'GET', null, null), null, function (error) {
        console.log(error);
      }, function (data) {
        //console.log(data);
        Server.WX_TICKET = JSON.parse(data).ticket;
        Server.WX_TICKET_TIME = Date.now();

        console.log(Server.WX_TICKET + "," + Server.WX_TICKET_TIME);
        resWXJSConfig(res, reqWebUrl);
      });
    });
  } else {
    resWXJSConfig(res, reqWebUrl);
  }
};

var resWXJSConfig = function (res, reqWebUrl) {
  var timestamp = Math.ceil(Date.now() / 1000);
  var sha1String = "jsapi_ticket=" + Server.WX_TICKET + "&noncestr=" + noncestr + "&timestamp=" + timestamp + "&url=" + reqWebUrl;
  var signature = commonUtil.sha1(sha1String, "", false);

  var resData = {
    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    appId: appId,
    timestamp: timestamp,
    nonceStr: noncestr,
    jsApiList: jsApiList,
    signature: signature
  };

  //console.log('resData:' + resData);
  apiHandler.OK(res, resData);
};

var parseXml = function (data) {
  var deferred = Q.defer();
  xml2js.parseString(data, {
      explicitArray: false,
      ignoreAttrs: true
    },
    function (err, result) {
      deferred.resolve(result);
    });

  return deferred.promise;
};

module.exports = exports = new WXController();