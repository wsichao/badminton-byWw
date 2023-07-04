const service = Backend.service('mc_weapp', 'service');

module.exports = {
  async getAction() {
    let that = this;
    let result = await service.get_home_page_service_list();
    return this.success(result);
  }
}