const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');
const mcAccountingService = Backend.service('mc_weapp', 'accounting');
const mcSceneModel = Backend.model("mc_weapp", undefined, "mc_scene");
const mcSceneRecommendModel = Backend.model("mc_weapp", undefined, "mc_scene_recommend");

const mcSuborderService = Backend.service('mc_weapp', 'suborder');
const mcShareService = Backend.service('mc_weapp', 'share');
const mcSceneSuborderModel = Backend.model('mc_weapp', undefined, 'mc_scene_suborder');


module.exports = {
  __rule: function (valid) {
    return valid.object({
      id: valid.string().required(),
      type: valid.number().default(0).empty(0)
    });
  },
  async update(id) {
    const type = this.query.type;
    if (type == 0) {
      await mcSceneOrderModel.update({
        _id: id,
        isDeleted: false,
        status: {$ne: 600}
      }, {
        status: 600,
        endTime: Date.now()
      })
    } else if (type == 1) {
      // 修改子订单状态
      await mcSceneSuborderModel.update({
        _id: id,
        isDeleted: false,
        status: {$in: [200, 500]}
      }, {
        status: 600,
        endTime: Date.now()
      })
    }

  },
  async getRId(id) {
    return (await mcSceneRecommendModel.findOne({
      _id: id
    })).userId;
  },
  async getResult(id) {
    const type = this.query.type;
    if (type == 0) {
      return await mcSceneOrderModel.findOne({
        _id: id,
        isDeleted: false,
        status: {$ne: 600}
      })
    } else if (type == 1) {
      return await mcSceneSuborderModel.findOne({
        _id: id,
        isDeleted: false,
        status: {$in: [200, 500]}
      })
    }
  },
  async getParentOrder(sceneOrderId) {
    return await mcSceneOrderModel.findOne({
      _id: sceneOrderId,
      isDeleted: false
    })
  },
  async getAction() {
    const id = this.query.id;
    const type = this.query.type;
    const result = await this.getResult(id);

    if (result) {
      await this.update(id);
      if (type == 1) {
            //朱李叶精选 分给分发人奖励金
          // 一级 二级分账
          const recomendUserId = await this.getRId(result.shareId);
  
          if (result.recommendPrice > 0) {
            console.log(`一级分账: user:${recomendUserId},${recomendUserId},${result._id}`);
            await mcAccountingService.recommendAward(recomendUserId, result.recommendPrice, result._id);
          }
          if (result.secondRecommendPrice > 0) {
            const u = await mcShareService.getShareGradient(recomendUserId);
            console.log(`二级分账: user:${u.p_user_id},${result.secondRecommendPrice},${result._id}`);
            await mcAccountingService.OrderRecommendSecondAward(u.p_user_id, result.secondRecommendPrice, result._id);
          }
  
          // 给供货商发奖金
          await mcSuborderService.fashionable(id);
      } else {
          //健康优选 全部分给清单人
          const user = await mcSceneModel.findOne({
            _id: result.sceneId
          })
          await mcAccountingService.orderOwnerAward(user.ownerUserId, result.price, result._id)
        
      }
    }
    
    return this.success({
      code: "200",
      msg: ""
    });
  }
}