/**
 * 6.24活动
 * 活动名称： 全城购 返红包     抢624元奖励金
 * 活动时间：23号-26号
 * 活动目的：提高会员活跃
 * 目标核销：日均1000单，共计4000单
 * 奖励金补贴预算：35000
 *
 * 活动规则：
 * l  用户在活动期间每天第一单下单后，可得高额奖励金
 * l  每天总计1000个奖励金红包，领完恢复正常奖励
 * l 在4天活动周期内，累积下满3单的用户，在第三单有机会获得624元奖励金
 * l 624元奖励规则
 * 第一天，每5个3单用户出1个624，当天最多出5个624
 * 第二天，每6个3单用户出1个624，当天最多出5个624
 * 第三天，每8个3单用户出1个624，当天最多出5个624
 * 第四天，每10个3单用户出1个624，当天最多出5个624
 *
 * 第一单奖励金规则如下，以每200单为周期，按照下述规则进行比例分配
 * 其中180个用户奖励金额在4-6元之间随机数，金额带小数点2位
 * 其中20个用户奖励金额在10-20元之间随机数，金额带小数点2位
 * 第二单开始恢复正常奖励金
 *
 * Created by fly on 2017－06－19.
 */

'use strict';

module.exports = {
  config: {
    activityNo: {type: String, default: activity_0624_no}, //活动代号
    type: {type: String, default: 'normal', enum: ['normal', '624']}, //活动规则类型
    value: {type: Number, default: 0}, //奖励金金额
    isConsumed: {type: Boolean, default: false}, //奖励金是否被用户使用
    userId: {type: String, default: ''}, //获取奖励金的用户id
    orderId: {type: String, default: ''}, //获取奖励金的相关的订单
    consumedAt: {type: Number, default: 0}, //用户获取奖励金的时间
    validAt: {type: Number, default: 0}, //有效期的起始时间
    expiredAt: {type: Number, default: 0}, //有效期的结束时间
    bigReward: {type: Boolean, default:false} //获取624元大奖
  },
  options: {
    collection: 'rewards'
  }
}
