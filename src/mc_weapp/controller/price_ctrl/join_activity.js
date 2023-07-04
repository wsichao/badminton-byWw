const mc_activity_signup_model = Backend.model("mc_weapp", undefined, "mc_activity_signup");
const mc_userinfo_model = Backend.model("mc_weapp", undefined, "mc_user_info");
const mc_activity = Backend.model("mc_weapp", undefined, "mc_activity");
const service = Backend.service('mc_weapp', 'price_ctrl_order');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      activity_id: valid.string().required(),
      share_id: valid.string().empty(""),
      name: valid.string().required(),
      phone: valid.string().required(),
      openid: valid.string().empty(""),
    });
  },
  async joinActovity(activity_id, user_id, share_id) {
    const cond = {
      isDeleted: false
    };
    if (activity_id.length == 24) {
      cond._id = activity_id;
    } else {
      cond.incremenId = activity_id;
    }
    const activity = await mc_activity.findOne(cond);
    if (!activity) return;

    await mc_activity_signup_model.create({
      userId: user_id,
      mcActivityId: activity._id,
      shareId: share_id
    });
    return activity;
  },
  async updateUserInfo(user_id, name, phone) {
    await mc_userinfo_model.update({
      userId: user_id,
      isDeleted: false
    }, {
      "consultingObj.name": name,
      "consultingObj.phoneNum": phone
    })
  },
  async postAction() {
    const user_id = this.req.identity.userId;
    const post = this.post;
    const activity_id = post.activity_id;
    const share_id = post.share_id;
    const name = post.name;
    const phone = post.phone;

    const activity = await this.joinActovity(activity_id, user_id, share_id);
    const price = activity.price || 0;
    await this.updateUserInfo(user_id, name, phone);

    if (post.openid && activity.price != 0) {
      // 开始微信支付
      let result = await service.createActivityOrder(user_id, post.openid, this.req, price, activity_id);
      let data = {};
      data.order_id = result.orderId;
      data.wx_order_id = result.wxOrderId;
      data.wx_time_stamp = result.wxTimeStamp;
      data.price = result.price;
      data.order_desc = result.name;

      return this.success({
        code: "200",
        msg: "",
        data
      });
    }


    return this.success({
      code: "200",
      msg: ""
    })
  }
}