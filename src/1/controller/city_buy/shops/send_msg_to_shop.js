/**
 * Created by Mr.Carry on 2017/5/25.
 */


"use strict";
module.exports = {
  __beforeAction: function () {
    let ip = getClientIp(this.req);
    if (ip.indexOf("127.0.0.1") == -1) {
      return this.fail("必须 127.0.0.1 启用 Controller");
    }
  },
  getAction: function () {
    let service = Backend.service("1/city_buy", "remind_send_stamps");
    return service.getShops()
      .then(function (item) {
        return item.map(function (shop) {
          return service.sendMsgToShop(shop.shopId);
        })
      }).then(function (data) {
        return data;
      });
  }
}