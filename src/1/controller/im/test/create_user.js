/**
 * Created by Mr.Carry on 2017/6/7.
 */
"use strict";

module.exports = {
  getAction: function () {
    let user_id = this.query.user_id
    let user_service = Backend.service("1/im", "user");
    return this.success(user_service.create(user_id));
  },
  mockAction: function () {
    return this.success({name: 1});
  }
}