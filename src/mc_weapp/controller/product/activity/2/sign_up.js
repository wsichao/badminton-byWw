const mc_scene_activity_data_model = Backend.model("mc_weapp", undefined, "mc_scene_activity_data");
const mc_scene_activity_model = Backend.model("mc_weapp", undefined, "mc_scene_activity");
const userMode = Backend.model('common', undefined, 'customer');


module.exports = {
  __rule: function (valid) {
    return valid.object({
      activity_id: valid.string().required(),
      recommended_user_id: valid.string().required(),
      user_id: valid.string().required(),
      diseases: valid.string().empty(""),
      services: valid.string().empty(""),
      name: valid.string().empty(""),
      phone: valid.string().empty(""),
    });
  },
  async check() {
    const activity_id = this.post.activity_id;
    const user_id = this.post.user_id;
    const recommended_user_id = this.post.recommended_user_id;

    const activity = await mc_scene_activity_model.findOne({
      _id: activity_id,
      isDeleted: false
    });

    if (!activity) {
      return "该活动不存在!";
    }

    if (activity.applicationsNumber == activity.usedNumber) {
      return "该活动名额已用完";
    }

    const a_data_count = await mc_scene_activity_data_model.count({
      activityId: activity_id,
      userId: user_id,
      isDeleted: false
    })

    if (a_data_count > 0) return "您已经参与过该活动";

    const user = await userMode.findOne({
      _id: user_id,
      isDeleted: false
    }, "phoneNum")
    if (!user) return "该用户不存在";
    const re_user = await userMode.findOne({
      _id: recommended_user_id,
      isDeleted: false
    }, "phoneNum")

    if (!re_user) return "推广用户不存在";

    return {
      activity,
      user,
      re_user
    }
  },
  async save() {
    const post = this.post;
    const activity_id = post.activity_id;
    const user_id = post.user_id;
    const recommended_user_id = post.recommended_user_id;
    const diseases = post.diseases;
    const services = post.services;
    const name = post.name;
    const phone = post.phone;
    const data = {
      diseases,
      services,
      name,
      phone
    }
    await mc_scene_activity_data_model.create({
      activityId: activity_id,
      userId: user_id,
      status: 0,
      recommendId: recommended_user_id,
      data
    })
    await mc_scene_activity_model.update({
      _id: activity_id
    }, {
      $inc: {
        usedNumber: 1
      }
    })

  },
  async postAction() {
    const res = await this.check();
    let code = '200';
    let msg = '';
    if (typeof res == 'string') {
      code = '1000';
      msg = res;
    } else {
      await this.save();
    }
    const post = this.post;
    return this.success({
      code,
      msg
    });
  }
}