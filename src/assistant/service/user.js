/**
 * 助理用户service
 */
const sys_user_model = Backend.model('assistant', undefined, 'sys_user');
const service_package_assistant_model = Backend.model('assistant', undefined, 'service_package_assistant');
const customerService = require('../../../app/services/CustomerService');
const handle_user_center = Backend.service('user_center', 'handle_user_center')
const PASSWORD_SALT = "kengkengwawa";
const co = require('co');

const crypto = require('crypto');


let cryptoStr = function (str) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex').toUpperCase();
};


module.exports = {
  /**
   * 密码登录
   * @param {string} phone_num 手机号 //13298765432
   * @param {string} pwd 密码
   * @return {Promise<{ userName ,  }>}
   */
  pwdLogin(phone_num, pwd) {
    const that = this;
    pwd = that.pwdEncryption(pwd);
    let cond = {
      userName: phone_num,
      password: pwd,
      isDeleted: false,
      role: 'assistant'
    };

    return co(function* () {
      let isUser = yield sys_user_model.findOne({ userName: phone_num, role: 'assistant' }, '_id userName assistantId').count();
      if (isUser != 1) return '该用户不存在';
      let result = yield sys_user_model.findOne(cond, '_id userName assistantId');
      if (result) {
        const jkLastestLoginTime = Date.now();
        const user = yield sys_user_model.findOneAndUpdate(cond,
          {
            jkLastestLoginTime: jkLastestLoginTime,
            pwdErrorLoginTime: null,
            pwdErrorLoginCount: 0
          }, { new: true });
        const user_info = yield that.getUserInfo(result.assistantId);
        return {
          user,
          user_info
        }
      } else {
        let errorPwdUser = yield sys_user_model.findOne({ userName: phone_num, role: 'assistant' });
        if (!errorPwdUser.pwdErrorLoginTime) {
          errorPwdUser = yield sys_user_model.findOneAndUpdate({
            userName: phone_num, role: 'assistant'
          },
            { pwdErrorLoginTime: Date.now(), pwdErrorLoginCount: 1 },
            { new: true });
        } else if (Date.now() - errorPwdUser.pwdErrorLoginTime < 10 * 60 * 1000) {
          errorPwdUser = yield sys_user_model.findOneAndUpdate({
            userName: phone_num,
            role: 'assistant'
          },
            { $inc: { pwdErrorLoginCount: 1 } },
            { new: true });
          if (errorPwdUser.pwdErrorLoginCount > 3) {
            return '请10分钟后尝试';
          }
        } else {
          errorPwdUser = yield sys_user_model.findOneAndUpdate({
            userName: phone_num,
            role: 'assistant'
          },
            { pwdErrorLoginTime: Date.now(), pwdErrorLoginCount: 1 },
            { new: true });
        }
      }
      return '手机号与密码不匹配，请重新输入！'
    })
  },
  /**
   * 验证码登录
   * @param {*} phone_num 手机号
   * @param {*} code 验证码
   * @return {Promise<{UserInfo}>}
   */
  codeLogin(phone_num, code) {
    let that = this;
    let cond = {
      userName: phone_num
    }
    return co(function* () {
      let result = yield sys_user_model.findOne(cond, '_id userName assistantId');
      if (result) {
        let auth_code = yield handle_user_center.login_auth_code(phone_num, code);
        if (auth_code.errno == 2003 || auth_code.errno == 0) {
          const jkLastestLoginTime = Date.now();
          const user = yield sys_user_model.findOneAndUpdate({ _id: result._id }, { jkLastestLoginTime: jkLastestLoginTime }, { new: true });
          const user_info = yield that.getUserInfo(result.assistantId);
          return {
            user,
            user_info
          }
        } else {
          return '短信验证码不正确或者过期';
        }
      }
      return '该用户不存在';
    })
  },
  /**
   * 获取token
   * @param {string} user_id 
   * @param {number} last_time 
   */
  getToken(user_id, last_time) {
    return customerService.token({
      _id: user_id,
      jkLastestLoginTime: last_time
    })
  },
  /**
   * 根据助理用户唯一标识，获取助理详细信息
   * @param {string} user_id 
   */
  getUserInfo(user_id) {
    return service_package_assistant_model.findOne({ _id: user_id }, '');
  },
  /**
   * 明文密码加密（由APPMD5加密后转换为大写）
   * @param {string} pwd 密码 
   */
  pwdEncryption(pwd) {
    // let first_pwd = cryptoStr(pwd).toLocaleUpperCase();
    pwd = pwd + pwd.substring(8, 16) + PASSWORD_SALT;
    return cryptoStr(pwd);
  },
  /**
   * 获取用户全部信息
   * @param {string} user_id 用户唯一标识
   */
  getUserAllInfo(user_id) {
    let that = this;
    return co(function* () {
      const user = yield sys_user_model.findOne({ _id: user_id });
      const user_info = yield that.getUserInfo(user.assistantId);
      return {
        user,
        user_info
      }
    })
  },
  /**
   * 修改用户信息
   * @param {string} user_id 用户唯一标识
   * @param {object} updated {field}
   */
  updateUserInfoAll(user_id, updated) {
    return co(function* () {
      let user = yield sys_user_model.findOne({ _id: user_id, isDeleted: false }, '_id userName assistantId');
      if (user) {
        let cond = {
          _id: user.assistantId,
          isDeleted: false
        }
        return yield service_package_assistant_model
          .findOneAndUpdate(cond, updated, { new: true });
      } else {
        return '用户不存在';
      }
    })
  },
  /**
   * 获取用户登录信息
   * @param {string} user_id 用户唯一标识
   */
  getUser(user_id) {
    const cond = {
      _id: user_id,
      isDeleted: false,
    }
    return sys_user_model.findOne(cond, '_id jkLastestLoginTime userName');
  },
  /**
   *  通过用户ID获取用户信息
   * @param user_id
   * @param fields
   * @returns {Query|Promise|void|*}
   */
  getUserByUserId(user_id, fields) {
    const cond = {
      _id: user_id,
      isDeleted: false,
    }
    return sys_user_model.findOne(cond, fields || '');
  },

  /**
   * 修改密码
   * @param {string} user_id 用户唯一标识
   * @param {string} phone_num 手机号
   * @param {string} new_pwd 新密码
   * @param {string} code 验证码
   */
  updatePwd(user_id, phone_num, new_pwd, code) {
    let that = this;
    new_pwd = that.pwdEncryption(new_pwd);
    return co(function* () {
      // 验证原密码是否正确
      if (true) {
        // 检查验证码是否正确
        let auth_code = yield handle_user_center.login_auth_code(phone_num, code);
        if (auth_code.errno == 2003 || auth_code.errno == 0) {
          // 修改密码
          const jkLastestLoginTime = Date.now();
          return yield sys_user_model.findOneAndUpdate({ _id: user_id }, { password: new_pwd, jkLastestLoginTime: jkLastestLoginTime }, { new: true });
        } else {
          return '短信验证码不正确或者过期';
        }
      }

    });
  }
}