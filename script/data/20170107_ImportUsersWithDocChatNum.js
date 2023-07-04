/**
 *  导入业务人员批量上线的用户excel
 *  原始数据格式：
 *  (
 *    姓名,
 *    手机号,
 *    性别(男／女),
 *    职业(如医生、律师等),
 *    省,
 *    市,
 *    单位,
 *    部门,
 *    职称(选填),
 *    定价级别(零、一、二、三、四),
 *    介绍人姓名(选填),
 *    个人简介)
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

var list = xlsx.parse("./data/users_20170308_blue_cross.xlsx");
var from = "ops@20170308";
var data = list[0].data;
var len = data.length;
var counter = 0;

console.log("data length : " + data.length);

async.whilst(
  function () {
    return counter < len;
  },
  function (cb) {
    var meta = data[counter] || {};
    var account = {
      name: meta[0] || "",
      phoneNum: (meta[1] + "") || "",
      sex: meta[2] || "",
      systag: ((new RegExp("医生")).test(meta[3]) ? "doctor" : meta[3]) || "",
      province: meta[4] || "",
      city: meta[5] || "",
      hospital: meta[6] || "",
      department: meta[7] || "",
      position: meta[8] || "",
      level: meta[9] || "",
      managerName: meta[10] || "",
      profile: meta[11] || "",
      from: from
    };

    console.log('the current count: ', counter);
    console.log('the current count: ', meta);
    counter++;
    //cb();
    CusSrv.createServiceProviderAccount(account, "shanghai")
      .then(function(_cus){
        console.log("Created!!! ");
        cb();
      }, function(err){
        if (err && err.code == 200)
          console.log("Exists!!! ");
        else
          console.log("Error!!! " + err);
        cb();
      })
  },
  function (err, result) {
    if (err) console.log("Err: " + err);
    console.log('all has completed');
  }
);