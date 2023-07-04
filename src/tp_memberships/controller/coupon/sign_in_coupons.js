// 10118 注册赠送的会员卡列表

const couponService = Backend.service('tp_memberships', 'coupon');
module.exports = {
  async getAction() {
    const user_id = this.req.query.user_id;
    let results = await couponService.signInCoupons(user_id);
    return this.success({
      code: '200',
      msg: '',
      items:results
    }) 
  }
}