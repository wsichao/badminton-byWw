const mc_scene_user_info_model = Backend.model("mc_weapp", undefined, "mc_user_info");
const mcSceneRecommendModel = Backend.model('mc_weapp', undefined, 'mc_scene_recommend');
const mcSceneGoodsInfoModel = Backend.model('mc_weapp', undefined, 'mc_scene_goods_info');

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
  async update(user_id, scene_id, product_id) {
    await mcSceneGoodsInfoModel.update({
      sceneId: scene_id,
      goodsId: product_id
    }, {
      $inc: {
        clickCount: 1
      }
    })
    Backend.service("mc_weapp", "user_activity_log").shareClickLog(user_id, this.req.identity.userId, scene_id, product_id);
  },
  async getAction() {
    try {
      const user_id = await this.getUserId(this.query.user_id);
      const product_id = this.query.product_id;
      const scene_id = await this.getScenceId(user_id);
      await this.update(user_id, scene_id, product_id);
      return this.success({
        code: "200",
        msg: ""
      })
    } catch (e) {
      return this.success({
        code: "1000",
        msg: ""
      })
    }
  }
}