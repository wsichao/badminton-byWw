/**
 * 会员服务表
 */
module.exports = {
  config: {
    //服务名称
    name: String,
    //服务价格
    price: {
      type: Number,
      default: 0
    },
    //折扣价
    discountPrice: {
      type: Number,
      default: 0
    },
    //服务描述
    detail: String,
    // 一句话服务简介
    smallDetail: String,
    // 大图
    bigImg: String,
    // 小图
    smallImg: String,

    //必须为会员
    isMustMember: {
      type: Boolean,
      default: false
    },
    // 有效期
    periodOfValidity: Number,
    membershipCardTypeId: {
      type: Backend.Schema.Types.ObjectId
    },
    //供应商id
    supplierId: Backend.Schema.Types.ObjectId,
    //使用条件
    useCondition: String,
    // 权重
    weight: Number,
    // 是否展示
    isShow: Boolean
  },
  options: {
    collection: 'TPMemberService'
  }
}