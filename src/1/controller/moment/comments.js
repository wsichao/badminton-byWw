/**
 * Created by Mr.Carry on 2017/6/28.
 */
"use strict";
let service = Backend.service('1/moment', 'moment');

module.exports = {
  //__beforeAction: function () {
  //  if (!isUserInfoAuthorized(this.req)) {
  //    return this.fail(8005);
  //  }
  //},
  getAction: function () {
    let moment_message_id = this.query.moment_message_id;
    let pageSize = this.query.pageSize;
    let pageNum = this.query.pageNum;
    let slices = getCurrentPageSlice(this.req);

    let userId = this.req.userId;
    let options = {
      userId: userId,
      pageNum: pageNum
    }

    let result = service.getComments(moment_message_id, slices, options);
    return this.success(result);
  },
  mockAction: function () {
    return this.success({
      'count': 100,
      "items": [
        {
          "user_id": "5937b047381b03789aa18e82",
          "comment_id": "5937b047381b03789aa18e83",
          "moment_id": "5937b047381b03789aa18e83",
          "avatar": "00003F61-00003F61-A241-4B2D-8F3E-5CEE952D6875",
          "name": "张小彬",
          "create_time": 1498646832532,
          "to_user_id": "54ad5d572389e7d908d12388",
          "to_user_name": "蒋铮",
          "comment": "233333333"
        }
      ]
    });
  }
}