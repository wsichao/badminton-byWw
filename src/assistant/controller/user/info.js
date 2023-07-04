const co = require('co');
const user_service = Backend.service('assistant', 'user');

module.exports = {
  getAction() {
    let that = this;
    const user = that.req.identity.user;
    console.log(user)
    const user_id = user._id;

    return co(function* () {
      let result = yield user_service.getUserAllInfo(user_id);
      const _id = result.user._id;
      const nick_name = result.user_info.name || '';
      const avatar = result.user_info.avatar || '';
      const phone_num = result.user_info.phoneNum || '';

      return that.success({
        code: '200',
        msg: '',
        data: {
          _id,
          nick_name,
          avatar,
          phone_num
        }
      });
    }).catch(function (e) {
      console.log(e);
      return that.success({
        code: '1000',
        msg: '系统错误，获取用户信息失败！'
      })
    });
  }
}