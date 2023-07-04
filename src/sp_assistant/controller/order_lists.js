const service = Backend.service('sp_assistant', 'sale');

module.exports = {
  __rule: function (valid) {
    return valid.object({
        type: valid.number().required()
    });
  },
  async getAction() {
    let that = this;
    let type = that.query.type;
    let assistant_id = this.req.identity.user._id;
    let result = await service.get_order_list(assistant_id,type);
    return that.success(result);
  }
}