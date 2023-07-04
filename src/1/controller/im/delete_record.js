/**
 * Created by yichen on 2017/6/9.
 */


"use strict";
let im_record_service = Backend.service("1/im", "im_record");

module.exports = {
  __beforeAction: function () {
    return userInfoAuth(this.req, {});
  },
  getAction: function () {
    //console.log('come in');
    let that = this;
    var userId = this.req.identity.userId;
    var user = this.req.identity.user;
    if (!isUUID24bit(userId) || !isExist(user)) {
      return this.fail(8005);
    }
    let record_id = this.query.record_id;
    let result =
      im_record_service
        .deleteChatRecord(user.im.userName, record_id)
        .then(function (data) {
          return that.success({
            "code": "200",
            "msg": "200"
          })
        })
        .catch(function (err) {
          console.log(err);
          return that.fail(2329);
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