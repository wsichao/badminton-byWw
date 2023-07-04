/**
 * Created by yichen on 2018/3/1.
 */

"use strict";
const model = Backend.model('doctor_comment', undefined, 'doctor_comment');
const user_model = Backend.model('common', undefined, 'customer');
const like_record_model = Backend.model('doctor_comment', undefined, 'comment_like_record')
const _ = require('underscore');
module.exports = {
  comment : function(user_id,doctor_id,comment){
    let data = {
      userId : user_id,
      doctorId : doctor_id,
      content : comment //评论内容
    }
    return model.create(data);
  },
  delComment : function (user_id,comment_id) {
    let cond = {
      userId : user_id,
      _id : comment_id
    }
    return model.findOneAndUpdate(cond,{isDeleted : true},{new:true});
  },
  commentList : function(user_id,doctor_id,pageSize,weight,bookmark){
    let cond = {
      doctorId : doctor_id,
      isDeleted : false,
      auditStatus : 100
    }
    let sort = {
      weight : -1,
      commentTime : -1
    }
    if(weight){
      cond.weight = {$lte : weight}
    }
    if(bookmark){
      cond.commentTime = {$lt : bookmark}
    }
    pageSize = pageSize || 20;
    let res = {
      items : [],
      bookmark : 0
    }
    let comment_items = [];
    let user_ids = [];
    let likeRecord = [];
    return model.find(cond).sort(sort).limit(pageSize)
      .then(function(items) {
        user_ids = _.map(items, function (item) {
          return item.userId;
        });
        let comment_ids = _.map(items, function (item) {
          return item._id
        });
        comment_items = items;
        if (user_id) {
          return like_record_model.find({
            userId: user_id,
            recordId: {$in: comment_ids},
            isDeleted: false,
            isLiked: true
          })
        }
      })
      .then(function(record){
        likeRecord = _.map(record,function(item){
          return item.recordId + '';
        });
        return user_model.find({_id:{$in:user_ids}},'name avatar')
      })
      .then(function(users){
        let user_index = _.indexBy(users,'_id');
        comment_items.forEach(function(item){
          if(user_index[item.userId]){
            let res_item = {
              "_id": item._id,
              "content": item.content,
              "commentTime": item.commentTime,
              "like_count": item.virtualLikeCount + item.realLikeCount,
              "reply_count": item.replyCount,
              "is_liked" : false,
              user : user_index[item.userId]
            }
            if(_.indexOf(likeRecord,(item._id + '')) != -1){
              res_item.is_liked = true
            }
            res.items.push(res_item);
          }
        })
        res.bookmark = comment_items.length ? comment_items[comment_items.length - 1].commentTime : 0;
        res.weight = comment_items.length ? comment_items[comment_items.length - 1].weight : 0;
        return res;
      })
  },
  like_comment : function(user_id,comment_id){
    return like_record_model.findOne({userId:user_id,recordId:comment_id,isDeleted:false})
      .then(function(like_record){
        if(!like_record){
          return like_record_model.methods.set({userId:user_id,recordId:comment_id})
        }else{
          if(like_record.isLiked){
            return like_record_model.methods.unlike(like_record._id)
          }else{
            return like_record_model.methods.like(like_record._id)
          }
        }
      })
      .then(function(record){
        if(record.isLiked){
          return model.findOneAndUpdate({_id:comment_id}, {$inc:{realLikeCount:1,weight:100}},{new : true})
        }else{
          return model.findOneAndUpdate({_id:comment_id}, {$inc:{realLikeCount:-1,weight:-100}},{new : true})
        }
      })
  }
}
