const sceneGoodsModel = Backend.model('mc_weapp', undefined, 'mc_scene_goods');
const sceneSupplyModel = Backend.model('mc_weapp', undefined, 'mc_scene_supply');

module.exports = {
  async getAction() {
    let userId = this.req.identity.userId;
    let supplier = await sceneSupplyModel.findOne({userId})
    if (supplier == null) {
        return this.success({
            code:"200",
            msg:"您还不是供应商"
        })
    }

    var pageNum = this.req.query.page_num || 0;
    var pageSize = this.req.query.page_size || 20;
    let supply_list = await sceneGoodsModel.find({supplyId:supplier._id,isDeleted:false,applyGoodsId: { $ne: null }},"name _id img describe supplyPrice goodsTotalStockNum isShow").sort({ isShow: -1,createdAt: -1}).skip(pageSize*pageNum).limit(pageSize);

    let res = supply_list.map((supply)=>{
        return {
            name: supply.name,
            good_id: supply._id,
            img: supply.img,
            describe: supply.describe,
            supply_price: supply.supplyPrice,
            is_show: supply.isShow,
            stock_num: supply.goodsTotalStockNum
        }
    })

    return this.success({
      code: "200",
      msg: "请求成功",
      items: res,
      title: supplier.name
    })
  
  }
}