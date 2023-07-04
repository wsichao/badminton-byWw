const service = Backend.service('mc_weapp', 'order');

module.exports = {
  async postAction() {
    const self = this;
    const post = this.post;
    let user_id = this.req.identity.userId;
    let result = await service.create_order(user_id,post.openid,self.req);
    return self.success(result);
  }
}