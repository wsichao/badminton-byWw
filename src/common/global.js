/**
 * 全局方法定义
 * Created by Mr.Carry on 2017/5/22.
 */
"use strict";
//global.xxx = 'xxx';

/**
 * 引入businessError 文件
 * **/
var info = require("./Errors.json"),
  constants = require('../../app/configs/constants'),
  serverConfigs = require('../../app/configs/server'),
  pinyin = require('pinyin'),
  mongoose = require('mongoose'),
  crypto = require('crypto'),
  _  = require('underscore'),
  qiniu = require('qiniu'),
  qiniuConfigs = require('../../app/configs/qiniu'),
  fs = require('fs');

let regionUtils = require('../../lib/regionUtils');



global.specialCities = constants.specialCities;
global.membershipCardNo = constants.membershipCardNo;
global.shopAuthorizedStatus = constants.shopAuthorizedStatus;
global.opShopProp = constants.opShopProp;
global.couponRateInCPS = constants.couponRateInCPS;
global.couponRateInCPS = constants.couponRateInCPS;
global.ZLYCARE_DOC_EMCHAT_ID_RUNTIME = constants.ZLYCARE_DOC_EMCHAT_ID_RUNTIME;
global.ZLYCARE_DOC_EMCHAT_SECRET_RUNTIME = constants.ZLYCARE_DOC_EMCHAT_SECRET_RUNTIME;
global.ZLYCARE_DOC_EMCHAT_ORG_NAME = constants.ZLYCARE_DOC_EMCHAT_ORG_NAME;
global.ZLYCARE_DOC_EMCHAT_APP_NAME = constants.ZLYCARE_DOC_EMCHAT_APP_NAME;
global.RECOMMEND_BAK = constants.RECOMMEND_BAK;
global.RECOMMEND_ASS = constants.RECOMMEND_ASS;
global.RECOMMEND_AD = constants.RECOMMEND_AD;
global.DoctorId_00120 = constants.DoctorId_00120;
global.twoFourHotLineTeamId = constants.twoFourHotLineTeamId;
global.SENIOR_COST = constants.SENIOR_COST;
global.webTokenSalt = 'zlycare';
global.activity_0624_no = '2017062400001';
global.FREE_MEMBERSHIP_FOR_NEW = '2017062200000';
global.FREE_MEMBERSHIP_FOR_NEW_CONFIG_ID = '5947a1a2b1bce56941cde761';
global.activity_test_day = '2017-06-24';
global.membershipVals = constants.membershipVals;
global.momentVisibleDays = 7 ;
global.pageSize20 = 20;
global.specialShopTypes = constants.specialShopType ;
global.neZS = {$ne: 'zs'};//source != 'zs',非专属热线来源
global.globalSource = 'source';//'source';//source != 'zs',非专属热线来源
global.webHOST = serverConfigs.webHOST; //
global.qrToPath = constants.qrToPath; //二维码扫描跳转

function BackendBusinessError(message, code, httpCode, err) {
  this.message = message;
  this.code = code;
  this.httpCode = httpCode;
  this.detail = "";
  if(err){
    this.prototype = err;
  }else{
    this.prototype = new Error();
  }
}

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

global.couponValueRule = function (value) {
  if(value <= 0){
    return 0;
  }else if(value < 1){
    return 1;
  }else {
    return Math.round(value);
  }
}
global.isUUID24bit = function (uuid) {
  let uuid_24bit_style = /\w{24}/;
  return uuid_24bit_style.test(uuid);
};


global.isExist = function (param) {
  if (!(param || param == 0 || param == ""))
    return false;
  return true;
};

global.userInfoAuth = function (req, resObj) {
  let appUserId = req.identity ? req.identity.userId : '';
  let appUser = req.identity && req.identity.user ? req.identity.user : null;

  if (!isUUID24bit(appUserId) || !isExist(appUser)) {
    console.log('user info err!');
    let defer = Backend.Deferred.defer();
    defer.resolve(resObj);
    return defer.promise;
  }
  req.userId = appUserId;
  req.user = appUser;
}

global.isUserInfoAuthorized = function (req) {
  let appUserId = req.identity ? req.identity.userId : '';
  let appUser = req.identity && req.identity.user ? req.identity.user : null;
  req.userId = appUserId;
  req.user = appUser;
  if (!isUUID24bit(appUserId) || !isExist(appUser)) {
    return false;
  }
  return true;
}

/**
 * 数组过滤
 * @param arr
 * @param filterFunc
 */
global.arrayFilter = function (arr, filterFunc) {
  let newArr = [];
  arr.forEach(function (item) {
    if (filterFunc(item)) newArr.push(item);
  });
  return newArr;
}

global.dateFormat = function (time, format) {
  var d = new Date(time);
  return d.format(format);
};


global.getCurrentPageSlice = function (req, defaultFrom, defaultPageSize, defaultSort,currentSize) {
  let from = defaultFrom;
  let pageSize = defaultPageSize;
  let size = parseInt(req.query.pageSize);
  let num = parseInt(req.query.pageNum);
  let sorts = {'createdAt': 1};//按日期从小到大排列//{'createDate': -1}//按日期从大到小排序
  //pageSlice.sort = sort;
  //console.info(size + " : " + num + "  :" + typeof(size));
  if ((typeof(size) === 'number') && size > 0)
    pageSize = size;
  if ((typeof(num) === 'number') && num > 0)
    from = num * pageSize;
  let slices = {skip: from, limit: pageSize};
  if(currentSize){
    slices.skip = currentSize;
  }
  if (defaultSort) {
    sorts = defaultSort;
    slices.sort = sorts;
  } else {
    slices.sort = sorts;
  }

  return slices;
};

/**
 * yyyy-MM-dd 00:00:00
 * @param time
 * @returns {string}
 */
global.getDateMidnight = function (time) {
  let d = new Date(time);
  return d.format("yyyy-MM-dd 00:00:00");
};

global.getDateBeginTS = function (time) {
  let d = new Date(time);
  return new Date(d.format("yyyy-MM-dd 00:00:00:000")).getTime();
};

global.getDateEndTS = function (time) {
  let d = new Date(time);
  return new Date(d.format("yyyy-MM-dd 23:59:59:999")).getTime();
};

global.getDateBeginTSInNaturalDays = function (time, days) {
  let d = new Date(time);
  d = new Date(d.setDate(d.getDate + days - 1));
  return new Date(d.format("yyyy-MM-dd 00:00:00:000")).getTime();
};

global.getDateEndTSInNaturalDays = function (time,days) {
  let d = new Date(time);
  d = new Date(d.setDate(d.getDate() + days - 1));
  return new Date(d.format("yyyy-MM-dd 23:59:59:999")).getTime();
};

/**
 * 通用应答的Response实体结构
 * @param res
 * @param status
 * @param data
 * @param type
 */
global.commonResponse = function (res, status, data, type) {
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
 *
 * @param errCode
 * @returns {BackendBusinessError}
 */
global.getBusinessErrorByCode = function (errCode, err) {
  if (info.hasOwnProperty(errCode)) {
    return new BackendBusinessError(info[errCode].businessMessage, errCode, info[errCode].httpCode, err);
  } else {
    return new BackendBusinessError(errCode, errCode, 400, err);
  }
};


global.toPinYin = function (oriStr) {
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

/**
 * 获取
 * @param req
 * @return ip
 */
global.getClientIp = function (req) {
  var ip = req.headers['x-forwarded-for'] ||
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress || '';
  if (ip.split(',').length > 0) {
    ip = ip.split(',')[0]
  }
  return ip;
}
global.getRandomNum = function (Min, Max) {
  var Range = Max - Min;
  var Rand = Math.random();
  return (Min + Math.round(Rand * Range));
};
global.getRandomCoupon  = function (cps){
  var random = getRandomNum(couponRateInCPS.min * 100, couponRateInCPS.max * 100);
  //console.log('random:', random);
  var randomVal = Math.round((cps || 0) * random / 10) / 10;
  return couponValueRule(randomVal);
}
global.isInSomeNatureDay = function (time, days) {
  let nowTS = Date.now();
  time = new Date(time);
  let date = time.getDate();
  date = new Date(time.setDate(date + days));
  let days_mid = new Date(date.format("yyyy-MM-dd 00:00:00")).getTime() - 1;
  //console.log(days_begin, new Date(days_begin));
  if(days_mid > nowTS){
    return true;
  }
  return false;
}
/**
 *
 * @param time
 * @param days 几个自然日
 * @returns {boolean}
 */
global.getSomeDaysMidNight = function (time, days) {
  let nowTS = Date.now();
  time = new Date(time);
  let date = time.getDate();
  date = new Date(time.setDate(date + days));
  let days_begin = new Date(date.format("yyyy-MM-dd 00:00:00")).getTime();
  //console.log(days_begin, new Date(days_begin));
  return days_begin;
}

global.commonMD5 = function (data, salt, upper) {
  if (data && salt) data += salt;
  // console.log("data:" + data);
  if (upper)
    return crypto.createHash('md5').update(data).digest('hex').toUpperCase();
  else
    return crypto.createHash('md5').update(data).digest('hex');
};
/**
 * 获取MongoDB中的ObjectId对象
 * @returns {*}
 */
global.getNewObjectId = function () {
  var id = mongoose.Types.ObjectId();
  console.info("new Object ID : " + id);
  return id;
};
/**
 * 验证web中api访问,token是否有效
 * @param cookies req.cookies
 * @param referer req.headers['referer']
 * @returns {boolean}
 */
global.verifyWebApiToken = function (cookies, referer) {
  //页面内ajax请求,referer指向访问页面链接
  let token = cookies && cookies.token || '';
  let ts = cookies && cookies.ts || '';
  let base_url = referer ? referer.substr(referer.indexOf('/1/')) : '';
  let gen_token = commonMD5(base_url + ts, webTokenSalt, true);
  if(token == gen_token){
    console.log('web api token valid');
    return true;
  }
  console.log('web api token invalid');
  return false;
}

/**
 * 上传7牛
 * */
global.uploadLocalFile = function(file , fileKey , ano){

  //需要填写你的 Access Key 和 Secret Key
  qiniu.conf.ACCESS_KEY = qiniuConfigs.ACCESS_KEY;
  qiniu.conf.SECRET_KEY = qiniuConfigs.SECRET_KEY;

//要上传的空间
  var bucket = qiniuConfigs.BUCKET;

//上传到七牛后保存的文件名
  var key = fileKey;

//构建上传策略函数
  function uptoken(bucket, key) {
    var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key);
    return putPolicy.token();
  }

//生成上传 Token
  var token = uptoken(bucket, key);

//要上传文件的本地路径
  var filePath = file;

//构造上传函数
  function uploadFile(uptoken, filePath ) {
    var extra = new qiniu.io.PutExtra();
    qiniu.io.putFile(uptoken , key , filePath, extra, function(err, ret) {
      if(!err) {
        // 上传成功， 处理返回值
        console.log(ret.hash, ret.key, ret.persistentId);
        fs.unlink(file , function(err){
          console.log('remove success!');
        });

      } else {
        // 上传失败， 处理返回代码
        console.log(err);
      }
      ano(err,ret);
    });
  }

//调用uploadFile上传
  uploadFile(token, file);

};

/**
 *
 * @param numArray
 * @param theTenPower 十的n次幂
 * @returns {number}
 */
global.getNumsPlusResult = function (numArray, theTenPower) {
  theTenPower = theTenPower || 100;
  var result = 0;
  for(var i = 0; i < numArray.length; i++){
    result += Math.round(Number(numArray[i]) * theTenPower);
  }
  return result / theTenPower;
}
/**
 * 限制接口访问频率,5s
 * @param userId
 * @param api
 * @returns {promise}
 */
global.limitApiCall = function (userId, api, seconds) {
  var key = userId + '_' + api;
  console.log(key);
   return Backend.cache.get(key)
  .then(function(value){
    console.log('value',value);
    if(value){
      return true;
    }else{
      Backend.cache.set(key, 1, seconds || 8);//5秒
      return false;
    }
  })
}
/**
 * 删除某个redis key
 * @param key
 * @returns {*}
 */
global.deleteRedisKey = function (key) {
  var key = userId + ':' + api;
  return Backend.cache.delete(key)
    .then(function(_res){
      console.log(_res);
    });
}

global.isShopAuthorized = function (shopVenderApplyStatus){
  return constants.shopAuthorizedStatus.indexOf(shopVenderApplyStatus) > -1;
}

global.getMomentType = function (userInfo) {
  var momentType = '';
  var shopVenderApplyStatus = userInfo.shopVenderApplyStatus;
  var shopType = userInfo.shopType || '';
  var docChatNum = userInfo.docChatNum || '';
  var hasMomentLocation = userInfo.hasMomentLocation || false;
  if(isShopAuthorized(shopVenderApplyStatus)){
    momentType = 'shop';
    if(shopType == '医疗'){
      momentType = 'medical';
    }
    if(hasMomentLocation){
      momentType = 'personal';
    }
  }else if(/^806/.test(docChatNum)){
    momentType = 'finance';
  }else {
    momentType = 'personal';
  }
  return momentType;
}
/**
 * 获取方形区域的左下角和右上角的坐标
 * @param coordinate_str
 * @returns {{left_bottom_coordinate: Array.<T>, right_top_coordinate: Array.<T>}}
 */
global.getCoordinateFromStr = function (coordinate_str) {
  let coordinate_array = coordinate_str.split(';');
  let left_bottom_coordinate = (coordinate_array[0] || '0,0').split(',').reverse();
  let right_top_coordinate = (coordinate_array[1] || '0,0').split(',').reverse();
  return {
    left_bottom_coordinate: [Number(left_bottom_coordinate[0]), Number(left_bottom_coordinate[1])],
    right_top_coordinate: [Number(right_top_coordinate[0]), Number(right_top_coordinate[1])]
  }
};

/**
 * 验证手机号
 * @param phone
 * @returns {boolean}
 */
global.isValidPhone = function (phone){
  var mobileReg = /^(13|14|15|18|17|19)[0-9]{9}$/;
  return mobileReg.test(phone);
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
global.getRandomNumByStr = function (Min, Max, charNum) {
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

/**
 * 获取手机号类型
 * @param phone
 * @returns {boolean}
 */
global.getPhoneType = function (phone){
  var mobileReg = /^(13|14|15|18|17|19)[0-9]{9}$/;
  var fixedReg = /^0[0-9]{9,11}/;
  if(mobileReg.test(phone)){
    return 'mobile';
  }else if(fixedReg.test(phone) && regionUtils.canMatchRegion(phone)){
    return 'fixed';
  }else{
    return 'other';
  }
};

global.setHttpLog = function (res, errCode) {
  if(errCode && errCode != 200) //有错误不入该日志
    return;
  var reqInfo = res.reqInfo;
  reqInfo.endAt= Date.now();
  var userId = reqInfo.headers["x-docchat-user-id"] || '0';
  var token = reqInfo.headers["x-docchat-session-token"] || '0';
  var appVersion = reqInfo.headers["x-docchat-app-version"] || '0';
  var deviceId = reqInfo.headers["x-docchat-application-device-mark"] || '0';
  var userAgent = reqInfo.headers["userAgent"] || '0';
  //userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 8_4 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12H143";

  var method = reqInfo.method || '';
  var defaultIp = '127.0.0.1';//'127.0.0.1';
  var clientIp = process.env.NODE_ENV == 'production' ? reqInfo.ip || defaultIp : '182.92.154.16';
  var hostName = serverHostName ?  serverHostName : os.hostname();

  //定义log日志输出格式
  //2017-08-14_15:01:20:112|2017-08-14_15:01:21:112|1|zlyChat|5819ed2593740e996bf3f824|POST|URL|PARAMS|httpReqPayload|clientIP|serverIP||
  var logger_log = logger.getLogger('HTTP_DATE_INFO');

  var log_format = '|' + new Date(reqInfo.beginAt).format("yyyy-MM-dd hh:mm:ss:SSS") + '|' + new Date(reqInfo.endAt).format("yyyy-MM-dd hh:mm:ss:SSS") + '|' +(reqInfo.endAt - reqInfo.beginAt) +
    '|' + userId + '|' + token + '|' + appVersion + '|' + deviceId +
    '|' + reqInfo.method + '|' + reqInfo.url + '|' + JSON.stringify(reqInfo.params || {}) +
    '|' + JSON.stringify(reqInfo.body || {}) +
    '|' + clientIp + '|' + hostName +'|' + userAgent +
    '|' + '{}' + '|' + 'noStack' +
    '|' + JSON.stringify(reqInfo.headers || {}) +
    '||';
  logger_log.info(log_format);
}
global.setHttpErrLog = function (res, err) {
  if(err && err.prototype && err.prototype.stack){
    console.log(err.prototype.stack);
  }
  var reqInfo = res.reqInfo;
  reqInfo.endAt= Date.now();
  var userId = reqInfo.headers["x-docchat-user-id"] || '0';
  var token = reqInfo.headers["x-docchat-session-token"] || '0';
  var appVersion = reqInfo.headers["x-docchat-app-version"] || '0';
  var deviceId = reqInfo.headers["x-docchat-application-device-mark"] || '0';
  var userAgent = reqInfo.headers["userAgent"] || '0';
  //userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 8_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12D508 MicroMessenger/6.1.5 NetType";

  var method = reqInfo.method || '';
  var defaultIp = '127.0.0.1';//'127.0.0.1';
  var clientIp = process.env.NODE_ENV == 'production' ? reqInfo.ip || defaultIp : '182.92.154.16';
  var hostName = serverHostName ?  serverHostName : os.hostname();

  var logger_log = logger.getLogger('HTTP_DATE_ERROR');

  var log_format = '|' + new Date(reqInfo.beginAt).format("yyyy-MM-dd hh:mm:ss:SSS") + '|' + new Date(reqInfo.endAt).format("yyyy-MM-dd hh:mm:ss:SSS") + '|' +(reqInfo.endAt - reqInfo.beginAt) +
    '|' + userId + '|' + token + '|' + appVersion + '|' + deviceId +
    '|' + reqInfo.method + '|' + reqInfo.url + '|' + JSON.stringify(reqInfo.params || {}) +
    '|' + JSON.stringify(reqInfo.body || {}) +
    '|' + clientIp + '|' + hostName +'|' + userAgent +
    '|' + JSON.stringify(err) + '|' + String(err && err.prototype && err.prototype.stack || '').replace(/\n/g, ';') +
    '|' + JSON.stringify(reqInfo.headers || {}) +
    '||';
  logger_log.info(log_format);
}

global.getDistance = function (pointA, pointB) {
  var lat_rate = 111712.7; //1纬度 米
  var lon_rate = 102834.7; //1经度 米
  console.log(pointA, pointB);
  return Math.ceil(Math.sqrt(Math.pow((pointA[1] - (pointB && pointB[1] || 0) ) * lat_rate, 2) + Math.pow((pointA[0] - (pointB && pointB[0] || 0)) * lon_rate, 2)));
}

global.formatDistance = function (distance){
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