/**
 * Created by yichen on 2018/3/7.
 */


'use strict';
const comment_model = Backend.model('doctor_comment',undefined, 'doctor_comment');
const user_model = Backend.model('common',undefined,'customer');
module.exports = {
  getAction: function () {
    console.log('come in');
    let self = this;
    let query  = this.query;
    let result={};
    let final = comment_model.findOne({_id:query.comment_id})
      .then(function(comment){
        result = {
          _id : comment._id,
          content : comment.content,
          commentTime : comment.commentTime,
          like_count : comment.realLikeCount + comment.virtualLikeCount,
          reply_count : comment.replyCount
        };
        return user_model.findOne({_id:comment.userId})
      })
      .then(function (user) {
        result.user = {
          _id : user._id,
          name : user.name,
          avatar : user.avatar,
        }
        console.log(result);
        return {data : JSON.stringify(result)}
      })
    return self.display('doctor/reply_detail.html',final);
  }
}