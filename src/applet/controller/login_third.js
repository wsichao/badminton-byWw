/**
 *
 * 小程序第三方登陆
 *
 * Created by yichen on 2018/7/2.
 */


'user strict';

const user_service = Backend.service('applet','user_service');
const user_center_service  = Backend.service('user_center','handle_user_center');

const co = require('co');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      phone_num: valid.string().required()
    });
  },
  postAction: function () {
    const self = this;
    const post = this.post;
    if(!global.isValidPhone(post.phone_num)){
      return self.fail(8005)
    }
    let result = {
      code : '200',
      msg: '',
      data:{}
    }
    return user_center_service.login_lazy_user_init(post.phone_num)
      .then(function(){
        return user_center_service.auth_code(post.phone_num)
      })
      .then(function(user_center_auth){
        let auth_code = '';
        if(!user_center_auth || user_center_auth.errno || !user_center_auth.data || !user_center_auth.data.code){
          throw getBusinessErrorByCode(8007);
        }else{
          auth_code = user_center_auth.data.code
        }
        return user_service.login_auth(post.phone_num,auth_code)
      })
      .then(function (data) {
        result.data = data;
        return self.success(result);
      },function (err) {
        console.log(err);
        return self.fail(8005)
      })

  }
}