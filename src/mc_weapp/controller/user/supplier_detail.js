const sceneSupplyModel = Backend.model('mc_weapp', undefined, 'mc_scene_supply');

module.exports = {
  async getAction() {
    let userId = this.req.identity.userId;
    let supplier = await sceneSupplyModel.findOne({userId:userId})
    if (supplier) {
      return this.success({
        code: "200",
        msg: "请求成功",
        data: {
            name: supplier.name,
            province_id: supplier.provinceId,
            province_name: supplier.provinceName,
            city_id: supplier.cityId,
            city_name: supplier.cityName,
            county_id: supplier.countyId,
            county_name: supplier.countyName,
            address: supplier.address,
            owner_type: supplier.ownerType,
            into_categorie: supplier.inToCategorie,
            is_delivery: supplier.isDelivery,
            contact_way: supplier.contactWay,
            brand_name: supplier.brandName,
            business_license: supplier.businessLicense,
            other_license: supplier.otherLicense,
            status: supplier.status
        }
      })
    }

    return this.success({
        code:"1001",
        msg:"您还没有称为供应商,请您注册",
        data:{}
    })
    
  }
}