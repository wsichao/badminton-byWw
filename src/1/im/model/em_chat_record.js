/**
 * Created by yichen on 2017/6/6.
 */
'use strict';
module.exports = {
  config: {
    uuid: String, //msg_id
    type: String,
    created: Number,
    modified: Number,
    timestamp: Number,//消息发送时间
    from: {type:String, index: true},//发送人username
    msg_id: String,//消息id
    to: {type:String, index: true},//接收人的username或者接收group的id
    groupId: String,
    chat_type: String,//用来判断单聊还是群聊。chat:单聊，groupchat:群聊
    payload: Object,

    emchatRequestAt: Number,

    statisticsUpdatedAt: {type: Number, default: Date.now},
    isDeleted: {type: Boolean, default: false},
    deletedBy : [String] ,//谁删除过这条消息
    qiniuResource: String //七牛资源
  },
  options: {
    collection: 'emchatRecords'
  }
}
