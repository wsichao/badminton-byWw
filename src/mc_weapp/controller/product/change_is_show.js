const mcSceneGoodsModel = Backend.model('mc_weapp', undefined, 'mc_scene_goods');
const supplier_service = Backend.service('mc_weapp', 'supplier');
// 上下架商品
module.exports = {
    __rule: function (valid) {
        return valid.object({
            product_id: valid.string().required(),//必选项
            is_show:valid.boolean().required()
        });
    },
    
    async postAction() {
        let product_id = this.post.product_id;
        let user_id = this.req.identity.userId;
        let is_show = this.post.is_show;
        // 检测是否是该商品的供应商,不是，返回错误信息
        let product = await supplier_service.isSupplier(product_id,user_id);
        if (product == null) {
            return this.success({
              code: '1001',
              msg: '抱歉您还不是供应商,没有访问权限'
            })
        }
        // 是update 上下架
       try {
           await mcSceneGoodsModel.update({_id:product_id},{isShow:is_show})
           return this.success({
                code: '200',
                msg: '更改成功'
            })
       }catch(error){
            return this.success({
                code: '1002',
                msg: '更改失败'
            })
       }
    }
}