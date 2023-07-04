/**
 * 
 * 商品订单表(mcSceneOrder)
 * 
 */

"use strict";
module.exports = {
  config: {
    // 用户唯一标识	
    userId: Backend.Schema.Types.ObjectId,
    // 微信订单号
    wxOrderId: String,
    // 订单号
    orderId: String,
    // 微信时间戳	
    wxTimeStamp: Number,
    name: String,
    // 100:未支付；200: 支付完成,300:退款,400:配送员接单;600：确认收货;
    status: {
      type: Number,
      enum: [100, 200, 300, 400, 600]
    },
    payType: {
      type: String,
      default: "wechat"
    },
    //订单完成时间
    endTime: Number,
    // 支付时间
    paidTime: Number,
    // 支付价格
    price: {
      type: Number,
      default: 0
    },
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
      //推荐人奖励
      recommendPrice: {
        type: Number,
        default: 0
      },
      // 二级推荐人奖励
      secondRecommendPrice: {
        type: Number,
        default: 0
      },
    }],
    // 推荐人唯一标识
    shareId: Backend.Schema.Types.ObjectId,
    // 场景唯一标识
    sceneId: Backend.Schema.Types.ObjectId,
    // 场景名称
    sceneName: String,
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
    // 是否退款到账
    isRefund: Boolean,
    // 退款到账时间
    refundTime: Number,
    // 0:健康优选；1:朱李叶精选；默认:0
    type: {
      type: Number,
      default: 0
    },
    // 折扣价格
    discountPrice: {
      type: Number,
      default: 0
    },
    //推荐人奖励
    recommendPrice: {
      type: Number,
      default: 0
    },
    // 二级推荐人奖励
    secondRecommendPrice: {
      type: Number,
      default: 0
    },
    //配送方式 1自取 2送货
    deliveryType: Number,
    //二维码核销码
    qrcode: String,
    //添加过期时间
    expiredAt: Number
  },
  options: {
    collection: 'mcSceneOrder'
  }
}