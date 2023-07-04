var
  commonUtil = require('../../lib/common-util'),
  constants = require('../configs/constants'),
  Statistic = require('../models/Statistics'),
  Log = require('../models/Log');

var LoggerService = function () {
};
LoggerService.prototype.constructor = LoggerService;

LoggerService.prototype.trace = function (data) {
  return Log.create(data);
};

LoggerService.prototype.getTraceDataByReq = function (req) {
  return {
    ip: req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip,
    terminalId: req.get(constants.HEADER_DEVICE_ID) || '',
    userId: req.get(constants.HEADER_USER_ID) || '',

    httpMethod: req.method,//请求方法
    httpUri: req.path,//请求Uri
    httpParams: req.query || {}, //请求参数
    httpReqPayload: req.body || {} //request payload
    //httpResPayload: req.method == "GET" ? "" : chunk //response payload
  };
};

/**
 * 获得指定用户收藏指定医生纪录
 * @param id
 * @param docChatNum
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
LoggerService.prototype.customerFavoriteTrace = function (id, docChatNum) {
  var condition = {'httpReqPayload.userId': id, 'httpReqPayload.docChatNum': docChatNum};
  condition.source = 'docChat';
  condition.httpUri = '/1/customer/favoriteDoc';
  condition.isDeleted = false;

  return Log.findOne(condition).exec();
};

//指定时间内被某ip访问某接口的访问
LoggerService.prototype.getCallNumTimeAgo = function (ip, httpUri, timeAgo) {
  var condition = {};
  condition.source = 'docChat';
  condition.isDeleted = false;
  condition.createdAt = {'$gte': Date.now() - timeAgo};
  condition.ip = ip;
  if (httpUri)
    condition.httpUri = httpUri;

  return Log.count(condition).exec();
};

LoggerService.prototype.getCallsNumTimeAgo = function (ip, HttpUris, timeAgo) {
  var condition = {};
  condition.source = 'docChat';
  condition.isDeleted = false;
  condition.createdAt = {'$gte': Date.now() - timeAgo};
  condition.ip = ip;
  if (HttpUris)
    condition.httpUri = {$in: HttpUris};

  return Log.count(condition).exec();
};

LoggerService.prototype.getCallOtherNumTimeAgo = function (ip, neHttpUri, timeAgo) {
  var condition = {};
  condition.source = 'docChat';
  condition.isDeleted = false;
  condition.createdAt = {'$gte': Date.now() - timeAgo};
  condition.ip = ip;
  if (neHttpUri)
    condition.httpUri = {$ne: neHttpUri};

  return Log.count(condition).exec();
};

/**
 * 所有医生今天被扫码次数
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
LoggerService.prototype.getTodayScannedNumAllDoctor = function () {
  var dateBegin = new Date(commonUtil.getDateMidnight(Date.now())).getTime();
  var dateEnd = new Date(commonUtil.getDateMidnight(Date.now() + constants.TIME_1_DAY)).getTime();
  var match = {};
  match.httpUri = /1\/doctor\/scanQRCode/;
  match.createdAt = {'$gte': dateBegin, '$lt': dateEnd};
  match.source = "docChat";
  match.isDeleted = false;
  var group = {};
  group._id = "$httpParams.docChatNum";
  group.count = {$sum: 1};
  var project = {'_id': 1, 'count': 1};

  return Log.aggregate({'$match': match}, {'$group': group}, {'$project': project}).exec();
};

/**
 * 所有医生今天患者下载次数
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
LoggerService.prototype.getTodayDownloadNumAllDoctor = function () {
  var dateBegin = new Date(commonUtil.getDateMidnight(Date.now())).getTime();
  var dateEnd = new Date(commonUtil.getDateMidnight(Date.now() + constants.TIME_1_DAY)).getTime();
  var match = {};
  match.httpUri = /1\/doctor\/downloadTrace/;
  match.createdAt = {'$gte': dateBegin, '$lt': dateEnd};
  match.source = "docChat";
  match.isDeleted = false;
  var group = {};
  group._id = "$httpParams.docChatNum";
  group.count = {$sum: 1};
  var project = {'_id': 1, 'count': 1};

  return Log.aggregate({'$match': match}, {'$group': group}, {'$project': project}).exec();
};

/**
 * 所有医生今天被查询次数
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
LoggerService.prototype.getTodayQueryNumAllDoctor = function () {
  var dateBegin = new Date(commonUtil.getDateMidnight(Date.now())).getTime();
  var dateEnd = new Date(commonUtil.getDateMidnight(Date.now() + constants.TIME_1_DAY)).getTime();
  var match = {};
  match.httpUri = /1\/doctor\/infoByDocChatNum/;
  match.createdAt = {'$gte': dateBegin, '$lt': dateEnd};
  match.source = "docChat";
  match.isDeleted = false;
  var group = {};
  group._id = "$httpParams.docChatNum";
  group.count = {$sum: 1};
  var project = {'_id': 1, 'count': 1};

  return Log.aggregate({'$match': match}, {'$group': group}, {'$project': project}).exec();
};

/**
 * 所有医生今天被收藏次数
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
LoggerService.prototype.getTodayFavoritedNumAllDoctor = function () {
  var dateBegin = new Date(commonUtil.getDateMidnight(Date.now())).getTime();
  var dateEnd = new Date(commonUtil.getDateMidnight(Date.now() + constants.TIME_1_DAY)).getTime();
  var match = {};
  match.httpUri = "/1/customer/favoriteDoc";
  match.createdAt = {'$gte': dateBegin, '$lt': dateEnd};
  match.source = "docChat";
  match.isDeleted = false;
  var project = {'docChatNum': '$httpReqPayload.docChatNum'};
  var group = {};
  group._id = "$docChatNum";
  group.count = {$sum: 1};

  return Log.aggregate({'$match': match}, {'$project': project}, {'$group': group}).exec();
};

/**
 * 获取最近的首次关注Log列表
 * 
 * 规则定义2016-11-19: 
 * （正式上线后）统计最近一段时间内用户的首次收藏数据, 时间范围为:（ Statistic.Last_Rel_Upd_At ~ Now ）
 *  如果想要按自然日统计，只需每次在自然日的节点调用即可,即每日0点调用
 * 
 * 规则定义2016-11-14: 
 *  查询所有医生 昨天的!!! 首次用户收藏 ; 统计时间为每晚过了0点之后 
 *
 * @ 2016-11-14-1 上线后手工第一次执行 1478908800000 —— 1479081600000
 * @ 2016-11-14-2 第二次手工执行 1479081600000 —— 1479124000931
 * @ 2016-11-15   第三次手工执行 1479124000931 —— 1479211769571
 * @ 2016-11-16   第四次手工执行 1479211769571 —— 1479276582977
 * @ 2016-11-17   第五次手工执行 1479276582977 —— 1479343353848
 * @ 2016-11-18   第六次手工执行 1479343353848 —— 1479429888415
 * 
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
LoggerService.prototype.getTodayDoc1stFans = function (lastTime, nowTime) {

  // var todayBegin = new Date(commonUtil.getDateMidnight(Date.now())).getTime();
  // var yesterdayBegin = new Date(commonUtil.getDateMidnight(Date.now() - constants.TIME_1_DAY)).getTime();
  // var todayEnd = new Date(commonUtil.getDateMidnight(Date.now() + constants.TIME_1_DAY)).getTime();

  // match.isDeleted = false;
  var project = {
    'docChatNum': '$httpReqPayload.docChatNum',
    'userId': '$httpReqPayload.userId',
    'newUserId': '$userId',
    'createdAt': '$createdAt'};
  var options = {
    "new": false,//返回更新前的数据
    "upsert": false,
    "sort": {"createdAt": -1}
  };
  var now = nowTime || Date.now();//1480609501987;//修复20161201bug使用
  // Step 1. 查询上一次统计时间,并更新记录日期
  return Statistic.findOneAndUpdate({
    type: Statistic.CONS.TYPE.LAST_REL_UPD
  },{
    updatedAt: now
  },options).exec().then(function(_stat){
    var lastUpd = lastTime || _stat.updatedAt;
    var match = {};
    match.httpMethod = "PUT";
    match.httpUri = "/1/customer/favoriteDoc";
    match.createdAt = {'$gte': lastUpd, '$lt': now};
    match.source = "docChat";
    match["httpReqPayload." + constants.PARAM_IS_1ST_FV] = true;//首次关注, 关注动作会新增该字段标识
    // Step 2. 查询符合条件的Log列表信息
    return Log.aggregate({'$match': match}, {'$project': project}).exec()
      .then(function(_logs){
        return {
          logs: _logs,
          lastUpd: lastUpd
        }
      });
  })

};

/**
 * 所有医生今天被分享次数
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
LoggerService.prototype.getTodaySharedNumAllDoctor = function () {
  var dateBegin = new Date(commonUtil.getDateMidnight(Date.now())).getTime();
  var dateEnd = new Date(commonUtil.getDateMidnight(Date.now() + constants.TIME_1_DAY)).getTime();
  var match = {};
  match.httpUri = "/1/customer/shareDoctorTrace";
  match.createdAt = {'$gte': dateBegin, '$lt': dateEnd};
  match.source = "docChat";
  match.isDeleted = false;
  var project = {'docId': '$httpReqPayload.docId'};
  var group = {};
  group._id = "$docId";
  group.count = {$sum: 1};

  return Log.aggregate({'$match': match}, {'$project': project}, {'$group': group}).exec();
};

/**
 * seanliu
 * 查询顾问的第一个收藏粉丝
 */
LoggerService.prototype.getDsFirstFans = function (d) {
  if(d._id){
    var condition = {"httpReqPayload.doctorId" : d._id};
  }else{
    var condition = {"httpReqPayload.docChatNum" : d.docChatNum};
  }
  condition.createdAt = {$gt:d.createdAt};
  condition.source = 'docChat';
  condition.httpUri = {$in:['/1/customer/favoriteDoc','/customer/favoriteDoc']};
  condition.isDeleted = false;
  condition.httpMethod = 'PUT';

  var project = "httpReqPayload.customerPhone httpReqPayload.userId"
  return Log.findOne(condition,project,{"sort": {"createdAt": 1}}).exec();
};

/**
 * seanliu
 * 查询顾问D的所有收藏粉丝
 */
LoggerService.prototype.getDsFans = function (dIds) {

  var condition = {"httpReqPayload.doctorId" : {$in:dIds}};
  condition.source = 'docChat';
  condition.httpUri = {$in:['/1/customer/favoriteDoc','/customer/favoriteDoc']};
  condition.isDeleted = false;
  condition.httpMethod = 'PUT';

  var project = "createdAt httpReqPayload.doctorId httpReqPayload.customerPhone httpReqPayload.userId"
  return Log.find(condition,project,{"sort": {"createdAt": 1}}).exec();
};

LoggerService.prototype.getUsersFans = function (uIds) {

  var condition = {"userId" : {$in:uIds}};
  condition.source = 'docChat';
  condition.httpUri = {$in:['/1/customer/favoriteDoc','/customer/favoriteDoc']};
  condition.isDeleted = false;
  condition.httpMethod = 'PUT';

  var project = "createdAt httpReqPayload.doctorId httpReqPayload.customerPhone httpReqPayload.userId"
  return Log.find(condition,project,{"sort": {"createdAt": 1}}).exec();
}
module.exports = exports = new LoggerService();