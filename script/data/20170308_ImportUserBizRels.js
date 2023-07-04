/**
 *  批量新建商业关系
 *  原始数据格式：
 *  (
 *    1. 主账户电话／手机
 *    2. 关联账户电话／手机
 *    3. 关系类型
 *    4. 关系的权重／越大越靠前
 *  )
 *  Logic:
 *    1. 验证数据合法性
 *    2. 清洗数据,存入缓存
 *    3. 创建新用户(主副账户)
 *  Created by Jacky.L on 7/1/17.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var
  Promise = require('promise'),
  xlsx = require('node-xlsx'),
  _ = require('underscore'),
  async = require('async'),
  CusSrv = require("../../app/services/CustomerService");

// 同步读取数据
var list = xlsx.parse("./data/user_biz_rels_20170308.xlsx");
var data = list[0].data;
var len = data.length;
var cacheRels = [];
var counter = 0;
var now = Date.now();
var TYPES = [
  "default",
  "recmnd_fans",
  "ass",
  "ad",
  "recmnd_fans_shanghai",
  "ass_shanghai",
  "ad_shanghai"
];
var phones = ["02164879999",
  "02164380530",
  "02164380560",
  "02164380590",
  "02154890115",
  "02154191793",
  "02164228083",
  "18917128706",
  "18917128783",
  "18917128613",
  "18917128560",
  "18917128363",
  "18917128373",
  "18917128319",
  "18917128579",
  "18917128283",
  "18221061404",
  "13162716535",
  "13564975215",
  "13120554756",
  "13818446721",
  "13818169030"];
var users = {};
console.log("data length : " + data.length);

// 异步处理
// 1. 查询所有涉及到的用户信息并缓存
require("../../app/models/Customer").find({phoneNum: {$in: phones}}, "_id phoneNum doctorRef")
  .then(function(_users){
    if (!_users || _users.length <=0) return;
    console.log("users: " + _users.length);
    for (var i = 0; i < _users.length ; i++){
      users[_users[i].phoneNum] = _users[i];
    }
    async.whilst(
      function () {
        return counter < len;
      },
      function (cb) {
        var meta = data[counter] || null;
        if (!meta) {
          counter++;
          cb();
        }

        var rel = {
          // 关系属性
          fromId: users[meta[0]]["_id"],
          fromRef: users[meta[0]]["doctorRef"],
          toId: users[meta[1]]["_id"],
          toRef: users[meta[1]]["doctorRef"],
          type: TYPES[meta[2] || 0],
          weight: meta[3] || 1,
          fansId: [], // 关系为推荐粉丝, 粉丝的ID列表,冗余方便查询
          orderId: [], // 关系为广告/助理服务, 存储订单列表
          // 基本属性
          createdAt: now,// 创建时间
          updatedAt: now,// 最近业务(需统计的)更新时间
          statisticsUpdatedAt: now, // 最近更新时间
          isDeleted: false,  // 是否标识删除
          source: 'docChat'  //数据来源: docChat-医聊
        };

        console.log('the current count: ', counter);
        console.log('the current count: ', meta);
        counter++;
        require("../../app/models/RelRecmndFan").create(rel)
          .then(function(){
            console.log("Created!!! ");
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