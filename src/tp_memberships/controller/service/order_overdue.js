/**
 *
 * 第三方服务订单过期
 * Created by yichen on 2018/11/28.
 */

'user strict';

const order_service = Backend.service('tp_memberships', 'service_order');
const coupon_service = Backend.service('tp_memberships', 'coupon');
module.exports = {
  __beforeAction: function () {
    let ip = getClientIp(this.req);
    let whiteIP = ['127.0.0.1'];
    console.log('请求的ip地址', ip);
    if (whiteIP.indexOf(ip) == -1) {
      return this.fail("必须白名单内的IP才可以访问");
    }
  },
  async getAction() {
    const self = this;
    const coupon_ids = await order_service.orderOverDue();
    await coupon_service.couponRollBack(coupon_ids);
    return self.success({code : 200, msg : ''});
  }
}