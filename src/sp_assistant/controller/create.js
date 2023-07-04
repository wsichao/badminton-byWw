const service = Backend.service('sp_assistant', 'sale');

module.exports = {
  __rule: function (valid) {
    return valid.object({
        user_id: valid.string().required(),
        doctor_id: valid.string().required(),
        price: valid.number().required()
    });
  },
  async postAction() {
    const self = this;
    const post = this.post;
    let assistant_id = this.req.identity.user._id;
    let result = await service.create_pre_order(assistant_id,post);
    return self.success(result);
  }
}