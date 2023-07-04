/**
 * 优惠券活动
 */
module.exports = {
    config: {
      // 优惠券活动名称	
      name	: String,
      // 活动开始时间	
      // 根据开始结束时间判断的，当前时间在时间范围内即：正常，否则活动失效
      activityStartTime: Number,
      // 活动结束时间
      // 根据开始结束时间判断的，当前时间在时间范围内即：正常，否则活动失效
      activityEndTime: Number,
      // 可用优惠券主键ID集合	
      discountCoupon: [{
        type: Backend.Schema.Types.ObjectId
      }],
    },
    options: {
      collection: 'discountCouponActivity'
    }
  }