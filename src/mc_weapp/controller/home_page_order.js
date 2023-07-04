const service = Backend.service('mc_weapp', 'order');

module.exports = {
  async getAction() {
    let that = this;
    let user_id = this.req.identity.userId;
    let result = await service.get_home_page_order_list(user_id);
    return this.success(result);
  }
}