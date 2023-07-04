const mcSceneStockApplyModel = Backend.model('mc_weapp', undefined, 'mc_scene_stock_apply');


module.exports = {
    async getAction() {
        let page = this.query.page_num || 0;
        let result = await mcSceneStockApplyModel.find({
            applyUserId: this.req.identity.userId
        },"productName applyCount applyTime distributeCount distributeTime status updatedAt").skip(page * 20)
        .limit(20)
        .sort({'_id':-1})
        
        return this.success({
            code: "200",
            msg: "获取库存列表成功",
            data: result
        }) 
        
    }
}