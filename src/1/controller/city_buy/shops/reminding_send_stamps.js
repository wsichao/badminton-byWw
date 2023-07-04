/**
 * 提醒商家发券
 * Created by Mr.Carry on 2017/5/24.
 */
"use strict";
let service = Backend.service("1/city_buy", "remind_send_stamps");

module.exports = {
  __beforeAction: function () {
    return userInfoAuth(this.req, {});
  },
  getAction: function () {
    let user_id = this.query.user_id; // 用户唯一标识
    let shop_id = this.query.shop_id; // 商户唯一标识
    // check 用户标识与商户唯一标识相同,返回错误信息
    if (user_id == shop_id) {
      return this.success({errno: 300, msg: '商户不能给自己发送提醒'});
    }
    // 记录用户提醒
    let result = service.checkUserAndShop(user_id, shop_id)
      .then(function (count_result) {
        // 提醒用户发券
        if (!count_result) {
          return service.remindingSendStamps(user_id, shop_id)
            .then(function (data) {
              return {errno: 200, msg: '成功'};
            });
        }
        // 不能重复发送提醒
        else {
          return {errno: 300, msg: '失败:不能重复发送提醒'};
        }
      }).catch(function (err) {
        console.log(err)
        return {errno: 301, msg: '失败'};
      })
    return this.success(result);
  },
  mockAction: function () {
    return this.success({errno: 200, msg: '成功'});
  }
}