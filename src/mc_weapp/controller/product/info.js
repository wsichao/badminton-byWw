const mcSceneGoodsModel = Backend.model('mc_weapp', undefined, 'mc_scene_goods');
const mcSceneModel = Backend.model('mc_weapp', undefined, 'mc_scene');
const mc_scene_goods_info_model = Backend.model("mc_weapp", undefined, "mc_scene_goods_info");
const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');
const mcSceneRecommendModel = Backend.model('mc_weapp', undefined, 'mc_scene_recommend');
const mongoose = require("mongoose")

module.exports = {
  __rule: function (valid) {
    return valid.object({
      id: valid.string().required()
    });
  },
  /**
   * 检查该用户是否已拥有该商品
   * @param user_id
   * @param product_id
   */
  async isJoin(user_id, product_id) {
    const scene = await mcSceneModel.findOne({
      ownerUserId: user_id,
      isDeleted: false,
    })
    if (!scene) return false;
    const scene_id = scene._id;
    // 检查用户是否已拥有该商品
    const is_join = (await mc_scene_goods_info_model.count({
      sceneId: scene_id,
      isDeleted: false,
      goodsId: product_id,
      isRelevance: true
    })) > 0;
    return is_join;
  },
  async getProduct(id,scene_id) {
    const product = await mcSceneGoodsModel.findOne({
      _id: id,
      isDeleted: false
    })
    if (!product) return {};
    return {
      name: product.name,
      describe: product.describe,
      img: product.img,
      price: product.price,
      origin_price: product.originPrice,
      describe_imgs: product.describeImgs || [],
      discount_price: product.discountPrice,
      type: product.type,
      scene_stock: await this.getSceneStock(scene_id,id),
      is_show: product.isShow,
      is_discount: product.isDiscount,
      recommend_price: product.recommendPrice,
      video: product.video,
      video_img: product.videoImg
    }
  },
  async getSceneStock(sceneId, goodsId) {
    if (!sceneId) {
      return 0;
    }
    let recommend = await mcSceneRecommendModel.findOne({
      userId: sceneId,
      isDeleted: false
    });
    const res = await mc_scene_goods_info_model.findOne({
      sceneId: recommend.sceneId,
      isRelevance: true,
      isDeleted: false,
      goodsId: goodsId
    }, "sceneStockNum")
    if (!res) return 0;
     //筛选出预库存数组
     let result = await mcSceneOrderModel.aggregate([
      {$match:{
          'products.id': mongoose.Types.ObjectId(goodsId),
          'status':100,
          'expiredAt':{$gte:Date.now()}
      }},
      {$unwind:'$products'},
      {$match:{'products.id':mongoose.Types.ObjectId(goodsId)}},
      {$group:{_id:'$products.id',total:{$sum:'$products.number'}}}
      ]).exec();
      let old = result[0] || {};

      let good = await mcSceneGoodsModel.findOne({_id: goodsId},"goodsTotalStockNum storeType")
      //一级库存计算
      if (good.storeType == 1) {
        return (good.goodsTotalStockNum || 0) - (old.total || 0);
      }
      //二级库存计算
    return (res.sceneStockNum || 0) - (old.total || 0);
  },
  async getAction() {
    const id = this.query.id;
    const user_id = this.req.identity.userId;
    const scene_id = this.query.scene_id;
    const p = await this.getProduct(id, scene_id);
    const is_join = await this.isJoin(user_id, id);
    p.is_join = is_join;
    return this.success({
      code: "200",
      msg: "",
      data: p
    });
  }
}