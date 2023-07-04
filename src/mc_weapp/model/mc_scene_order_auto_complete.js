/**
 * 
 * 订单自动完成日志
 * 
 */

"use strict";
module.exports = {
  config: {
    // 订单唯一标识
    orderId: Backend.Schema.Types.ObjectId,
    // 自动完成时间字符串	
    autoCompleteTime: String,
    // 时间
    time: Number
  },
  options: {
    collection: 'mcSceneOrderAutoComplete'
  }
}