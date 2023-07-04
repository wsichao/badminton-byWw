/**
 * 添加 IM 好友
 * Created by Mr.Carry on 2017/6/6.
 */

"use strict";
let user_service = Backend.service("1/im", "user");
let im_session_service = Backend.service("1/im", "im_session");

module.exports = {
  __beforeAction: function () {
    return userInfoAuth(this.req, {});
  },
  getAction: function () {
    let that = this;
    let to_user_id = this.query.to_user_id;
    let user_id = this.req.userId;
    let im_obj = {}
    if (!to_user_id) {
      return that.fail(2326);
    }
    let result = user_service
      .addFriend(user_id, to_user_id)
      .then(function (data) {
        im_obj = data;
        return {};
      })
      // 添加双向会话
      .then(function () {
        if (!im_obj.im_user_id || !to_user_id) {
          throw new Error("未初始化IM用户");
        }
        return [
          im_session_service.insertSession(im_obj.im_user_id, to_user_id),
          im_session_service.insertSession(to_user_id, im_obj.im_user_id)
        ];
      })
      .then(function (data) {
        return that.success({
          "code": "200",
          "msg": "200"
        })
      })
      .catch(function (data) {
        if (data.err) {
          return that.fail(2326);
        }
      })
    return result;
  },
  mockAction: function () {
    return this.success({
      "code": "200",
      "msg": "200"
    })
  }
};