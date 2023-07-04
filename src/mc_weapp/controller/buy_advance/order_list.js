const service = Backend.service('mc_weapp', 'pre_order');

module.exports = {
  async getAction() {
    let user_id = this.req.identity.userId;
    let result = await service.get_order_list(user_id);
    return this.success({
      code : '200',
      msg:'',
      items : result
    });
  }
}