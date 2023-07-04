const service = Backend.service('sp_assistant', 'service');

module.exports = {
  async getAction() {
    let that = this;
    let assistant_id = this.req.identity.user._id;
    let result = await service.get_doctor_lists(assistant_id);
    return that.success(result);
  }
}