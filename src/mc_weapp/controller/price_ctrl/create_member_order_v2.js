const service = Backend.service('mc_weapp', 'price_ctrl_order');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      openid: valid.string().required(),
      type: valid.number().required()
    });
  },
  async postAction() {
    const self = this;
    const post = this.post;
    let user_id = this.req.identity.userId;
    let result = await service.createOrderV2(user_id, post.openid, self.req, post.type);
    let data = {};
    data.order_id = result.orderId;
    data.wx_order_id = result.wxOrderId;
    data.wx_time_stamp = result.wxTimeStamp;
    data.price = result.price;
    data.order_desc = result.name;

    return self.success({
      code: "200",
      msg: "",
      data
    });
  }
}