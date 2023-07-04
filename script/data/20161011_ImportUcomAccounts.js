/**
 *  导入UCOM用户excel
 *  DocChat-backend
 *  Created by Jacky.L on 10/11/16.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var
  Promise = require('promise'),
  xlsx = require('node-xlsx'),
  _ = require('underscore'),
  util = require('../lib/common-util'),
  Doctor = require('../app/models/Doctor');

var list = xlsx.parse("./data/ucom20161017.xls");
var data = list[0].data;
var len = data.length;
var counter = 0;
var timer;
console.log("data length : " + data.length);

var insertDoctor = function () {

  console.log("counter= " + counter);
  clearInterval(timer);
  var now = Date.now();

  if (counter >= len) {
    console.log("DONE!!");
    return;
  }

  var doctor = {
    realName: data[counter][0],
    phoneNum: data[counter][1],
    password: data[counter][2],
    hospital: data[counter][3],
    position: data[counter][4],
    province: data[counter][5],
    city: data[counter][6],
    from: "ucom",
    sex: "女",
    department: ""
  };
  doctor.systag = 'doctor';
  doctor.password = doctor.password.toLowerCase();
  doctor.callPrice = {
    initiatePayment: 20,
    initiateIncome: 16,
    paymentPerMin: 5,
    incomePerMin: 4
  };
  doctor.docChatNum = "7" + util.getNumByStr(counter + 3, 5);
  doctor.applyStatus = "done";
  doctor.source = 'docChat';

  return Doctor.findOne({
    phoneNum: doctor.phoneNum,
    isDeleted: false,
    source: 'docChat',
    applyStatus: 'done'}).exec()
    .then(function (_doc) {
      if (_doc){
        console.log("Exists!!!");
      }else{
        console.log("OK!!!");
        return Doctor.create(doctor);
      }
    })
    .then(function () {
      counter++;
      timer = setInterval(insertDoctor, 100);
    });
};

timer = setInterval(insertDoctor, 100);