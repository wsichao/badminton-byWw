/**
 * Created by Mr.Carry on 2018/3/12.
 */
"use strict";
const model = Backend.model('activity', '', 'invitation_bonus_log');
const co = require('co');
const _ = require('underscore');
const user_model = Backend.model('common','','customer');

module.exports = {
  /**
   * 邀请用户注册记录
   * @param from_user_id 发起邀请人唯一标识
   * @param to_user_id 被邀请用户唯一标识
   */
  registerLog(from_user_id, to_user_id) {
    return co(function* () {
      // 被邀请用户是否重复调用
      const count = yield model.count({toUserId: to_user_id});
      if (count <= 0) {
        return yield model.create({
          fromUserId: from_user_id,
          toUserId: to_user_id
        })
      } else {
        throw Error('该注册用户已被邀请过，不可重复记录同一个被邀请账号');
      }
    });
  },
  /**
   * 被邀请用户核销记录
   * @param to_user_id 被邀请用户唯一标识
   */
  invitationBonusLog(to_user_id) {
    return co(function* () {
      return yield model.update({toUserId: to_user_id}, {isVerification: true});
    })
  },
  /**
   * 发出邀请用户邀请到的记录
   * @param from_user_id 被邀请用户唯一标识
   */
  fromUserinvitation(from_user_id) {
    return co(function* () {
      let result = {
        invite_count : 0,
        check_count : 0,
        bonus : 0,
        invite_users : []
      }
      let invitaion = yield model.find({fromUserId: from_user_id,isDeleted:false}).sort({createdAt : -1});
      result.invite_count = invitaion.length;
      let user_ids = _.map(invitaion,function(item){
        return item.toUserId
      });
      let users = yield user_model.find({_id: {$in : user_ids}},'name avatar');
      let userIndex = _.indexBy(users,'_id');
      invitaion.forEach(function(item){
        if(item.isVerification){
          result.check_count ++ ;
          result.bonus += 3 ;
        }
        if(userIndex[item.toUserId]){
          let user_items = {
            _id : userIndex[item.toUserId]._id,
            name : userIndex[item.toUserId].name,
            bonus : item.isVerification ? 3:0,
            timestamp : item.createdAt,
            avatar : userIndex[item.toUserId].avatar
          }
          result.invite_users.push(user_items);
        }
      })
      return result;
    })
  }
};