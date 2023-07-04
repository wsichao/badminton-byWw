const mcSceneModel = Backend.model('mc_weapp', undefined, 'mc_scene');
const mcSceneGoodsInfoModel = Backend.model('mc_weapp', undefined, 'mc_scene_goods_info');
const mcSceneRecommendModel = Backend.model('mc_weapp', undefined, 'mc_scene_recommend');


module.exports = {
  __rule: function (valid) {
    return valid.object({
      product_id: valid.string().required(),
      is_join: valid.boolean().empty(true).default(true),
      recommend_user_id: valid.string().required(),
    });
  },
  async checkOwner() {
    const user_id = this.req.identity.userId;
    const is_owner = (await mcSceneModel.count({
      ownerUserId: user_id,
      isDeleted: false
    })) > 0;
    if (!is_owner) return "该用户不是清单所有人，请先申请开通清单";
    return true;
  },
  /**
   * 检查是否已经加入
   */
  async checkIsJoin(secend_id, product_id) {
    const count = await mcSceneGoodsInfoModel.count({
      sceneId: secend_id,
      goodsId: product_id,
      isRelevance: true,
    })
    return count > 0;
  },
  async updateInfo(secend_id, product_id, state, recommend_user_id) {
    const is_used = (await mcSceneGoodsInfoModel.count({
      sceneId: secend_id,
      goodsId: product_id,
      isDeleted: false
    })) > 0
    const current_time = Date.now();
    //这里去取分组
    const scene = await mcSceneModel.findOne({
      _id: secend_id,
      isDeleted: false
    })

    let categorys = scene.categorys;
    let categoryId;
      categorys.forEach((item) => {
        if (item.type == 1 && item.isDefault) {
          categoryId = item.categoryId;
        }
      })

    if (is_used) {
      await mcSceneGoodsInfoModel.update({
        sceneId: secend_id,
        goodsId: product_id
      }, {
        isRelevance: state,
        fromRecommendUserId: recommend_user_id,
        sortedByTime: current_time,
        categoryId: categoryId
      });
    } else {
      await mcSceneGoodsInfoModel.create({
        sceneId: secend_id,
        goodsId: product_id,
        isRelevance: state,
        fromRecommendUserId: recommend_user_id,
        sortedByTime: current_time,
        categoryId: categoryId
      });
    }

  },
  async handler() {
    const product_id = this.query.product_id;
    const is_join = this.query.is_join;
    const user_id = this.req.identity.userId;
    const recommend_user_id = this.query.recommend_user_id;
    const secend_id = (await mcSceneRecommendModel.findOne({
      userId: user_id,
      isDeleted: false
    })).sceneId;
    if (is_join) {
      const is_check_join = await this.checkIsJoin(secend_id, product_id);
      if (is_check_join) return;
      await this.updateInfo(secend_id, product_id, true, recommend_user_id);
    } else {
      await this.updateInfo(secend_id, product_id, false, recommend_user_id);
    }

  },
  async getAction() {
    const check_owner = await this.checkOwner();
    if (check_owner != true) {
      return {
        code: "1000",
        msg: check_owner
      }
    }
    await this.handler();
    return this.success({
      code: "200",
      msg: ""
    })
  }
}