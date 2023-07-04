/**
 * Created by guoyichen on 2017/1/4.
 */

var
    _ = require('underscore'),
    Q = require("q"),
    commonUtil = require('../../lib/common-util'),
    constants = require('../configs/constants'),
    Message = require('../models/Message'),
    Promise = require('promise');


var MessageService = function () {
};
MessageService.prototype.constructor = MessageService;
MessageService.prototype.countNotReadMessages = function(userId){
    var cond = {
        userId: userId,
        isViewed: false
    }
    return Message.count(cond);
}

MessageService.prototype.createMessage = function(message){

    return Message.create(message);
}

MessageService.prototype.updateMessage = function (condition, update){
    //if(!update.updatedAt){
    //    update.updatedAt = Date.now()
    //}
    return Message.findOneAndUpdate(condition, update).exec();
}

MessageService.prototype.getNewestMessageByType = function(userId, type){
    type = type || 'hongbao_record';
    var cond = {
        userId: userId,
        type: type
    }
    return Message.findOne(cond, Message.publicFields, {sort: {createdAt
        : -1},limit: 1}).exec();
}
MessageService.prototype.getMessages = function(userId, ignoredTypes, pageSlice ,type){
    ignoredTypes = ignoredTypes || [];
    var cond = {
        isDeleted: false,
        userId: userId,
        type: {$nin: ignoredTypes, $in: ["hongbao_record","hongbao_refund","sys"]}
    };
    if(type && type != "sys"){
        cond.type ={$nin: ignoredTypes, $eq: type};
    }
    return Message.find(cond, Message.publicFields, pageSlice).populate("messageFrom","name avatar sex docChatNum profile").exec();
};
MessageService.prototype.getMyMessages = function(userId, pageSlice){
    var cond = {
        isDeleted: false,
        messageFrom: userId,
        type : 'personal'
    };
    return Message.find(cond, Message.publicFields, pageSlice).populate("messageTo","name avatar sex docChatNum profile").exec();
};
MessageService.prototype.getMessageById = function(msgId){
    var cond = {
      _id: msgId,
      isDeleted: false
    };
    return Message.findOne(cond, Message.publicFields)
      .populate('messageFrom', 'name avatar sex docChatNum profile')
      .exec();
};

MessageService.prototype.delMessageById = function(msgId){
    var cond = {
      _id: msgId,
      isDeleted: false
    };
    return Message.update(cond, {$set: {isDeleted: true, updatedAt: Date.now()}})
      .exec();
};
module.exports = exports = new MessageService();




