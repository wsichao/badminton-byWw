/**
 * 
 * 活动数据配置表
 * 
 */

"use strict";
module.exports = {
  config: {
    // 2:我要找北京专家活动
    type: Number,
    data: {
      // 病种
      diseases: [String],
      // 所需服务
      services: [String]
    }
  },
  options: {
    collection: 'mcSceneActivityDataConfig'
  }
}