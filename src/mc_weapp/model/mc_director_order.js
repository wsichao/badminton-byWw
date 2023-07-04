/**
 *
 * 主管订单表
 * 
 */


"use strict";
module.exports = {
  config: {
    // 微信订单号
    wxOrderId: {
      type: String,
      default: ''
    },
    name: String,
    // 订单号
    orderId: {
      type: String,
      default: ''
    },
    // 微信支付时间
    wxTimeStamp: {
      type: Number,
      default: Date.now
    },
    // 订单支付状态
    status: {
      type: Number,
      enum: [100, 200]
    },
    // 订单金额
    price: {
      type: Number,
      default: 0
    },
    // 用户唯一标识
    userId: {
      type: Backend.Schema.Types.ObjectId
    },
    // 支付类型
    payType: {
      type: String,
      default: "wechat"
    },
    paidTime: Number
  },
  options: {
    collection: 'mcDirectorOrder'
  }
}