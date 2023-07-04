var crypto = require('crypto');
const commonUtil = require('./../../../lib/common-util');
const initKey = commonUtil.commonMD5('mantianxinghui2019mantianxinghui', "", false);
var parseString = require('xml2js').parseString;
const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');

const decryptData256 = function (encryptedData, key) {
  encryptedData = new Buffer(encryptedData, 'base64')

  var iv = "";
  let decipher = crypto.createDecipheriv('aes-256-ecb', key, iv);
  decipher.setAutoPadding(true);
  let decoded = decipher.update(encryptedData, 'base64', 'utf8');
  decoded += decipher.final('utf8');
  return decoded;
}

module.exports = {
  async record(body) {
    let deferred = Backend.Deferred.defer();
    parseString(body, function (err, result) {
      deferred.resolve(result);
    });
    return deferred.promise;
  },
  async update(orderid) {
    await mcSceneOrderModel.update({
      orderId: orderid
    }, {
      isRefund: true,
      refundTime: Date.now()
    })
  },
  async postAction() {
    const xml = this.post.xml;
    let str = xml.req_info[0];
    try {
      str = decryptData256(str, initKey);
      const record = await this.record(str);
      const out_refund_no = record.root.out_refund_no[0];
      await this.update(out_refund_no);
    } catch (e) {
      console.log(e)
    }

    var resdata = `<xml>
      <return_code><![CDATA[SUCCESS]]></return_code>
      <return_msg><![CDATA[OK]]></return_msg>
    </xml>`
    let res = this.res;
    res.set('Content-Type', "application/xml");
    res.set('Access-Control-Allow-Origin', '*');
    return this.success(resdata);
  }
}