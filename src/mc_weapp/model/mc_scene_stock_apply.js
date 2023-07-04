/**
 * 
 * 库存申请表
 * 
 */

"use strict";
module.exports = {
  config: {
    // 商品唯一标识
    productId: Backend.Schema.Types.ObjectId,
    // 清单唯一标识
    sceneId: Backend.Schema.Types.ObjectId,
    // 申请人的唯一标识
    applyUserId: String,
    // 商品名称
    productName: String,
    // 场景名称
    sceneName: String,
    // 申请人名称
    applyUserName: String,
    // 申请人手机号
    applyUserPhone: String,
    // 申请数量
    applyCount: Number,
    // 申请时间戳
    applyTime: Number,
    // 申请状态 100待分配 200已分配
    status: Number,
    // 分配数量
    distributeCount: Number,
    // 分配时间
    distributeTime: Number,
    // 供应商 id
    supplyId: Backend.Schema.Types.ObjectId,
    //供应商名称
    supplyName: String
  },
  options: {
    collection: 'mcSceneStockApply'
  }
}