/**
 * 商品详情表(mcSceneGoods)
 * Backend.Schema.Types.ObjectId
 */
module.exports = {
  config: {
    // 名称
    name: String,
    // 描述信息
    describe: String,
    // 图片
    img: String,
    // 价格
    price: Number,
    // 原价
    originPrice: Number,
    // 图片描述信息
    describeImgs: [String],
    // 0:健康优选；1:朱李叶精选；默认:0
    type: {
      type: Number,
      default: 0
    },
    // 是否有折扣
    isDiscount: {
      type: Boolean,
      default: false
    },
    // 商品折扣价
    discountPrice: {
      type: Number,
      default: 0
    },
    // 推荐奖励价格
    recommendPrice: {
      type: Number,
      default: 0
    },
    secondRecommendPrice: {
      type: Number,
      default: 0
    },
    // 上下架;true: 上架; false: 下架
    isShow: {
      type: Boolean,
      default: true
    },
    // 优选商品转精选商品中优选商品Id
    beforeZeroGoodsId: Backend.Schema.Types.ObjectId,
    // 供应商Id
    supplyId: Backend.Schema.Types.ObjectId,
    // 供应商名称
    supplyName: String,
    // 供应价格
    supplyPrice: {
      type: Number,
      default: 0
    },
    //视频
    video: String,
    //视频图片
    videoImg: String,
    //申请上架 id
    applyGoodsId: String,
    //库存类型 1 一级 2 二级
    storeType: Number,
    //商品总库存 1 一级相当于直接用这个 扣这个
    goodsTotalStockNum: Number

  },
  options: {
    collection: 'mcSceneGoods'
  }
}