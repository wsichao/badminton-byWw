const mcSceneModel = Backend.model('mc_weapp', undefined, 'mc_scene');
const mcSceneRecommendModel = Backend.model('mc_weapp', undefined, 'mc_scene_recommend');
const mcSceneGoodsModel = Backend.model('mc_weapp', undefined, 'mc_scene_goods');
const mcSceneActivityInfo = Backend.model('mc_weapp', undefined, 'mc_scene_activity_info');
const mc_scene_user_info_model = Backend.model("mc_weapp", undefined, "mc_user_info");
const mc_scene_goods_info_model = Backend.model("mc_weapp", undefined, "mc_scene_goods_info");
const _ = require("underscore");


module.exports = {
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required()
    });
  },
  async getUserId(user_id) {
    const user_info = await mc_scene_user_info_model.findOne({
      preRefUserId: user_id,
      isDeleted: false
    })
    if (!user_info) return user_id;
    return user_info.userId;
  },
  async getSceneId() {
    let user_id = this.query.user_id;
    user_id = await this.getUserId(user_id);

    const recommend = await mcSceneRecommendModel.findOne({
      userId: user_id,
      isDeleted: false
    })
    if (recommend)
      return recommend.sceneId;
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
  async getSceneGoods() {
    const scene_id = await this.getSceneId();
    const current_user_id = this.req.identity.userId;
    if (!scene_id) return [];
    const scene = await mcSceneModel.findOne({
      _id: scene_id,
      isDeleted: false
    })
    if (!scene) return [];
    let goods_ids = await this.getGoodsId(scene_id);
    // const user_goods_ids = _.filter((scene.sceneUserGoods || []), function (item) {
    //   return item.userId == current_user_id;
    // });
    // goods_ids = goods_ids.concat(user_goods_ids.map(item => {
    //   return item.goodsId;
    // }))
    const goods = await mcSceneGoodsModel.find({
      _id: {
        $in: goods_ids
      },
      isDeleted: false
    }, "type");

    //有多少个精选的
    const sum = _.reduce(goods, function (memo, num) {
      return memo + (num.type || 0);
    }, 0);

    const len = goods.length; //有多少个商品
    let result = [];

    if (len != 0) {
      // 只有type 为 1 的数字
      if (sum == len) {
        result.push({
          id: 1,
          name: "本店严选"
        })
      }
      // type 为 0 的数字 
      else if (sum == 0) {
        result.push({
          id: 0,
          name: "本店优惠"
        })
      }
      // type 与总数不相等的数字 
      else if (sum < len) {
        result = [{
          id: 1,
          name: "本店严选"
        }, {
          id: 0,
          name: "本店优惠"
        }]
      }
    }


    //这个地方需要更改成相应的model
    const activities = await mcSceneActivityInfo.find({
      sceneId: scene._id,
      isDeleted: false,
      isRelevance: true
    });

    if (activities.length > 0) {
      result.push({
        id: 2,
        name: "活动有礼"
      })
    }

    return result;
  },
  async getAction() {
    const res = await this.getSceneGoods();
    if (res.length == 0) {
      res.push({
        id: 1,
        name: "星辉严选"
      })
    }
    return this.success({
      code: "200",
      msg: "",
      data: {
        types: res
      }
    });
  }
}