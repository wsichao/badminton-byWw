/**
 * 双向回拨
 * @type {exports}
 */
var
  util = require('util'),
  Q = require("q"),
  serverConfigs = require('../configs/server'),
  request = require('request'),
  Base64 = require('js-base64').Base64,
  ErrorHandler = require('../../lib/ErrorHandler'),
  commonUtil = require('../../lib/common-util'),
  constants = require('../configs/constants'),
  http = require('http'),
  crypto = require('crypto'),
  querystring = require('querystring'),
  encrypt = commonUtil.commonMD5;

var
  accountSid = 'aaf98f894b827e71014b8bf1ec91027f',
  accountAuthTOKEN = '2bfe4bf8bb004cf784136c3d8695e104',
  subAccountSid = 'd11c122b605a11e58739ac853d9f54f2',
  subAccountAuthTOKEN = 'db6ef1d6900ac70ff6da1bd5a40de952',
  host_url = 'https://app.cloopen.com:8883/2013-12-26',
  host_url_test = 'https://sandboxapp.cloopen.com:8883/2013-12-26',
  //callback_url = (serverConfigs.env == 1) ? (host_url + '/SubAccounts/' + subAccountSid + '/Calls/Callback' ) : (host_url_test + '/SubAccounts/' + subAccountSid + '/Calls/Callback'),
  callback_url = host_url + '/SubAccounts/' + subAccountSid + '/Calls/Callback';
  call_result_url = host_url + '/Accounts/' + accountSid + '/CallResult';
  hangupCdrUrl = serverConfigs.HOST + "/callback/hangup";//通话结束后回调地址

var CallbackService = function () {
};

CallbackService.prototype.constructor = CallbackService;

CallbackService.prototype.callback = function (fromPhone, toPhone, maxCallTime, callCustomer, otherOptions) {
  var deferred = Q.defer();

  var time = new Date().Format("yyyyMMddhhmmss");
  var md5SigParameter = encrypt(subAccountSid + subAccountAuthTOKEN + time, "", true);
  var base64Authorization = Base64.encode(subAccountSid + ":" + time);
  var url = callback_url + "?sig=" + md5SigParameter;

  var body = {//JSON.stringify({
    from: fromPhone,
    to: toPhone,
    needRecord: (serverConfigs.env == 1) ? '1' : '0',
    maxCallTime: maxCallTime,
    hangupCdrUrl: hangupCdrUrl,
    customerSerNum: constants.showCallbackPhone,
    fromSerNum: constants.showCallbackPhone//,
    //promptTone: callCustomer ? 'callcustomer.wav' : 'callbroker.wav'
  };//);
  
  // Deal with other options
  if (otherOptions && otherOptions.countDownTime) body.countDownTime = otherOptions.countDownTime;
  body = JSON.stringify(body);

  var options = {
    url: url,
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'charset': 'utf-8',
      'Content-Length': Buffer.byteLength(body),
      'Authorization': base64Authorization
    },
    body: body
  };

  console.log("callback options:" + util.inspect(options));

  request(options, function (error, response, body) {
    console.log("callback request boby:" + body);

    if (!error && JSON.parse(body).statusCode == '000000') {
      deferred.resolve(JSON.parse(body).CallBack);
    } else {
      deferred.reject(ErrorHandler.getBusinessErrorByCode(5001));
    }
  });

  return deferred.promise;
};
var genFeiyuAuthToken = function(data){
 return crypto.createHash('MD5').update(data).digest('hex').toUpperCase();
}

CallbackService.prototype.genFeiyuAuthToken = function (appId, ti) {
  console.log('token: ', constants._24hlIdTokenMap[appId]);
  return genFeiyuAuthToken(appId + (constants._24hlIdTokenMap[appId]) + Number(ti));
}
CallbackService.prototype.callback_feiyu = function (fromPhone, toPhone, maxCallMinute, orderId, willShowMobile, otherOptions) {
  //不支持固话,需要交押金
  willShowMobile = willShowMobile || false; //true--freePhone
  var deferred = Q.defer();
  var nowTS = Date.now();
  fromPhone = '86' + fromPhone;
  toPhone = '86' + toPhone;
  //var config_feiyu = serverConfigs.env ? constants._24hlFixed : constants._24hlTestFixed;
  var config_feiyu = serverConfigs.env ? constants._24hlFixed : constants._24hlTestFixed;
  //if(willShowMobile){//TODO:???
  //  config_feiyu = serverConfigs.env ? constants._24hlMobile : constants._24hlTestMobile;
  //}
  var feiyuNum = commonUtil.getRandomFeiyuNum();
  console.log('config_feiyu:', config_feiyu);
  var postData = {
    appId: config_feiyu.appId,
    caller: fromPhone,
    appCallId: orderId + '',
    maxCallMinute: maxCallMinute,
    showNumberType: 1, //外呼显号标示：1）显号； 2）不显号
    callee: toPhone, //被叫号码：号码格式如下，拨打中国手机8613888888888
    calleeDistrictCode: '86',
    ifRecord: 1,
    ti: nowTS,
    ver: config_feiyu.version,
    au: genFeiyuAuthToken(config_feiyu.appId + config_feiyu.appToken + nowTS),
    acaller: feiyuNum, //主叫显号
    bcaller: feiyuNum, //被叫显号
  };
  if(willShowMobile){ //通过通话记录拨打免费电话,显示主叫真实手机号
    postData.showNumberType = 1;
    postData.bcaller = fromPhone;
  }
  var showNumObj = {
    callerShowNum: postData.acaller,
    calleeShowNum: postData.bcaller
  }
  console.log('postData:', postData);
  if(otherOptions && otherOptions.appServerExtraData){
    postData.appServerExtraData = otherOptions.appServerExtraData;
  }
  if(otherOptions && otherOptions.channelId){
    postData.channelId = otherOptions.channelId;
  }
  postData = querystring.stringify(postData);
  var headers = {
    'Content-Length': Buffer.byteLength(postData), //必须得加
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    'Connection': 'close'
  }
  var option = {
    hostname: 'api.feiyucloud.com',
    path: '/api/callback',
    method: 'POST',
    headers: headers
  }
  console.log("callback options:" + util.inspect(option));
  var httpReq = http.request(option, function (res) {
    var data = '';
    res.setEncoding('utf-8');
    res.on('data', function(chunk){
      console.log('chunk:', chunk);
      data += chunk;
    });
    res.on('end', function(){
      data = JSON.parse(data);
      data['showNumObj'] = showNumObj;
      data['appId'] = config_feiyu.appId;
      data = JSON.stringify(data);
      console.log('data:', data);
      deferred.resolve(data);

    });
    res.on('err', function(err){
      console.log('err:', err);
      deferred.reject(ErrorHandler.getBusinessErrorByCode(5001));
    });
  });
  httpReq.write(postData);
  httpReq.on('error', function(err){
    deferred.reject(ErrorHandler.getBusinessErrorByCode(5001));
  });
  return deferred.promise;
};

CallbackService.prototype.getCallBothType = function (callerCallBothType, callerPhoneNum, calleePhoneNum, isFreePhone) {
  //return ''; //
  /*return 'feiyucloud';
  isFreePhone = isFreePhone || false;
  callerCallBothType = callerCallBothType || '';

  if(commonUtil.isValidFixedPhone(callerPhoneNum) || commonUtil.isValidFixedPhone(calleePhoneNum)){ //如果主叫被叫是固话,不走飞语云
    return '';
  }
  if(callerCallBothType){ //如果用户设置了,按用户的设置
    return callerCallBothType;
  }*/
  // if(isFreePhone){
  //   var callBothType = '';
  //   //容联云通讯:飞语云 = 5:5
  //   var random = Math.floor(Math.random() * 10);
  //   console.log('random:', random);
  //   if(random < 5){
  //     callBothType = '';
  //   }else{
  //     callBothType = 'feiyucloud';
  //   }
  //   return callBothType;
  // }else{
  //   return '';
  // }
  /*   var callBothType = '';
     //容联云通讯:飞语云 = 2:8
     var random = Math.floor(Math.random() * 10);
     console.log('random:', random);
     if(random < 2){
       callBothType = 'yuntongxun';
     }else{
       callBothType = 'feiyucloud';
     }
     return callBothType;*/
  if(callerCallBothType == 'feiyucloud' && !isFreePhone){ //如果用户设置了,按用户的设置
    return callerCallBothType;
  }
  return 'yuntongxun';
};

var getFeiyuCallInfo = function (order){
  var deferred = Q.defer();
  var nowTS = Date.now();
  var channelId = order.channelId;
  var config_feiyu = serverConfigs.env ? constants._24hlFixed : constants._24hlTestFixed;

  var appId = order.appId || config_feiyu.appId;//TODO: removed
  var postData = {
    appId: appId,
    fyCallId: channelId,
    ti: nowTS,
    au: genFeiyuAuthToken(appId + constants._24hlIdTokenMap[appId] + nowTS),
  };
  postData = querystring.stringify(postData);
  var headers = {
    'Content-Length': Buffer.byteLength(postData), //必须得加
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    'Connection': 'close'
  }
  var option = {
    hostname: 'api.feiyucloud.com',
    path: '/api/fetchCallHistory',
    method: 'POST',
    headers: headers
  }
  console.log("callback options:" + util.inspect(option));
  var httpReq = http.request(option, function (res) {
    var data = '';
    res.setEncoding('utf-8');
    res.on('data', function(chunk){
      console.log('chunk:', chunk);
      data += chunk;
    });
    res.on('end', function(){
      data = JSON.parse(data);
      if(data.resultCode !== '0'){
        return deferred.reject(ErrorHandler.getBusinessErrorByCode(5003));
      }
      data = JSON.stringify(data.result);
      console.log('data:', data);
      deferred.resolve(data);

    });
    res.on('err', function(err){
      console.log('err:', err);
      deferred.reject(ErrorHandler.getBusinessErrorByCode(5001));
    });
  });
  httpReq.write(postData);
  httpReq.on('error', function(err){
    deferred.reject(ErrorHandler.getBusinessErrorByCode(5001));
  });
  return deferred.promise;
}

var getYuntongxunCallInfo = function (order){
  var deferred = Q.defer();
  var channelId = order.channelId;

  var time = new Date().Format("yyyyMMddhhmmss");
  var md5SigParameter = encrypt(accountSid + accountAuthTOKEN + time, "", true);
  var base64Authorization = Base64.encode(accountSid + ":" + time);
  var url = call_result_url + "?sig=" + md5SigParameter + '&callsid=' + channelId;
  var options = {
    url: url,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'charset': 'utf-8',
      'Authorization': base64Authorization
    }
  };

  console.log("callback options:" + util.inspect(options));

  request(options, function (error, response, body) {
    console.log("callback request boby:" + body);

    if (!error && JSON.parse(body).statusCode == '000000') {
      deferred.resolve(JSON.parse(body).CallResult);
    } else {
      deferred.reject(ErrorHandler.getBusinessErrorByCode(5001));
    }
  });

  return deferred.promise;
}

CallbackService.prototype.getTheThirdCallInfo = function (order) {
  var callBothType = order.provider;
  if(!callBothType || callBothType == 'yuntongxun'){
    return getYuntongxunCallInfo(order);
  }else if(callBothType == 'feiyucloud'){
    return getFeiyuCallInfo(order);
  }
}
Date.prototype.Format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
};

module.exports = exports = new CallbackService();
