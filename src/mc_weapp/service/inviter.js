const user_service = Backend.service('mc_weapp', 'user');
const community_amount_price_service = Backend.service('mc_weapp', 'community_amount_price');
const share_service = Backend.service('mc_weapp', 'share');

module.exports = {
  async join(inviter_id, user_id) {
    if (!inviter_id) return;
    if (inviter_id != user_id) { //本人不可扫码
      let user_role = await user_service.getRole(user_id); //城市经理不可作为扫码者
      if (!user_role) {
        let user_ref = await user_service.searchUserRef(user_id);
        if (!user_ref) {
          await user_service.buildUserRef(user_id, inviter_id);
          await community_amount_price_service.insertShareUser(inviter_id);
        }
      }
    }
    await share_service.setVolunteers(user_id, inviter_id);
  }
}