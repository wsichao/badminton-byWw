/**
 * 生成普通奖励金集合
 *
 * 6.24活动
 * 活动名称： 全城购 返红包
 * 活动时间：23号-26号
 * 活动目的：提高会员活跃
 * 目标核销：日均1000单，共计4000单
 * 活动规则：
 * l  用户在活动期间每天第一单下单后，可得高额奖励金
 * l  每天总计1000个奖励金红包，领完恢复正常奖励
 *
 * 第一单奖励金规则如下，以每200单为周期，按照下述规则进行比例分配
 * 其中180个用户奖励金额在4-6元之间随机数，金额带小数点2位
 * 其中20个用户奖励金额在10-20元之间随机数，金额带小数点2位
 * 第二单开始恢复正常奖励金
 * Created by fly on 2017－06－19.
 */

'use strict';
let _model = Backend.model('1/activity', undefined, 'reward');
let async = require('async');
module.exports = {
  __beforeAction: function () {
    let ip = getClientIp(this.req);
    if (ip.indexOf("127.0.0.1") == -1) {
      return this.fail("必须 127.0.0.1 启用 Controller");
    }
  },
  getAction: function () {
    let days = ['2017-06-23', '2017-06-24', '2017-06-25', '2017-06-26'];
    let day_index = 0;
    let rewards = [];
    async.whilst(
      function(){
        return day_index < days.length;
      },
      function(day_cb){
        let day = new Date(days[day_index]);
        day_index++;
        let day_begin_at = getDateBeginTS(day);
        let day_begin_end = getDateEndTS(day);
        console.log('day_begin:', day_begin_at, day_begin_end);
        let circle_num = 1000;
        let current_num = 0;
        let level_1_num = 180;
        let level_2_num = 20;

        async.whilst(
          function(){
            return current_num < circle_num;
          },
          function(circle_cb){
            current_num++;
            if((level_1_num + level_2_num) == 0){
              level_1_num = 180;
              level_2_num = 20;
            }
            let value = 0;
            let level_random = getRandomNum(1, 200);
            if(level_1_num > 0 && level_2_num > 0){
              if(level_random < 181){
                value = getRandomNum(400, 600);
                level_1_num--;
              }else{
                value = getRandomNum(1000, 2000);
                level_2_num--;
              }
            }else if(level_1_num > 0){
              value = getRandomNum(400, 600);
              level_1_num--;
            }else if(level_2_num > 0){
              value = getRandomNum(1000, 2000);
              level_2_num--;
            }
            value = value / 100;
            console.log(current_num, value, level_1_num, level_2_num);
            let reward = {
              type: 'normal', //活动规则类型
              value: value, //奖励金金额
              validAt: day_begin_at, //有效期的起始时间
              expiredAt: day_begin_end, //有效期的结束时间
            }
            rewards.push(reward);
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