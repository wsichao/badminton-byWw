/**
 * Created by yichen on 2018/4/11.
 */
const url = 'http://bc.juliye.net/mq/open/push';
const app_id = '4107a0bb-e0b8-4784-bcd2-a17bcffa7ba4';
const app_secret = '968c5139-c8f4-4198-a7bb-f3573db08280';
const queue_name = 'sp_pay_after_send_boss';

const Q = require('q');
let request = require('request');
'use strict';
module.exports = {
  /**
   * 发送消息队列
   */
  push_message_to_mq(message) {
    let defer = Q.defer();
    //发送请求
    console.log('env:     ', process.env.NODE_ENV == 'production' ? 'pro' : 'dev')
    console.log(message)
    request.post({
      url: url,
      form: {
        data: message,
        app_id: app_id,
        app_secret: app_secret,
        queue_name: queue_name,
        env: process.env.NODE_ENV == 'production' ? 'pro' : 'dev'
      }
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
        defer.resolve({ code: '200', msg: "发送成功" });
      } else {
        console.log(body)
        defer.resolve({ code: '500', msg: "发送失败" });
      }
    })
    return defer.promise;
  },
  /**
   * 订单支付成功后推送Boss
   * @param {*} sporder_id 服务包订单唯一标识(_id)
   */
  async spPayAfterSendBoss(sporder_id) {
    return await this.push_message_to_mq(sporder_id);
  }
}