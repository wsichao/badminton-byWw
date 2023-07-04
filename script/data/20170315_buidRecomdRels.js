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
var now = 1491022992663; //1489584853689 1489630895682 1489759377222 1489802390852 1489882898518
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
  if(docChatNums.indexOf(row[recmdDocChatNum] + '') < 0){
    docChatNums.push(row[recmdDocChatNum] + '');
  }
}
console.log(docChatNums, docChatNums.length);
var RelRecmndFan = require("../../app/models/RelRecmndFan");

 //异步处理
 //1. 查询所有涉及到的用户信息并缓存
require("../../app/models/Customer").find({docChatNum: {$in: docChatNums}}, "_id docChatNum doctorRef")
  .then(function(_users){
    if (!_users || _users.length <=0) return;
    console.log("users: " + _users.length);
    var docChatNumUserMap = _.indexBy(_users, 'docChatNum');
    var counter = 1;
    async.whilst(
      function () {
        return counter < len;
      },
      function (cb) {
        var meta = data[counter] || null;
        if (!meta) {
          counter++;
          return cb();
        }
        users = docChatNumUserMap;
        if(!users[meta[bizDocChatNum]] || !users[meta[recmdDocChatNum]]){
          console.log('not find:', meta[bizDocChatNum], meta[recmdDocChatNum]);
          counter++;
          return cb();
        }
        var rel = {
          // 关系属性
          fromId: users[meta[bizDocChatNum]]["doctorRef"],
          fromRef: users[meta[bizDocChatNum]]["doctorRef"],
          toId: users[meta[recmdDocChatNum]]["doctorRef"],
          toRef: users[meta[recmdDocChatNum]]["doctorRef"],
          type: 'recmnd_fans',
          weight: 2000,
          fansId: [], // 关系为推荐粉丝, 粉丝的ID列表,冗余方便查询
          orderId: [], // 关系为广告/助理服务, 存储订单列表
          // 基本属性
          createdAt: now,// 创建时间
          updatedAt: now,// 最近业务(需统计的)更新时间
          statisticsUpdatedAt: now, // 最近更新时间
          isDeleted: false,  // 是否标识删除
          source: 'docChat'  //数据来源: docChat-医聊
        };
        var cond = {
          fromId: users[meta[bizDocChatNum]]["doctorRef"],
          toId: users[meta[recmdDocChatNum]]["doctorRef"],
          type: 'recmnd_fans',
          isDeleted: false  // 是否标识删除
        }
        console.log('the current count: ', counter);
        console.log('the current count: ', meta);
        counter++;
        RelRecmndFan.findOne(cond)
          .then(function(_rel){
            if(_rel){
              var update = {
                weight: 2000,
                updatedAt: now
              }
              console.log('Update!');
              return RelRecmndFan.update({_id: _rel._id}, update).exec();
            }else{
              console.log('Create!');
              return RelRecmndFan.create(rel);
            }
          })
          .then(function(){
            cb();
          },function(err){
            console.log("Error!!! " + err);
            cb();
          });
      },
      function (err, result) {
        if (err) console.log("Err: " + err);
        console.log('all has completed');
      }
    );
  });