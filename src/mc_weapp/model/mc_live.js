/**
 * 
 * 直播相关数据
 * 
 */

"use strict";
module.exports = {
  config: {
    roomInfo: [{
      // 直播间名称
      name: String,
      // 房间 id
      roomid: Number,
      // 奖励金金额	
      cover_img: String,
      // 直播状态 101: 直播中, 102: 未开始, 103: 已结束, 104: 禁播, 105: 暂停中, 106: 异常, 107: 已过期
      live_status: Number,
      goods: [{
          cover_img: String,
          url: String,
          price: Number,
          name: String
      }],

      //主播名
      anchor_name: String,
      //主播图片
      anchor_img: String,
      //直播计划开始时间，列表按照 start_time 降序排列
      start_time: Number,
      // 直播计划结束时间
      end_time: Number
    }]
  },
  options: {
    collection: 'mcLive'
  }
}