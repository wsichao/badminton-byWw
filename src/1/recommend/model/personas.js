/**
 * 用户画像
 * Created by Mr.Carry on 2017/7/26.
 */
"use strict";

module.exports = {
  config: {
    source: {type: String, default: 'docChat'},
    userId: {type: String}, // 用户id
    heat: [] // 标签占比
  },
  options: {
    collection: 'personas'
  }
}