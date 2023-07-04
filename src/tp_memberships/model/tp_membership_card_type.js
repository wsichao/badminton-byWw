/**
 * 会员卡类型表
 */
module.exports = {
  config: {
    // 名称
    name: String,
    // logo
    logo: String,
    // web 介绍页
    link: String,
    // 零售价
    price: Number,
    // 有效期
    periodOfValidity: {
      type: Number
    },
    // 活动
    activity: {
      // 开始时间
      startTime: Number,
      //结束时间
      endTime: Number,
      //活动优惠价格
      discountPrice: Number,
    },
    //权益描述
    interests: [{
      img: String,
      name: String
    }]
  },
  options: {
    collection: 'TPMembershipCardType'
  }
}