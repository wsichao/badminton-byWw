const request = require('request');
const co = require('co');
const fs = require('fs');
const common_util = require('../../../lib/common-util');
const user_info_model = Backend.model('mc_weapp', undefined, 'mc_user_info');
const user_role_model = Backend.model('mc_weapp', undefined, 'mc_user_role');
const user_ref_model = Backend.model('mc_weapp', undefined, 'mc_user_ref');
const mc_scene_user_role_model = Backend.model('mc_weapp', undefined, 'mc_scene_user_role');
const user_center_service = Backend.service('user_center', 'handle_user_center');
const user_model = require('../../../app/models/Customer');
const old_customer_service = require('../../../app/services/CustomerService');
const old_zlycare_controller = require('../../../app/controllers/ZlycareController');
const sessionTokenService = Backend.service('common', 'session_token');
const sceneSupplyModel = Backend.model('mc_weapp', undefined, 'mc_scene_supply');

module.exports = {
  /**
   * 判断用户qcode关联表是否生成
   * user_id : 用户id
   */
  async userInfoExist(user_id) {
    let user = await user_info_model.findOne({
      userId: user_id,
      isDeleted: false
    });
    return user;
  },
  /**
   * 生成qcode关联表
   * user_id : 用户id
   * qcode ：二维码
   */
  async userInfoCreate(user_id, qcode) {
    let user = await user_info_model.create({
      userId: user_id,
      qcode: qcode
    });
    return user;
  },
  /**
   * 判断用户是否是城市经理
   * user_id : 用户id
   */
  async getRole(user_id) {
    const role = await user_role_model.findOne({
      userId: user_id,
      isDeleted: false,
      type: 0
    });
    return role;
  },
  /**
   * 更新userInfo表
   * user_id : 用户id
   * qcode ：二维码
   */
  async userInfoUpdate(user_id, qcode) {
    let cond = {
      userId: user_id,
      isDeleted: false
    }
    var update_info = {
      $set: {
        qcode: qcode
      }
    }
    let user = await user_info_model.findOneAndUpdate(cond, update_info, {
      new: true
    });
    return user;
  },
  /**
   * 注册登陆 
   * phone_num 手机
   * name 名字
   * avatar 头像
   * return {
   *  user_new : 是不是新用户 true 是 false 不是
   *  sessionToken : 用户token string
   *  user_id : 用户id
   * }
   */
  async loginAndSignin(phone_num, name, gender, avatar, header_session_type) {
    await user_center_service.login_lazy_user_init(phone_num);
    let user_center_auth = await user_center_service.auth_code(phone_num);
    let auth_code = '';
    if (!user_center_auth || user_center_auth.errno || !user_center_auth.data || !user_center_auth.data.code) {
      throw getBusinessErrorByCode(8007);
    } else {
      auth_code = user_center_auth.data.code
    }
    let user_center_new = false;
    let user_new = false;
    const user_center_auth_res = await user_center_service.login_auth_code(phone_num, auth_code);
    if (!user_center_auth_res || (user_center_auth_res.errno && user_center_auth_res.errno != 2003)) {
      throw getBusinessErrorByCode(1502);
    }
    if (user_center_auth_res.errno == 2003) {
      user_center_new = true;
    }
    let user = await user_model.findOne({
      phoneNum: phone_num,
      isDeleted: false
    });
    if (!user) {
      user = await old_customer_service.validUser(phone_num, name, gender,'', 'mcApplet', '', '', '', {
        avatar
      });
      user_new = true;
    }
    let resUser = {};
    resUser = user;
    resUser.sessionToken = await sessionTokenService.createToken(user._id, '2030WeChat');

    if (user_center_new) {
      let user_center_init = await user_center_service.login_lazy_user_init(phone_num);
    }
    resUser.user_new = user_new;
    resUser.user_id = user._id;
    return resUser;
  },
  /**
   * 查询用户是否建立了与邀请人的关系
   * user_id : 用户id
   */
  async searchUserRef(user_id) {
    let user = await user_ref_model.findOne({
      userId: user_id,
      isDeleted: false
    });
    return user;
  },
  /**
   * 建立用户与邀请人关系
   * user_id : 用户id
   * inviter_id ：邀请人id
   */
  async buildUserRef(user_id, inviter_id) {
    //查询邀请人的身份
    let role = await user_role_model.findOne({
      userId: inviter_id,
      type: 0,
      isDeleted: false
    });
    let cond = {
      pUserId: inviter_id,
      userId: user_id
    }
    if (role) { //邀请人是城市经理
      cond.rootUserId = inviter_id;
      return await user_ref_model.create(cond);
    } else { //邀请人是普通用户
      //查询邀请人的上级
      let ref = await user_ref_model.findOne({
        userId: inviter_id,
        isDeleted: false
      });
      if (ref && ref.rootUserId) { //有根级
        let user_role = await user_role_model.findOne({ //判断根级用户是否还是城市经理
          userId: ref.rootUserId,
          type: 0,
          isDeleted: false
        });
        if (user_role) {
          cond.rootUserId = ref.rootUserId;
        }
      }
      return await user_ref_model.create(cond);
    }
  },
  /**
   * 查询用户信息
   * user_id : 用户id
   */
  async getUserInfo(user_id) {
    let info = {};
    let user = await user_model.findOne({
      _id: user_id,
      isDeleted: false
    });
    info.nick_name = user.name;
    info.head_url = user.avatar;
    info.if_city_manager = false;
    let role = await user_role_model.findOne({
      userId: user_id,
      type: 0,
      isDeleted: false
    })
    if (role) {
      info.if_city_manager = true;
    }
    let userinfo = await user_info_model.findOne({
      userId: user_id,
      isDeleted: false
    })

    let scene_user_role = await mc_scene_user_role_model.findOne({
      userId: user_id,
      isDeleted: false
    })

    info.is_director = false;
    info.is_volunteers = false;
    info.p_is_referees = false;
    info.p_is_delivery_man = false;
    info.p_is_scene_supply = false;
    if (userinfo.userId) {
      const ref = await user_ref_model.findOne({
          userId: userinfo.userId,
          isDeleted: false
      })
      if (ref && ref.pUserId) {
        const volunteersUser = await user_model.findOne({
          _id: ref.pUserId, 
          isDeleted: false
        })
        const u = await user_info_model.findOne({
          userId: ref.pUserId,
          isDeleted: false
        })

        if (volunteersUser) {
          info.my_volunteer_name = volunteersUser.name;
          info.my_volunteer_avatar = volunteersUser.avatar;
          info.is_volunteers = true;
        }
        
        if (u) {
          if (u.consultingObj && u.consultingObj.name) {
            info.my_volunteer_name = u.consultingObj.name;
          }
        }
        
      }
    }
    if (userinfo.role == 'director') {
      info.is_director = true;
    }

    if (scene_user_role) {
      if (scene_user_role.role.indexOf('sceneRecommend') != -1) {
        info.p_is_referees = true;
      }
      if (scene_user_role.role.indexOf('sceneErrand') != -1) {
        info.p_is_delivery_man = true;
      }
      if (scene_user_role.role.indexOf('sceneSupply') != -1) {
        info.p_is_scene_supply = true;
      }
    }

    //这个也是判断是供应商的条件
    info.p_is_scene_supply = (await sceneSupplyModel.count({userId: user_id,status:200}))> 0
    
    return info;

  },
  /**
   * 爱心分享-查询用户线下一级user
   * user_id : 用户id
   */
  async getUserId(user_id) {
    let cond = {
      isDeleted: false,
      pUserId: user_id
    }
    let user = await user_ref_model.find(cond);
    let userId = [];
    user.forEach(element => {
      userId.push(element.userId);
    });
    return userId;
  },
  /**
   * 查询城市经理线下所有user
   * user_id : 用户id
   */
  async getUserIdsUnderManager(user_id) { //获取城市经理所有下线的userid
    let cond = {
      rootUserId: user_id,
      isDeleted: false
    }
    let user = await user_ref_model.find(cond);
    let userId = [];
    user.forEach(element => {
      userId.push(element.userId);
    });
    return userId;
  }
}