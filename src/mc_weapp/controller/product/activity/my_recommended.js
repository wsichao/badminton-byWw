const mc_scene_activity_info_model = Backend.model("mc_weapp", undefined, "mc_scene_activity_info");
const mc_scene_activity_model = Backend.model("mc_weapp", undefined, "mc_scene_activity");
const mc_scene_recommend_model = Backend.model("mc_weapp", undefined, "mc_scene_recommend");

module.exports = {
  async getSceneId() {
    let user_id = this.req.identity.userId;
    const cond = {
      userId: user_id,
      isDeleted: false
    }
    const res = await mc_scene_recommend_model.findOne(cond);
    if (!res) return;
    return res.sceneId;
  },
  async getActivitys() {
    const scene_id = await this.getSceneId();
    if (!scene_id) return [];
    const cond = {
      sceneId: scene_id,
      isRelevance: true
    };
    const activity_infos = await mc_scene_activity_info_model.find(cond);
    const activity_ids = activity_infos.map(item => {
      return item.activityId;
    })
    const activitys = await mc_scene_activity_model.find({
      _id: {
        $in: activity_ids
      },
      isShow: true,
      isDeleted: false
    }).sort({
      createdAt: -1
    });
    const res = activitys.map(item => {
      return {
        activity_id: item._id,
        activity_name: item.name,
        recommended_count: item.usedNumber,
        remaining_count: item.applicationsNumber - item.usedNumber,
        end_time: item.abortTime,
        recommended_bonus: item.recommendAwardCash,
        is_expired: Date.now() > item.abortTime,
        is_not_quota: (item.applicationsNumber - item.usedNumber) <= 0
      }
    })
    return res;
  },
  async getAction() {
    const list = await this.getActivitys();
    return this.success({
      code: "200",
      msg: "",
      data: {
        list
      }
    })
  }
}