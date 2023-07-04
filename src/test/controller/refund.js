const service = Backend.service("mc_weapp", "refund");
module.exports = {
  async getAction() {
    const orderid = this.query.orderid;
    const price = this.query.price;
    const wxorderid = this.query.wxorderid;
    await service.wxAPI(orderid, price, wxorderid);
    return this.success({
      name: 1
    });
  }
}