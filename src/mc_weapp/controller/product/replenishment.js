const mcSceneReplenishmentModel = Backend.model('mc_weapp', undefined, 'mc_scene_replenishment');
const mcSceneCollectionModel = Backend.model('mc_weapp', undefined, 'mc_scene_collection');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      recommend_user_id: valid.string().empty(""),
      product_name: valid.string().empty(""),
      product_brand: valid.string().empty(""),
      product_price: valid.number().empty(""),
      product_number: valid.number().empty(""),
      product_channel: valid.string().empty(""),
      product_detail: valid.string().empty("")
    });
  },
  async getRUId() {
    const recommend_user_id = this.post.recommend_user_id;
    let user_id = this.req.identity.userId;
    let ruid = "";
    if (recommend_user_id && recommend_user_id != "") {
      ruid = recommend_user_id;
    } else {
      const coll = await mcSceneCollectionModel.findOne({
        userId: user_id,
        isDeleted: false
      }).sort({
        createdAt: 1
      })
      if (coll && coll.sceneRecommend.length > 0) {
        ruid = coll.sceneRecommend[0].userId;
      }
    }
    return ruid;
  },
  async save() {
    const post = this.post;
    const ruid = await this.getRUId();
    let user_id = this.req.identity.userId;
    let data = {
      userId: user_id,
      productName: post.product_name,
      productBrand: post.product_brand,
      productPrice: post.product_price,
      productNumber: post.product_number,
      productChannel: post.product_channel,
      productDetail: post.product_detail
    }
    if (ruid) {
      data.mcRecommendUserId = ruid;
    }
    await mcSceneReplenishmentModel.create(data);
  },
  async postAction() {
    try {
      await this.save();
      return this.success({
        code: "200",
        msg: ""
      });
    } catch (e) {
      console.log(e);
      return this.success({
        code: "1000",
        msg: "服务器报错"
      });
    }
  }
}