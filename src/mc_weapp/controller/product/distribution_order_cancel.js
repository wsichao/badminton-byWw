const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');
const refundService = Backend.service('mc_weapp', 'refund');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      id: valid.string().required()
    });
  },
  async update(id) {
    await mcSceneOrderModel.update({
      _id: id,
      isDeleted: false
    }, {
      status: 300
    })
  },
  async getAction() {
    const id = this.query.id;
    // 退款
    await refundService.product(id);
    await this.update(id);
    return this.success({
      code: "200",
      msg: ""
    });
  }
}