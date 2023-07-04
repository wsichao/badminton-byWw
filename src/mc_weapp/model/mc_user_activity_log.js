/**
 * 
 * 分账记录
 * 
 */

"use strict";
module.exports = {
  config: {
    // 用户唯一标识(分享人)
    fromUserId: Backend.Schema.Types.ObjectId,
    // 用户唯一标识（被分享人）
    toUserId: Backend.Schema.Types.ObjectId,
    // share || click
    activity: String,
    // 商品唯一标识
    productId: Backend.Schema.Types.ObjectId,
    // 场景唯一标识
    sceneId: Backend.Schema.Types.ObjectId
  },
  options: {
    collection: 'mcUserActivityLog'
  },
  methods: {
    /**
     * 创建记录
     * @param {*} fromUserId 
     * @param {*} toUserId 
     * @param {*} activity 
     * @param {*} sceneId 
     * @param {*} productId 
     */
    record(fromUserId, toUserId, activity, sceneId, productId) {
      return this.create({
        fromUserId,
        toUserId,
        activity,
        sceneId,
        productId
      })
    }
  }
}