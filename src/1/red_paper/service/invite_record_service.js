/**
 * Created by fly on 2017－07－11.
 */
'use strict';
let _model = Backend.model('1/red_paper', undefined, 'invite_record');
module.exports = {
  genInviteRecord: function (data) {
    return _model.create(data);
  },
  getInviteRecordByUserId: function (invitee_id) {
    let cond = {
      source: 'docChat',
      isDeleted: false,
      invitee: invitee_id
    }
    return _model.findOne(cond).exec();
  },
  /**
   *
   * @param invitee_id
   */
  setInviteRecordLogin: function (invitee_id) {
    let cond = {
      source: 'docChat',
      isDeleted: false,
      invitee: invitee_id,
      isLogin: {$ne: true}
    }
    return _model.findOneAndUpdate(cond, {$set: {isLogin: true}}, {new: true}).exec();
  },
  getInviterCount: function (inviter_id) {
    let cond = {
      source: 'docChat',
      isDeleted: false,
      inviter: inviter_id,
      isLogin: true
    }
    return _model.count(cond).exec();
  }
}