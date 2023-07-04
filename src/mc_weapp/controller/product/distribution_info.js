const userMode = Backend.model('common', undefined, 'customer');
const mcSceneSubOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_suborder');
const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');
const _ = require("underscore");

module.exports = {
  __rule: function (valid) {
    return valid.object({
      distribution_id: valid.string().required(),
      type: valid.number().default(0).empty(0)
    });
  },
  async findOrder(id) {
    let order = {};
    const type = this.query.type;
    if (type == 0) {
      order = await mcSceneOrderModel.findOne({
        _id: id,
        isDeleted: false
      });
    } else if (type == 1) {
      order = await mcSceneSubOrderModel.findOne({
        _id: id,
        isDeleted: false
      });
      const rootOrder = await mcSceneOrderModel.findOne({
        _id: order.sceneOrderId,
        isDeleted: false
      });
      order.deliveryType = rootOrder.deliveryType;
      order.paidTime = rootOrder.paidTime;
    }
    return order;
  },
  // 获取折扣价格
  getDiscountPrice(products) {
    const prices = products.map(item => {
      return item.isDiscount ? (item.discountPrice || 0) * item.number : 0
    })
    return _.reduce(prices, function (memo, num) {
      return memo + num;
    }, 0);
  },
  async getOrder(id) {
    let order = await this.findOrder(id);
    if (!order) return {};
    let u = await userMode.findOne({
      _id: order.userId,
      isDeleted: false
    }, "avatar");
    if (!u) u = {};
    return {
      id: order._id,
      avatar: u.avatar || "",
      name: order.contactName,
      phone: order.contactPhone,
      address: order.contactAddress,
      products: order.products,
      note: order.note,
      time: order.paidTime,
      price: order.price,
      merchants: order.sceneName,
      status: order.status,
      delivery_type: order.deliveryType,
      end_time: order.endTime,
      order_id: order.orderId,
      supply_price: order.supplyPrice,
      express_name: order.expressName,
      express_no: order.expressNo,
      express_type: order.expressType
    }
  },
  async getAction() {
    const distribution_id = this.query.distribution_id;
    const order = await this.getOrder(distribution_id);
    return this.success({
      code: "200",
      msg: "",
      data: order
    });
  }
}