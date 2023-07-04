/**
 * 邀请好友有现金红包,邀请纪录
 * Created by fly on 2017－07－11.
 */
'use strict';

module.exports = {
  config: {
    source: {type: String, default: 'docChat'},
    inviter : { type: String , default : '' , index : 1 },    //邀请人id
    invitee : { type: String , default : '' , index : 1 },     //被邀请人id
    inviteePhone : { type: String , default : ''},      //被邀请人手机号
    isLogin : { type: Boolean , default : false , index : 1 }, //邀请后,是否登录过
    inviteeReward : {type: Number, default: 0}, //被邀请人登录后的现金奖励

  },
  options: {
    collection: 'inviteRecords'
  }
}