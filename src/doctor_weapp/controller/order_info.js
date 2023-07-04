
const member_service = Backend.service('doctor_weapp','member');
const docotr_role_model = Backend.model('doctor_weapp', undefined, 'doctor_role');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required()
    });
  },
  async getAction() {
    const self = this;
    const query = this.req.query;
    const d_user_id = this.req.identity.userId;
    const user_id = query.user_id;
    const result = await member_service.getOrderInfo(d_user_id,user_id);
    return self.success(result);
  }
}
