/**
 * 
 * 供应商表
 * 
 */

"use strict";
module.exports = {
  config: {
    // 名称
    name: String,
    phone: String,
    // 用户Id
    userId: Backend.Schema.Types.ObjectId,
    // 商户所在省唯一标识
    provinceId: String,
    // 商户所在省名称
    provinceName: String,
    // 商户所在市唯一标识
    cityId: String,
    // 商户所在市名称
    cityName: String,
    // 商户所在县唯一标识
    countyId: String,
    // 商户所在县名称
    countyName: String,
    // 商户所在地详细地址
    address: String,
    //是企业还是个人申请 0 1
    ownerType: Number,
    //品牌名称
    brandName: String,
    //入驻类目
    inToCategorie: String,
    //是否支持直接发货
    isDelivery: Number,
    //营业执照图片地址
    businessLicense: String,
    //其他资质
    otherLicense: [String],
    //联系方式
    contactWay: String,
    //申请状态 100申请中 200已通过 300已拒绝
    status: Number
  },
  options: {
    collection: 'mcSceneSupply'
  }
}