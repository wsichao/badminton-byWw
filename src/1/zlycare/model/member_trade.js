/**
 *  高级或者vip会员额度明细
 * Created by fly on 2017－06－22.
 */
'use strict';
module.exports = {
  config: {
    userId: String, //用户主账号id
    vipType: {type: String, enum: ['zlycare', 'zlycare_vip']}, //zlycare-高级会员;zlycare_vip-vip会员
    type: {type: String, enum: ['buy', 'use']}, //购买会员额度 | 消耗会员额度
    // buy-购买;use-消耗
    value: {type: Number, default: 0}, //购买到的会员额度 | 报销消耗的会员额度
    memberships: [{//type=buy,数组长度为1;否则>=1
      membershipId: String, //会员卡id
      cardNo: String, //会员卡no
      cost: Number //type=buy|get,为从购买或者领取的额度;否则为抵扣会员额度
    }],
    productId: {type: String, default: ''}, //消耗额度,相关的productId
    productName: {type: String, default: ''}, //消耗额度,相关的productName
    code: {type: Number, default: 0}, //消耗额度,产生的报销码
    orderId : {type : String , default : ''},//orderId

    isChecked: {type: Boolean, default: false}, //是否被医疗商户核销
      step:{type: Number, default: 0},
    checkedAt: {type: Number, default: Date.now }, //核销的时间
    checkVenderId: String, //核销医疗商户id

    marketingPrice: {type: Number, default: 0}, //市场价
  },
  options: {
    collection: 'vipMemberTrades'
  }
}
