/**
 * 1. 定时脚本：每天 23 点 55 分开始执行
 * 2. 该脚本处理用户已配送未确认订单，自动更改为已确认
 * 3. 根据当前时间往前推 6 天，一共 7 天内的订单，未确认的修改为已确认。
 * 4. 未确定订单定义：订单状态为400(配送员接单)的订单。
 * 5. 55 23 * * * curl http://localhost:9050/mc_weapp/script/auto_order_success
 */
const moment = require("moment");
const mcSceneOrderModel = Backend.model('mc_weapp', undefined, 'mc_scene_order');
const mcSceneOrderAutoCompleteModel = Backend.model('mc_weapp', undefined, 'mc_scene_order_auto_complete');
const accounting_service = Backend.service("mc_weapp", "accounting");
const mcSceneModel = Backend.model("mc_weapp", undefined, "mc_scene");

module.exports = {
  // 获取待处理订单 id 列表
  async getOrderIds(time) {
    const orders = await mcSceneOrderModel.find({
      paidTime: {
        $lte: time
      },
      status: 400,
      type: 0,
      isDeleted: false
    });
    return orders.map(item => {
      return {
        order_id: item._id,
        price: item.price,
        scene_id: item.sceneId
      }
    })
  },
  // 修改订单状态
  async updateOrder(order_id, scene_id, price) {
    await mcSceneOrderModel.update({
      _id: order_id
    }, {
      status: 600,
      endTime: Date.now()
    })
    //给商家分钱
    const user = await mcSceneModel.findOne({_id: scene_id})
    await accounting_service.orderOwnerAward(user.ownerUserId, price, order_id)
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
  // 获取 6 天前日期
  async getOldTime() {
    const t = moment().subtract(5, 'days').format("YYYY-MM-DD");
    return (new Date(`${t} 00:00:00`)).getTime();
  },
  async getAction() {
    // 1. 获取当天日期 -> 2019-06-24
    const current_time = await this.getCurrentTime();
    // 2. 获取6天前日期 -> 2019-06-19
    const old_time = await this.getOldTime();
    // 3. 查询时间区间 [ < 2019-06-19 00:00:00]
    const order_ids = await this.getOrderIds(old_time);
    // 4. 修改查询到的订单状态，同时添加入日志
    for (let i = 0; i < order_ids.length; i++) {
      let order_id = order_ids[i].order_id;
      let scene_id = order_ids[i].scene_id;
      let  price = order_ids[i].price;
      await this.updateOrder(order_id, scene_id, price);
      await this.log(order_id, current_time, old_time);
    }
    return this.success({
      order_ids
    })
  }
}