const mc_scene_activity_data_model = Backend.model("mc_weapp", undefined, "mc_scene_activity_data");

module.exports = {
  __rule: function (valid) {
    return valid.object({
      id: valid.string().required(),
      user_id: valid.string().required()
    });
  },
  async getInfo() {
    const id = this.query.id;
    const user_id = this.query.user_id;
    return await mc_scene_activity_data_model.findOne({
      userId: user_id,
      activityId: id,
      isDeleted: false
    });
  },
  async getAction() {
    const info = await this.getInfo();
    if (!info) {
      return this.success({
        code: '1000',
        msg: '该内容不存在'
      });
    }
    return this.success({
      code: '200',
      msg: "",
      data: info.data
    })
  }
}