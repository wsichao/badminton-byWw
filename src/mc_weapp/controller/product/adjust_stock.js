const mcSceneGoodsModel = Backend.model('mc_weapp', undefined, 'mc_scene_goods');
const supplier_service = Backend.service('mc_weapp', 'supplier');
const mcSceneStockLog = Backend.model('mc_weapp', undefined, 'mc_scene_stock_log');
// 调整商品库存
module.exports = {
    __rule: function (valid) {
        return valid.object({
            product_id: valid.string().required(),//必选项
            num: valid.number().required()
        });
    },
    // get请求getAction 
    async postAction() {
        let product_id = this.post.product_id;
        let user_id = this.req.identity.userId;
        let num = this.post.num;
        let product = await supplier_service.isSupplier(product_id,user_id)
       
        if (product == null) {
            return this.success({
              code: '1001',
              msg: '抱歉您还不是供应商,没有访问权限'
            })
        }
       
        let number = product.goodsTotalStockNum + num
        if (number < 0) {
            return this.success({
                code: '1002',
                msg: '库存更改失败'
            })
        }

        try {
            await mcSceneGoodsModel.update({_id:product_id},{goodsTotalStockNum:number})
            await mcSceneStockLog.create({productId:product_id,productName:product.name,supplyId:product.supplyId,goodsTotalStockNum:num})
            return this.success({
                code: '200',
                msg: '更改成功'
            })
             
        } catch (error) {
            return this.success({
                code: '1002',
                msg: '库存更改失败'
            })
        }
        
    }
}