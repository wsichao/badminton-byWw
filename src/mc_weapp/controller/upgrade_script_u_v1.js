const service = Backend.service("mc_weapp", "upgrade_script/all_user");
module.exports = {
  async getAction() {
    await service.initUsers();
    return this.success({
      success: true
    });
  }
}