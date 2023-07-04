/**
 * Created by yichen on 2017/5/2.
 */

/**
 * Coupon
 * 代金券
 * Created by zhaoyifei on 15/1/26.
 */

var
    mongodb = require('../configs/db'),
    StatisticsHelper = require('../../lib/StatisticsHelper'),
    Schema = mongodb.mongoose.Schema;
var hookUpModel = StatisticsHelper.hookUpModel;
//var min = [0, 'The value of path `{PATH}` ({VALUE}) is beneath the limit ({MIN}).'];
//var max = [1, 'The value of path `{PATH}` ({VALUE}) exceeds the limit ({MAX}).'];
var MembershipSchema = new Schema({
    userId: {type: String, default: ''},//绑定用户的UUID

    type: {type: String, enum: ['city_buy', 'zlycare', 'zlycare_vip']},// 会员卡种类

    source: {type: String, default: 'docChat'},//数据来源: docChat-医聊
    expiredAt: {type: Number, default: Date.now},// 过期时间,必需大于等于当前时间才能够正常使用
    validAt: {type: Number, default: Date.now}, //生效时间

    cardNo: {type: String, default: ''},//会员卡no，运营进行管理会员卡，优先级, 消费记录cardNo
    balance: {type: Number, default: 0},//当前会员卡可用的消费福利
    normalValue: {type: Number, default: 0},//当前会员卡可用的常用药品的报销额度，默认值为0
    cost: {type: Number, default: 0}, // 当前会员卡实际已经消耗掉的福利
    totalVal: {type: Number, default: 0},//当前会员卡总金额

    hasGenExpiredTrade: {type: Boolean, default: false}, //若会员卡过期,是否已生成过期会员额度明细
    createdAt: {type: Number, default: Date.now},      //新建时间
    updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
    isDeleted: {type: Boolean, default: false},//该条记录是否被删除
    statisticsUpdatedAt: {type: Number, default: Date.now}

}, {
    collection: 'memberships'
});
hookUpModel(MembershipSchema);
var Membership = mongodb.mongoose.model('Membership', MembershipSchema);


module.exports = Membership;