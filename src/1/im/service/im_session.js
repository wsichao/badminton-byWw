/**
 * IM 会话管理service
 * Created by Mr.Carry on 2017/6/8.
 */

"use strict";
let im_session_model = Backend.model("1/im", undefined, 'im_session');
let ec_chat_record_model = Backend.model("1/im", undefined , "em_chat_record" );


module.exports = {
  /**
   * 添加会话
   * @param from_im_user_name IM username
   * @param to_im_user_name   IM username
   * @returns {*|Promise.<T>}
   */
  insertSession: function (from_im_user_name, to_im_user_name) {
    //return im_session_model.update({
    //  userName: from_im_user_name
    //}, {
    //  $addToSet: {sessions: {userName: to_im_user_name}}
    //}, true, false)

    return im_session_model
      .count({userName: from_im_user_name})
      .then(function (count) {
        // update
        if (count > 0) {
          return im_session_model.update({
            userName: from_im_user_name,
            'sessions': {$ne: to_im_user_name}
          }, {
            $push: {sessions: to_im_user_name}
          });
        }
        // create
        else {
          return im_session_model.create({userName: from_im_user_name, sessions: [to_im_user_name]})
        }
      })

  },
  /**
   * 删除会话
   * @param from_im_user_name IM username
   * @param to_im_user_name   IM username
   * @returns {*}
   */
  deleteSession: function (from_im_user_name, to_im_user_name) {
    return im_session_model.update({userName: from_im_user_name}, {$pull: {'sessions': to_im_user_name}});
  },
  /**
   * 获取会话信息
   * @param userName   IM username
   * @return {Promise  sessionObject}
   */
  getSession: function(userName){
    return im_session_model.findOne({userName : userName})
  },
  /**
   * 删除会话列表,同时删除消息记录
   * @param from_im_user_name   IM username
   * @param to_im_user_name     IM username
   * @returns {Promise updateObject}
   */
  deleteChatRecord: function(from_im_user_name, to_im_user_name){
    var cond = {
      isDeleted : false ,
      "$or":
        [
          {"from": from_im_user_name,to:to_im_user_name},
          {"from": to_im_user_name, to :from_im_user_name }
        ]
    }
    return ec_chat_record_model.update( cond ,  {$addToSet : {'deletedBy': from_im_user_name}}, {multi : true });

  }
};