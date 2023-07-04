/**
 * Created by yichen on 2017/6/9.
 */


"use strict";
let im_session_service = Backend.service("1/im", "im_session");

module.exports = {
  __beforeAction: function () {
    return userInfoAuth(this.req, {});
  },
  getAction: function () {
    let that = this;
    var userId = this.req.identity.userId;
    var user = this.req.identity.user;
    if (!isUUID24bit(userId) || !isExist(user)) {
      return this.fail(8005);
    }
    let to_user_id = this.query.to_user_id;
    let result =
      im_session_service
      .deleteSession(user.im.userName, to_user_id)
      .then(function(_result){
        return im_session_service.deleteChatRecord(user.im.userName, to_user_id)
      })
      .then(function (data) {
        return that.success({
          "code": "200",
          "msg": "200"
        })
      })
      .catch(function (err) {
        console.log(err);
        return that.fail(2328);
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