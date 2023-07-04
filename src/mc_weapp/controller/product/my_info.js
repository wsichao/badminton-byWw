const supplier_service = Backend.service('mc_weapp', 'supplier');
const mcSceneModel = Backend.model('mc_weapp', undefined, 'mc_scene');
const mc_scene_goods_info_model = Backend.model("mc_weapp", undefined, "mc_scene_goods_info");
// 我的货架 商品详情
module.exports = {
    __rule: function (valid) {
        return valid.object({
            product_id: valid.string().required()//必选项
        });
    },
    // get请求getAction 
    async getAction() {
        let product_id = this.query.product_id;
        let user_id = this.req.identity.userId;
        let product = await supplier_service.isSupplier(product_id,user_id)
        if (product == null) {
            return this.success({
              code: '1001',
              msg: '抱歉您还不是供应商,没有访问权限'
            })
        }
        const res = await this.isJoin(user_id,product_id);
        return this.success({
            code: '200',
            msg: '查询成功',
            data:{
                product_id:product._id,
                name:product.name,
                describe:product.describe,
                supply_price:product.supplyPrice,
                goods_total_stock_num:product.goodsTotalStockNum,
                img:product.img,
                describe_imgs:product.describeImgs,
                is_show:product.isShow,
                is_join:res.is_join,
                is_scene:res.is_scene
            }
        })
    },
   /**
   * 检查该用户是否已拥有该商品
   * @param user_id
   */
  async isJoin(user_id,product_id) {
    const scene = await mcSceneModel.findOne({
      ownerUserId: user_id,
      isDeleted: false,
    })
    if (!scene) return  {is_scene:false,is_join:false};
    const scene_id = scene._id;
    // 检查用户是否已拥有该商品
    const is_join = (await mc_scene_goods_info_model.count({
      sceneId: scene_id,
      isDeleted: false,
      goodsId: product_id,
      isRelevance: true
    })) > 0;
    if(!is_join) return {is_scene:true,is_join:false}
    return {is_scene:true,is_join:true};
  },
}