const mc_scene_activity_info_model = Backend.model("mc_weapp", undefined, "mc_scene_activity_info");
const mc_scene_activity_model = Backend.model("mc_weapp", undefined, "mc_scene_activity");
const mc_scene_recommend_model = Backend.model("mc_weapp", undefined, "mc_scene_recommend");
const mc_scene_activity_data_model = Backend.model("mc_weapp", undefined, "mc_scene_activity_data");
const mc_scene_user_info_model = Backend.model("mc_weapp", undefined, "mc_user_info");
const _ = require("underscore");

module.exports = {
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required()
    });
  },
  async getUserId(user_id) {
    const user_info = await mc_scene_user_info_model.findOne({
      preRefUserId: user_id,
      isDeleted: false
    })
    if (!user_info) return user_id;
    return user_info.userId;
  },
  async getSceneId() {
    let user_id = this.query.user_id;
    user_id = await this.getUserId(user_id);
    const cond = {
      userId: user_id,
      isDeleted: false
    }
    const res = await mc_scene_recommend_model.findOne(cond);
    if (!res) return;
    return res.sceneId;
  },
  async getActivitysData(activity_ids) {
    let user_id = this.req.identity.userId;
    const res = await mc_scene_activity_data_model.find({
      userId: user_id,
      activityId: {
        $in: activity_ids
      },
      isDeleted: false,
    });
    return _.indexBy(res, "activityId");
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
    const activitysDataMap = await this.getActivitysData(activitys);

    const res = activitys.map(item => {
      let status = -1;
      if (activitysDataMap[item._id]) {
        status = activitysDataMap[item._id].status
      }
      return {
        activity_id: item._id,
        activity_name: item.name,
        recommended_count: item.usedNumber,
        remaining_count: item.applicationsNumber - item.usedNumber,
        end_time: item.abortTime,
        amount: item.userAwardCash,
        url: item.activityUrl,
        status,
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