const rp = require('request-promise');

module.exports = {
     /**
   * 获取请求结果
   * @param {*} type 快递公司简写编码
   * @param {*} no 快递单号 快递单号（如果是顺丰，获取时使用“单号:收货人手机号后4位”）
   */
  async getExpressNo(type,no) {
    const url = "https://wuliu.market.alicloudapi.com/kdi";
    let options = {
      headers: {
        'Authorization':'APPCODE 2b08225b74f54839b27ffe001fdf0263'
      },
      url: `${url}`,
      json: true
    };
    options.qs = {type: type, no: no};
    return await rp(options);
  }
}