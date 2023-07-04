/**
 * Created by guoyichen on 2017/1/11.
 */

/**
 *  导入业务人员批量上线的用户excel
 *  原始数据格式：
 *  (
 *  姓名	登录名	联系地址	单位	职称

 *    姓名,
 *    手机号码,
 *    联系地址,
 *    单位,
 *    职称
 *  Logic:
 *    1. 验证数据合法性
 *    2. 清洗数据,存入缓存
 *    3. 创建新用户(主副账户)
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var
    Promise = require('promise'),
    xlsx = require('node-xlsx'),
    _ = require('underscore'),
    async = require('async'),
    CusSrv = require("../../app/services/CustomerService");

var list = xlsx.parse("./data/users_20170111.xlsx");
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
            province: meta[2] || "",
            city: meta[3] || "",
            hospital: meta[4] || "",
            department: meta[5] || "",
            position: meta[6] || "",
            sex: "",
            systag: "doctor",
            level: "二",
            managerName: "",
            from: "ucom"
        };

        console.log('the current count: ', counter);
        console.log('the current count: ', meta);
        counter++;
        //cb();
        CusSrv.createServiceProviderAccount(account)
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