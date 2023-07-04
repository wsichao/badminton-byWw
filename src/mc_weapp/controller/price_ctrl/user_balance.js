/**
 * 200019 获取用户补助金余额
 */
const boss_wallet_service = Backend.service("mc_weapp", 'boss/wallet');

module.exports = {
  async getAction() {
    const user_id = this.req.identity.userId;
    const res = await boss_wallet_service.apiWalletFind(user_id);
    const balance = res.result.allCash;
    return this.success({
      code: "200",
      msg: "",
      data: {
        balance
      }
    });
  }
}