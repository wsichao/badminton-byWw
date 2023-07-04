const mcSceneRecommendModel = Backend.model('mc_weapp', undefined, 'mc_scene_recommend');
const mcSceneModel = Backend.model('mc_weapp', undefined, 'mc_scene');
const mcSceneGoodsModel = Backend.model('mc_weapp', undefined, 'mc_scene_goods');
const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');
const mc_scene_collection_model = Backend.model("mc_weapp", undefined, "mc_scene_collection");
const mc_scene_goods_info_model = Backend.model("mc_weapp", undefined, "mc_scene_goods_info");
const mc_scene_user_info_model = Backend.model("mc_weapp", undefined, "mc_user_info");

const mcOrder = Backend.service('mc_weapp', 'order');

const _ = require("underscore");


module.exports = {
  __beforeAction() {
    if (this.query.type == "") {
      this.query.type = 0;
    }
  },
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required(),
      search: valid.string().empty(""),
      type: valid.number()
    });
  },
  async isCollection(recommend_user_id) {
    let user_id = this.req.identity.userId;
    const res = await mc_scene_collection_model.count({
      userId: user_id,
      "sceneRecommend.userId": recommend_user_id
    })
    return res > 0;
  },
  async getGoods(ids = [], search, type = 0, user_goods_ids_map, scene_id) {
    const reg = new RegExp(search, 'i') //不区分大小写
    let cond = {
      _id: {
        $in: ids
      },
      type,
      isDeleted: false,
      isShow: true
    }
    if (search) {
      cond.name = {
        "$regex": reg
      }
    }
    let res = await mcSceneGoodsModel.find(cond).sort({
      createdAt: -1
    });
    let new_res = [];
    res = await this.sort(scene_id, res);
    let origin_res = _.filter(res, function (item) {
      if (user_goods_ids_map.indexOf(item._id + "") != -1) {
        new_res.push(item);
        return false;
      }
      return true;
    })
    new_res.reverse();
    return new_res.concat(origin_res);
  },
  async sort(scene_id, goods) {
    const ids = goods.map(item => {
      return item._id;
    })
    const res = await mc_scene_goods_info_model.find({
      sceneId: scene_id,
      isRelevance: true,
      goodsId: {
        $in: ids
      },
    }).sort({
      sortedByTime: -1
    });
    const goods_map = _.indexBy(goods, "_id");
    return res.map(item => {
      return goods_map[item.goodsId];
    })
  },
  async getGoodsId(scene_id) {
    const res = await mc_scene_goods_info_model.find({
      sceneId: scene_id,
      isRelevance: true,
      isDeleted: false
    }, "goodsId")
    if (!res) return [];
    return res.map(item => item.goodsId);
  },
  /**
   * 根据用户唯一标识获取推荐
   * @param {*} user_id 
   */
  async getRecommend(user_id) {
    const search = this.query.search;
    const type = this.query.type;
    const current_user_id = this.req.identity.userId;
    let recommend = await mcSceneRecommendModel.findOne({
      userId: user_id,
      isDeleted: false
    });
    if (!recommend) return;
    const scene_id = recommend.sceneId;
    const scene = await mcSceneModel.findOne({
      _id: scene_id,
      isDeleted: false
    })
    if (!scene) return;
    let goods_ids = await this.getGoodsId(scene_id);
    const user_goods_ids = _.filter((scene.sceneUserGoods || []), function (item) {
      return item.userId == current_user_id;
    });
    const user_goods_ids_map = user_goods_ids.map(item => {
      return item.goodsId + "";
    });
    // goods_ids = goods_ids.concat(user_goods_ids_map)
    const address = `${scene.provinceName || ""}${scene.cityName || ""}${scene.countyName || ""}${scene.address || ""}`;
    const phone = scene.isShowOwner == true ? scene.ownerPhone : '';
    return {
      scene_id: scene._id,
      merchants: scene.name,
      deliveryType: scene.deliveryType,
      address,
      phone,
      avatar: scene.avatar,
      qcode: recommend.qscode,
      goods: await this.getGoods(goods_ids, search, type, user_goods_ids_map, scene_id)
    }
  },
  async collectionCount(user_id) {
    return await mc_scene_collection_model.count({
      "sceneRecommend.userId": user_id
    })
  },
  async orderCount(user_id) {
    let recommend = await mcSceneRecommendModel.findOne({
      userId: user_id,
      isDeleted: false
    });
    if (!recommend) return 0;
    const scene_id = recommend.sceneId;
    return await mcSceneOrderModel.count({
      sceneId: scene_id,
      isDeleted: false,
      status: {
        $in: [200, 300, 400, 600]
      }
    })
  },
  async getUserId(user_id) {
    const user_info = await mc_scene_user_info_model.findOne({
      preRefUserId: user_id,
      isDeleted: false
    })
    if (!user_info) return user_id;
    return user_info.userId;
  },
  async isOwner() {
    const user_id = this.req.identity.userId;
    return (await mcSceneModel.count({
      ownerUserId: user_id,
      isDeleted: false
    })) > 0;
  },
  async getAction() {
    let user_id = this.query.user_id;
    user_id = await this.getUserId(user_id);
    const result = await this.getRecommend(user_id);
    const is_collection = await this.isCollection(user_id);
    const collection_count = await this.collectionCount(user_id);
    const order_count = await this.orderCount(user_id);
    const is_owner = await this.isOwner();
    const avatar = result.avatar;
    const phone = result.phone;
    const address = result.address;
    if (!result) {
      return this.success({
        code: "200",
        msg: "",
        data: {
          merchants: "",
          qcode: "",
          list: []
        }
      })
    }
    const goods = result.goods;
    const qcode = result.qcode || "";
    const merchants = result.merchants || "";
    let res = [];

    if (goods) {
      const goods_ids = goods.map(item => item._id);
      const goods_map = await mcOrder.goodsCount(goods_ids);
      let res_goods_ids = goods.map(item => item.beforeZeroGoodsId);
      res_goods_ids = _.without(res_goods_ids, undefined);
      const more_map = await mcOrder.goodsCount(res_goods_ids);
      for (let i = 0; i < goods.length; i++) {
        const item = goods[i];
        let sell_count = 0;
        let more_count = 0;
        if (goods_map[item._id] != undefined) {
          sell_count = goods_map[item._id]
        }
        if (more_map[item.beforeZeroGoodsId] != undefined) {
          more_count = more_map[item.beforeZeroGoodsId]
        }
        sell_count += more_count;

        res.push({
          product_id: item._id,
          product_img: item.img,
          product_name: item.name,
          product_detail: item.describe,
          price: item.price,
          origin_price: item.originPrice,
          is_discount: item.isDiscount || false,
          discount_price: item.discountPrice || 0,
          recommend_price: is_owner ? (item.recommendPrice || 0) : undefined,
          is_show_recommend_price: is_owner,
          sell_count
        })
      
      }
    }

    if (this.query.type == 1) {
      result.deliveryType = undefined
    } else {
      result.deliveryType = result.deliveryType.length > 0 ? result.deliveryType : [1]
    }


    return this.success({
      code: "200",
      msg: "",
      data: {
        merchants,
        qcode,
        list: res,
        is_collection,
        collection_count,
        order_count,
        avatar,
        phone,
        address,
        delivery_type: result.deliveryType,
      }
    })
  }
}