const mc_scene_goods_info_model = Backend.model("mc_weapp", undefined, "mc_scene_goods_info");

module.exports = {
    __rule: function (valid) {
    return valid.object({
            goods: valid.required(),
            scene_id: valid.string().required(),
            categoryId: valid.string().required()
        });
    },
    async postAction() {
        const scene_id = this.post.scene_id;
        const goods = this.post.goods;
        const categoryId = this.post.categoryId;
       
        await mc_scene_goods_info_model.update({
            sceneId: scene_id,
            isRelevance: true,
            isDeleted: false,
            'goodsId': {
                $in: goods
            }
        },{$set:{categoryId:categoryId}},{multi:true})
           
        return this.success({
            code: "200",
            msg: "更改成功"
        })
    }
}