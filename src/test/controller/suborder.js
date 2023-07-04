const suborderService = Backend.service('mc_weapp', 'suborder');

module.exports = {
  async getAction() {
    const orderid = this.query.orderid;
    await suborderService.createSubOrder(orderid);
    return this.success({});
  }
}