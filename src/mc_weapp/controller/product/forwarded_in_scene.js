const mc_scene_user_info_model = Backend.model("mc_weapp", undefined, "mc_user_info");
const mcSceneRecommendModel = Backend.model('mc_weapp', undefined, 'mc_scene_recommend');
const mcSceneModel = Backend.model('mc_weapp', undefined, 'mc_scene');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      product_id: valid.string().required(),
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
  /**
   * 获取 scenceId
   * @param user_id
   */
  async getScenceId(user_id) {
    const recommend = await mcSceneRecommendModel.findOne({
      userId: user_id,
      isDeleted: false
    })
    if (recommend) return recommend.sceneId;
  },
  /**
   * 检查用户是否已经添加过
   * @param {*} scene_id 
   * @param {*} user_id 
   * @param {*} product_id 
   */
  async check(scene_id, user_id, product_id) {
    const is_recommend = (mcSceneRecommendModel.count({
      sceneId: scene_id,
      userId: user_id
    })) > 0;
    if (is_recommend) {
      console.log("该用户已是该小清单推荐人");
      return true;
    }

    const is_used = (await mcSceneModel.count({
      _id: scene_id,
      isDeleted: false,
      "sceneUserGoods": {
        "$elemMatch": {
          "goodsId": product_id,
          "userId": user_id
        }
      }
    })) > 0;
    if (is_used) {
      console.log(`该用户与商品已作为推荐商品 scene_id:${scene_id},product_id:${product_id},user_id:${user_id}`);
      return true;
    }
  },
  async updateScence(scene_id, user_id, product_id) {
    if (await this.check(scene_id, user_id, product_id)) return;

    const cond = {
      _id: scene_id,
      isDeleted: false
    }
    const obj = {
      $push: {
        "sceneUserGoods": {
          "userId": user_id,
          "goodsId": product_id
        }
      }
    }
    await mcSceneModel.update(cond, obj);
    console.log(cond, obj);
  },
  async getAction() {
    const user_id = await this.getUserId(this.query.user_id);
    const product_id = this.query.product_id;
    const scene_id = await this.getScenceId(user_id);
    const login_user_id = this.req.identity.userId;
    if (scene_id) {
      await this.updateScence(scene_id, login_user_id, product_id);
      return this.success({
        code: "200",
        msg: ""
      })
    } else {
      return this.success({
        code: "1000",
        msg: "该场景不存在"
      })
    }

  }
}