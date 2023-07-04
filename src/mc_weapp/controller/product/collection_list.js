const mc_scene_collection_model = Backend.model("mc_weapp", undefined, "mc_scene_collection");
const mc_scene_recommend_model = Backend.model("mc_weapp", undefined, "mc_scene_recommend");
const mc_scene_model = Backend.model("mc_weapp", undefined, "mc_scene");
const mc_scene_goods_model = Backend.model("mc_weapp", undefined, "mc_scene_goods");
const mc_scene_activity = Backend.model("mc_weapp", undefined, "mc_scene_activity");
const mc_scene_activity_info = Backend.model("mc_weapp", undefined, "mc_scene_activity_info");
const mc_scene_goods_info_model = Backend.model("mc_weapp", undefined, "mc_scene_goods_info");
const _ = require("underscore");
const userMode = Backend.model('common', undefined, 'customer');

module.exports = {
  async getGoodsId(scene_ids) {
    const res = await mc_scene_goods_info_model.find({
      sceneId: {
        $in: scene_ids
      },
      isRelevance: true,
      isDeleted: false
    }, "sceneId goodsId").sort({
      sortedByTime: -1
    })
    if (!res) return [];
    return {
      ids: res.map(item => item.goodsId),
      map: _.groupBy(res, "sceneId")
    }
  },
  async getCollection(user_id) {
    let pageNum = Number(this.query.page_num || 0);
    let pageSize = Number(this.query.page_size || 20);
    const res = await mc_scene_collection_model.findOne({
      userId: user_id,
      isDeleted: false
    });
    if (!res) return [];

    const sceneRecommend = res.sceneRecommend;
    const user_ids = sceneRecommend.map(item => {
      return item.userId;
    })

    if (user_ids.length == 0) return [];

    const recommends = await mc_scene_recommend_model.find({
      userId: {
        $in: user_ids
      },
      isDeleted: false
    })

    const scene_ids = recommends.map(item => {
      return item.sceneId;
    })

    if (scene_ids.length == 0) return [];

    const scenes = await mc_scene_model.find({
      _id: {
        $in: scene_ids
      },
      isDeleted: false
    }).skip(pageSize*pageNum).limit(pageSize);

    const g_info = await this.getGoodsId(scene_ids);
    let goods_id = g_info.ids;
    let g_map = g_info.map;


    const goods = await mc_scene_goods_model.find({
      _id: {
        $in: goods_id
      },
      isDeleted: false,
      isShow: true
    });

    const goods_map = _.indexBy(goods, "_id");

    let result = [];

    for (let i = 0; i < scenes.length; i++) {
      const item = scenes[i];

      let imgs = []
      let detail = ""
      let goods = []
      let has_me = false;
      let has_act = false;
      const gs = g_map[item._id] || [];
      gs.forEach(element => {
        const good_id = element.goodsId;
        if (goods_map[good_id]) {
          imgs.push(goods_map[good_id].img);
          goods.push({
            good_image: goods_map[good_id].img,
            good_type: goods_map[good_id].type,
            good_price: goods_map[good_id].price
          });
          if (goods_map[good_id].type == 1) {
            has_me = true;
          }
        }
      })

      if (imgs.length > 4) {
        detail = `等${imgs.length}件商品`;
        imgs = imgs.splice(0, 4);
      } else {
        detail = `${imgs.length}件商品`;
      }

      //去查看是否有活动
      const acts = await mc_scene_activity_info.find({
        sceneId: item._id,
        isDeleted: false
      })

      if (acts.length > 0) {
        const act_ids = acts.map(item => {
          return item.activityId;
        })

        const act = await mc_scene_activity.find({
          _id: {
            $in: act_ids
          },
          isDeleted: false,
          isShow: true
        })

        if (act.length > 0) {
          has_act = true;
        }
      }

      result.push({
        id: item._id,
        name: item.name,
        imgs,
        detail,
        avatar: item.avatar,
        count: goods.length,
        goods: goods.splice(0, 4),
        has_me,
        has_act
      })

    }

    const result_map = _.indexBy(result, "id");

    const user_list = await userMode.find({
      _id: {
        $in: user_ids
      },
      isDeleted: false
    }, "name phone")

    const user_map = _.indexBy(user_list, "_id");

    const r = []
    for (let i = 0; i < recommends.length; i++) {
      const item = recommends[i];
      if (result_map.hasOwnProperty(item.sceneId)) {
        const s = result_map[item.sceneId] || {};
        const u = user_map[item.userId] || {};

        r.push({
          user_id: item.userId,
          user_name: u.name || "",
          name: s.name,
          imgs: s.imgs,
          detail: s.detail,
          avatar: s.avatar || "",
          goods: s.goods,
          has_me: s.has_me,
          has_act: s.has_act,
          count: s.count
        });
      }
    }

    const r_map = _.indexBy(r, "user_id");

    res.sceneRecommend.reverse();
    const t = []
    for (let i = 0; i < res.sceneRecommend.length; i++) {
      const item = res.sceneRecommend[i];
      if (r_map.hasOwnProperty(item.userId)) {
        t.push(r_map[item.userId]);
      }
    }
    return t;
  },
  async getAction() {
    let user_id = this.req.identity.userId;
    const result = await this.getCollection(user_id);

    return this.success({
      code: "200",
      msg: "",
      data: {
        list: result
      }
    });
  }
}