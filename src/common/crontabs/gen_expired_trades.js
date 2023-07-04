/**
 * 定时器: 每天凌晨1点执行,查找过期的会员额度卡片,生成过期会员额度
 * node args http://127.0.0.1:9020
 * node gen_expired_trades.js http://127.0.0.1:9020
 * Created by Mr.Carry on 2017/5/27.
 */

// crontab -e
//  0 1 * * *   wget  http://127.0.0.1:9020/1/membership/gen_expired_trades

"use strict";
let request = require("request");
let args = process.argv.splice(2);
let website = args[0];
let action = website + '/1/membership/gen_expired_trades';
request(action, function (error, response, body) {
  console.log(body)
})