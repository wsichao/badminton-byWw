const priceCtrlOrder = Backend.service("mc_weapp", "price_ctrl_order")
const orderModel = Backend.model("mc_weapp", undefined, "mc_scene_order");

module.exports = {
  async getAction() {
    const order_id = this.query.order_id;
    const order = await orderModel.findOne({
      orderId: order_id
    });
    await priceCtrlOrder.paySceneSuccess(order.orderId);
    return this.success({
      name: 1
    });
  }
}