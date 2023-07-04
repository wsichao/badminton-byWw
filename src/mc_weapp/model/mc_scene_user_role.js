/**
 *
 * 平台用户角色表(mcSceneUserRole)
 *
 */


"use strict";
module.exports = {
  config: {
    userId: Backend.Schema.Types.ObjectId,
    // 商务经理:sceneManager;推荐人:sceneRecommend;配送员:sceneErrand;
    role: [{
      type: String,
      enum: ["sceneManager", "sceneRecommend", "sceneErrand"]
    }]
  },
  options: {
    collection: 'mcSceneUserRole'
  }
}