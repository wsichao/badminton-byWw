/**
 * 
 * 补货表
 * 
 */

"use strict";
module.exports = {
  config: {
    // 用户唯一标识	
    userId: Backend.Schema.Types.ObjectId,
    // 商品名称
    productName: String,
    // 商品品牌
    productBrand: String,
    // 商品单价
    productPrice: Number,
    // 年使用量
    productNumber: Number,
    // 曾购买渠道
    productChannel: String,
    // 商品补充描述
    productDetail: String,
    // 推荐人用户标识
    mcRecommendUserId: Backend.Schema.Types.ObjectId,
    // 是否已同步	
    isSync: {
      type: Boolean,
      default: false
    }
  },
  options: {
    collection: 'mcSceneReplenishment'
  }
}