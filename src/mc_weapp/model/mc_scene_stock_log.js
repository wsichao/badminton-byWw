/**
 * 库存log
 */

"use strict";
module.exports = {
  config: {
    // 商品唯一标识
    productId: String,
    // 清单唯一标识
    sceneId: String,
    // 供应商id
    supplyId: String,
    // 商品名称
    productName: String,
    // 场景名称
    sceneName: String,
    // 申请库存id
    applyStockId: String,
    // 清单库存数
    sceneStockNum:Number,
    // 库存类型
    storeType:Number,
    // 商品库存变动数
    goodsTotalStockNum:Number
  },
  options: {
    collection: 'mcSceneStockLog'
  }
}