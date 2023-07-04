/**
 * Created by Mr.Carry on 2018/3/12.
 */
"use strict";

module.exports = {
  config: {
    name: String,// 姓名
    phone: String,// 手机号
    channelId: Backend.Schema.ObjectId,// 渠道码
    wechat: {
      openId: String, // 微信唯一标识
      nickName: String,// 微信昵称
      avatar: String // 微信头像
    },// 微信账号
    auditState: {
      type: Number,
      default: 0
    },// 审核状态 0:未审核,100:审核失败,200:审核成功
    auditTime: Number, // 审核时间
    refuseReason: {type: String, default: ''} // 拒绝理由
  },
  options: {collection: 'drugAuditor'}
};