/**
 * Created by guoyichen on 2017/2/13.
 */
var
    _ = require('underscore'),
    Q = require("q"),
    commonUtil = require('../../lib/common-util'),
    constants = require('../configs/constants'),
    MomentMsg = require('../models/MomentMsg'),
    async = require('async'),
    Promise = require('promise');


var MomentMsgService = function () {
};
MomentMsgService.prototype.constructor = MomentMsgService;

MomentMsgService.prototype.setExistMessage = function( fans , momentId ,originalMomentId, momentUserId){
    var condition  = {}
    condition.userId = { $in : fans }
    var momentData  = {
        moment : momentId ,
        momentUser : momentUserId,
        originalMomentId : originalMomentId,
        msgCreatedAt: Date.now()
    }
    /*console.log(fans);
    console.log(momentId);
    console.log(momentUserId);*/
    return MomentMsg.update(condition, {$push:{momentList : momentData}} , {new:true,multi: true }).exec();
}


MomentMsgService.prototype.getMsgByUserIdArray = function( userIdArray,fields){
    var condition  = {};
    condition.userId = { $in : userIdArray };
    var selectfields = fields || "userId";
    return MomentMsg.find(condition,selectfields).exec();
}

MomentMsgService.prototype.getMsgByUserIdArrayExcept = function( userIdArray, originalMomentId, fields){
    var condition  = {};
    condition.userId = { $in : userIdArray };
    condition['momentList.originalMomentId'] = originalMomentId;
    var selectfields = fields || "userId";
    return MomentMsg.find(condition,selectfields).exec();
}

MomentMsgService.prototype.getMomentMsgById = function(userId){
    // "$slice":[3,6]
    var condition  = {
        userId : userId,
        isDeleted : false
    };
    return MomentMsg.findOne(condition).exec();
        //.slice('momentList', [ -(pageSlice.skip + 1), pageSlice.limit ]).exec()
        //.populate("momentList.moment").populate("momentList.momentUser","name avatar docChatNum sex");
}

MomentMsgService.prototype.delOneMomentMsg = function(userId,momentId){
    var condition  = {
        userId : userId,
        isDeleted : false,
        'momentList.moment':momentId
    }
    return MomentMsg.update(condition,{'momentList.$.isDeleted' : true}).exec();
}

MomentMsgService.prototype.createNoExistMsg = function(  fans , momentId ,originalMomentId, momentUserId){
    var currentIndex = 0;
    var momentMsgs = [];
    for(var i = 0; i < fans.length; i++){
        var momentData  = {
            moment : momentId ,
            originalMomentId : originalMomentId,
            momentUser : momentUserId,
            msgCreatedAt: Date.now()
        }
        momentMsgs.push({
            userId : fans[i],
            momentList : [
                momentData
            ]
        });
    }
    MomentMsg.create(momentMsgs);
}

MomentMsgService.prototype.createNewUserMsg = function(  fans , momentId , momentUserId){
    var momentData  = {
        moment : momentId ,
        momentUser : momentUserId,
        msgCreatedAt: Date.now()
    }
    var data = {
        userId : fans,
        momentList : [
            momentData
        ]
    }
    return MomentMsg.create(data);
}

module.exports = exports = new MomentMsgService();