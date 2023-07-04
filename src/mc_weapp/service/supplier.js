const mcSceneGoodsModel = Backend.model('mc_weapp', undefined, 'mc_scene_goods');
const mcSceneSupplyModel = Backend.model('mc_weapp', undefined, 'mc_scene_supply');
// 供应商相关
module.exports = {
    /**
    * 判断是否是该商品的供应商
    */
    async isSupplier(product_id,user_id) {
        let supplier_id_obj = await mcSceneSupplyModel.findOne({userId: user_id},"_id")
        // 通过供应商ID和product_id，查找改条商品
        const product = await mcSceneGoodsModel.findOne({
            _id: product_id,
            supplyId: supplier_id_obj._id
        })
        return product;

    }
}