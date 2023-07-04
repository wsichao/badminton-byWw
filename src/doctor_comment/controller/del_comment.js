/**
 *
 * 删除评论
 *
 * Created by yichen on 2018/3/1.
 */

'use strict';
const service = Backend.service('doctor_comment', 'doctor_comment');
module.exports = {
  __rule: function(valid){
    return valid.object({
      comment_id : valid.string().required()
    });
  },
  putAction: function () {
    let res_obj =
      {
        "code": '200',
        "msg" : ''
      }
    let self = this;
    let post = this.post;
    let user_id = this.req.identity.userId
    return service.delComment(user_id,post.comment_id)
      .then(function(res){
        return self.success(res_obj);
      })
  },
  mockAction: function () {
    let res_obj =
      {
        "code": '200',
        "msg" : ''
      }
    return this.success(res_obj);
  }
}
