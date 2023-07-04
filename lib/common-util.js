/**
 *  common-util
 *  封装通用方法
 *  Created by Jacky.L on 4/16/14.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
/**
 * 通用应答的Json实体结构
 * @param statusCode
 * @param msgStr
 * @param data
 * @returns {{status: *, msg: *, res: *}}
 */
var util = require('util'),
  mongoose = require('mongoose'),
//pinyin = require('pinyin'),
  sms = require('../app/configs/sms'),
  http = require('http'),
  request = require('request'),
//querystring=require('querystring'),
  crypto = require('crypto'),
  server = require('../app/configs/server'),
  Push = require('./push'),
  _ = require('underscore'),
  Promise = require('promise'),
  qiniuConfigs = require('../app/configs/qiniu'),
  CONS = require('../app/configs/constants'),
  qiniu = require('qiniu'),
  regionUtils = require('./regionUtils'),
  CacheService = require('../app/services/CacheService'),
  pinyin = require('pinyin'),
  handler = require('../app/configs/ApiHandler');

var uuid_24bit_style = /\w{24}/;

exports.isValidSmsTxt = function (txt) {

  if (txt.length > 400) return 0; // 字数过长
  if (txt.indexOf("【") >= 0) return -2; // 非法字符【
  if (txt.indexOf("】") >= 0) return -3; // 非法字符【
  if (txt.indexOf("发票") >=0 ) return -4;
  if (txt.indexOf("高利贷") >=0 ) return -5;
  if (txt.indexOf("习近平") >=0 ) return -6;
  return 1;
};

exports.genCallPrice = function (level) {
  var callPrice = {
    "discount": 1,
    "customerInitiateTime": 5,
    "doctorInitiateTime": 5
  };

  if (level == "零") {
    callPrice.initiatePayment = 0;
    callPrice.initiateIncome = 0;
    callPrice.paymentPerMin = 0;
    callPrice.incomePerMin = 0;
  } else if (level == "一") {
    callPrice.initiatePayment = 10;
    callPrice.initiateIncome = 8;
    callPrice.paymentPerMin = 3;
    callPrice.incomePerMin = 2;
  } else if (level == "二") {
    callPrice.initiatePayment = 20;
    callPrice.initiateIncome = 16;
    callPrice.paymentPerMin = 5;
    callPrice.incomePerMin = 4;
  } else if (level == "三") {
    callPrice.initiatePayment = 50;
    callPrice.initiateIncome = 40;
    callPrice.paymentPerMin = 12;
    callPrice.incomePerMin = 10;
  } else { //默认三级
    callPrice.initiatePayment = 100;
    callPrice.initiateIncome = 80;
    callPrice.paymentPerMin = 22;
    callPrice.incomePerMin = 18;
  }
  return callPrice;
};
/**
 * 验证手机号
 * @param phone
 * @returns {boolean}
 */
var isValidPhone = function (phone){
  var mobileReg = /^(13|14|15|18|17|16|19)[0-9]{9}$/;
  return mobileReg.test(phone);
};
exports.isValidPhone = isValidPhone;
/**
 * 验证是否为座机号
 * @param phone
 * @returns {boolean} 座机号时,返回带中划线的座机号010-1234565
 */
exports.isValidFixedPhone = function (phone){
  console.log('isValidFixedPhone:');
  phone = phone + '';
  var fixedReg = /^0[0-9]{10,11}/;
  if(!fixedReg.test(phone)){
    return false;
  }
  var  regionNum = regionUtils.canMatchRegion(phone);
  console.log('regionNum:', regionNum);
  if(regionNum){
    console.log('return region:', regionNum + '-' + phone.substr(regionNum.length, phone.length));
    return (regionNum + '-' + phone.substr(regionNum.length, phone.length));
  }
  return  false;
};

/**
 * 获取手机号类型
 * @param phone
 * @returns {boolean}
 */
exports.getPhoneType = function (phone){
  var mobileReg = /^(13|14|15|18|17|16|19)[0-9]{9}$/;
  var fixedReg = /^0[0-9]{9,11}/;
  if(mobileReg.test(phone)){
    return CONS.phoneType.mobile;
  }else if(fixedReg.test(phone) && regionUtils.canMatchRegion(phone)){
    return CONS.phoneType.fixed;
  }else{
    return CONS.phoneType.other;
  }
};

//获取num位随机数
exports.getRandomCode = function (num) {
  //随机数
  var source = [
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l",
    "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x",
    "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
    "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X",
    "Y", "Z"
  ];
  num = num || 5;
  var code = "";
  for (var i = 0; i < num; i++) {
    code += source[Math.round(Math.random() * 61)];
  }
  return code;
};

/**
 * 获取七牛存储token
 * @returns {*|Object}
 */
exports.getToken = function () {
  qiniu.conf.ACCESS_KEY = qiniuConfigs.ACCESS_KEY;
  qiniu.conf.SECRET_KEY = qiniuConfigs.SECRET_KEY;
  //console.info('get token');
  var putPolicy = new qiniu.rs.PutPolicy(qiniuConfigs.BUCKET,
    null, null, null, null, null, null, 60 * 60 * 24 * 365);//设置一年有效期
  //putPolicy.callbackUrl = callbackUrl;
  //putPolicy.callbackBody = callbackBody;
  //putPolicy.returnUrl = returnUrl;
  //putPolicy.returnBody = returnBody;
  //putpolicy.persistentOps = persistentops;
  //putPolicy.persistentNotifyUrl = persistentNotifyUrl;
  //putPolicy.expires = expires;
  //console.info("Generate uptoken: " + putPolicy);
  return putPolicy.token();
};
/**
 * 判断timstamps数组中的时间是否都在时间区间内
 * @param begin
 * @param end
 * @param timestamps    时间数组
 * @param timeInterval  循环间距
 * @returns {boolean}
 */
exports.isBetweenTimeZone = function (begin, end, timestamps, timeInterval) {

  for (var i = 0; i < timestamps.length; i++) {
    var time = timestamps[i];
    if (timeInterval) {
      var sub = (time - begin) % timeInterval;
      var floor = (Math.floor(time - begin)) / timeInterval;
      if (sub < 0 || (time - (floor * timeInterval)) > end)
        return false;
    } else if (time < begin || time > end) {
      return false;
    }
  }
  return true;
};

/**
 * 验证时间合法性
 * @param timestamps
 * @param base
 * @param slot
 * @returns {boolean}
 */
exports.isValidatedTime = function (timestamps, base, slot) {
  //
  for (var i = 0; i < timestamps.length; i++) {
    if ((timestamps[i] - base) % slot !== 0)
      return false;
  }
  return true;
};


/**
 * 通用应答的Response实体结构
 * @param res
 * @param status
 * @param data
 * @param type
 */
var commonRes = function (res, status, data, type) {
  //console.log("response: " + util.inspect(res) );//+ status + data + type
  var contentType = 'application/json';
  if (type) contentType = type;
  if (data === undefined) data = {};
  res.status(status)
    //.set('Set-Cookie', {'zly_session_id': '10001'})
    .set('Content-Type', contentType)
    //.set('Access-Control-Allow-Origin', '*')
    .json(data);
};
/**
 *
 * @param req
 * @param res
 * @param fields
 * @param succFn
 * @returns {*}
 */
exports.reqFilter = function(req, res, fields, succFn){
  "use strict";
  var required = fields.required||[]
    ,optional = fields.optional||[]
    ,all = _.union(required,optional)
    ,data = _.extend(req.params,req.query,req.body)
    ,paramKeys = Object.keys(data)
    ,diff = _.difference(required,paramKeys);
  if(diff.length > 0)
    return handler.COMMON_MISSING_FIELDS(res,diff);
  for(var k in all){
    if(!data[all[k]] && data[all[k]] !== 0){
      delete data[all[k]];
    }
  }
  var promise = succFn(_.pick(data,all));
  if(!promise){
    var error = {code: 9005, msg: '返回参数不能为空!'};
    return commonRes(res, 500, {code: error.code, msg: error.msg}, null);
  }
  if(!(promise instanceof  Promise))
    promise = Promise.resolve(promise);
  promise.then(function(rs){
      commonRes(res, 200, rs, null);
    })
    .catch(function(err){
      commonRes(res, 501, {code: err.code || '',msg: err.message || ''}, null);
    });
};


/**
 * Copy fields selectively from one object to another.
 * WARNING: Only works for tier-1 fields.
 *
 * Author: Evan Liu
 */
exports.partialCopy = function (object, fields) {
  var ret = {};
  for (var i in fields) {
    ret[fields[i]] = object[fields[i]];
  }

  return ret;
};

/**
 * MD5加密
 * @param data
 * @returns {*}
 */
exports.commonMD5 = function (data, salt, upper) {
  if (data && salt) data += salt;
  // console.log("data:" + data);
  if (upper)
    return crypto.createHash('md5').update(data).digest('hex').toUpperCase();
  else
    return crypto.createHash('md5').update(data).digest('hex');
};

/**
 * sha1签名
 * @param data
 * @returns {*}
 */
exports.sha1 = function (data, salt, upper) {
  if (data && salt) data += salt;
  // console.log("data:" + data);
  if (upper)
    return crypto.createHash('sha1').update(data).digest('hex').toUpperCase();
  else
    return crypto.createHash('sha1').update(data).digest('hex');
};

exports.commonResult = function (statusCode, msgStr, data) {
  var result = {status: statusCode, msg: msgStr, res: data};
  return result;
};

/**
 * 通用应答的Response实体结构
 * @param res
 * @param status
 * @param data
 * @param type
 */
exports.commonResponse = function (res, status, data, type) {
  var contentType = 'application/json';
  if (type) contentType = type;
  if (data === undefined) data = {};
  res.status(status)
    .set('Set-Cookie', {'zly_session_id': '10001'})
    .set('Content-Type', contentType)
    .set('Access-Control-Allow-Origin', '*')
    .send(data);
  //.json(data);
};
/**
 * 获取当前要查询的分页条件
 * @param req
 * @param defaultFrom
 * @param defaultPageSize
 * @returns {{$slice: *[]}}
 */
exports.getCurrentPageSlice = function (req, defaultFrom, defaultPageSize, defaultSort) {
  var from = defaultFrom;
  var pageSize = defaultPageSize;
  var size = parseInt(req.query.pageSize);
  var num = parseInt(req.query.pageNum);
  var sorts = {'createdAt': 1};//按日期从小到大排列//{'createDate': -1}//按日期从大到小排序
  //pageSlice.sort = sort;
  //console.info(size + " : " + num + "  :" + typeof(size));
  if ((typeof(size) === 'number') && size > 0)
    pageSize = size;
  if ((typeof(num) === 'number') && num > 0)
    from = num * pageSize;
  var slices = {skip: from, limit: pageSize};
  if (defaultSort) {
    sorts = defaultSort;
    slices.sort = sorts;
  } else {
    slices.sort = sorts;
  }

  console.info(util.inspect(slices));
  return slices;
};
/**
 * 判断请求中是否有body内容
 * @param req
 * @returns {boolean}
 */
exports.hasBody = function (req) {
  return 'transfer-encoding' in req.headers || 'content-length' in req.headers;
};
/**
 * 判断请求body类型是否为form表单
 * @param req
 * @returns {boolean}
 */
exports.isFormReq = function (req) {
  console.log(util.inspect(req.headers));
  var type = req.headers["content-type"];
  console.log(util.inspect(type));
  return (type.indexOf('multipart/form-data') > -1)
    || (type.indexOf('application/x-www-form-urlencoded') > -1);
};
/**
 * 判断请求body类型是否为Json实体
 * @param req
 * @returns {boolean}
 */
exports.isJsonReq = function (req) {
  var type = req.headers.content_type;
  return type.indexOf('application/json ') > -1;
};
/**
 * 请求中是否明确指定返回类型为html
 * @param req
 */
exports.acceptHtml = function (req) {
  var accept = req.headers.accept;
  console.info(accept + "   typeof accept: " + typeof(accept));
  if (typeof(accept) != 'undefined')
    return accept.indexOf('text/html') > -1;
  else
    return false;
};
/**
 * 获取MongoDB中的ObjectId对象
 * @returns {*}
 */
exports.getNewObjectId = function () {
  var id = mongoose.Types.ObjectId();
  console.info("new Object ID : " + id);
  return id;
};
exports.getObjectIdByStr = function (oid) {
  var id = mongoose.Types.ObjectId(oid);
  console.info("new Object ID : " + id);
  return id;
};
/**
 *
 * @param hanz
 * @returns {Array}
 */
//exports.getPinyinNormal = function (hanz) {
//  var res = [];
//  if (typeof(hanz) == 'string') {
//    var tmp = pinyin(hanz, {
//      style: pinyin.STYLE_NORMAL
//    });
//    for (var x = 0; x < tmp.length; x++) {
//      res[x] = tmp[x][0];
//    }
//  }
//  return res;
//};
/**
 * 获取
 * @param doc
 * @param newdoc
 * @param params
 */
exports.getFormatDocObj = function (doc, newdoc, params) {

  var len = 0;

  if (params)
    len = params.length;

  console.log("params length is: " + len);

  for (var i = 0; i < len; i++) {
    var param = params[i];
    //console.log("param: " + param);
    if (newdoc[param] || newdoc[param] == "" || newdoc[param] == 0) {//如果有该元素 或者 该元素为空或零
      doc[param] = newdoc[param];
    }
  }
  return doc;
};

/**
 *
 * @param uuid
 * @returns {*}
 */
exports.isUUID24bit = function (uuid) {
  return uuid_24bit_style.test(uuid);
};

/**
 * 发送短信
 * @param tplId
 * @param number
 * @param text
 * @param isMarketing
 * @public
 */
exports.sendSms = function (tplId, number, text, isMarketing) {
  console.log("Current env is:" + server.env + "; Begin Sending message:" + tplId
    + "  :  " + number + "  :  " + text);

  if (!number || number == "") {
    return;
  }
  //FIXME: 固定电话,不发送短信
  //if(!isValidPhone(number)){
  //  return;
  //}
  var num = "";
  var numbers = number.split(",");
  if (!numbers || numbers.length < 1) return;
  for (var i = 0 ; i < numbers.length; i++){
    if (isValidPhone(numbers[i])){
      num += numbers[i] + ",";
    }
  }
  console.log('step1');
  var smsConfig = {
    "1697458":  30 * 60 * 1000
  };
  // 只有在单独发送信息时才控制发送频率 TODO
  if (smsConfig[tplId] && smsConfig[tplId] > 0 && numbers.length == 1){
    if (!CacheService.isUserMomentExistsLocal(
        number,
        tplId,
        smsConfig[tplId]
      )) {
      CacheService.addUserMomentLocal(number, tplId);
    }else{
      console.log("短信发送频率受限制");
      return;
    }
  }

  console.log('step2');
  request.post(sms.SMS_SERVER + sms.SMS_SEND_API,
    function optionalCallback(err, httpResponse, body) {
      if (err) {
        return console.error('send message failed:', err);
      }
      console.log('step3');
      console.log('send message successful!  Server responded with:' + body);
    }).form({
      "apikey": (isMarketing ? sms.MARKETING_API_KEY : sms.API_KEY),
      "mobile": number,
      "tpl_id": tplId,//"642401",
      "tpl_value": text//"#code#=xxxx&..."
    });
};
//V2 SMS TODO: 目前仅支持动态短信通知
exports.sendSmsV2 = function (numArray, text, isMarketing) {
  console.log("V2 Current env is:" + server.env + "; Begin Sending message: " + text);
  if (!numArray || numArray.length <=0) {
    return;
  }
  var pager = 500;
  var times = Math.ceil(numArray.length/pager);
  var async = require('async');
  var num = 0;
//【朱李叶健康】您关注的刘郑波(热线号600006606)发布了最新动态：asdfasdf  登录朱李叶健康(http://dc-c.zlycare.com)在拨号盘中输入600006606即可与我联系。
//【朱李叶健康】您关注的      (热线号#       #)发布了最新动态：#message# 登录朱李叶健康(#                     #)在拨号盘中输入#       #即可与我联系。
  async.whilst(
    function () {
      return num < times;
    },
    function(cb){
      var number = "";
      var max = ((num+1)==times)? (numArray.length - num*pager):(num + 1)*pager;
      for (var i = 0; i < max; i++){
        if(isValidPhone(numArray[i + num*pager])){
          number += numArray[i + num*pager]+ ",";
        }
      }
      console.log(number + "  :  " + isMarketing);
      //固定电话,不发送短信
      if(!number){
        num++;
        return cb();
      }
      request.post(sms.SMS_SERVER + sms.SMS_SEND_API_V2,
        function optionalCallback(err, httpResponse, body) {
          if (err) {
            console.error('send message failed:', err);
          }else{
            console.log('send message successful!  Server responded with:' + body);
          }
          num++;
          cb();
        }).form({
          "apikey": (isMarketing ? sms.MARKETING_API_KEY : sms.API_KEY),
          "mobile": number,
          "text": text
        });
    },
    function (err, res) {
      if (err) console.log("Error Sms " + err);
      console.log('all has completed');
    });
};
/**
 *
 * @param params
 * @returns {boolean}
 */
exports.isAllExist = function (params) {
  for (var i = 0; i < params.length; i++) {
    if (!(params[i] || params[i] == 0 || params == ""))
      return false;
  }
  return true;
};
/**
 *
 * @param param
 * @param can
 * @returns {boolean}
 */
exports.isExist = function (param, can) {
  if (!(param || param == 0 || param == ""))
    return false;
  return true;
};
/**
 *
 * @returns {string}
 */
exports.generateAuthCode = function () {
  return (Math.random() + "").substr(2, 6);
};
/**
 * 推送信息
 * @param client
 */
function pushMsg(client, userId, msgType, msgTitle, msgDescription) {
  console.log("pushing msg!!");
  var opt = {
    push_type: 1,//推送类型,1单播,2组播,3所有
    user_id: userId
    //channel_id: "5222687915086388201",
    //device_type: 4
    //ios特有字段，可选
    //aps: {
    //  alert: "朱李叶消息提醒",
    //  Sound: "",
    //  Badge: 0
    //}
    //message_type: msgType,//消息类型,默认0为消息,1为通知
    //messages: JSON.stringify([msg]),
    //msg_keys: JSON.stringify(["zly_push_key"])
  };
  switch (msgType) {
    case 0:
      console.log("Msg type 0");
      opt["message_type"] = 0;
      opt["messages"] = JSON.stringify([msgTitle]);
      opt["msg_keys"] = JSON.stringify(["zly_push_key"]);
      break;
    case 1:
      console.log("Msg type 1");
      opt["message_type"] = 1;
      opt["messages"] = JSON.stringify([
        {
          title: msgTitle,
          description: msgDescription
        }
      ]);
      opt["msg_keys"] = JSON.stringify(["zly_push_key"]);
      break;
    default:
      console.log("Msg type default");
      break;
  }
  client.pushMsg(opt, function (err, result) {
    console.log("Push callback!!");
    if (err) {
      console.log(err);
      return;
    }
    console.log(result);
  })
}
/**
 * push
 * 参考文档
 * http://developer.baidu.com/wiki/index.php?title=docs/cplat/push/sdk/phpserver
 */
exports.push = function (userPushId, msgType, msgTitle, msgDescription, refreshMsg, callback) {

  var back = function (status, result) {
    if (callback) {
      return callback(status, result);
    } else {
      return;
    }
  };

  if (!userPushId || userPushId == "")
    back(true, null);

  var opt = {//3235210
    ak: 'UhKLwOGvIZuWktxoRKniPvwn',
    sk: 'cfiDmO9W4WhZpmQ6FBCBR8xxT8Ckn1Gm'
  };
  var client = new Push(opt);
  //pushMsg(client, userPushId, type, msgTitle, msgDescription);

  console.log("pushing msg!!");
  var opt = {
    aps: {
      alert: "朱李叶消息提醒",
      Sound: 'default',
      Badge: 0
    },
    push_type: 1,//推送类型,1单播,2组播,3所有
    user_id: userPushId//百度pushId
  };
  switch (msgType) {
    case 0:
      console.log("Msg type 0");
      opt["message_type"] = 0;
      opt["messages"] = JSON.stringify([msgTitle]);
      opt["msg_keys"] = JSON.stringify(["zly_push_key"]);
      break;
    case 1:
      console.log("Msg type 1");
      opt["message_type"] = 1;
      opt["messages"] = JSON.stringify([
        {
          title: msgTitle,
          description: msgDescription
        }
      ]);
      opt["msg_keys"] = JSON.stringify(["zly_push_key"]);
      break;
    case 2:
      console.log("Msg type 2");
      opt["message_type"] = 0;
      opt["aps"].alert = JSON.stringify([refreshMsg]);
      opt["messages"] = JSON.stringify([refreshMsg]);
      opt["msg_keys"] = JSON.stringify(["zly_push_key"]);
      break;
    default:
      console.log("Msg type default");
      break;
  }
  client.pushMsg(opt, function (err, result) {
    console.log("Push callback!!");
    if (err) {
      console.log(err);
      return back(false, err);
    } else {
      return back(true, result);
    }
  })

};
/**
 *
 * @param data
 * @param validation
 * @param onSuccess
 * @param onFailure
 * @returns {*}
 */
exports.validate = function (data, validation, onSuccess, onFailure) {
  if (!data)
    return onFailure(handler.COMMON_MISSING_FIELDS, data);

  console.log("req payload: " + util.inspect(data));
  var required = validation.required || [];
  var optional = validation.optional || [];
  var mandatory = validation.mandatory || [];

  if (required) {
    var fields = Object.keys(data);
    var diff = _.difference(required, fields);
    /* Be careful of the order of the parameters of _.difference.
     * We will only go fail if there are missing fields.
     * If there are more, we will go succeed.
     */
    if (diff.length > 0)
      return onFailure(handler.COMMON_MISSING_FIELDS, diff);
  }

  for (field in mandatory) {
    if (mandatory[field] != data[field])
      return onFailure(handler.COMMON_WRONG_FIELDS, field);
  }

  //Get the union fields
  fields = _.union(required, optional);

  // 清洗数组null
  for (f in fields) {
    if (data[fields[f]] instanceof Array) {
      data[fields[f]] = _.without(data[fields[f]], null);
    }
  }

  //Pick the fields from data
  return onSuccess(handler.CREATED, _.pick(data, fields));
};

exports.getRandomNum = function (Min, Max) {
  var Range = Max - Min;
  var Rand = Math.random();
  return (Min + Math.round(Rand * Range));
};
/**
 * 获取随机数,返回字符串,前缀补零
 * Ex:
 * 1. getRandomNumByStr(0,999,6) = '000724'
 * 2. getRandomNumByStr(0,999,2) = '985'
 * 3. getRandomNumByStr(0,999,2) = '079'
 *
 * @param Min
 * @param Max
 * @param charNum 字符个数,不足补0
 * @returns {*}
 */
exports.getRandomNumByStr = function (Min, Max, charNum) {
  var MaxStr = (Max || "") + "";
  var strLen = (MaxStr.length > charNum)? MaxStr.length : charNum;
  var Range = Max - Min;
  var Rand = Math.random();
  var result = (Min + Math.round(Rand * Range)) + "";
  var resLen = result.length;
  for (var i = 0; i < (strLen - resLen); i++)
    result = "0" + result;
  return result;
};
exports.getNumByStr = function (num, charNum) {
  var num = num + "";
  var strLen = (num.length > charNum)? num.length : charNum;
  var numLen = num.length;
  for (var i = 0; i < (strLen - numLen); i++)
    num = "0" + num;
  return num;
};
/**
 * MM月dd日hh时mm分
 * @param time
 * @returns {string}
 */
exports.genCommonDate = function (time) {
  var d = new Date(time);
  var dstring = "";
  dstring += d.getMonth() + 1;
  dstring += "月";
  dstring += d.getDate();
  dstring += "日";
  dstring += d.getHours() + "时" + d.getMinutes() + "分";

  return dstring;
};

/**
 * yyyy-MM-dd
 * @param time
 * @returns {string}
 */
exports.getDate = function (time) {
  var d = new Date(time);
  return d.format("yyyy-MM-dd");
};

/**
 * yyyy-MM-dd 00:00:00
 * @param time
 * @returns {string}
 */
exports.getDateMidnight = function (time) {
  var d = new Date(time);
  return d.format("yyyy-MM-dd 00:00:00");
};

exports.getNextDateMidnight = function (time) {
  var d = new Date(time + (24 * 60 * 60 * 1000));
  return d.format("yyyy-MM-dd 00:00:00");
};

/**
 * yyyy-MM-dd
 * @param time
 * @returns {string}
 */
exports.getyyyyMMdd = function (time) {
  var d = new Date(time);
  return d.format("yyyyMMdd");
};


exports.getyyyyMMddhhmm = function (time) {
  var d = new Date(time);
  return d.format("yyyyMMddhhmm");
};


exports.getyyyyMMddhhmmss = function (time) {
  var d = new Date(time);
  return d.format("yyyyMMddhhmmss");
};


exports.dateFormat = function (time, format) {
  var d = new Date(time);
  return d.format(format);
};

/**
 * 日期格式化方法
 * @param format
 * @returns {*}
 */
Date.prototype.format = function (format) {
  var date = {
    "M+": this.getMonth() + 1,
    "d+": this.getDate(),
    "h+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3),
    "S+": this.getMilliseconds()
  };
  if (/(y+)/i.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in date) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1
        ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
    }
  }
  return format;
};

exports.validateSid = function (sid) {
  //var sidReg = new RegExp(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/);
  var sidReg = new RegExp(/^[1-9]([0-9]{13}|[0-9]{16})([0-9]|[x,X])$/);
  if(sidReg.test(sid)){
    return true;
  }
  return false;
};
/**
 *
 * @param docChatNum 热线号
 * @param perPartLen 每部分的长度
 * @returns {string} 123-456-789-0
 */
exports.stringifyDocChatNum = function (docChatNum, perPartLen) {
  docChatNum += '';
  var len = docChatNum.length,
      perPartLen = perPartLen || 3,
      partNum = Math.ceil(len/perPartLen);
  var numArray = [];
  if(partNum > 2){
    for(var i = 0; i< partNum; i++){
      numArray.push(docChatNum.substr(i * perPartLen, perPartLen));
    }
  }else{
    numArray = [docChatNum];
  }
  return numArray.join('-');
};

/**
 *
 * @param number
 * @param code
 */
exports.sendVoice = function(number , code){
  if (!number || number == "") {
    return;
  }
  if (!code || code == "") {
    return;
  }
  request.post(sms.VOICE_SERVER + sms.VOICE_API,
    function optionalCallback(err, httpResponse, body) {
      if (err) {
        return console.error('send message failed:', err);
      }
      console.log('send message successful!  Server responded with:' + body);
    }).form({
    "apikey": sms.API_KEY,
    "mobile": number,
    "code": code//"642401",
  });
};

var MD5 = function (data, salt, upper){
  if (data && salt) data += salt;
  if (upper)
    return crypto.createHash('md5').update(data).digest('hex').toUpperCase();
  else
    return crypto.createHash('md5').update(data).digest('hex');
};

exports.genCommonMD5 = MD5;
/**
 * Juliye MD5加密
 * @param data
 * @param isInit
 * @returns {*}
 */
exports.genJuliyeMD5 = function (data, isInit) {
  if (isInit){
    // 明文 - md5 - md5
    return MD5(MD5(data), server.secret, true);
  }else{
    // data(一次md5) - md5
    return MD5(data, server.secret, true);
  }
};
exports.verifyAli = function (algorithm, publicKey, sig, data) {
  algorithm = algorithm || 'RSA-SHA1';
  publicKey = publicKey || '';
  var verify = crypto.createVerify(algorithm);
  verify.update(data);
  return verify.verify(publicKey, sig, 'hex');
}

exports.getRandomFeiyuNum = function(){
  var maxNum = 1;
  var randomNum = Math.floor(Math.random()* 2);
  console.log("randomNum", randomNum);
  return CONS.callbackPhonesFeiyuCloud[randomNum];
}
/**
 *
 * @param numArray
 * @param theTenPower 十的n次幂
 * @returns {number}
 */
exports.getNumsPlusResult = function (numArray, theTenPower) {
  theTenPower = theTenPower || 100;
  var result = 0;
  for(var i = 0; i < numArray.length; i++){
    result += Math.round(Number(numArray[i]) * theTenPower);
  }
  return result / theTenPower;
}

exports.setExpiredAtSomeDate = function (date) {
  //<24,当月24号;>24,下月24号
  date = Number(date);
  var curDate = new Date().getDate();
  var curTime = new Date();
  var expiredAt = curDate > date ? new Date(curTime.getFullYear() + '-'
    + (curTime.getMonth() + 2) +'-' +  date + ' 23:59:59:999') : new Date(curTime.getFullYear() + '-'
    + (curTime.getMonth() + 1) +'-' +  date + ' 23:59:59:999');
  return expiredAt.getTime();
};
exports.setValidAtSomeDate = function (date) {
  //<24,当月24号;>24,下月24号
  date = Number(date);
  var curDate = new Date().getDate();
  var curTime = new Date();
  var expiredAt = curDate > date ? new Date(curTime.getFullYear() + '-'
    + (curTime.getMonth() + 2) +'-' +  date + ' 00:00:00:000') : new Date(curTime.getFullYear() + '-'
    + (curTime.getMonth() + 1) +'-' +  date + ' 00:00:00:000');
  return expiredAt.getTime();
};

exports.setValidAtSomeMonth = function (nowTS, validMonths) {
  var nowTime = new Date(nowTS);
  var nowMonth = nowTime.getMonth();
  nowTime = new Date(nowTime.setMonth(nowMonth + validMonths));
  var expiredAt =  new Date(nowTime.getFullYear() + '-' + (nowTime.getMonth() + 1) + '-' + nowTime.getDate() +' 23:59:59:999');
  console.log('setValidAtSomeMonth:', expiredAt);
  return expiredAt.getTime();
};


//==============from zylcare-web=====
exports.filterParams = function(req,res,fields,succFn){
  var required = fields.required||[]
      ,optional = fields.optional||[]
      ,all = _.union(required,optional)
      ,data = _.extend(req.params,req.query,req.body)
      ,paramKeys = Object.keys(data)
      ,diff = _.difference(required,paramKeys);
  if(diff.length > 0)
    return handler.COMMON_MISSING_FIELDS(res,diff);
  for(var k in all){
    if(!data[all[k]] && data[all[k]] !== 0){
      delete data[all[k]];
    }
  }
  succFn(_.pick(data,all));
};

/**
 * 字符串补齐
 * @param str
 * @param n
 * @param key
 * @returns {*}
 */
exports.pad = function(str, n, key){
  "use strict";
  var len = str.toString().length;
  while (len < n){
    str = '' + key + str;
    len ++;
  }
  return str;
};

exports.toPinYin = function (oriStr) {
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

exports.getDistance = function (pointA, pointB) {
  var lat_rate = 111712.7; //1纬度 米
  var lon_rate = 102834.7; //1经度 米
  console.log(pointA, pointB);
  return Math.ceil(Math.sqrt(Math.pow((pointA[1] - (pointB && pointB[1] || 0) ) * lat_rate, 2) + Math.pow((pointA[0] - (pointB && pointB[0] || 0)) * lon_rate, 2)));
}

exports.formatDistance = function (distance){
  //distance单位米
  if(distance < 100){
    return '<100m';
  }else if(distance < 1000){
    return distance + 'm';
  }else if(distance < 10000){
    return Math.ceil(distance * 0.01) / 10 + 'km';
  }else{
    return '>10km';
  }
}
/**
 *  代金券取整规则
 * 1、金额小于1元，向上取整（0.5取1）
 * 2、金额大于1元，小数四舍五入取整（5.8取6，5.3取5）
 * @param value
 * @returns {number}
 */
exports.couponValueRule = function (value) {
  if(value <= 0){
    return 0;
  }else if(value < 1){
    return 1;
  }else {
    return Math.round(value);
  }
}

/**
 * 对int类型数据的格式化处理
 规则：
 4    4
 4.1  4.10（只有1位小数的时候补齐）
 4.11 4.11
 * @param num
 * @returns {*}
 */
exports.returnFloat = function(value){
  var value=Math.round(parseFloat(value)*100)/100;
  var xsd=value.toString().split(".");
  if(xsd.length==1){
    // value=value.toString()+".00";
    return value;
  }
  if(xsd.length>1){
    if(xsd[1].length<2){
      value=value.toString()+"0";
    }
    return value;
  }
}