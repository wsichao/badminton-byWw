const orderService = Backend.service('mc_weapp', 'order');
const pre_order_service = Backend.service('mc_weapp', 'pre_order');
const _ = require('underscore');


module.exports = {
  async getAction() {
    let that = this;
    let user_id = this.req.identity.userId;
    let result = await orderService.get_home_page_order_list(user_id);
    let preOrders = await pre_order_service.get_order_list(user_id);
    let orderItems = result.items;
    orderItems = orderItems.concat(preOrders);
    orderItems = _.sortBy(orderItems,function(item){
        return -item.created_at;
    });
    result.items = orderItems;
    return this.success(result);
  }
}