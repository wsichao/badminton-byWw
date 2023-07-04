const mc_scene_apply_for_model = Backend.model("mc_weapp", undefined, "mc_scene_apply_for");

module.exports = {
  async getInfo() {
    let user_id = this.req.identity.userId;
    const res = await mc_scene_apply_for_model.findOne({
      userId: user_id,
      isDeleted: false
    })
    return {
      "name": res.name,
      "avatar": res.avatar,
      "province_id": res.provinceId,
      "province_name": res.provinceName,
      "city_id": res.cityId,
      "city_name": res.cityName,
      "county_id": res.countyId,
      "county_name": res.countyName,
      "address": res.address,
      "delivery_type": res.deliveryType,
      "user_name": res.userName
    }
  },
  async getAction() {
    const data = await this.getInfo();
    return this.success({
      code: "",
      msg: "",
      data
    });
  }
}