/**
 *
 * 用户相关service
 *
 * Created by yichen on 2018/7/2.
 */


'user strict';

const user_model = require("../../../app/models/Customer");
const user_center_service = Backend.service('user_center',"handle_user_center");
const old_customer_service = require('../../../app/services/CustomerService');
const old_zlycare_controller = require('../../../app/controllers/ZlycareController');
const co = require('co');

module.exports = {
  /**
   * 小程序登陆
   * @returns {*|Promise|RegExpExecArray}
   */
  login_auth: function (phone_num,auth_code) {
    return co(function* () {
      let user_center_new = false;
      const user_center = yield user_center_service.login_auth_code(phone_num,auth_code);
      if (!user_center ||  (user_center.errno && user_center.errno != 2003)) {
        throw getBusinessErrorByCode(1502);
      }
      if(user_center.errno == 2003){
        user_center_new = true;
      }
      let exist_user = yield user_model.findOne({isDeleted:false,phoneNum:phone_num});
      let phoneName = '';
      let resUser = {};
      if(!exist_user){
        phoneName = phone_num.substr(0,3) + '****' + phone_num.substr(7,4);
        let user = yield old_customer_service.validUser(phone_num, phoneName, '', 'applet', '', '', '', user_center.data);
        resUser = yield old_zlycare_controller.handleUserInfo(user,user_center.data);
      }
     
      if(user_center_new){
        let user_center_init = yield user_center_service.login_lazy_user_init(phone_num);
      }
      return resUser;
    })
  }
}