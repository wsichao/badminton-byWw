/**
 * 624活动 返现624块
 * Created by yichen on 2017/6/19.
 */


"use strict";
let model = Backend.model("1/activity", undefined, "reward");
let _ = require('underscore')


module.exports = {
  /**
   * 保存领取记录到redis
   * 返回 redis存储内容
   * @param userId
   * @param orderId
   */
  saveRedisOrder: function (userId,orderId) {
    let defer = Backend.Deferred.defer();
    var orderArr = [];

    Backend.cache.get(userId + "624").then(function (result) {
      result = JSON.parse(result);
      if (result) {
        orderArr = result;
      }
      orderArr.push(orderId);
      Backend.cache.set(userId + '624', JSON.stringify(orderArr), 60 * 60 * 24 * 10);
      defer.resolve(orderArr);
      console.log(orderArr);
    })
    return defer.promise;
  },
  saveRewardRecord : function(userId,orderId){
    let now_ts = Date.now();

    let current_day_begin_at = getDateBeginTS(now_ts);
    let current_day_begin_end = getDateEndTS(now_ts);
    //todo: 测试用
    //current_day_begin_at = getDateBeginTS(new Date(activity_test_day));
    //current_day_begin_end = getDateEndTS(new Date(activity_test_day));
    let cond = {
      activityNo: activity_0624_no,
      type: '624',
      validAt: {$gte: current_day_begin_at},
      expiredAt: {$lte: current_day_begin_end},
      isConsumed: false
    }
    return model.findOneAndUpdate(cond,
      {$set: {isConsumed: true, userId: userId, consumedAt: now_ts, orderId: orderId}},
      {sort: {_id: 1}, fields: 'value bigReward', new: true})
      .then(function(_reward){
        return _reward && _reward.bigReward && _reward.value || 0;
      })
  }
};
