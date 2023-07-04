const mc_scene_activity_data_config_model = Backend.model("mc_weapp", undefined, "mc_scene_activity_data_config");

module.exports = {
  async getAction() {
    let res = await mc_scene_activity_data_config_model.findOne({
      type: 2
    })
    if (!res) res = {};
    return this.success({
      code: "200",
      msg: "",
      data: res.data
    })
  }
}