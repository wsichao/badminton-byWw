const member_service = Backend.service('tp_memberships', 'member_service');
const coupon_service = Backend.service('tp_memberships', 'coupon');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      member_service_id: valid.string().required()
    });
  },
  async getAction() {
    const member_service_id = this.query.member_service_id;
    const user_id = this.req.identity.userId;
    const data = await member_service.getService(member_service_id, user_id);
    data.discount_coupon_count = await coupon_service.canUseCouponCount(user_id,member_service_id,data.discount_price);
    return this.success({
      code: '200',
      msg: '',
      data
    });
  }
}