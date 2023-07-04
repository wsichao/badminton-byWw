/**
 * Created by fly on 2017－05－31.
 */
'use strict';

module.exports = {
  __beforeAction: function () {
    let ip = getClientIp(this.req);
    if (ip.indexOf("127.0.0.1") == -1) {
      return this.fail("必须 127.0.0.1 启用 Controller");
    }
  },
  getAction: function () {
    let MembershipService = Backend.service('1/membership', 'membership_trade');
    let res_promise = MembershipService.genExpiredTrades();
    return this.success(res_promise);
  }
}