/**
 * 
 * 微信公众号 关注用户表
 * 
 */

"use strict";
module.exports = {
  config: {
    //微信公众号的唯一 id	
    openid: String,
    //腾讯平台的 id
    unionid: String,
  },
  options: {
    collection: 'mcOfficialAccount'
  }
}