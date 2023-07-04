const service = Backend.service('sp_assistant', 'service');

module.exports = {
  __rule: function (valid) {
    return valid.object({
        doctor_id: valid.string().required()
    });
  },
  async getAction() {
    let that = this;
    let doctor_id = that.query.doctor_id;
    let result = await service.get_user_lists(doctor_id);
    return that.success(result);
  }
}