/**
 * 
 * 控价用户会员订单
 * 
 */

"use strict";
module.exports = {
  config: {
    // 用户唯一标识	
    userId: Backend.Schema.Types.ObjectId,
    // 微信订单号
    wxOrderId: String,
    // 订单号
    orderId: String,
    // 微信时间戳	
    wxTimeStamp: Number,
    name: String,
    // 支付状态100-未支付，200-支付成功
    status: {
      type: Number,
      enum: [100, 200]
    },
    // 支付时间
    paidTime: Number,
    // 支付价格
    price: {
      type: Number,
      default: 0
    },
    // 参与分账的人，记录当时身份
    participants: [{
      userId: Backend.Schema.Types.ObjectId,
      role: {
        type: String,
        enum: ["director", "ordinary"] //director: 主管; ordinary:普通上级
      }
    }]

  },
  options: {
    collection: 'mcPriceCtrlMemberOrder'
  }
}