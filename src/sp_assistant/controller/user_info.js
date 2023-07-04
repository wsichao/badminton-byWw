const user_service = Backend.service('sp_assistant', 'user');

module.exports = {
  async getAction() {
    let that = this;
    const user = that.req.identity.user;
    const user_id = user._id;
    let result = await user_service.getUserInfo(user_id);
    const _id = result._id;
    const nick_name = result.name || '';
    const avatar = result.avatar || '';
    const phone_num = result.phoneNum || '';

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
  }
}