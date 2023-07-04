/**
 * Created by yichen on 2017/6/9.
 */


"use strict";

var EmchatRecord = Backend.model('1/im', undefined, 'em_chat_record');

module.exports = {
  /**
   * 获取聊天记录
   * @param userName
   * @param chatUserName
   * @param timestamp 最后一条记录时间戳
   * @param pageSize 个数
   * @returns {Array|{index: number, input: string}}
   */
  getChatRecord : function(userName,chatUserName,timestamp,pageSize){
    var cond = {
      "$or":
        [
          {"from": chatUserName,to:userName},
          {"from": userName, to :chatUserName }
        ],
      deletedBy : {$ne : userName}
    };
    if(timestamp){
      cond.timestamp = { $lt : timestamp }
    }
    var pageSlice = {
      sort: {timestamp : -1}
    };
    if(pageSize){
      pageSlice.limit = pageSize
    }
    return EmchatRecord.find(cond,"",pageSlice).exec()
  },
};