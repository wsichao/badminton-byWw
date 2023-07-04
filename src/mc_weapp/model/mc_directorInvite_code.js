/**
 * 
 * 主管邀请码
 * 
 */


"use strict";
module.exports = {
  config: {
    // 使用人
    userId: Backend.Schema.Types.ObjectId,
    // 邀请码
    code: {
      type: String
    },
    // 是否已使用	
    isUsed: {
      type: Boolean,
      default: false
    },
    usedTime: {
      type: Number
    }
  },
  options: {
    collection: 'mcDirectorInviteCode'
  }
}