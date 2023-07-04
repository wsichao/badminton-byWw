const service = Backend.service('mc_weapp', 'price_ctrl_order');

module.export = {
  /**
   * 订单支付成功
   * 1、修改订单状态为200
   * @param {*} order 
   */
  async payOrder(order) {
    const order_id = order.orderId;
    return await service.paySuccess(order_id);
  }
}