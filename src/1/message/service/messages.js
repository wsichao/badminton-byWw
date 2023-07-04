/**
 * Created by Mr.Carry on 2017/5/25.
 */
"use strict";
let JPushService = require('./../../../../app/services/JPushService');

/**
 *
 * @param push_id
 * @param message_notification 内容
 * @param notification_extras
 */
let pushNotification = function (push_id, message_notification, notification_extras) {

  /**
   * var extras = {
         type: 1,//有新消息 
         contentType: 'personal' moment-动态, personal-个人留言, sys-系统通知  comment-评论点赞
          };
   */
  JPushService.pushNotification(push_id, message_notification, '', notification_extras);
  console.log("pushNotification")
}

let pushMessage = function (push_id, content, extras) {
  /**
   * var extras = {
         type: 1,//有新消息 
         contentType: 'personal' moment-动态, personal-个人留言, sys-系统通知  comment-评论点赞
          };
   */

  JPushService.pushMessage(push_id, content, '', extras);
  console.log("pushMessage")
}

module.exports = {
  insertMessage: function (msg_obj) {
    let model = Backend.model('1/message', undefined, 'messages');
    //let extras = {
    //  type: 1,
    //  contentType: 'sys'
    //}
    //pushNotification(push_id, content, extras);
    //pushMessage(push_id, content, extras);
    return model.create(msg_obj);
  },
  pushNotification: pushNotification,
  pushMessage: pushMessage
};