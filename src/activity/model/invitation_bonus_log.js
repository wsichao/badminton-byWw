/**
 * 邀请有奖记录 [ invitationBonusLog ]
 * Created by Mr.Carry on 2018/3/12.
 */
"use strict";

module.exports = {
  config: {
    fromUserId: {
      type: Backend.Schema.ObjectId,
    },
    toUserId: {
      type: Backend.Schema.ObjectId,
    },
    isVerification: {
      type: Boolean,
      default: false
    }
  },
  options: {
    collection: 'invitationBonusLog'
  }
};