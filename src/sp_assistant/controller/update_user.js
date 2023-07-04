const user_service = Backend.service('sp_assistant', 'user');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      avatar: valid.string()
    });
  },
  async postAction() {
      console.log('123');
    let that = this;
    const user = that.req.identity.user;
    const user_id = user._id;
    const avatar = that.post.avatar;

    let updated = {};
    if (avatar) updated.avatar = avatar;
    let result = await user_service.updateUserInfoAll(user_id, updated);
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
  }
}