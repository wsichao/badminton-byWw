/**
 * 
 * 活动数据表
 * 
 */

"use strict";
module.exports = {
  config: {
    // 活动ID
    activityId: Backend.Schema.Types.ObjectId,
    // 推荐人Id
    recommendId: Backend.Schema.Types.ObjectId,
    // 用户Id
    userId: Backend.Schema.Types.ObjectId,
    // 审核状态:0审核中，1审核拒绝，2审核通过
    status: {
      type: Number,
      enum: [0, 1, 2]
    },
    data: Object
  },
  options: {
    collection: 'mcSceneActivityData'
  }
}