/**
 * Created by fly on 2017－06－06.
 */
'use strict';
let service_emchat = Backend.service('common', 'EmchatService');
let im_session_service = Backend.service("1/im", "im_session");

module.exports = {
  __beforeAction: function () {
    return userInfoAuth(this.req, {
      code: 2327,
      msg: '删除好友失败'
    });
  },
  mockAction: function () {
    let resObj = {
      code: '200',
      msg: '假成功'
    };
    return this.success(resObj);
  },
  postAction: function () {
    let _self = this;
    //删除好友关系
    let app_user = this.req.user;
    let app_user_im_name = app_user.im && app_user.im.userName || 'test';
    let friend_im_name = this.req.body.friend;
    //console.log(app_user_im_name, friend_im_name);

    //验证环信用户id
    if (!friend_im_name) {
      return this.fail(3001);
    }
    return service_emchat
      .deleteFriend(app_user_im_name, friend_im_name)
      .then(function () {
        return im_session_service.deleteSession(app_user_im_name, friend_im_name);
      })
      .then(function (_res) {
        console.log('_res_1:', _res, typeof _res);
        if (_res.error) {
          return _self.fail(2327);
        }
        return _self.success({
          code: '200',
          msg: ''
        });
      }, function (_res) {
        console.log('_res_2:', _res, typeof _res);
        return _self.fail(2327);
      });
  }
}