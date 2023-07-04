const mcSceneRecommendModel = Backend.model('mc_weapp', undefined, 'mc_scene_recommend');
const mcSceneApplyforModel = Backend.model('mc_weapp', undefined, 'mc_scene_apply_for');

module.exports = {
  async getRecommend() {
    let user_id = this.req.identity.userId;
    const count = await mcSceneRecommendModel.count({
      userId: user_id,
      isDeleted: false
    });
    return count > 0;
  },
  async getApplyfor() {
    let user_id = this.req.identity.userId;
    const res = await mcSceneApplyforModel.findOne({
      userId: user_id,
      isDeleted: false
    });
    if (!res) {
      return 0;
    }
    if (res.status == 100) {
      return 100;
    } else if (res.status == 200) {
      return 200;
    }
  },
  async getAction() {
    let status = 0;
    let is_recommend = await this.getRecommend();
    if (is_recommend) {
      status = 200;
    } else {
      status = await this.getApplyfor();
    }
    return this.success({
      code: "200",
      msg: "",
      data: {
        status
      }
    })
  }
}