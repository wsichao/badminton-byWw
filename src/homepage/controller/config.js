const home_page_config_service = Backend.service('homepage', 'home_page_config');

module.exports = {
  async getAction() {
    const data = await home_page_config_service.homeConfig();
    return this.success({
      code: '200',
      msg: '',
      data
    });
  }
}