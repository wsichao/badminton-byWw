/**
 * 
 * 商品场景关联表
 * 
 */

"use strict";
module.exports = {
  config: {
    // 场景唯一标识	
    sceneId: Backend.Schema.Types.ObjectId,
    // 商品唯一标识
    goodsId: Backend.Schema.Types.ObjectId,
    // 订单标识
    isRelevance: Boolean,
    clickCount: Number, // 浏览数
    forwardingCount: Number, // 转发数
    fromRecommendUserId: Backend.Schema.Types.ObjectId, //从哪个推荐人获取的商品
    // 排序字段
    sortedByTime: Number,
    //分类id 冗余到了scene表的分类中
    categoryId: Backend.Schema.Types.ObjectId,
    //库存
    sceneStockNum: Number
  },
  options: {
    collection: 'mcSceneGoodsInfo'
  }
}