/**
 * 
 * 用户咨询
 * 
 */


"use strict";
module.exports = {
  config: {
    // 用户唯一标识	
    userId: Backend.Schema.Types.ObjectId,
    // 咨询疾病名称
    name: String,
    // 咨询疾病描述
    detail: String
  },
  options: {
    collection: 'mcConsulting'
  }
}