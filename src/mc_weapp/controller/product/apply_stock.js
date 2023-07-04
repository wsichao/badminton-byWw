const mcSceneModel = Backend.model('mc_weapp', undefined, 'mc_scene');
const mcSceneGoodsModel = Backend.model('mc_weapp', undefined, 'mc_scene_goods');
const mcSceneStockApplyModel = Backend.model('mc_weapp', undefined, 'mc_scene_stock_apply');


module.exports = {
    __rule: function (valid) {
    return valid.object({
            product_id: valid.string().required(),
            apply_count: valid.number().required(),
            scene_id: valid.string().required()
        });
    },
    async getScene() {
        const user_id = this.req.identity.userId;
        return await mcSceneModel.findOne({
          ownerUserId: user_id,
          isDeleted: false
        },"name ownerName ownerPhone");
    },
    async postAction() {
        //申请人id
        let user_id = this.req.identity.userId;
        let post = this.post;

        let product = await mcSceneGoodsModel.findOne({
            _id: post.product_id
        },"name supplyId supplyName")

        let scene = await this.getScene();

        if (scene._id != post.scene_id) {
            return this.success({
                code: "100",
                msg: "您没有权限申请"
            })
        }

        let result = await mcSceneStockApplyModel.create({
            productId: post.product_id,
            sceneId: scene._id,
            applyUserId: user_id,
            productName: product.name,
            sceneName: scene.name,
            applyUserName: scene.ownerName,
            applyUserPhone: scene.ownerPhone,
            applyCount: post.apply_count,
            applyTime: Date.now(),
            status: 100,
            supplyId: product.supplyId,
            supplyName: product.supplyName
        })
         if (result != null) {
            return this.success({
                code: "200",
                msg: "提交库存申请成功"
            })
         }else {
            return this.success({
                code: "100",
                msg: "提交库存申请失败"
            }) 
         }
    }
}