/**
 * Created by lijinxia on 2017/10/16.
 */
var

    commonUtil = require('../../lib/common-util'),
    constants = require('../configs/constants'),
    MessageCenter = require('../models/MessageCenter'),
    async=require('async');


var MessageCenterService = function () {
};
MessageCenterService.prototype.constructor = MessageCenterService;

MessageCenterService.prototype.addMessageCenterToUser = function (userIds, msg, notificationId,messageRef){
    if (!userIds || userIds.length <= 0)
        return;

    async.each(userIds, function (uId, next) {
        var message = {user: uId};
        if(notificationId)
            message.notification = notificationId;

        if(messageRef)
            message.messageRef = messageRef;

        message.images = msg.pics || []; //TODO 特别注意别错了
        message.type = msg.type;
        message.subType = msg.subType || "";
        message.title = msg.title;
        message.content = msg.content;
        message.link = msg.link || "";
        message.isViewed = msg.isViewed || false;
        message.isDeleted = msg.isDeleted || false;

        MessageCenter.create(message);
        next();
    }, function complete(err) {

    });
};

MessageCenterService.prototype.getMessageByUserId = function (userId) {
    var cond = {
        user: userId,
        // isDeleted: false
    };
    return MessageCenter.find(cond, MessageCenter.publicFields).populate('notification', 'type title content images link').sort({createdAt: -1}).exec();
};

MessageCenterService.prototype.getMessageByUserAndNotificationId = function (userId, notificationId) {
    var cond = {
        user: userId,
        // notification:notificationId,
        $or: [{notification: notificationId}, {_id: notificationId}],
        isDeleted: false
    };
    return MessageCenter.find(cond, MessageCenter.publicFields).populate('notification', 'type subType title content images link').sort({createdAt: -1}).exec();
};

MessageCenterService.prototype.updateMessage = function (cond, updates) {
    cond.isDeleted = false;
    return MessageCenter.update(cond, updates).exec();
};

MessageCenterService.prototype.delMessageById = function (msgId) {
    var cond = {
        _id: msgId,
        isDeleted: false
    };
    return MessageCenter.update(cond, {$set: {userDeleted: true, updatedAt: Date.now()}}).exec();
};

MessageCenterService.prototype.getMessageLatestCreated = function (userId) {
    var cond = {
        user: userId
    };
    return MessageCenter.find(cond, MessageCenter.publicFields).sort({createdAt: -1}).limit(1).exec();
};

MessageCenterService.prototype.getMessageById = function (notificationId) {
    var cond = {
        // notification:notificationId,
        $or: [{notification: notificationId}, {_id: notificationId}],
        isDeleted: false
    };
    return MessageCenter.findOne(cond, MessageCenter.publicFields).populate('notification', 'type subType title content images link createdAt').sort({createdAt: -1}).exec();
};
module.exports = exports = new MessageCenterService();




