/**
 * 发布评论
 * Created by yichen on 2017/6/28.
 */
'use strict';
let config_service = Backend.service('common', 'config_service');
let dynamic_sample_service = Backend.service('1/recommend', 'dynamic_sample_service');

module.exports = {
  __beforeAction: function () {
    // return userInfoAuth(this.req, {
    //   items: []
    // });
  },
  mockAction: function () {
    var resObj = {
      code : 200
    }
    return this.success(resObj);
  },
  postAction: function (){
    let that = this;
    let userId = this.req.identity.userId;
    let user = this.req.identity.user;
    if (!isUUID24bit(userId) || !isExist(user)) {
      return this.fail(8005);
    }
    let moment_id = this.post.moment_id;
    let comment = this.post.comment;
    let comment_id = this.post.comment_id;
    let to_user_id = this.post.to_user_id;

    /*
    * 1.验证信息
    * 2.生成评论
    * 3.更新动态信息
    * 4.生成评论消息
    * 5.发送透传、推送
    * */
    if(!comment || !moment_id){
      return this.fail(8005);
    }
    let momentService = Backend.service("1/moment","moment_service");
    let commentService = Backend.service("1/moment","comment_service");
    let userSercvice = Backend.service("common","user_service");
    let commentMsgService = Backend.service("1/moment","comment_msg_service");
    let messageService = Backend.service("1/message","messages");
    let momentServiceForPush = Backend.service('1/moment','moment');
    let moment,newComment = {},replyComment,replyUser,result;
    return momentService.findMomentById(moment_id)
      .then(function(_moment){
        if(!_moment){
          throw getBusinessErrorByCode(2207);
        }
        moment = JSON.parse(JSON.stringify(_moment));
        newComment.moment_id = moment_id;
        if(comment_id){
              return commentService.findById(comment_id)
          }
      })
      .then(function(_comment){
        if(comment_id){
          if(!_comment){
            throw getBusinessErrorByCode(8005)
          }
          newComment.comment_id = comment_id;
          replyComment = _comment;
        }
        return userSercvice.getInfoByUserId(to_user_id)
      })
      .then(function(_replyUser){
        if(to_user_id){
          if(!_replyUser){
            throw getBusinessErrorByCode(8005)
          }
          newComment.to_user_id = to_user_id;
          replyUser = _replyUser;
        }
        newComment.userId = userId;
        newComment.content = comment;
        return commentService.createComment(newComment)
      })
      .then(function(_comment){
        newComment = _comment;
        return momentService.increaseCommentCount(moment_id)
      })
      .then(function(_moment){

        var newComment_msgs = [];
        if(userId != _moment.userId){
          newComment_msgs.push({
            fromUserId : userId,                                        //发评论用户id
            toUserId : _moment.userId,
            comment : comment,                                       //评论内容
            commentId : newComment._id,                                     //评论id
            moment : {
              momentId : _moment._id,                                    //动态id
              content : _moment.displayContent,                                     //动态内容
              pics : _moment.pics                                      //动态图片
            }
          })
        }
        if(replyUser && replyUser._id != userId){
          newComment_msgs.push({
            fromUserId : userId,                                        //发评论用户id
            toUserId : replyUser._id,
            comment : comment,                                       //评论内容
            commentId : newComment._id,                                     //评论id
            moment : {
              momentId : _moment._id,                                    //动态id
              content : _moment.displayContent,                                     //动态内容
              pics : _moment.pics                                      //动态图片
            }
          })
        }
        return commentMsgService.createCommentMsg(newComment_msgs)
      })
      .then(function(_newComment_msg){
        return userSercvice.getInfoByUserId(moment.userId)
      })
      .then(function(_momentUser) {
        result = {
          code: 200,
          items: {
            user_id: newComment.userId,
            comment_id: newComment._id,
            avatar: user.avatar,
            name: user.name,
            create_time: newComment.createdAt,
            comment: newComment.content
          }
        };
        if(user.shopVenderApplyStatus && user.shopVenderApplyStatus > 2){
          result.items.avatar = user.shopAvatar;
          result.items.name = user.shopName;
        }
        if (replyUser) {
          result.items.to_user_id = replyUser._id;
          result.items.to_user_name = replyUser.shopName || replyUser.name;
          if(replyUser.shopVenderApplyStatus && replyUser.shopVenderApplyStatus > 2){
            result.items.to_user_name = replyUser.shopName;
          }
        }
        if(moment.userId != userId){
          return momentServiceForPush.sendUnreadReminding(_momentUser._id);
        }
      })
      .then(function() {
        if (replyUser && replyUser._id != userId) {
          return momentServiceForPush.sendUnreadReminding(replyUser._id)
        }
      })
      .then(function(){
        //[ 用户行为记录 ] 评论动态
        if (!userId || !moment || !moment.userId) return;
        return config_service.getTagsByUserId(moment.userId)
          .then(tags => {
            if (!tags || tags.length == 0) return;
            let sample_info = {
              type: 0,
              targetId: moment_id,
              action: 2,
              tags: tags
            }
            return dynamic_sample_service.genSample(userId, sample_info);
          })
      })
      .then(function(){
        return that.success(result);
      }, function (err) {
        console.log(err);
        commonResponse(that.res, 400, {code:err.code, msg:err.message}, null);
      })


  }
}