const orderModel = require('../../../../app/models/service_package/makeAppointmentOrder');
const commonUtil = require('../../../../lib/common-util');
module.exports = {
  __beforeAction: function () {
    console.log('当前的环境', process.env.NODE_ENV);
    if (process.env.NODE_ENV != '_test') {
      let ip = getClientIp(this.req);
      let whiteIP = ['123.56.147.196', '182.92.106.199', '127.0.0.1', '172.31.1.22', '172.31.1.23','112.125.88.214'];//123.56.147.196 正式公网 182.92.106.199 测试公网
      console.log('请求的ip地址', ip);
      if (whiteIP.indexOf(ip) == -1) {
        return this.fail("必须白名单内的IP才可以访问");
      }
    }
  },
  __rule: function (valid) {
    return valid.object({
      orderId: valid.string()
    });
  },
  async postAction() {
    const orderId = this.post.orderId;
    const order = await orderModel.findOne({isDeleted:false, _id : orderId});
    commonUtil.sendSms('2461526', order.userPhoneNum,
    "#name#=" + order.userName +
    "&#date#=" + dateFormat(order.orderTime,'MM月dd日hh时mm分'));
    return this.success({
      code: '200',
      msg: ''
    });
  }
}