const service = Backend.service('tp_memberships', 'interests');
const user_service = Backend.service('common', 'user_service');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      type: valid.string().default('all_third'),
    });
  },
  async getAction() {
    const type = this.query.type;
    let user_id = undefined;
    let user_name = "";
    let user_img = "";

    if (this.req.identity.userId) {
      const user = await user_service.getInfoByUserId(this.req.identity.userId, "name avatar");
      user_id = user._id;
      user_name = user.name;
      user_img = user.avatar;
    }

    const list = await service.list(type, user_id, user_name, user_img);
    return this.success({
      code: '200',
      msg: '',
      data: {
        list
      }
    });
  }
}