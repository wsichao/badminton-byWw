/**
 * 会员订单(TPMembershipCardOrder)
 *
 * Created by yichen on 2018/10/09.
 */

"use strict";

module.exports = {
  config: {
    userId: Backend.Schema.Types.ObjectId, //用户id
    price: Number, // 价格
    cardId: Backend.Schema.Types.ObjectId, //卡id
    orderStatus: Number, //100 未支付  200 支付成功
    orderId: String, //订单id
    wxorderId: String, //微信订单id
    wxTimeStamp: Number, //微信时间戳
    paidTime: Number, //支付时间
    paidType: {
      type: String,
      enum: ['wechat', 'alipay', 'balance']
    }, //支付方式
    dueTime: Number, //过期时间 时间长度 （月份）
    renewTime: Number, //续签时间
    endTime: Number, //到期时间
    originalPrice: Number, //原价
  },
  options: {
    collection: 'TPMembershipCardOrder'
  }
};