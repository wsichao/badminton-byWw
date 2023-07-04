/**
 * 动态评论消息相关
 * Created by yichen on 2017/6/29.
 */


"use strict";

let model = Backend.model('1/moment', undefined, 'comment_msg');
module.exports = {
   createCommentMsg: function(data){
    return model.create(data);
  },
  deleteCommentMsg:function(fromUserId,momentId){
       var condition = {
           fromUserId : fromUserId,
           'moment.momentId' : momentId,
           isDeleted : false
       };
       return model.findOneAndUpdate(condition,{$set: {isDeleted:true}},{new: true}).exec();
  },
    getListByToUserId: function(toUserId,isRead,pageSize,timeStamp){ //isRead  true:已读 false:未读
      var condition = {
          toUserId : toUserId,
          isDeleted : false,
          isRead : isRead
      };
      if(timeStamp && timeStamp !=0){   //当有时间戳且时间戳不为零，加载小于这个时间戳的消息列表
          condition.createdAt = {
            $lt:timeStamp
          }
      }


      return model.find(condition,"").sort({createdAt:-1}).limit(pageSize).exec(); //将消息按时间戳降序排列
    },
    findUnreadMessage : function (toUserId) {
        var condition = {
            toUserId : toUserId,   //接受评论的用户
            isRead : false,
            isDeleted : false,
        };
        return model.find(condition).sort({createdAt:-1}).exec();
    },
    updateMessages : function (messageIds,update) {
        var condition = {
            _id : { $in : messageIds},
            isDeleted : false,
        };
        return model.update(condition, update, {multi: true}).exec()
    }
};
