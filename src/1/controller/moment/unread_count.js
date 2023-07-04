/**
 * api-2411 未读消息数
 * Created by Mr.Carry on 2017/6/29.
 */
"use strict";
let service = Backend.service('1/moment', 'moment');

module.exports = {
  __beforeAction: function () {
    if (!isUserInfoAuthorized(this.req)) {
      return this.fail(8005);
    }
  },
  getAction: function () {
    let user_id = this.req.userId;
    return this.success(service.getUnreadCount(user_id));
  },

  mockAction: function () {
    return this.success({count: 5, avatar: '612C2204-90A8-4641-BB07-309EE1F51096'});
  }
}