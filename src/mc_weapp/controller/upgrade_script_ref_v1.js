const service = Backend.service("mc_weapp", "upgrade_script/user_ref");
module.exports = {
  async getAction() {
    await service.initUsers();
    return this.success({
      success: true
    });
  }
}