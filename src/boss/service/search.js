const im_session_service = Backend.service('im', 'session');
const im_msg_service = Backend.service('im', 'message');
const im_group_service = Backend.service('im', 'group');


const user_model = Backend.model('common', undefined, 'customer');
const assistant_model = Backend.model('assistant', undefined, 'service_package_assistant');
const sysuser_model = Backend.model('assistant', undefined, 'sys_user');
const im_group_ps_ref_model = Backend.model('im', undefined, 'im_group_ps_ref');
const _ = require('underscore');

module.exports = {
  /**
   * 查询用户
   * @param {*} user_id 
   * @param {*} assistant_id 
   * @param {*} page_size 
   * @param {*} page_num 
   */
  async searchUser(user_id, assistant_id, page_size, page_num) {
    return await im_session_service.searchSession( user_id, assistant_id, page_size, page_num);
  },
  /**
   * 获取聊天记录
   * @param {*} from_user_id 
   * @param {*} to_user_id 
   * @param {*} type 
   * @param {*} args {page_num,page_size}
   */
  async record(from_user_id, to_user_id, type = 'chat', args) {
    const result = await im_msg_service.boss_record(from_user_id, to_user_id, type, args);
    return result;
  },
  /**
   * 获取群组信息
   * @param {*} group_ids 群组标识
   */
  async searchGroup(group_ids) {
    const result = await im_group_service.getGroupsInfo(group_ids);
    return result;
  }
}