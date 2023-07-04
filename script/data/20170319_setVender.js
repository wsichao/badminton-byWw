/**
 *  批量新建商业关系
 *  原始数据格式：
 *  (
 *    1. 开通日期
 *    2. 商铺热线号
 *    3. 商铺名称
 *    4. 关联热线号
 *    5. 热线号名称
 *  )
 *
 */
var
  Promise = require('promise'),
  xlsx = require('node-xlsx'),
  _ = require('underscore'),
  async = require('async'),
  CusSrv = require("../../app/services/CustomerService");

// 同步读取数据
var list = xlsx.parse("./data/左下角开权限.xlsx");
var data = list[0].data;
var len = data.length;
var now = 1490064121079; //1489584853689 1489630895682 1489759377222 1489802390852 1489882898518
var users = {};
var bizDocChatNum = 1;
var recmdDocChatNum = 2;
var rowBegin = 1;
console.log("data length : " + data.length);
console.log("data : " + data[bizDocChatNum],data[recmdDocChatNum]);

var docChatNums = [];
var userBizMap = {};
for(var i = rowBegin; i < data.length; i++){
  var row = data[i];
  if(!row){
    continue;
  }
  if(!row[bizDocChatNum] || !row[recmdDocChatNum]){
    console.log(i);
    continue;
  }
  userBizMap[row[bizDocChatNum]] = row[recmdDocChatNum];
  if(docChatNums.indexOf(row[bizDocChatNum] + '') < 0){
    docChatNums.push(row[bizDocChatNum] + '');
  }
  //if(docChatNums.indexOf(row[recmdDocChatNum] + '') < 0){
  //  docChatNums.push(row[recmdDocChatNum] + '')
  //}
}
console.log(docChatNums, docChatNums.length);
var RelRecmndFan = require("../../app/models/RelRecmndFan");
var Customer = require("../../app/models/Customer");

//异步处理
//1. 查询所有涉及到的用
 Customer.update({docChatNum: {$in: docChatNums}}, {$set: {isVender: true}})
  .then(function(){
    console.log('all has completed');
  },function (err) {
  if (err) console.log("Err: " + err);
});
