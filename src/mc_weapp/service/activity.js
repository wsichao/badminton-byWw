const invitation_service = Backend.service("mc_weapp", "invitation");
const mc_activity_model = Backend.model("mc_weapp", undefined, "mc_activity");
const mc_activity_signup_model = Backend.model("mc_weapp", undefined, "mc_activity_signup");
const _ = require("underscore");
const moment = require('moment');

module.exports = {
  /**
   * 
   * @param {*} user_id 用户唯一标识
   * @param {*} title_sub 副标题
   */
  async createInvitation(user_id, activity_id, title_sub) {
    const res = await invitation_service.create(user_id, activity_id, title_sub);
    return res;
  },
  /**
   * 活动列表
   * @param {*} user_id 用户唯一标识
   */
  async getList() {
    const str = moment(Date.now()).format("YYYY-MM-DD") + ' 00:00:00'
    const now_date = (new Date(str)).getTime()
    const cond = {
      isDeleted: false,
      conductTime: {
        $gt: now_date
      }
    }
    const res = await mc_activity_model.find(cond).sort({
      conductTime: 1
    });
    return res;
  },
  async getActivity(activity_id) {
    let cond = {
      isDeleted: false
    };
    if (activity_id.length == 24) {
      cond._id = activity_id;
    } else {
      cond.incremenId = activity_id;
    }
    return mc_activity_model.findOne(cond)
  },
  /**
   * 获取用户参加的活动列表
   * @param {*} user_id 
   */
  async getUserSignup(user_id) {
    const cond = {
      userId: user_id,
      isDeleted: false
    }
    const list = await mc_activity_signup_model.find(cond);
    return _.indexBy(list, "mcActivityId");
  }
}