/**
 * 过期七天的服务包定时脚本(删除session)
 * 该脚本每天晚上23:59:59运行
 * 发现当天已过期七天的服务包，并根据服务包找到用户相关会话，解散相关群组
 * 59 23 * * * curl http://localhost:9050/1/service_package/crontab/expired_delsession
 */
const session_service = Backend.service('im', 'session');
const group_service = Backend.service('im', 'group');
const sp_group_log_model = Backend.model('service_package', undefined, 'sp_group_log');
const im_group_ps_ref_model = Backend.model('im', undefined, 'im_group_ps_ref');
const sp_order_service = Backend.service('service_package', 'order');

module.exports = {
  async getAction() {
    const result = await sp_order_service.getExpireSevenDaysGroups();
    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      const group_id = item.groupId;
      const sp_order_id = item.orderId;
      const params = await session_service.delSessionByGroup(group_id);
      // 删除群组关系
      await im_group_ps_ref_model.update({ groupId: group_id }, { isDeleted: true });
      // 删除群组
      await group_service.destroyGroup(group_id);
      // 日志记录
      await sp_group_log_model.create({
        groupId: group_id,
        servicePackageOrderId: sp_order_id,
        option: '删除群组',
        params
      });
    }
    return this.success({ code: '200', msg: '', data: result });
  }
}