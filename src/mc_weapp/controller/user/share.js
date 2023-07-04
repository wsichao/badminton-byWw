/**
 *
 * 2030健康-爱心分享
 *
 */

const user_role_model = Backend.model('mc_weapp', undefined, 'mc_user_role');
const user_service = Backend.service('mc_weapp', 'user');
const order_service = Backend.service('mc_weapp', 'order');
module.exports = {
  async getAction() {
    let user_id = this.req.identity.userId;
    let userIds = await user_service.getUserId(user_id);
    let cond = {
      userId: { $in: userIds },
      status: { $gte: 200 },
      type: 0,
      isDeleted: false,
    }
    let orders = await order_service.getOrders(cond);
    let user_info = await user_service.userInfoExist(user_id);
    let info = {
      user_id: user_id,
      qr_code: user_info.qcode,
      deliver_num: orders.length,
      orders: orders
    }
    let result = {
      code: '200',
      msg: '',
      data: info
    }
    return this.success(result);
  }
}