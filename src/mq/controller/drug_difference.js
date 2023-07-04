/**
 * Created by yichen on 2018/4/11.
 */

const co = require('co');
const message_service = Backend.service('boss','message');
const user_model = require('../../../app/models/Customer');
'use strict';
module.exports = {
  postAction: function () {
    let self = this;
    let message = this.post.data;
    let result = co(function* () {
      let user = yield user_model.findOne({_id:message.user});
      let notificationExtras = {
          type: '4',//推送按照type
          contentType: 'notificationCenter',//透传按照contentType
          notificationBody: {
            type: message.type + '',
            title: message.title,//标题
            content: message.content,//药品名称
          }
      }
      let message_new = yield message_service.push_and_save_message(user.pushId,notificationExtras,undefined,undefined,message)
      if(message_new){
        return{
          'isAsk' : 1,
          code:200,
          msg:'通知成功'
        }
      }else{
        return{
          code:400,
          msg:'通知失败'
        }
      }
    });
    return this.success(result);
  }
}

