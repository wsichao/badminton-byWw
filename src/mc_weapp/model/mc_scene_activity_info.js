/**
 * 
 * 清单活动关联表
 * 
 */

"use strict";
module.exports = {
  config: {
    // 场景Id
    sceneId: Backend.Schema.Types.ObjectId,
    // 活动表Id
    activityId: Backend.Schema.Types.ObjectId,
    // 关联关系(true为存在关联；false为关联关系被取消)
    isRelevance: Boolean,
  },
  options: {
    collection: 'mcSceneActivityInfo'
  }
}