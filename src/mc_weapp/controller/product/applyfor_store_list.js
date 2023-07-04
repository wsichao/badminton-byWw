const mcApplyGoodsModel = Backend.model('mc_weapp', undefined, 'mc_apply_goods');
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
    let supply_list = await mcApplyGoodsModel.find({supplyId:supplier._id},"name _id headImg standard supplyPrice status createdAt").sort({status: 1,createdAt: -1}).skip(pageSize*pageNum).limit(pageSize);

    let res = supply_list.map((supply)=>{
        return {
            name: supply.name,
            good_supply_id: supply._id,
            head_img: supply.headImg,
            standard: supply.standard,
            supply_price: supply.supplyPrice,
            status: supply.status,
            submit_time: supply.createdAt
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