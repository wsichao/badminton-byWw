const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');
const mcRecommendOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_recommend');
const mcSceneSuborderModel = Backend.model('mc_weapp', undefined, 'mc_scene_suborder');
const _ = require('underscore');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required()
    });
  },
  async products(user_id, type, page) {
    const re_res = await mcRecommendOrderModel.findOne({
      userId: user_id,
      isDeleted: false
    })
    const scene_id = re_res.sceneId;
    let orders;
    if (type == 0) {
        orders = await mcSceneOrderModel.find({
        sceneId: scene_id,
        isDeleted: false,
        type: 0,
        status: {
          $gte: 200
        }
      }).skip(page * 20)
        .limit(20)
        .sort({'_id':-1});
    }else {
        orders = await mcSceneSuborderModel.find({
        sceneId: scene_id,
        isDeleted: false,
        status: {
          $gte: 200
        }
      }).skip(page * 20)
        .limit(20)
        .sort({'_id':-1});
    }
    
    orders = orders.map(item => {
      let product_info = {
        scene_name: item.sceneName,
        detail: "",
        status: item.status,
        type: item.type,
        contact_name: item.contactName
      };
      if (item.products) {
        if (item.products.length == 1) {
          product_info.detail = `${item.products[0].name}1件商品`
        } else {
          product_info.detail = `${item.products[0].name}等${item.products.length}件商品`
        }
      }
      return {
        id: item._id,
        order_id: item.orderId,
        order_name: item.name,
        price: item.price,
        time: item.paidTime,
        type: "product",
        type_name: "商品订单",
        order_type: item.type,
        product_info
      };
    })
    return orders;
  },
  async getAction() {
    let user_id = this.query.user_id;
    let type = this.query.type || 0;
    let page = this.query.page || 0;
    const products_list = await this.products(user_id, type, page);
    return this.success({
      products_list
    });
  }
}