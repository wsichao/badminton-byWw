/**
 * IM 用户管理
 * Created by Mr.Carry on 2017/6/6.
 */
'use strict';

let emchatService = Backend.service("common", "EmchatService")
let customer_model = Backend.model('common', undefined, 'customer');
var mongoose = require('mongoose');

module.exports = {
  /**
   * 添加好友
   * @param from_user_id 用户 user_id
   * @param friend_im_user_name 好友 IM 用户名
   */
  addFriend: function (from_user_id, friend_im_user_name) {
    let from_im_user_name;
    return customer_model
      // 查询用户 im 用户名
      .findOne({_id: from_user_id}, "im.userName")
      .then(function (data) {
        from_im_user_name = data.im.userName;
        // 添加好友关系
        return emchatService.addFriend(from_im_user_name, friend_im_user_name);
      })
      .then(function () {
        return {im_user_id: from_im_user_name};
      })
      .catch(function (err) {
        console.log(err);
        return {err: err.stack};
      })
  },
  /**
   * 创建 IM 用户
   * @param user_id
   */
  create: function (user_id) {
    let im_data = {};
    return customer_model
      .findOne({_id: user_id}, "name im shopVenderApplyStatus")
      .then(function (data) {
        let name = '';
        im_data = data.im;
        if (!data.im || ((data.im.userName == '' && data.im.pwd == '') || data.im.isSync == false)) {
          if (data.shopVenderApplyStatus > 2) {
            name = data.shopName || "";
          }
          else if (data.shopVenderApplyStatus <= 2) {
            name = data.name || "";
          }
          // 环信用户名
          let im_user_id = mongoose.Types.ObjectId();
          // 环信用户密码
          let im_pwd = mongoose.Types.ObjectId();
          im_data = {im_user_id: im_user_id, im_pwd: im_pwd, im_nickname: name};
          return im_data;
        }
        throw new Error(user_id + ":用户已存在环信账户");
      })
      // 创建环信用户
      .then(function (data) {
        return customer_model.update({_id: user_id}, {
          $set: {
            im: {
              userName: data.im_user_id,
              pwd: data.im_pwd,
              nickName: data.im_nickname
            }
          }
        }).then(function () {
          return data;
        })
      })
      // 同步环信账户
      .then(function (data) {
        return emchatService.createUser(data.im_user_id, data.im_pwd, data.im_nickname);
      })
      // 创建成功,修改用户im.isSync = true;
      .then(function (data) {
        return customer_model.update({_id: user_id}, {$set: {"im.isSync": true}});
      })
      .then(function () {
        return {userName: im_data.im_user_id, pwd: im_data.im_pwd, nickName: im_data.im_nickname, isSync: true};
      },function (err) {
        //console.log(err);
        //console.log("im_data:", im_data);
        return im_data;
      })
  },

  /**
   * 修改昵称
   * @param user_id  用户id
   * @param nickname 昵称
   */
  updateNick: function (user_id, nickname) {
    return customer_model
      .findOne({_id: user_id}, 'im.userName')
      // 同步昵称
      .then(function (data) {
        let im_user_name = data.im.userName;
        return emchatService.editNickname(im_user_name, nickname);
      })
      // 修改昵称
      .then(function () {
        return customer_model.update({_id: user_id}, {$set: {'im.nickName': nickname}})
      }).catch(function (err) {
        console.log(err);
        return {err: err.stack};
      })
  },
  getList: function () {
    return customer_model.find({'$or': [{im: {$exists: false}}, {'im.isSync': false}]}, "_id").limit(5);
  },
  /**
   * 获取用户信息
   * @param im_user_name im 用户名
   */
  getUserInfo: function (im_user_name) {
    return customer_model
      .findOne({'im.userName': im_user_name}, '_id avatar name shopVenderApplyStatus shopName shopAvatar')
      .then(function (data) {
        let name = '';
        let avatar = '';
        if (data.shopVenderApplyStatus >= 3) {
          name = data.shopName || "";
          avatar = data.shopAvatar || "";
        }
        else if (data.shopVenderApplyStatus <= 2) {
          name = data.name || "";
          avatar = data.avatar || "";
        }
        return {_id: data._id, avatar: avatar, name: name};
      });
  },
  /**
   * 移除黑名单
   * @param user_id  用户id
   * @param black_username IM用户名
   * @returns {*}
   */
  deleteUserBlack: function (user_id, black_username) {
    return customer_model
      .findOne({_id: user_id}, 'im.userName')
      .then(function (data) {
        return emchatService.deleteUserFromBlacklist(data.im.userName, black_username);
      }).catch(function (err) {
        console.log(err)
        return {};
      })
  }
};