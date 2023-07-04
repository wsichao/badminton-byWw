/**
 *
 * 2030健康-推广详情
 *
 */

const user_role_model = Backend.model('mc_weapp', undefined, 'mc_user_role');
const user_service = Backend.service('mc_weapp', 'user');
const order_service = Backend.service('mc_weapp', 'order');
module.exports = {
    __rule: function (valid) {
        return valid.object({
            date: valid.number().required()
        });
    },
  async getAction() {
      let user_id = this.req.identity.userId;
      let date = this.query.date;
     const role = await user_service.getRole(user_id);
      if (!role) {
          return {
              code: '8005',
              msg: '用户不是城市经理'
          }
      }
      let userIds = await user_service.getUserIdsUnderManager(user_id);//获取城市经理所有下线的userid
      let format_date = new Date(date);
      let month = format_date.getMonth() + 1;//获取当前月份
      let previous_month_time = format_date.setMonth(month-2);//设置上个月时间(时间戳)
      let cond = {
        userId: { $in: userIds },
        status: {$gte:200},
        type: 0,
        paidTime: {
            $gte: previous_month_time,
            $lt: date
        },
        isDeleted: false,
      }
      let orders = await order_service.getOrders(cond);
      let info = {
        month_total_num : orders.length,
        lists : orders
      }
      let result = {
          code : '200',
          msg : '',
          data : info
      }
      return this.success(result);
  }
}