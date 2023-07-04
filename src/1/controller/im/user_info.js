/**
 * Created by Mr.Carry on 2017/6/8.
 */

"use strict";
let user_service = Backend.service("1/im", "user");

module.exports = {
  getAction: function () {
    let im_user_name = this.query.im_user_name;
    let that = this;
    return user_service
      .getUserInfo(im_user_name)
      .then(function (data) {
        return that.success(data);
      })
      .catch(function (err) {
        console.log(err);
        return that.fail(2403);
      });
  },
  mockAction: function () {
    return this.success({
      "_id": "mock",
      "name": "mock",
      "avatar": "mock"
    })
  }
}