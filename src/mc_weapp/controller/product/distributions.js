const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');
const mcSceneSuborderModel = Backend.model('mc_weapp', undefined, 'mc_scene_suborder');
const mcSceneErrandModel = Backend.model('mc_weapp', undefined, 'mc_scene_errand');
const mcSceneSupplyModel = Backend.model('mc_weapp', undefined, 'mc_scene_supply');

const userMode = Backend.model('common', undefined, 'customer');
const _ = require("underscore");

module.exports = {
  __rule: function (valid) {
    return valid.object({
      type: valid.number().default(0).empty(0)
    });
  },
  async getId(user_id) {
    const res = await mcSceneErrandModel.findOne({
      userId: user_id,
      isDeleted: false
    })

    if (!res) return;
    return res._id;
  },
  async getSupplyId(user_id) {
    const res = await mcSceneSupplyModel.findOne({
      userId: user_id,
      isDeleted: false
    })

    if (!res) return;
    return res._id;
  },
  async getUserMap(orders) {
    const user_ids = orders.map(item => {
      return item.userId;
    })

    const users = await userMode.find({
      _id: {
        $in: user_ids
      },
      isDeleted: false
    }, "avatar");
    return _.indexBy(users, "_id");
  },
  async getList(id, page) {
    const type = this.query.type;
    let list = [];
    if (type == 0) {
      list = await mcSceneOrderModel.find({
        sceneErrandId: id,
        type,
        status: {
          $gte: 200
        },
        isDeleted: false
      }).skip(page * 20)
        .limit(20)
        .sort({paidTime:-1});
    } else if (type == 1) {
      const user_id = this.req.identity.userId;
      const supplyId = await this.getSupplyId(user_id);
      let cond = [];
      if (id) cond.push({
        sceneErrandId: id
      });
      if (supplyId) cond.push({
        supplyId: supplyId
      });
      list = await mcSceneSuborderModel.find({
        $or: cond,
        status: {
          $gte: 200
        },
        isDeleted: false
      }).skip(page * 20)
        .limit(20)
        .sort({"_id":-1});;
    }

    const u_m = await this.getUserMap(list) || {};

    list = list.map(item => {
      //这个地方改价格
      const products = item.products;
      let product_name = "";
      if (products.length == 1) {
        const p = products[0];
        product_name = `${p.name} 1 件商品`;
      } else if (products.length > 1) {
        const p = products[0];
        product_name = `${p.name}等 ${products.length} 件商品`;
      }
      const u = u_m[item.userId] || {};
      const avatar = u.avatar || "";

      return {
        id: item._id,
        name: item.contactName,
        avatar,
        phone: item.contactPhone,
        address: item.contactAddress,
        note: item.note,
        price: type == 0 ? item.price : item.supplyPrice,
        time: item.paidTime || item.createdAt,
        product_name,
        merchants: item.sceneName,
        status: item.status,
        delivery_type: item.deliveryType
      }
    })

    return list;
  },
  async getAction() {
    const user_id = this.req.identity.userId;
    const page = this.query.page;
    let list = []
    const id = await this.getId(user_id);
    
    if (id) {
      list = await this.getList(id,page);
    }

    return this.success({
      code: "200",
      msg: "",
      data: {
        list
      }

    });
  }
}