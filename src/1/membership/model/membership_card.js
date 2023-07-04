/**
 *  会员额度卡片
 * Created by fly on 2017－05－25.
 */
'use strict';
module.exports = {
  config: {
    userId: {type: String, default: ''},//绑定用户的UUID

    type: {type:String,  enum: ['city_buy', 'zlycare', 'zlycare_vip']},// 会员卡种类

    source: {type: String, default: 'docChat'},//数据来源: docChat-医聊
    expiredAt: {type: Number, default: Date.now},// 过期时间,必需大于等于当前时间才能够正常使用
    validAt:{type:Number,default: Date.now}, //生效时间

    cardNo: {type: String, default: ''},//会员卡no，运营进行管理会员卡，优先级, 消费记录cardNo
    balance: {type: Number, default: 0},//当前会员卡可用的消费福利
    cost: {type: Number, default: 0}, // 当前会员卡实际已经消耗掉的福利
    totalVal : {type: Number, default: 0},//当前会员卡总金额

    hasGenExpiredTrade: {type: Boolean, default: false}, //若会员卡过期,是否已生成过期会员额度明细
  },
  options: {
    collection: 'memberships'
  }
}