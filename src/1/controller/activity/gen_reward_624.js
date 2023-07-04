/**
 *  * 生成624奖励金集合
 *
 * 6.24活动
 * 活动名称： 全城购 返红包
 * 活动时间：23号-26号
 * 活动目的：提高会员活跃
 * 目标核销：日均中奖5单，共计中奖20单
 * 活动规则：
 * l  用户在活动期间下3单，有机会得高额奖励金
 * l  每天总计5单中奖，领完恢复正常奖励
 * Created by yichen on 2017/6/19.
 */

'use strict';
let _model = Backend.model('1/activity', undefined, 'reward');
let async = require('async');
let _ = require('underscore');
module.exports = {
  __beforeAction: function () {
    let ip = getClientIp(this.req);
    if (ip.indexOf("127.0.0.1") == -1) {
      return this.fail("必须 127.0.0.1 启用 Controller");
    }
  },
  getAction: function () {
    let days = [ '2017-06-24', '2017-06-25', '2017-06-26'];
    let day_index = 0;
    let rewards = [];
    async.whilst(
      function(){
        return day_index < days.length;
      },
      function(day_cb){
        let day = new Date(days[day_index]);

        let day_begin_at = getDateBeginTS(day);
        let day_begin_end = getDateEndTS(day);
        console.log('day_begin:', day_begin_at, day_begin_end);
        var groupMemberCount = 30;
        var rewardArray = [];
        //if(day_index == 0){
        //  groupMemberCount = 5;
        //  rewardArray = getRewardArray(5,5)
        //}else if(day_index == 1){
        //  groupMemberCount = 6;
        //  rewardArray = getRewardArray(6,5)
        //}else if(day_index == 2){
        //  groupMemberCount = 8;
        //  rewardArray = getRewardArray(8,5)
        //}else if(day_index == 3){
        //  groupMemberCount = 10;
        //  rewardArray = getRewardArray(10,5)
        //}
        rewardArray = getRewardArray(30,5)
        let circle_num = 5 * groupMemberCount;
        let current_num = 0;

        console.log(rewardArray);

        day_index++;
        async.whilst(
          function(){
            return current_num < circle_num;
          },
          function(circle_cb){
            var bigReward = false;
            if(_.contains(rewardArray,current_num)){
              bigReward = true
            }
            let reward = {
              type: '624', //活动规则类型
              value: 624, //奖励金金额
              validAt: day_begin_at, //有效期的起始时间
              expiredAt: day_begin_end, //有效期的结束时间
              bigReward : bigReward,//获得624块大奖
            }
            rewards.push(reward);
            current_num++;
            process.nextTick(circle_cb);
          },
          function(){
            console.log('rewards.length:', rewards.length);
            day_cb();
          }
        )
      },
      function(){
        console.log('all has completed!');
        _model.create(rewards);
      }
    )
    return this.success('beginning......');
  }
}

let getRewardArray = function(memberCount,groupCount){
  var resultArr = [];
  for(var i = 0;i<groupCount;i++){
    resultArr.push(Math.floor(Math.random() * memberCount) + (i * memberCount) )
  }
  return resultArr;
}