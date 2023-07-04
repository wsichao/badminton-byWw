/**
 * 定时器:每两个小时,提醒商户发券
 * node args http://127.0.0.1:9020
 * node remind_send_stamps.js http://127.0.0.1:9020
 * Created by Mr.Carry on 2017/5/27.
 */

// crontab -e
// test
// 0 */2 * * *  wget  http://127.0.0.1:9020/1/city_buy/shops/send_msg_to_shop


"use strict";
let request = require("request");
let moment = require("moment");
let args = process.argv.splice(2);
let website = args[0];
let action = website + '/1/city_buy/shops/send_msg_to_shop';
request(action, function (error, response, body) {
  console.log(body)
})

console.log("end:" +moment().format("YYYY-MM-DD HH:mm:ss"));