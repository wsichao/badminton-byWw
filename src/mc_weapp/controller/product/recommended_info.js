const mcSceneRecommendModel = Backend.model('mc_weapp', undefined, 'mc_scene_recommend');
const mcSceneModel = Backend.model('mc_weapp', undefined, 'mc_scene');
const mcSceneGoodsModel = Backend.model('mc_weapp', undefined, 'mc_scene_goods');
const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');
const mc_scene_collection_model = Backend.model("mc_weapp", undefined, "mc_scene_collection");
const mc_scene_goods_info_model = Backend.model("mc_weapp", undefined, "mc_scene_goods_info");

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
      updatedAt: -1
    });
    const goods_map = _.indexBy(goods, "_id");
    return res.map(item => {
      return goods_map[item.goodsId];
    })
  },
  /**
   * 根据用户唯一标识获取推荐
   * @param {*} user_id 
   */
  async getRecommend(user_id) {
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
    return {
      merchants: scene.name,
      qcode: recommend.qscode,
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
  async getAction() {
  
    const user_id = this.query.user_id;
    const result = await this.getRecommend(user_id);
    const is_collection = await this.isCollection(user_id);
    const collection_count = await this.collectionCount(user_id);
    const order_count = await this.orderCount(user_id);
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
    const qcode = result.qcode || "";
    const merchants = result.merchants || "";
    return this.success({
      code: "200",
      msg: "",
      data: {
        merchants,
        qcode,
        is_collection,
        collection_count,
        order_count
      }
    })
  }
}