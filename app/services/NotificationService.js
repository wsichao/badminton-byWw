/**
 * Created by lijinxia on 2017/10/16.
 */

var
    // commonUtil = require('../../lib/common-util'),
    // constants = require('../configs/constants'),
    Notification = require('../models/Notification');


var NotificationService = function () {
};
NotificationService.prototype.constructor = NotificationService;

NotificationService.prototype.createNotification = function (notification) {

    return Notification.create(notification);
};
NotificationService.prototype.getNotificationList = function (cond, params,pageSlice) {
    cond.isDeleted=false;
    return Notification.find(cond, Notification.publicFields, pageSlice).sort({updatedAt:-1}).exec();
};
NotificationService.prototype.getNotificationById = function (id) {
    var cond = {
        _id: id,
        isDeleted: false
    };
    return Notification.findOne(cond, Notification.publicFields).exec();
};

NotificationService.prototype.updNotificationById = function (id, updates) {
    var cond = {
        _id: id,
        isDeleted: false
    };
    return Notification.findOneAndUpdate(cond, updates,{new: true}).exec();
};
NotificationService.prototype.delNotificationById = function (id) {
    var cond = {
        _id: id,
        isDeleted: false
    };
    return Notification.update(cond, {$set: {isDeleted: true, updatedAt: Date.now()}}).exec();
};

NotificationService.prototype.getNotificationForMessageById = function (id) {
    var cond = {
        $or: [{notification: id}, {_id: id}],
    };
    return Notification.findOne(cond, Notification.publicFields).exec();
};
module.exports = exports = new NotificationService();