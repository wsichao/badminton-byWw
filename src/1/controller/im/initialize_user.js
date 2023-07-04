/**
 * 批量初始化用户
 * Created by Mr.Carry on 2017/6/6.
 */
"use strict";

let user_service = Backend.service("1/im", "user");

module.exports = {
  __beforeAction: function () {
    let ip = getClientIp(this.req);
    if (ip.indexOf("127.0.0.1") == -1) {
      return this.fail("必须 127.0.0.1 启用 Controller");
    }
  },
  getAction: function () {
    let that = this;
    return user_service
      .getList()
      .then(function (items) {
        return items.map(function (item) {
          return user_service.create(item._id);
        });
      })
      .then(function (data) {
        return that.success(data);
      })
      .catch(function (err) {
        console.log(err);
        return {};
      })
    //user_service.create()
    //return this.success({msg: '初始化成功'});
  }
}