const service = Backend.service('mc_weapp', 'service');

module.exports = {
  __rule: function (valid) {
    return valid.object({
        service_id: valid.string().required()
    });
  },
  async getAction() {
    let that = this;
    let service_id = that.query.service_id;
    let result = await service.get_service_detail(service_id);
    return this.success(result);
  }
}