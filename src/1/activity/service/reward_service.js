/**
 * Created by fly on 2017－06－19.
 */

'use strict';
let _model = Backend.model('1/activity', undefined, 'reward');

module.exports = {
  /**
   * 获取6.24活动,第一单奖励金
   * 1.标示奖励金已使用；
   * 2.记录使用用户；
   * 3.奖励金使用时间
   * @param userId
   * @returns {Promise.<T>|Promise}
   */
  getTodayNormalReward: function (userId, orderId) {
    let now_ts = Date.now();

    let current_day_begin_at = getDateBeginTS(now_ts);
    let current_day_begin_end = getDateEndTS(now_ts);
    //todo: 测试用
    //current_day_begin_at = getDateBeginTS(new Date(activity_test_day));
    //current_day_begin_end = getDateEndTS(new Date(activity_test_day));
    let cond = {
      activityNo: activity_0624_no,
      type: 'normal',
      validAt: {$gte: current_day_begin_at},
      expiredAt: {$lte: current_day_begin_end},
      isConsumed: false
    }
    return _model.findOneAndUpdate(cond, {$set: {isConsumed: true, userId: userId, consumedAt: now_ts, orderId: orderId}}, {sort: {_id: 1}, fields: 'value', new: true})
    .then(function(_reward){
      return _reward && _reward.value || 0;
    })
  }
}