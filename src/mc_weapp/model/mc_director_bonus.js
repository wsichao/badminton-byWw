/**
 * 
 * 奖励金表
 * 
 */


"use strict";
module.exports = {
  config: {
    // 奖励金来源用户
    fromUserId: Backend.Schema.Types.ObjectId,
    // 奖励金来源订单标识
    orderId: {
      type: String,
      default: ''
    },
    // 奖励金发放用户	
    toUserId: Backend.Schema.Types.ObjectId,
    // 奖励金
    price: {
      type: Number,
      default: 0
    }
  },
  options: {
    collection: 'mcDirectorBonus'
  }
}