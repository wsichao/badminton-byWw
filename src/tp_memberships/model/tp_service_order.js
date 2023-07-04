/**
 * 会员权益订单(TPServiceOrder)
 *
 * Created by yichen on 2018/10/09.
 */

"use strict";

module.exports = {
  config: {
    userId: Backend.Schema.Types.ObjectId, //用户id
    price: Number, // 价格
    originPrice: Number, //原价
    orderStatus: Number, //100 未支付  200 支付成功 300 被消费
    orderId: String, //订单id
    wxorderId: String, //微信订单id
    wxTimeStamp: Number, //微信时间戳
    paidTime: Number, //支付时间
    paidType: {
      type: String,
      enum: ['wechat', 'alipay', 'balance']
    }, //支付方式
    expendBy: Backend.Schema.Types.ObjectId, //消耗商家id
    serviceId: Backend.Schema.Types.ObjectId,
    serviceName: String, //服务名字
    serviceDetail: String, //服务详情
    serviceSmallDetail: String, //一句话简介
    serviceBigImg: String, //服务大图
    serviceSmallImg: String, //服务小图
    qrCode: String, //二维码唯一标识
    expiredAt: Number, //过期时间
    expendAt: Number,//核销时间
    serviceIsMustMember : Boolean, //必须为会员
    serviceMembershipCardTypeId : Backend.Schema.Types.ObjectId,
    serviceSupplierId : Backend.Schema.Types.ObjectId, //供应商id
    userDiscountCouponId :  Backend.Schema.Types.ObjectId, //优惠券id
    discountCouponPrice : Number, //优惠券金额
  },
  options: {
    collection: 'TPServiceOrder'
  }
};