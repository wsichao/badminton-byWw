/**
 * 
 * 子订单
 * 
 */

"use strict";
module.exports = {
  config: {
    // 用户唯一标识	
    userId: Backend.Schema.Types.ObjectId,
    // 订单唯一标识
    sceneOrderId: Backend.Schema.Types.ObjectId,
    // 商品列表
    products: [{
      // 商品唯一标识
      id: Backend.Schema.Types.ObjectId,
      // 商品名
      name: String,
      // 商品图片
      img: String,
      // 商品件数
      number: Number,
      // 单价
      price: Number,
      // 是否有折扣;默认 false;
      isDiscount: {
        type: Boolean,
        default: false
      },
      // 折扣金额
      discountPrice: {
        type: Number,
        default: 0
      },
      // 供应价格
      supplyPrice: {
        type: Number,
        default: 0
      },
      //推荐人奖励
      recommendPrice: {
        type: Number,
        default: 0
      },
      //推荐人奖励(二级)
      secondRecommendPrice: {
        type: Number,
        default: 0
      }
    }],
    // 供应商Id
    supplyId: Backend.Schema.Types.ObjectId,
    // 供应商名称
    supplyName: String,
    // 供应价格
    supplyPrice: {
      type: Number,
      default: 0
    },
    // 订单价格
    price: {
      type: Number,
      default: 0
    },
    // 100:未支付；200: 支付完成,300:退款,400:配送员接单;500:配送中,600：确认收货;
    status: {
      type: Number,
      default: 100
    },
    // 是否已打款给商家
    isPaySupply: {
      type: Boolean,
      default: false
    },
    // 场景唯一标识
    sceneId: Backend.Schema.Types.ObjectId,
    // 场景名称
    sceneName: String,
    // 名称
    name: String,
    // 配送方式 1自取 2送货
    deliveryType: Number,
    // 联系人姓名
    contactName: String,
    // 联系人手机号
    contactPhone: String,
    // 联系人地址
    contactAddress: String,
    // 备注
    note: String,
    // 配送员唯一标识
    sceneErrandId: Backend.Schema.Types.ObjectId,
    // 推荐人奖励
    recommendPrice: {
      type: Number,
      default: 0
    },
    // 推荐人奖励(二级)
    secondRecommendPrice: {
      type: Number,
      default: 0
    },
    shareId: Backend.Schema.Types.ObjectId,
    //子订单的补助金
    discountPrice: {
      type: Number,
      default: 0
    },
    // 订单id
    orderId: String,
    //订单完成时间
    endTime: Number,
    //付款时间
    paidTime: Number,
    //二维码核销码
    qrcode: String,
    //快递名称
    expressName: String,
    //快递单号
    expressNo: String,
    //快递公司简写编码
    expressType: String
  },
  options: {
    collection: 'mcSceneSubOrder'
  }
}