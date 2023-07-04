const user_service = Backend.service('assistant', 'user');
const co = require('co');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      new_pwd: valid.string().required(),
      code: valid.string().required()
    });
  },
  postAction() {
    let that = this;
    const new_pwd = that.post.new_pwd;
    const code = that.post.code;
    const user = that.req.identity.user;
    const user_id = user._id;
    const phone_num = user.userName;

    return co(function* () {
      let result = yield user_service.updatePwd(user_id, phone_num, new_pwd, code);
      if (typeof result == 'string') {
        return that.success({
          code: '1000',
          msg: result
        })
      }
      return that.success({
        code: 200,
        msg: ''
      });
    }).catch(function (e) {
      console.log(e);
      return that.success({
        code: '1000',
        msg: '系统错误，修改密码失败'
      })
    });
  }
}