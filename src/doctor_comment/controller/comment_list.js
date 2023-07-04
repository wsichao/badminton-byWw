/**
 * Created by yichen on 2018/3/1.
 */


'use strict';
const service = Backend.service('doctor_comment', 'doctor_comment');
module.exports = {
  __rule: function(valid){
    return valid.object({
      doctor_id : valid.string().required()
    });
  },
  getAction: function () {
    console.log('come in');
    let self = this;
    let query  = this.query;
    let user_id = this.req.identity.userId;
    return service.commentList(user_id,query.doctor_id,query.pageSize,query.weight,query.bookmark)
      .then(function(res){
        return self.success(res);
      })
  },
  mockAction: function () {
    let res_obj ={
      items : [
        {
          "user_id": '57d77e24f52e142136bd8573',
          "user_name" : 'yichen',
          "user_avatar" : '612C2204-90A8-4641-BB07-309EE1F51096',
          "content" : 'xxx',
          "commentTime" : 1519871959000,
          "like_count" : 1111,
          "replyCount":1111,
          "_id" : '57d77e24f52e142136bd8573'
        },
        {
          "user_id": '57d77e24f52e142136bd8573',
          "user_name" : 'yichen',
          "user_avatar" : '612C2204-90A8-4641-BB07-309EE1F51096',
          "content" : 'xxx',
          "commentTime" : 1519871959000,
          "like_count" : 1111,
          "replyCount":1111,
          "_id" : '57d77e24f52e142136bd8573'
        },
        {
          "user_id": '57d77e24f52e142136bd8573',
          "user_name" : 'yichen',
          "user_avatar" : '612C2204-90A8-4641-BB07-309EE1F51096',
          "content" : 'xxx',
          "commentTime" : 1519871959000,
          "like_count" : 1111,
          "replyCount":1111,
          "_id" : '57d77e24f52e142136bd8573'
        },
      ],
      weight:100000
    }

    return this.success(res_obj);
  }
}