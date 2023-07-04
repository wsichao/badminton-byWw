/**
 * name docChatNum avatar
 * @type {*|exports|module.exports}
 */
global.mongoosePre = function (schema, schema_str) {
  schema.pre('count', function(){
    this._conditions.source = {$ne: 'zs'};
    //console.log(schema_str + ' count pre:', this._conditions);
  });
  schema.pre('find', function(){
    this._conditions.source = {$ne: 'zs'};
    //console.log(schema_str + ' find pre:', this._conditions);
  });
  schema.pre('findOne', function(){
    this._conditions.source = {$ne: 'zs'};
    //console.log(schema_str + ' findOne pre:', this._conditions);
  });
  schema.pre('findOneAndRemove', function(){
    this._conditions.source = {$ne: 'zs'};
    //console.log(schema_str + ' findOneAndRemove pre:', this._conditions);
  });
  schema.pre('findOneAndUpdate', function(){
    this._conditions.source = {$ne: 'zs'};
    //console.log(schema_str + ' findOneAndUpdate pre:', this._conditions);
  });
  schema.pre('insertMany', function(){
    this._conditions.source = {$ne: 'zs'};
    //console.log(schema_str + ' insertMany pre:', this._conditions);
  });
  schema.pre('update', function(){
    this._conditions.source = {$ne: 'zs'};
    //console.log(schema_str + ' update pre:', this._conditions);
  });
}

var
  Promise = require('promise'),
  xlsx = require('node-xlsx'),
  _ = require('underscore'),
  async = require('async'),
  commonUtil = require('../../lib/common-util'),
  Customer = require("../../app/models/Customer"),
  Doctor = require("../../app/models/Doctor"),
  MomentMsg = require("../../app/models/MomentMsg");

var list = xlsx.parse("./data/users_20170809_300.xlsx");//20170629
var from = "ops@20170809";
var data = list[0].data;
var len = data.length;
var counter = 0;

console.log("data length : " + data.length);
var users = [];
var userRefs = [];
var userMomentMsgs = [];
var errRows = [];
//var len = 3;
for(var i = 1; i < len; i++){
  var meta = data[i] || {};
  var userId = commonUtil.getNewObjectId();
  var userRefId = commonUtil.getNewObjectId();
  var userMomentMsgId = commonUtil.getNewObjectId();
  var momentListId = commonUtil.getNewObjectId();
  var name = meta[0] || '';
  var pinyinName = commonUtil.toPinYin(name);
  var docChatNum = meta[1] || '';
  var avatar =  meta[2] || '';
  var phoneNum =  meta[3] || '';
  //var nowTS = Date.now();
  var nowTS = 1502242543401;//20170802:1501667317589;//20170801:1501572034102//20170718:1500347295209;//20170629:1498718755836;//20170624:1498192499828;//20170623:1498115186544;//20170622:1498375239576;//2017?:1496660133248; //20170518: 1495103385478;
  var statisticsUpdatedAt = nowTS + 15 * 60 * 1000;
  var loginPassword = "93D80FDDA50F6EBBF5514924740DD72A";
  if(!name || !docChatNum || !avatar || !phoneNum) {
    errRows.push(name + docChatNum + avatar + phoneNum);
    break;
  }
  var user = {
    _id: userId,
    name: name,
    pinyinName: pinyinName,
    docChatNum: docChatNum,
    avatar: avatar,
    phoneNum: phoneNum,
    doctorRef: userRefId,
    from: from,
    loginPassword: loginPassword,
    statisticsUpdatedAt: statisticsUpdatedAt
  };
  var userRef = {
    _id: userRefId,
    name: name,
    pinyinName: pinyinName,
    docChatNum: docChatNum,
    avatar: avatar,
    phoneNum: phoneNum,
    from: from,
    statisticsUpdatedAt: statisticsUpdatedAt
  };
  var userMomentMsg = {
    userId: userId,
    momentList: [],
    createdAt: nowTS,
    statisticsUpdatedAt: statisticsUpdatedAt
  };
  users.push(user);
  userRefs.push(userRef);
  userMomentMsgs.push(userMomentMsg);
}
Customer.create(users);
Doctor.create(userRefs);
MomentMsg.create(userMomentMsgs);

console.log(errRows);
