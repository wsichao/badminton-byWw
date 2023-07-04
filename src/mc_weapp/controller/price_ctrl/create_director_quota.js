const accounting_service = Backend.service("mc_weapp", "accounting");
module.exports = {
  async getAction() {
    const user_id = this.req.identity.userId;
    const price = 1000 * 100;
    const user = await accounting_service.getUserAccount(user_id);
    if (user.withdrawal_price < 1000 * 100 && user.grant_price < 1000 * 100) {
      return this.success({
        code: "1000",
        msg: "用户可用额度不够，请提额后再行购买"
      })
    }

    await accounting_service.directorSpending(user_id, price);
    return this.success({
      code: "200",
      msg: ""
    })
  }
}