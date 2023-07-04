const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');
const mcSceneErrandModel = Backend.model('mc_weapp', undefined, 'mc_scene_errand');
const userMode = Backend.model('common', undefined, 'customer');

const commonUtil = require('./../../../../lib/common-util');
const mcSceneRecommendModel = Backend.model("mc_weapp", undefined, "mc_scene_recommend");
const mcAccountingService = Backend.service('mc_weapp', 'accounting');
const mcSceneModel = Backend.model("mc_weapp", undefined, "mc_scene");

module.exports = {
  __rule: function (valid) {
    return valid.object({
      id: valid.string().required()
    });
  },
  async user(user_id) {
    return await userMode.findOne({
      _id: user_id
    }, "phoneNum")
  },
  async check(id) {
    const count = await mcSceneOrderModel.count({
      _id: id,
      isDeleted: false,
      status: 400
    });
    return count > 0;
  },
  async update(id) {
    await mcSceneOrderModel.update({
      _id: id,
      isDeleted: false,
      status: 200
    }, {
      status: 400
    })
  },
  async sendMsg(id) {
    const order = await mcSceneOrderModel.findOne({
      _id: id
    });
    const scene_errand_id = order.sceneErrandId;
    const errand = await mcSceneErrandModel.findOne({
      _id: scene_errand_id
    });
    const phone = errand.phone;
    const name = errand.name;
    const u = await this.user(order.userId);
    console.log(`3151756: phone:${u.phoneNum} #name#=${name}&#phone#=${phone}`);
    commonUtil.sendSms("3151756", u.phoneNum, `#name#=${name}&#phone#=${phone}`);
  },
  async getAction() {
    const id = this.query.id;
    const flag = await this.check(id);
    if (flag) {
      return this.success({
        code: "1000",
        msg: "不能重复接单"
      });
    }
    await this.update(id);
    await this.sendMsg(id);

    //业务需要新加的逻辑 用来解决确认接单后就收款
    await mcSceneOrderModel.update({
      _id: id,
      isDeleted: false,
      status: 400
    }, {
      status: 600,
      endTime: Date.now()
    })

    const result = await mcSceneOrderModel.findOne({
      _id: id,
      isDeleted: false
    })
    if (result.type == 1) {
      //朱李叶精选 分给分发人奖励金
      if (result.recommendPrice > 0) {
        const user = await mcSceneRecommendModel.findOne({_id: result.shareId})
        await mcAccountingService.recommendAward(user.userId, result.recommendPrice, result._id)
      }
    }else{
      //健康优选 全部分给清单人
      const user = await mcSceneModel.findOne({_id: result.sceneId})
      await mcAccountingService.orderOwnerAward(user.ownerUserId, result.price, result._id)
    }
    return this.success({
      code: "200",
      msg: ""
    });
  }
}