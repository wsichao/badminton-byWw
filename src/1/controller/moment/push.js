/**
 * Created by Mr.Carry on 2017/7/1.
 */
"use strict";
let moment_service = Backend.service('1/moment', 'moment');

module.exports = {
  __beforeAction: function () {
    if (!isUserInfoAuthorized(this.req)) {
      return this.fail(8005);
    }
  },
  getAction: function () {
    let that = this;
    let user_id = this.req.userId;
    let result = moment_service
      .sendUnreadReminding(user_id)
      .then(function (data) {
        return that.success({code: '200', msg: '成功'});
      }).catch(function (err) {
        console.log(err);
        return that.fail(2413);
      });
    return result;
  },
  mockAction: function () {
    return this.success({code: '200', msg: '推送透传消息成功'});
  }
}