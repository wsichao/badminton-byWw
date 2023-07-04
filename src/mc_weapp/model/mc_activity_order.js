/**
 * 
 * 活动订单表((mcActivityOrder)
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
    payType: {
      type: String,
      default: "wechat"
    },
    // 支付时间
    paidTime: Number,
    // 支付价格
    price: {
      type: Number,
      default: 0
    },
    // 活动唯一标识
    activityId: Backend.Schema.Types.ObjectId,
    // 省名称
    provinceName: String,
    // 市名称
    cityName: String,
    // 详细地址
    address: String,
    // 活动主题名称
    activityName: String,
    // 联系人姓名
    contactsName: String,
    // 联系人电话
    contactsPhone: String,
    // 活动开始时间
    conductTime: Number,
    // 活动说明
    explain: String
  },
  options: {
    collection: 'mcActivityOrder'
  }
}