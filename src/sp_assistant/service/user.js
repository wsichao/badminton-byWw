/**
 * 2030 助理用户service
 */
const customer_model = require('../../../app/models/Customer');
const user_center_service = Backend.service('user_center', 'handle_user_center')
const common_util = require('../../../lib/common-util');
const user_role_model = Backend.model('mc_weapp',undefined,'mc_user_role');

module.exports = {
    /**
     * 密码登录
     * @param {string} phone_num 手机号 //13298765432
     * @param {string} pwd 密码
     * @return {Promise<{ userName ,  }>}
     */
    async pwdLogin(phone_num, pwd) {
      pwd = common_util.genJuliyeMD5(pwd);
      console.log(pwd);
      let user = await customer_model.findOne({isDeleted:false,phoneNum : phone_num});
      if(!user){
        return '用户未注册';
      }
      let user_role = await user_role_model.findOne({isDeleted:false,userId : user._id,type:{$in : [3,4]}});
      if(!user_role){
        return '不是助理用户';
      }
      let user_center = await user_center_service.login_password(phone_num,pwd)
      if(!user_center|| user_center.errno || !user_center.data || !user_center.data.id){
        return '用户名或密码有误，请重新登陆';
      }else{
        user = await customer_model.findOne({isDeleted:false,openId : user_center.data.id})
      }
      return user;
    },
    /**
     * 根据助理用户唯一标识，获取助理详细信息
     * @param {string} user_id 
     */
    async getUserInfo(user_id) {
      return await customer_model.findOne({ _id: user_id,isDeleted:false }, '');
    },
    /**
     * 修改用户信息
     * @param {string} user_id 用户唯一标识
     * @param {object} updated {field}
     */
    async updateUserInfoAll(user_id, updated) {
      let user = await customer_model.findOne({ _id: user_id, isDeleted: false }, '_id');
        if (user) {
          let cond = {
            _id: user._id,
            isDeleted: false
          }
          return await customer_model
            .findOneAndUpdate(cond, {$set : updated}, { new: true });
        } else {
          return '用户不存在';
        }
    },
  
    /**
     * 修改密码
     * @param {string} user_id 用户唯一标识
     * @param {string} phone_num 手机号
     * @param {string} new_pwd 新密码
     * @param {string} code 验证码
     */
    async updatePwd(phone_num, new_pwd, code) {
      let that = this;
      new_pwd = common_util.genJuliyeMD5(new_pwd);
      // 检查验证码是否正确
      let auth_code = await user_center_service.reset_password(phone_num, code,undefined,new_pwd);
      if (auth_code.errno == 0) {
        return {}
      } else {
        return '短信验证码不正确或者过期';
      }
    }
  }