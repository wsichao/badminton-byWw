const service = Backend.service('mc_weapp', 'order');

module.exports = {
  __rule: function (valid) {
    return valid.object({
        openid: valid.string(),
        _id: valid.string().required()
    });
  },
  async postAction() {
    const self = this;
    const post = this.post;
    let user_id = this.req.identity.userId;
    let result = await service.create_pre_order(user_id,post,self.req);
    return self.success(result);
  }
}