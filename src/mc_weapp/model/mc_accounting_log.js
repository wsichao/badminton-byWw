/**
 * 
 * 分账记录
 * 
 */

"use strict";
module.exports = {
  config: {
    // 用户唯一标识	
    userId: Backend.Schema.Types.ObjectId,
    // 订单标识
    orderId: String,
    // 分账金额	
    amount: {
      type: Number,
      default: 0
    },
    type: String
  },
  options: {
    collection: 'mcAccountingLog'
  }
}