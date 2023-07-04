const accounting_service = Backend.service("mc_weapp", 'accounting');

module.exports = {
  async insertLoginUser(user_id) {
    // 当前用户首次登录 奖励金
    await accounting_service.recordUserAccount(user_id, 600 * 100, 0);
  },
  async insertShareUser(user_id) {
    // 当前用户分享人+100
    await accounting_service.recordUserAccount(user_id, 100 * 100, 1);
  },
  async insertPShsre(user_id, price) {
    if (!user_id) return;
    price = price * 0.1 * 100;
    await accounting_service.recordUserAccount(user_id, price, 2);
  },
  async insertDirector(user_id, price) {
    if (!user_id) return;
    price = price * 0.04 * 100;
    await accounting_service.recordUserAccount(user_id, price, 3);
  }
}