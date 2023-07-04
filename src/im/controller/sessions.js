/**
 *
 * api 10081 会话列表
 *
 * Created by yichen on 2018/8/3.
 */

module.exports = {
  /**
   * @param user_id
   */
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required()
    });
  },
  async getAction() {
    let that = this;
    //请求baas
    const imUtilService = Backend.service('im', 'util');
    const sessionsResult = await imUtilService.baseRequest('/session/list', 'get', {
      user_id: this.query.user_id,
    });
    if (!sessionsResult || sessionsResult.errno) {
      return this.fail(8005)
    }
    let result = {
      "code": "200",
      "msg": "",
      "items": []
    }
    //获取userIds and groups
    let userIds = [this.query.from_user_id];
    let groupIds = [];
    sessionsResult.data.forEach((item) => {
      userIds.push(item.from.user_id);
      if (item.to.user_id) {
        userIds.push(item.to.user_id);
      }
      if (item.last_record && item.last_record.from && item.last_record.from.user_id) {
        userIds.push(item.last_record.from.user_id);
      }
      if (item.chat_type === 'chatgroup') {
        groupIds.push(item.group.group_id)
      }
    })
    //查询user 和 group
    const _ = require('underscore');
    userIds = _.uniq(userIds);
    groupIds = _.uniq(groupIds);

    const sessionService = Backend.service('im','session');
    const allResult = await sessionService.getSessionInfo(userIds,groupIds);
    const groupOrderRefIndex = allResult[0];
    const userIndex = allResult[1];
    //组装数据
    sessionsResult.data.forEach((item) => {
      let itemUserName = '';
      let itemuserAvatar = '';
      if(item.chat_type === 'chat'){
        itemUserName = userIndex[item.to.user_id].user_name || '';
        itemuserAvatar = userIndex[item.to.user_id].avatar || '';
      }else if(item.chat_type === 'chatgroup'){
        itemUserName = item.group.name;
        itemuserAvatar = groupOrderRefIndex[item.group.group_id] 
        && groupOrderRefIndex[item.group.group_id].icon || '';
      }
      let resultItem = {
        "service_package_order": {
          "order_id": groupOrderRefIndex[item.group.group_id] && groupOrderRefIndex[item.group.group_id].servicePackageOrderId || '', 
          "name":groupOrderRefIndex[item.group.group_id] && groupOrderRefIndex[item.group.group_id].name || '',
          "validity_time": groupOrderRefIndex[item.group.group_id] && groupOrderRefIndex[item.group.group_id].validity_time || null
        },
        "session_id": item.session_id,
        "user": {
          "user_id": item.to.user_id || '',
          "im_id": item.chat_type === 'chat'? item.to.im_id : item.group.group_id,
          "user_name": itemUserName,
          "avatar": itemuserAvatar
        },
        "chat": {
          "from": {
            "user_id": item.last_record.from.user_id,
            "im_id": item.last_record.from.im_id,
            "user_name": item.last_record.from.user_id ? userIndex[item.last_record.from.user_id].user_name : '',
            "avatar": item.last_record.from.user_id ? userIndex[item.last_record.from.user_id].avatar : ''
          },
          "to": {
            "user_id": item.last_record.to.user_id,
            "im_id": item.last_record.to.im_id,
            "user_name": item.last_record.to.user_id ? userIndex[item.last_record.to.user_id].user_name : '',
            "avatar": item.last_record.to.user_id ? userIndex[item.last_record.to.user_id].avatar : ''
          },
          "msg_id": item.last_record.msg_id,
          "timestamp": item.last_record.send_chat_time ? new Date(item.last_record.send_chat_time).getTime() : 0,
          "direction": "",
          "chat_type": item.chat_type,
          "payload": item.last_record.payload || {}
        }

      }
      result.items.push(resultItem);
    })
    return this.success(result)
  }
}