/**
 *
 * 评论医生
 *
 * Created by yichen on 2018/2/28.
 */

'use strict';
const service = Backend.service('doctor_comment', 'doctor_comment');
const servicePackageOrderService = require('./../../../app/services/service_package/servicePackageOrderService');
module.exports = {
  __rule: function(valid){
    return valid.object({
      comment : valid.string().required(),
      doctor_id : valid.string().required()
    });
  },
  postAction: function () {
    console.log('come in');

    let self = this;
    let post = this.post;
    if(!post.comment){
      return self.fail(8005);
    }
    let user_id = this.req.identity.userId

    //是否买过该医生的服务包且审核通过
    return servicePackageOrderService.findOrdersByUserIdAndDoctorId(user_id, post.doctor_id)
      .then(function(spOrder){
        console.log(spOrder);
        if (!spOrder || spOrder.length == 0) {
          throw 2436;
        }
        return service.comment(user_id,post.doctor_id,post.comment)
      })
      .then(function(res){
        let res_obj =
          {
            "code": '200',
            "msg" : '',
            data : {
              "_id": res._id,
              "user": {
                "_id": self.req.identity.user._id,
                "name": self.req.identity.user.name,
                "avatar": self.req.identity.user.avatar
              },
              "content": res.content,
              "commentTime": res.commentTime,
              "like_count": res.realLikeCount + res.virtualLikeCount,
              "reply_count": res.replyCount,
              "is_liked": false
            }
          }
        return self.success(res_obj);
      },function(err){
        return self.fail(err);
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
