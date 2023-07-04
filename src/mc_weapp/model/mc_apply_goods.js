/**
 * 商品详情表(mcApplyGoods)
 * Backend.Schema.Types.ObjectId
 */
module.exports = {
    config: {
      // 名称
      name: String,
      // 品牌
      brandName: String,
      //规格
      standard: String,
      //商品头图
      headImg: String,
      //其他图片
      otherImgs: [String],
      // 供应价格
      supplyPrice: {
        type: Number,
        default: 0
      },
      //买点
      sellingPoint: String,
      //其他商品信息
      otherInfo: String,

      // 供应商Id
      supplyId: String,
      // 供应商名称
      supplyName: String,
      //申请状态 100 申请中 200 通过 300 拒绝 400 取消
      status: Number
    },
    options: {
      collection: 'mcApplyGoods'
    }
  }