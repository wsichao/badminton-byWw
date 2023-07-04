/**
 * 专属会员服务订单创建
 */

const service = Backend.service('mc_weapp', 'order');

module.exports = {
  __rule: function (valid) {
    return valid.object({
        openid: valid.string(),
        doctor_id: valid.string(),
        order_id: valid.string().required()
    });
  },
  async postAction() {
    const self = this;
    const post = this.post;
    let user_id = this.req.identity.userId;
    let result = await service.create_service_order(user_id,post.doctor_id,post.order_id,post.openid,self.req);
    return self.success(result);
  }
}