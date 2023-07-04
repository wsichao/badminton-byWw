/**
 * Created by lijinxia on 2017/9/7.
 */
var
    mongodb = require('../configs/db'),
    StatisticsHelper = require('../../lib/StatisticsHelper'),
    Schema = mongodb.mongoose.Schema;
var hookUpModel = StatisticsHelper.hookUpModel;
var MembershipTradesSchema = new Schema({
    userId: String, //用户主账号id
    type: {type: String, enum: ['old', 'expired', 'coupon', 'rebate', 'buy', 'get']}, //额度明细类型
    // old-迁移前消耗;expired-会员额度过期;coupon-领券;rebate-用券返现;buy-购买;get-领取
    value: {type: Number, default: 0}, //会员额度金额
    memberships: [{//type=buy|get,数组长度为1;否则>=1
        membershipId: String, //会员卡id
        cardNo: String, //会员卡no
        isNormalFlag:{type: Boolean, default: false},  //是否消耗了常用药品额度
        cost: Number //type=buy|get,为从购买或者领取的额度;否则为抵扣会员额度
    }],
    couponId: {type: String, default: ''}, //领券|用券返现,相关的couponId
    orderId: {type: String, default: ''}, //购买|领取,相关的orderId
    shopId: {type: String, default: ''}, //领券|用券返现,相关的店铺id
    createdAt: {type: Number, default: Date.now},      //新建时间
    isDeleted: {type: Boolean, default: false},//该条记录是否被删除
}, {
    collection: 'membershipTrades'
});
hookUpModel(MembershipTradesSchema);
var MembershipTrades = mongodb.mongoose.model('MembershipTrades', MembershipTradesSchema);


module.exports = MembershipTrades;