/**
 *
 * api 10094 添加好友
 *
 * Created by yichen on 2018/8/3.
 */

module.exports = {
  /**
   * @param from_user_id
   * @param to_user_id
   */
  __rule: function (valid) {
    return valid.object({
      from_user_id: valid.string().required(),
      to_user_id: valid.string().required(),
    });
  },
  async postAction() {
    let that = this;
    const imUtilService = Backend.service('im', 'util');
    const userIds = [this.post.from_user_id,this.post.to_user_id];
    const userResult = await imUtilService.baseRequest('/user/create', 'post', {
      user_ids: userIds,
    });
    const recordResult = await imUtilService.baseRequest('/user/add_friend', 'post', {
      user_id: this.post.from_user_id,
      friend_user_id: this.post.to_user_id,
    });
    if (!recordResult || recordResult.errno) {
      if (recordResult.errno === 1000 ) {
        return that.success({ code: 1000, msg: '好友关系已存在' })
      }
      return this.fail(8005)
    }
    let restult = {
      code: "200",
      msg: ''
    };
    return this.success(restult)
  }
}