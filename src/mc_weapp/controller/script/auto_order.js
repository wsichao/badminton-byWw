/**
 * 1. 定时脚本：每天 00 点 00 分开始执行
 * 2. 该脚本处理用户已配送未确认订单，自动更改为已确认
 * 3. 根据当前时间往前推 2 天，一共 2 天内的订单，未确认的修改为已确认。
 * 4. 未确定订单定义：订单状态为400(配送员接单)的订单。
 * 5. 55 23 * * * curl http://localhost:9050/mc_weapp/script/auto_order
 */
const moment = require("moment");
const mcSceneSuborderModel = Backend.model('mc_weapp', undefined, 'mc_scene_suborder');
const mcSceneOrderAutoCompleteModel = Backend.model('mc_weapp', undefined, 'mc_scene_order_auto_complete');
const mcSceneRecommendModel = Backend.model("mc_weapp", undefined, "mc_scene_recommend");
const mcAccountingService = Backend.service('mc_weapp', 'accounting');
const mcSuborderService = Backend.service('mc_weapp', 'suborder');
const mcShareService = Backend.service('mc_weapp', 'share');

module.exports = {
  // 获取待处理订单 id 列表
  async getOrderIds(time) {
    const orders = await mcSceneSuborderModel.find({
      paidTime: {
        $lte: time
      },
      status: {$in: [200, 500]},
      isDeleted: false
    });
    return orders.map(item => {
      return {
        order_id: item._id,
        price: item.price,
        scene_id: item.sceneId,
        shareId: item.shareId
      }
    })
  },
  async getRId(id) {
    return (await mcSceneRecommendModel.findOne({
      _id: id
    })).userId;
  },
  // 修改订单状态
  async updateOrder(order_id, scene_id, price, shareId) {
    await mcSceneSuborderModel.update({
            _id: order_id,
            isDeleted: false,
            status: {$in: [200, 500]}
        }, {
        status: 600,
        endTime: Date.now()
    })

    const result = await mcSceneSuborderModel.findOne({
        _id: order_id,
        isDeleted: false,
        status: 600
    })

    if (result) {
        const recomendUserId = await this.getRId(shareId);

        if (result.recommendPrice > 0) {
          if (recomendUserId) {
            console.log(`一级分账: user:${recomendUserId},${recomendUserId},${result._id}`);
            await mcAccountingService.recommendAward(recomendUserId, result.recommendPrice, result._id);
          }
        }
        if (result.secondRecommendPrice > 0) {
          const u = await mcShareService.getShareGradient(recomendUserId);
          if (u) {
            console.log(`二级分账: user:${u.p_user_id},${result.secondRecommendPrice},${result._id}`);
            await mcAccountingService.OrderRecommendSecondAward(u.p_user_id, result.secondRecommendPrice, result._id);
          }
        }
        // 给供货商发奖金
        await mcSuborderService.fashionable(order_id);
    }

  },
  async log(order_id, current_time, time) {
    await mcSceneOrderAutoCompleteModel.create({
      orderId: order_id,
      autoCompleteTime: current_time,
      time
    })
  },
  // 获取当前日期
  async getCurrentTime() {
    return moment().format("YYYY-MM-DD HH:mm:ss");
  },
  // 获取 2 天前日期
  async getOldTime() {
    const t = moment().subtract(7, 'days').format("YYYY-MM-DD");
    return (new Date(`${t} 00:00:00`)).getTime();
  },
  async getAction() {
    // 1. 获取当天日期 -> 2019-06-24
    const current_time = await this.getCurrentTime();
    // 2. 获取1天前日期 -> 2019-06-19
    const old_time = await this.getOldTime();
    // 3. 查询时间区间 [ < 2019-06-19 00:00:00]
    const order_ids = await this.getOrderIds(old_time);
    // 4. 修改查询到的订单状态，同时添加入日志
    for (let i = 0; i < order_ids.length; i++) {
      let order_id = order_ids[i].order_id;
      let scene_id = order_ids[i].scene_id;
      let  price = order_ids[i].price;
      let shareId = order_ids[i].shareId;
      await this.updateOrder(order_id, scene_id, price, shareId);
      await this.log(order_id, current_time, old_time);
    }
    return this.success({
      order_ids
    })
  }
}