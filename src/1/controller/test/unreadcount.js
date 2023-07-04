/**
 * Created by Mr.Carry on 2017/6/29.
 */
"use strict";
let service = Backend.service('1/moment', 'moment');
module.exports = {
  getAction: function () {
    let user_id = '123';
    //
    return this.success(service.getUnreadCount(user_id));
  }
};