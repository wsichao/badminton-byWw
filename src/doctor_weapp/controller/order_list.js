
const member_service = Backend.service('doctor_weapp','member');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      page_size: valid.number(),
      page_num: valid.number(),
    });
  },
  async getAction() {
    const self = this;
    const query = this.req.query;
    const user_id = this.req.identity.userId;
    let page_size = query.page_size || 20;
    let page_num = query.page_num || 0;
    const result = await member_service.searchOrders(user_id,page_size,page_num);
    return self.success(result);
  }
}