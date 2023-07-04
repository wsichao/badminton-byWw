/**
 * 用户相关 service 方法
 */

const _ = require('underscore');

module.exports = {
  /**
   * sendMsg 发送消息
   * @param msgData 消息体
   * @param msgType 消息类型 users 用户消息 chatgroups群组消息
   */
  async sendMsg(msgData, msgType) {
    const inUtilService = Backend.service('im', 'util');
    const groupService = Backend.service('im', 'group');
    const groupOrderRefModel = Backend.model('im', undefined, 'im_group_ps_ref');
    const servicePackageModel = require('../../../app/models/service_package/servicePackage');
    const userService = Backend.service('im', 'user');
    let url = '/message/send';
    const user = await userService.getUser([msgData.user_id]);
    const userInfo = user[msgData.user_id];
    if (msgType == 'users') {
      const extArr = [{
        key: 'IMname',
        value: userInfo && userInfo.user_name || ''
      }, {
        key: 'IMavatar',
        value: userInfo && userInfo.avatar && ('https://cdn.juliye.net/' + userInfo.avatar) || ''
      }, {
        key: 'IMuserId',
        value: msgData.user_id
      }];
      msgData.ext_json = extArr;
    } else if (msgType == 'chatgroups') {
      const groupInfo = await groupService.getGroupInfo(msgData.to_user_id);
      const servicePackageRef = await groupOrderRefModel.findOne({
        isDeleted: false,
        groupId: msgData.to_user_id
      });
      const servicePackage = await servicePackageModel.findOne({
        isDeleted: false,
        _id: servicePackageRef.servicePackageId
      });
      const extArr = [{
        key: 'IMGroupId',
        value: msgData.to_user_id
      }, {
        key: 'IMGroupName',
        value: groupInfo.data && groupInfo.data.name || ''
      }, {
        key: 'IMGroupAvatar',
        value: servicePackage && groupInfo.icon || ''
      }, {
        key: 'IMname',
        value: userInfo && userInfo.user_name || ''
      }, {
        key: 'IMavatar',
        value: userInfo && userInfo.avatar && ('https://cdn.juliye.net/' + userInfo.avatar) || ''
      }, {
        key: 'IMuserId',
        value: msgData.user_id
      }];
      msgData.ext_json = extArr;
    }
    const msgResult = await inUtilService.baseRequest(
      url,
      'post',
      msgData
    );
    return msgResult;
  },
  /**
   * 获取聊天记录
   * @param {*} from_user_id 
   * @param {*} to_user_id 
   * @param {*} type 
   * @param {*} args 
   */
  async record(from_user_id, to_user_id, type = 'chat', args) {
    console.log(111)
    const url = '/record/get';
    const data = {
      from_user_id,
      to_user_id,
      type,
      bookmark: args.bookmark,
      page_size: args.page_size
    };
    const inUtilService = Backend.service('im', 'util');
    const result = await inUtilService.baseRequest(url, 'GET', data);
    console.log(result)
    return result;
  },

  /**
   * boss 获取聊天记录
   * @param {*} from_user_id 
   * @param {*} to_user_id 
   * @param {*} type 
   * @param {*} args 
   */
  async boss_record(from_user_id, to_user_id, type = 'chat', args) {
    const url = '/record/boss_get';
    const data = {
      from_user_id,
      to_user_id,
      type,
      page_num: args.page_num,
      page_size: args.page_size
    };
    const inUtilService = Backend.service('im', 'util');
    const result = await inUtilService.baseRequest(url, 'GET', data);
    return result;
  }

}