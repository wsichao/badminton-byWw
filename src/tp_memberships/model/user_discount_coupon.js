/**
 * 第三方服务优惠券
 */
module.exports = {
    config: {
      // 用户唯一标识	
      userId	: Backend.Schema.Types.ObjectId,
      // 优惠券唯一标识	
      discountCouponId: Backend.Schema.Types.ObjectId,
      // 优惠券类型；voucher ：代金券
      type: {
        type: String,
        default : 'voucher'
      },
      // 优惠券名称	
      name: String,
      // 额度	
      limit: Number,
      // 满多少钱可用	
      workingCondition: Number,
      // 结束时间	
      dueTime :Number,
      // 有效期；天数；	
      periodOfValidity : Number,
      //适用的服务	
      memberServices : [{
        type: Backend.Schema.Types.ObjectId
      }],
      // 是否已使用	
      isUsed: {
        type : Boolean,
        default : false
      },
    },
    options: {
      collection: 'userDiscountCoupon'
    }
  }