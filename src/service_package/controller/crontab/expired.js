/**
 * 过期七天的服务包定时脚本
 * 该脚本每天早上七点运行
 * 发现当天已过期七天的服务包，并根据服务包找到用户相关会话，发送指定消息通知用户
 * 0 7  * * * curl http://localhost:9050/1/service_package/crontab/expired
 */
const sp_order_service = Backend.service('service_package', 'order');
const im_group_service = Backend.service('im', 'group');
const sp_group_log_model = Backend.model('service_package', undefined, 'sp_group_log');
const message = '尊敬的会员，本服务已经到期，服务群将于今晚解散，感谢您一直以来的关注和支持。';

module.exports = {
  async getAction() {
    const result = await sp_order_service.getExpireSevenDaysGroups();
    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      const group_id = item.groupId;
      const order_id = item.orderId;
      // 群组发送消息
      const params = await im_group_service.sendMsgByGroup(group_id, message);
      // 添加日志
      await sp_group_log_model.create({
        groupId: group_id,
        servicePackageOrderId: order_id,
        option: '发消息',
        params,
        message
      });
    }
    return this.success({ code: '200', msg: '', data: result });
  }
}