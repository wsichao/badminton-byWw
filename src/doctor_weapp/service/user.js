const user_center_service = Backend.service('user_center', 'handle_user_center');
const user_model = require('../../../app/models/Customer');
const sessionTokenService = Backend.service('common', 'session_token');
const docotr_role_model = Backend.model('doctor_weapp', undefined, 'doctor_role');
const common_util = require('../../../lib/common-util');
const service_package_doctor_model = require('./../../../app/models/service_package/servicePackageDoctor')
const mc_doctor_model = Backend.model('mc_weapp', undefined, 'mc_doctor');
module.exports = {
  /**
   * 获取医生的角色信息
   * user_id : 用户id
   * return {
   *    role : [],  //'mc' - 2030医生 'sp' - 服务包医生
   *    data : {}   // docotr_role_model
   * }
   */
  async getRole(user_id) {
    const role = await docotr_role_model.findOne({
      userId: user_id,
      isDeleted: false,
    });
    let result = [];
    if (role && role.mcDoctorId) {
      result.push('mc');
    }
    if (role && role.servicePackageDoctorId) {
      result.push('sp');
    }
    return {
      role: result,
      data: role
    };
  },
  /**
   * 登陆 
   * phone_num 手机
   * password 密码
   * return {}
   */
  async login(phone_num, password) {
    let user = await user_model.findOne({
      phoneNum: phone_num,
      isDeleted: false
    }, 'name phoneNum avatar _id');
    if (!user) {
      throw {
        code: 1000,
        msg: '用户未注册'
      }
    }
    let role = await this.getRole(user._id);
    if (!role || !role.role.length) {
      throw {
        code: 1000,
        msg: '用户不是医生'
      }
    }

    let user_center = await user_center_service.login_password(phone_num, common_util.genJuliyeMD5(common_util.genCommonMD5(password)));
    if (!user_center || user_center.errno || !user_center.data || !user_center.data.id) {
      throw {
        code: 1000,
        msg: '账号或密码错误，请重新输入'
      }
    }
    // 根据用户信息获取医生信息
    let doctor_id = '';
    let type = 0;
    if (role.data.servicePackageDoctorId) {
      type = 0;
      doctor_id = role.data.servicePackageDoctorId;
    } else if (role.data.mcDoctorId) {
      type = 1;
      doctor_id = role.data.mcDoctorId;
    }
    const doctor_info = await this.getDoctorInfo(doctor_id, type);
    user.name = doctor_info.name;
    user.avatar = doctor_info.avatar;
    let resUser = JSON.parse(JSON.stringify(user));
    resUser.sessionToken = await sessionTokenService.createToken(user._id, 'doctorWeChat');
    resUser.role = role.role;
    return resUser;
  },
  /**
   * 获取医生信息
   * @param {*} doctor_id 
   * @param {*} type 0:专属医生;1:2030健康
   * @return {name, avatar}
   */
  async getDoctorInfo(doctor_id, type = 0) {
    let result = {};
    if (type == 0) {
      result = await service_package_doctor_model.findOne({
        isDeleted: false,
        _id: doctor_id
      }, 'name avatar');
    } else if (type == 1) {
      result = await mc_doctor_model.findOne({
        isDeleted: false,
        _id: doctor_id
      }, 'name avatar');
    }
    return {
      name: result.name,
      avatar: result.avatar
    }
  },
  /**
   * 查询用户信息
   * user_id : 用户id
   */
  async getUserInfo(user_id) {
    let user = await user_model.findOne({
      _id: user_id,
      isDeleted: false
    });
    return user;
  },
  async logout(user_id) {
    await sessionTokenService.createToken(user_id, 'doctorWeChat');
  },
  async reset_password(phone_num, old_pwd, new_pwd) {
    let result = await user_center_service.reset_password(phone_num, '',
      common_util.genJuliyeMD5(common_util.genCommonMD5(old_pwd)),
      common_util.genJuliyeMD5(common_util.genCommonMD5(new_pwd)));
    if (result && !result.errno) {
      return result
    } else {
      throw {
        code: '1000',
        msg: result.errmsg
      }
    }
  },
  /**
   * 创建 医生用户角色表 
   * @param {*} userId 用户id
   * @param {*} mcDoctorId 2030 医生id
   * @param {*} servicePackageDoctorId 服务包医生id
   */
  async create_role(userId, mcDoctorId, servicePackageDoctorId) {
    let new_role = {
      userId
    }
    let role = await docotr_role_model.findOne(new_role);
    if (mcDoctorId) {
      new_role.mcDoctorId = mcDoctorId;
    }
    if (servicePackageDoctorId) {
      new_role.servicePackageDoctorId = servicePackageDoctorId;
    }
    if (role) {
      return await docotr_role_model.findOneAndUpdate({
        _id: role._id
      }, {
        $set: new_role
      }, {
        new: true
      });
    } else {
      return await docotr_role_model.create(new_role);
    }

  }
}