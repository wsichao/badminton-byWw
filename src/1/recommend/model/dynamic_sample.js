/**
 * 动态推荐系统样本
 * Created by Mr.Carry on 2017/7/26.
 */
"use strict";

module.exports = {
  config: {
    source: {type: String, default: 'docChat'},
    userId: {type: String}, // 用户id
    type: {type: Number, default: 0},// [{ 0 : 动态 , 1 : 朱丽叶健康, 2: 购买 }]
    targetId: {type: String},
    action: {type: Number}, // [ { 0 : 查看 , 1 : 点赞 ,2 : 评论 ,3 : 转发 , 4: 购买成功 5: 购买失败 }  ]
    tags: []
  },
  options: {
    collection: 'dynamic_sample'
  }
}