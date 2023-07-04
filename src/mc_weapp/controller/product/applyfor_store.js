const mcApplyGoodsModel = Backend.model('mc_weapp', undefined, 'mc_apply_goods');
const sceneSupplyModel = Backend.model('mc_weapp', undefined, 'mc_scene_supply');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      name: valid.string().required(),
      standard: valid.string().required(),
      head_img: valid.string().required(),
      supply_price: valid.number().required()
    });
  },
  async postAction() {
    try {
      let userId = this.req.identity.userId;
      let supplier = await sceneSupplyModel.findOne({userId},"_id name")
      if (supplier == null) {
          return this.success({
            code: '1001',
            msg: '抱歉您还不是供应商,没有对应权限'
          })
      }

      let post = this.post
      let ag = {
        name: post.name,
        standard: post.standard,
        brandName: post.brand_name,
        headImg: post.head_img,
        supplyPrice: post.supply_price * 100,
        otherImgs: post.other_imgs || [],
        sellingPoint: post.selling_point || "",
        otherInfo: post.other_info || "",
        supplyId: supplier._id,
        supplyName: supplier.name
      }
      //说明是修改
      let re = {};
      if (post.good_supply_id) {
          if (post.is_cancel) {
            await mcApplyGoodsModel.update({_id:post.good_supply_id},{$set: {status: 400}})
          }else{
            await mcApplyGoodsModel.update({_id:post.good_supply_id},{$set: ag})
          }
          re = await mcApplyGoodsModel.findOne({_id:post.good_supply_id},"name standard brandName headImg supplyPrice otherImgs sellingPoint otherInfo supplyId supplyName createdAt")
      } else {
        ag["status"] = 100
        re = await mcApplyGoodsModel.create(ag)
      }
    
      return this.success({
        code: '200',
        msg: '提交成功',
        data: {
          name: re.name,
          standard: re.standard,
          brand_name: re.brandName,
          head_img: re.headImg,
          supply_price: re.supplyPrice,
          other_imgs: re.otherImgs,
          selling_point: re.sellingPoint,
          other_info: re.otherInfo,
          good_supply_id: re._id,
          submit_time: re.createdAt
        }
      })
    } catch (e) {
      return this.success({
        code: '1000',
        msg: '系统错误,提交失败'
      })
    }
  }
}