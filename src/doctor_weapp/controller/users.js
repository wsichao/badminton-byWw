
const member_service = Backend.service('doctor_weapp','member');
const docotr_role_model = Backend.model('doctor_weapp', undefined, 'doctor_role');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      keywords: valid.string().empty(''),
      page_size: valid.number(),
      page_num: valid.number(),
    });
  },
  async getAction() {
    const self = this;
    const query = this.req.query;
    const user_id = this.req.identity.userId;
    const result = await member_service.searchUsers(user_id,query);
    return self.success(result);
  }
}