const service = Backend.service('mc_weapp', 'order');
module.exports = {
  async getAction() {
    const self = this;
    const userId = this.req.identity.userId;
    let result = await service.get_mc_manager_extend(userId);
    return self.success(result);
  }
}