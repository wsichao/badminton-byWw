/**
 * Created by dell on 2018/12/3.
 */
//注册赠送的会员卡列表
'use strict';
const couponService = Backend.service('tp_memberships', 'coupon');
const moment = require('moment');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required()
    });
  },
  getAction() {
    const user_id = this.req.query.user_id;
    let final = couponService.signInCoupons(user_id)
      .then(function (result) {
        result = result.map(item=>{
          item.start_time = moment(item.start_time).format('YYYY-MM-DD')
          item.end_time = moment(item.end_time).format('YYYY-MM-DD')
          return item;
        })
        return {data: {items: result}}
      })
    return this.display('invite_prize/success.html', final);
  }
}