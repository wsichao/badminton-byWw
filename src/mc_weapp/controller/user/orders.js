const service = Backend.service('mc_weapp', 'order');

module.exports = {
  __rule: function (valid) {
    return valid.object({
    });
  },
  async getAction() {
    const self = this;
    const userId = this.req.identity.userId;
    let result = await service.get_mc_order_list(userId);
    return self.success(result);
  }
}