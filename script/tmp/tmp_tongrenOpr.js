/**
 * 导出同仁医生就诊患者数据
 */

var
  Report = require('../app/models/Report.js'),
  util = require('../lib/common-util'),
  _ = require('underscore'),
  fs = require('fs');

var head = '就诊时间' + "," + "姓名" + "," + "性别" + "," + "电话" + "," + "身份证号" + "," + "年龄" + "," + "就诊医生" + "," + "症状";
var doctors = ['张旭', '锡琳', '段甦'];

var step = 0;

var outerTimer = setInterval(function () {
  (function (step) {
    if (step >= doctors.length) {
      console.log("Outer Game over...");
      clearInterval(outerTimer);
      return;
    }

    console.log('../data/' + doctors[step] + '.csv');
    fs.appendFileSync('../data/' + doctors[step] + '.csv', head + '\n', 'utf-8');

    var conditions = {
      isDeleted: false,
      doctorName: doctors[step]
    };//查询指定医生的就诊患者

    Report.find(conditions).sort({createdAt: -1}).exec()
      .then(function (reports) {
        var length = reports.length;
        console.log("Length: " + length);

        var j = 0;
        var innerTimer = setInterval(function () {
          (function (j) {
            if (j >= length) {
              console.log("Inner Game over...");
              clearInterval(innerTimer);
              return;
            }

            var r = reports[j];

            var line = new Date(r.createdAt).format("YYYY-MM-dd hh:mm") + "," +
              (r.customerName || "") + "," +
              (r.customerSex || "") + "," +
              (r.customerPhone || "") + "," +
              (r.sid || "") + "," +
              (2015 - r.sid.substr(6, 4)) + "," +
              (r.doctorName || "") + "," +
              (r.reportSelf || "");

            fs.appendFileSync('../data/' + doctors[step] + '.csv', line + '\n', 'utf-8');
          })(j++)
        }, 2);
      });
  })(step++)
}, 10000);


//for (var i = 0; i < doctors.length; i++) {
//
//  console.log('../data/' + doctors[i] + '.csv');
//  fs.appendFileSync('../data/' + doctors[i] + '.csv', head + '\n', 'utf-8');
//
//  var conditions = {
//    isDeleted: false,
//    doctorName: doctors[i]
//  };//查询指定医生的就诊患者
//
//  Report.find(conditions).sort({createdAt: -1}).exec()
//    .then(function (reports) {
//      _.each(reports, function (r) {
//        var line = r.createdAt + "," +
//          (r.customerName || "") + "," +
//          (r.customerSex || "") + "," +
//          (r.customerPhone || "") + "," +
//          (r.sid || "") + "," +
//          (r.doctorName || "") + "," +
//          (r.reportSelf || "");
//
//        fs.appendFileSync('../data/' + doctors[i] + '.csv', line + '\n', 'utf-8');
//      })
//    });
//}
