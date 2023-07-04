/**
 * PayService 支付服务
 * 
 * Description:
 * 
 * Service Ref:
 * 
 */
var
  Q = require("q"),
  utils = require("../../lib/common-util"),
  ErrorHandler = require('../../lib/ErrorHandler'),
  constants = require('../configs/constants'),
  querystring = require('querystring'),
  https = require('https'),
  util = require('util'),
  configs = require('../configs/server');


var CONS = {
  PAY_TYPE: {
    WX: "wx",
    ALI: "ali",
    SYS: "sys_pay",
    IAP: "iap"
  },
  ALI_STATUS: {
    TRADE_SUCCESS: "TRADE_SUCCESS",
    TRADE_FINISHED: "TRADE_FINISHED",
    WAIT_BUYER_PAY: "WAIT_BUYER_PAY",
    TRADE_CLOSED: "TRADE_CLOSED"
  }
};
var PayService = function () {};
PayService.prototype.constructor = PayService;

var iapReq = function (deferred, option, postData) {
  option.hostname = 'sandbox.itunes.apple.com';
  var httpsReq = null, request_timer = null;
  request_timer = setTimeout(function(){
    httpsReq.abort();
    deferred.reject({status: -1}); //请求超时
    console.log('iap request timeout');
  }, 2000);
  httpsReq = https.request(option, function (res) {
    clearTimeout(request_timer);
    var data = '';
    res.setEncoding('utf-8');
    res.on('data', function(chunk){
      console.log('chunk:', chunk);
      data += chunk;
    });
    res.on('end', function(){
      data = JSON.parse(data);
      console.log('data:', data);
      //data = JSON.stringify(data);
      deferred.resolve(data);
    });
    res.on('err', function(err){
      console.log('err:', err);
      deferred.reject(ErrorHandler.getBusinessErrorByCode(8007));
    });
  });
  httpsReq.write(postData);
  httpsReq.on('error', function(err){
    clearTimeout(request_timer);
    deferred.reject(ErrorHandler.getBusinessErrorByCode(8007));
  });
}
PayService.prototype.authIAP = function (receiptData){
  var deferred = Q.defer();
  var postData = {
    'receipt-data': receiptData,
    'password': constants.IOS_SHARED_SECRET
  };
  postData = JSON.stringify(postData);
  var headers = {
    'Content-Length': Buffer.byteLength(postData), //必须得加
    'Content-Type': 'application/json'
  }
  var hostname = configs.env ? 'buy.itunes.apple.com' : 'sandbox.itunes.apple.com';
  var option = {
    protocol: 'https:',
    hostname: hostname,
    path: '/verifyReceipt',
    method: 'POST',
    headers: headers
  }
  console.log("callback options:" + util.inspect(option));
  var httpsReq = null, request_timer = null;
  request_timer = setTimeout(function(){
    httpsReq.abort();
    deferred.resolve({status: -1}); //请求超时
    console.log('iap request timeout');
  }, 6000);
  httpsReq = https.request(option, function (res) {
    clearTimeout(request_timer);
    var data = '';
    res.setEncoding('utf-8');
    res.on('data', function(chunk){
      console.log('chunk:', chunk);
      data += chunk;
    });
    res.on('end', function(){
      data = JSON.parse(data);
      console.log('data:', data);
      if(data.status == 21007){
        iapReq(deferred, option, postData);
      }else{
        deferred.resolve(data);
      }
    });
    res.on('err', function(err){
      console.log('err:', err);
      deferred.reject(ErrorHandler.getBusinessErrorByCode(8007));
    });
  });
  httpsReq.write(postData);
  httpsReq.on('error', function(err){
    clearTimeout(request_timer);
    deferred.reject(ErrorHandler.getBusinessErrorByCode(8007));
  });
  return deferred.promise;
}
PayService.prototype.CONS = CONS;
module.exports = exports = new PayService();