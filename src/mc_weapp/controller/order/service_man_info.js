const service = Backend.service('mc_weapp', 'order');

module.exports = {
  __rule: function (valid) {
    return valid.object({
        order_id: valid.string().required(),
    });
  },
  async getAction() {
    const self = this;
    const query = this.query;
    let result = await service.get_mc_service_man(query.order_id);
    return self.success(result);
  }
}