const mc_scene_goods_info_model = Backend.model("mc_weapp", undefined, "mc_scene_goods_info");
const mcSceneGoodsModel = Backend.model('mc_weapp', undefined, 'mc_scene_goods');

module.exports = {
    //分组下的商品列表 
    async getCategoryGoods(categoryId) {
        let res = await mc_scene_goods_info_model.find({
            categoryId: categoryId,
            isRelevance: true,
            isDeleted: false
        })
        let goods_ids = res.map(item => item.goodsId)
        let cond = {
            _id: {
                $in: goods_ids
            },
            isDeleted: false,
            isShow: true
        }
        return goods = await mcSceneGoodsModel.find(cond).sort({
                 createdAt: -1
            });    
    }
}