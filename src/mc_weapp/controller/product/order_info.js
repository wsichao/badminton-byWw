const mcSceneSubOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_suborder');
const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');
const mcSceneErrandModel = Backend.model('mc_weapp', undefined, 'mc_scene_errand');
const userMode = Backend.model('common', undefined, 'customer');
const mcSceneSupplyModel = Backend.model('mc_weapp', undefined, 'mc_scene_supply');
const _ = require("underscore");

module.exports = {
  __rule: function (valid) {
    return valid.object({
      id: valid.string().required(),
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
      order.type = rootOrder.type;
      order.paidTime = rootOrder.paidTime;
      order.deliveryType = rootOrder.deliveryType;
      // order.discountPrice = this.getDiscountPrice(order.products);
      order.discountPrice = rootOrder.discountPrice || this.getDiscountPrice(order.products);
      if (order.supplyId) {
        const supply = await mcSceneSupplyModel.findOne({_id:order.supplyId},"name phone provinceName cityName countyName address")
        order.supply = supply
      }
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
    const scene_errand_id = order.sceneErrandId;
    let errand = await mcSceneErrandModel.findOne({
      _id: scene_errand_id,
      isDeleted: false
    });
    if (!errand) errand = {};
    errand = {
      name: errand.name,
      phone: errand.phone
    };

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
      errand,
      discount_price: order.discountPrice,
      type: order.type,
      delivery_type: order.deliveryType,
      order_id: order.orderId,
      end_time: order.endTime,
      supply: order.supply,
      qrcode: order.qrcode,
      express_name: order.expressName,
      express_no: order.expressNo,
      express_type: order.expressType
    }
  },
  async getAction() {
    const id = this.query.id;
    const order = await this.getOrder(id);
    return this.success({
      code: "200",
      msg: "",
      data: order
    });
  }
}