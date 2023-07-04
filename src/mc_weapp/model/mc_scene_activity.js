/**
 * 
 * 清单活动表
 * 
 */

"use strict";
module.exports = {
  config: {
    // 活动名称
    name: String,
    // 活动链接
    activityUrl: String,
    // 截止时间
    abortTime: Number,
    // 名额
    applicationsNumber: Number,
    // 已用名额，默认 0
    usedNumber: {
      type: Number,
      default: 0
    },
    // 用户激励
    userAwardCash: {
      type: Number,
      default: 0
    },
    // 推荐人激励
    recommendAwardCash: {
      type: Number,
      default: 0
    },
    // 上下架
    isShow: {
      type: Boolean,
      default: true
    }
  },
  options: {
    collection: 'mcSceneActivity'
  }
}