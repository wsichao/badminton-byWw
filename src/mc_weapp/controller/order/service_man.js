const service = Backend.service('mc_weapp', 'order');

module.exports = {
  __rule: function (valid) {
    return valid.object({
        order_id: valid.string().required(),
        name: valid.string().required(),
        phone_num: valid.string().required(),
    });
  },
  async postAction() {
    const self = this;
    const post = this.post;
    let user_id = this.req.identity.userId;
    let result = await service.insert_mc_service_man(user_id,post);
    return self.success(result);
  }
}