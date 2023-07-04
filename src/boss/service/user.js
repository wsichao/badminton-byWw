const user_model = Backend.model('common', undefined, 'customer');
const user_center_service = Backend.service('user_center', 'handle_user_center');
const commonUtil = require('./../../../lib/common-util');
const old_customer_service = require('./../../../app/services/CustomerService');

module.exports = {
  async updatePwd(phone_num) {
    // 检查用户是否已经设置密码
    pwd = phone_num.substring(3);
    let auth_code_result = await user_center_service.auth_code(phone_num);
    let auth_code = auth_code_result.data.code;
    const user = await user_center_service.login_auth_code(phone_num, auth_code);
    const has_pwd = user.data.hasPwd;
    // 已经设置过密码，不再继续处理密码
    if (has_pwd) return;
    pwd = commonUtil.genCommonMD5(pwd);
    pwd = commonUtil.genJuliyeMD5(pwd);
    // 修改密码
    auth_code_result = await user_center_service.auth_code(phone_num);
    auth_code = auth_code_result.data.code;
    await user_center_service.reset_password(phone_num, auth_code, undefined, pwd);
  },

  /**
   * 检查用户信息
   * 检查用户是否存在
   * 检查用户是否已经设置密码
   * 已设置密码返回true，其他返回相关提示信息
   * @param {string} phone_num 手机号
   * @return boolean || error msg
   */
  async checkUser(user_id) {
    // 1.检查用户是否存在
    const count = await user_model.count({
      _id: user_id,
      isDeleted: false
    });
    console.log(count)
    if (count == 0) return '用户不存在';
    return true;
  },
  /**
   * 根据用户唯一标识获取用户手机号
   * @param {*} user_id 
   * @return 手机号
   */
  async getPhoneNum(user_id) {
    const user = await user_model.findOne({
      _id: user_id,
      isDeleted: false
    }, 'phoneNum')
    return user.phoneNum;
  },
  /**
   * 新增用户
   * @param {*} phone_num 
   * @return user_id
   */
  async new_user(phone_num){
    let user = await user_model.findOne({
      phoneNum:phone_num,
      isDeleted: false
    }, '_id');
    if(user){
      await user_center_service.login_lazy_user_init(phone_num);
    }else{
      user = await old_customer_service.validUser(phone_num, '', '', 'boss_doctor');
      await user_center_service.login_lazy_user_init(phone_num);
    }
    return user._id;
  }
}