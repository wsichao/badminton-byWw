const mcApplyGoodsModel = Backend.model('mc_weapp', undefined, 'mc_apply_goods');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      good_supply_id: valid.string().required()
    });
  },
  async getAction() {
    let supplyId = this.query.good_supply_id
    let supply = await mcApplyGoodsModel.findOne({_id:supplyId})
    return this.success({
      code: "200",
      msg: "请求成功",
      data: {
        name: supply.name,
        standard: supply.standard,
        brand_name: supply.brandName,
        head_img: supply.headImg,
        supply_price: supply.supplyPrice,
        other_imgs: supply.otherImgs,
        selling_point: supply.sellingPoint,
        other_info: supply.otherInfo,
        status: supply.status
      }
    })

  }
}