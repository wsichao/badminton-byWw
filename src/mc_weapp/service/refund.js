const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');
const mcRefundLogModel = Backend.model('mc_weapp', undefined, 'mc_refund_log');
const userMode = Backend.model('common', undefined, 'customer');
const Server = require('../../../app/configs/server');
const host = Server.HOST;
// const host = "https://dev.mtxhcare.com";

const appid = 'wxd3f4975292f64d62';
const mch_id = '1513373921';
const noncestr = 'Wm3WZYTPz34dsfkjkd';

const notify_url = `${host}/mc_weapp/refund`;

const mc_mchKey = "mantianxinghui2019mantianxinghui";
const commonUtil = require('./../../../lib/common-util'); //../../lib/common-util
var fs = require('fs'),
  path = require('path'),
  // certFile = path.resolve(__dirname, 'ssl/apiclient_cert.p12'),
  keyFile = path.resolve(__dirname, 'ssl/apiclient_key.pem'),
  caFile = path.resolve(__dirname, 'ssl/apiclient_cert.pem'),
  request = require('request');
var parseString = require('xml2js').parseString;

module.exports = {
  /**
   *  商品退款
   * @param {String} id 
   */
  async product(id) {
    const order = await mcSceneOrderModel.findOne({
      _id: id,
      isDeleted: false
    })
    if (order.status == 300) {
      console.log(`订单${id}已退款，不可重复退款`);
      return;
    }
    const res = await this.wxAPI(order.orderId, order.price);
    console.log(`订单${id}开始退款`);
    if (res.xml.return_code[0] == "SUCCESS") {
      await mcRefundLogModel.create({
        outTradeNo: res.xml.out_refund_no[0],
        xml: res.xml
      });
    }
    const u = await this.user(order.userId);
    console.log(`发送短信通知: 3151760 ${u.phoneNum} #id#=${order.orderId}`);
    // 发送短信通知
    commonUtil.sendSms("3151760", u.phoneNum, `#id#=${order.orderId}`);
  },
  async user(user_id) {
    return await userMode.findOne({
      _id: user_id
    }, "phoneNum")
  },
  async wxAPI(orderid, price) {
    var stringA = `appid=${appid}&mch_id=${mch_id}&nonce_str=${noncestr}&notify_url=${notify_url}&out_refund_no=${orderid}&out_trade_no=${orderid}&refund_fee=${price}&total_fee=${price}&key=${mc_mchKey}`;
    var sign = commonUtil.commonMD5(stringA, "", true);
    var payload = `<xml>
      <appid>${appid}</appid>
      <mch_id>${mch_id}</mch_id>
      <nonce_str>${noncestr}</nonce_str> 
      <notify_url>${notify_url}</notify_url> 
      <out_refund_no>${orderid}</out_refund_no>
      <out_trade_no>${orderid}</out_trade_no>
      <refund_fee>${price}</refund_fee>
      <total_fee>${price}</total_fee>
      <sign>${sign}</sign>
    </xml>`;
    try {
      var options = {
        url: 'https://api.mch.weixin.qq.com/secapi/pay/refund',
        method: "POST",
        headers: {
          "Content-Type": "application/xml"
        },
        body: payload,
        // cert: fs.readFileSync(certFile),
        key: fs.readFileSync(keyFile),
        cert: fs.readFileSync(caFile),
        passphrase: mch_id
      };
      let deferred = Backend.Deferred.defer();
      request(options, function (error, response, body) {
        parseString(body, function (err, result) {
          deferred.resolve(result);
        });

      })
      return deferred.promise;
    } catch (e) {
      console.log(e)
    }
  }
}