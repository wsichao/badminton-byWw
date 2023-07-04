const sceneSupplyModel = Backend.model('mc_weapp', undefined, 'mc_scene_supply');
const user_model = require('../../../../app/models/Customer');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      name: valid.string().required(),
      owner_type: valid.number().required(),
      into_categorie: valid.string().required(),
      is_delivery: valid.number().required(),
      contact_way: valid.string().required(),
      province_id: valid.string().empty(""),
      province_name: valid.string().empty(""),
      city_id: valid.string().empty(""),
      city_name: valid.string().empty(""),
      county_id: valid.string().empty(""),
      county_name: valid.string().empty(""),
      address: valid.string().empty("")
    });
  },
  async isApply(userId){
    let count = await sceneSupplyModel.count({userId})
    return count > 0
  },
  async postAction() {
    try {
      let userId = this.req.identity.userId;
      if (await this.isApply(userId)) {
          return this.success({
            code: '1001',
            msg: '抱歉您已经提交过申请'
          })
      }

      const user = await user_model.findOne({_id:userId},'phoneNum')
      let post = this.post
      let ap = {
        name: post.name,
        phone: user.phoneNum,
        userId: userId,
        provinceId: post.province_id,
        provinceName: post.province_name,
        cityId: post.city_id,
        cityName: post.city_name,
        countyId: post.county_id,
        countyName: post.county_name,
        address: post.address,
        ownerType: post.owner_type,
        inToCategorie: post.into_categorie,
        isDelivery: post.is_delivery,
        contactWay: post.contact_way,
        brandName: post.brand_name,
        businessLicense: post.business_license,
        otherLicense: post.other_license,
        status: 100
      }

      await sceneSupplyModel.create(ap)
      return this.success({
        code: '200',
        msg: '提交成功'
      })
    } catch (e) {
      return this.success({
        code: '1000',
        msg: '系统错误,提交失败'
      })
    }
  }
}