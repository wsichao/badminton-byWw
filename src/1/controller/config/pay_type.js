/**
 * Created by Mr.Carry on 2017/7/19.
 */
"use strict";
let config_service = Backend.service('common', 'config_service');
module.exports = {
  getAction: function () {
    let v = this.req.query.v;
    return this.success(config_service.getPayType(v));
  },
  mockAction: function () {
    return this.success({
      is_ios_pay: false
    });
  }
}