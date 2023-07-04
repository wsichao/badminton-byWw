/**
 *
 * api 10080 消息记录
 *
 * Created by yichen on 2018/8/3.
 */

module.exports = {
  /**
   * @param from_user_id
   * @param to_user_id
   * @param type
   */
  __rule: function (valid) {
    return valid.object({
      from_user_id: valid.string().required(),
      to_user_id: valid.string().required(),
      type: valid.string(),
    });
  },
  async getAction() {
    let that = this;
    const imUtilService = Backend.service('im', 'util');
    this.query.type = this.query.type || 'chat'
    const recordResult = await imUtilService.baseRequest('/record/get', 'get', {
      from_user_id: this.query.from_user_id,
      to_user_id: this.query.to_user_id,
      type: this.query.type == 'chat' ? this.query.type :'chatgroup',
      bookmark: this.query.timestamp || Date.now(),
      page_size: this.query.pageSize || 20
    });
    if (!recordResult || recordResult.errno) {
      return this.fail(8005)
    }
    const imUserService = Backend.service('im', 'user');
    let userIds = [this.query.from_user_id];
    if (!this.query.type || this.query.type == 'chat') {
      userIds.push(this.query.to_user_id);
    }
    userIndex = await imUserService.getUser(userIds);
    let restult = {
      code: "200",
      msg: '',
      items: []
    };
    recordResult.data.records.forEach((item) => {
      let resItem = {
        "from": {
          "user_id": item.from.user_id,
          "im_id": item.from.im_id,
          "user_name": userIndex[item.from.user_id].user_name,
          "avatar": userIndex[item.from.user_id].avatar
        },
        "to": {
          "user_id": item.to.user_id,
          "im_id": item.to.im_id,
          "user_name":item.to.user_id ? userIndex[item.to.user_id].user_name : '',
          "avatar":item.to.user_id ? userIndex[item.to.user_id].avatar : ''
        },
        "msg_id": item.msg_id,
        "timestamp": new Date(item.send_chat_time).getTime(),
        "direction": "mock",
        "chat_type": item.type == 'chatgroup' ? 'groupchat' : item.type,
        "payload": item.payload
      }
      restult.items.push(resItem);
    })
    return this.success(restult)
  }
}