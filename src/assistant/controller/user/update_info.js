const user_service = Backend.service('assistant', 'user');
const co = require('co');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      nick_name: valid.string(),
      avatar: valid.string()
    });
  },
  getAction() {
    let that = this;
    const user = that.req.identity.user;
    const user_id = user._id;
    const nick_name = that.query.nick_name;
    const avatar = that.query.avatar;

    let updated = {};
    if (nick_name) updated.name = nick_name;
    if (avatar) updated.avatar = avatar;

    return co(function* () {
      let result =  user_service.updateUserInfoAll(user_id, updated);
      if (typeof result != 'string') {
        return that.success({
          code: '200',
          msg: ''
        });
      } else {
        return that.success({
          code: '200',
          msg: result
        });
      }
    });
  }
}