const mcUserActivityLogModel = Backend.model('mc_weapp', undefined, 'mc_user_activity_log');

module.exports = {
  /**
   * 分享日志记录
   * @param {*} share_user_id 
   * @param {*} scene_id 
   * @param {*} product_id 
   */
  async shareLog(share_user_id, scene_id, product_id) {
    await mcUserActivityLogModel.methods.record(share_user_id, undefined, "share", scene_id, product_id);
  },
  /**
   * 被分享的日志记录
   * @param {*} share_user_id 
   * @param {*} by_share_user_id 
   * @param {*} scene_id 
   * @param {*} product_id 
   */
  async shareClickLog(share_user_id, by_share_user_id, scene_id, product_id) {
    await mcUserActivityLogModel.methods.record(share_user_id, by_share_user_id, "share click", scene_id, product_id);
  }
}