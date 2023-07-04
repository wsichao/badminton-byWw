/**
 * Created by Mr.Carry on 2017/6/12.
 */
"use strict";

let user_service = Backend.service("1/im", "user");
console.log(user_service)
module.exports = {
  __beforeAction: function () {
    return userInfoAuth(this.req, {});
  },
  getAction: function () {
    let black_username = this.query.black_username;
    let user_id = this.req.userId;
    let that = this;
    return user_service
      .deleteUserBlack(user_id, black_username)
      .then(function () {
        return that.success({code: '200', msg : '移除黑名单成功'});
      }).catch(function () {
        return that.fail(2406);
      })
  },
  mockAction: function () {
    return this.success({code: '200', msg: '移除黑名单成功'});
  }
}