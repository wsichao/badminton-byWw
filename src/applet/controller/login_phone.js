/**
 *
 * 验证码登陆
 *
 * Created by yichen on 2018/7/3.
 */


'user strict';

const user_service = Backend.service('applet','user_service');
const user_center_service = Backend.service('user_center','handle_user_center');
const co = require('co');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      phone_num: valid.string().required(),
      auth_code:valid.string().required()
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
        return user_service.login_auth(post.phone_num,post.auth_code)
      })
      .then(function (data) {
        console.log(data);
        result.data = data;
        return self.success(result);
      },function (err) {
        console.log(err);
        return self.fail(8005)
      })

  }
}