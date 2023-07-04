/**
 * 
 * 用户奖励金记录
 * 
 */

"use strict";
module.exports = {
  config: {
    // 用户唯一标识	
    userId: Backend.Schema.Types.ObjectId,
    // 描述
    detail: String,
    // 奖励金金额	
    amount: {
      type: Number,
      default: 0
    },
    // 类型
    type: String
  },
  options: {
    collection: 'mcGrantsLog'
  }
}