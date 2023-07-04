const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');
const mcSceneSuborderModel = Backend.model('mc_weapp', undefined, 'mc_scene_suborder');
const _ = require('underscore');

module.exports = {
  async productsSubOrder(user_id,page) {
    let orders = await mcSceneSuborderModel.find({
      userId: user_id,
      isDeleted: false,
      status: {
        $gte: 200
      }
    }).skip(page * 20)
      .limit(20)
      .sort({'_id':-1});
    orders = orders.map(item => {
      let product_info = {
        scene_name: item.sceneName,
        detail: "",
        status: item.status,
        type: 1
      };
      if (item.products) {
        if (item.products.length == 1) {
          product_info.detail = `${item.products[0].name}1件商品`
        } else if (item.products.length == 0) {
          product_info.detail = `0件商品`
        } else {
          product_info.detail = `${item.products[0].name}等${item.products.length}件商品`
        }
      }

      if (item.type == 1) {
        item.deliveryType = undefined
      }

      return {
        id: item._id,
        order_id: item.orderId,
        order_name: item.name,
        price: item.price,
        time: item.createdAt,
        type: "product",
        type_name: "商品订单",
        product_info,
        delivery_type: item.deliveryType
      };
    })
    return orders;
  },
  async products(user_id,page) {
    let orders = await mcSceneOrderModel.find({
      userId: user_id,
      isDeleted: false,
      type: 0,
      status: {
        $gte: 200
      }
    }).skip(page * 20)
      .limit(20)
      .sort({'_id':-1});
    orders = orders.map(item => {
      let product_info = {
        scene_name: item.sceneName,
        detail: "",
        status: item.status,
        type: item.type
      };
      if (item.products) {
        if (item.products.length == 1) {
          product_info.detail = `${item.products[0].name}1件商品`
        } else if (item.products.length == 0) {
          product_info.detail = `0件商品`
        } else {
          product_info.detail = `${item.products[0].name}等${item.products.length}件商品`
        }
      }

      if (item.type == 1) {
        item.deliveryType = undefined
      }

      return {
        id: item._id,
        order_id: item.orderId,
        order_name: item.name,
        price: item.price,
        time: item.paidTime,
        type: "product",
        type_name: "商品订单",
        product_info,
        delivery_type: item.deliveryType
      };
    })
    return orders;
  },
  async getAction() {
    try{
      let user_id = this.req.identity.userId;
      let type = this.query.type || 0;
      let page = this.query.page || 0;

      let list = [];
      if (type == 1) {
        const product_sub_list = await this.productsSubOrder(user_id,page);
        list = list.concat(product_sub_list);
      }else {
        const products_list = await this.products(user_id,page);
        list = list.concat(products_list);
      }
      return this.success({
        list
      });
    }catch(e){
      console.log(e)
    }
    
  }
}