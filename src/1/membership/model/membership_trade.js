/**
 *  会员额度明细
 *  todo:确定时间
 *  6月份之前的数据通过脚本生成的,创建时间为实际生成和消费会员额度的时间
 * Created by fly on 2017－05－25.
 */
'use strict';
module.exports = {
  config: {
    userId: String, //用户主账号id
    type: {type: String, enum: ['old', 'expired', 'coupon', 'rebate', 'buy', 'get']}, //额度明细类型
      // old-迁移前消耗;expired-会员额度过期;coupon-领券;rebate-用券返现;buy-购买;get-领取
    value: {type: Number, default: 0}, //会员额度金额
    memberships: [{//type=buy|get,数组长度为1;否则>=1
      membershipId: String, //会员卡id
      cardNo: String, //会员卡no
      cost: Number, //type=buy|get,为从购买或者领取的额度;否则为抵扣会员额度
        isNormalFlag: {type: Boolean, default: false}//是否是常用药品
    }],
    couponId: {type: String, default: ''}, //领券|用券返现,相关的couponId
    orderId: {type: String, default: ''}, //购买|领取,相关的orderId
    shopId: {type: String, default: ''}, //领券|用券返现,相关的店铺id
  },
  options: {
    collection: 'membershipTrades'
  }
}
