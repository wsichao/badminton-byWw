const makeAppointmentOrderService = require('./../../../../app/services/service_package/makeAppointmentOrderService');
const ServicePackageDoctorAssistantRefService = require('./../../../../app/services/service_package/servicePackageDoctorAssistantRefService');
const sys_user_service = Backend.service('assistant', 'user');

const co = require('co');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      orderId: valid.string().required(),
      items: valid.array().required(),
      checklist_imgs: valid.array(),
      workTime: valid.number(),
      status: valid.number(),
      address: valid.string()
    });
  },
  postAction() {
    
    let that = this;
    return co(function* () {
      const orderId = that.post.orderId;
      const items = that.post.items;
      const instructions = that.post.instructions;
      const checklist_imgs = that.post.checklist_imgs;
      const status = that.post.status;
      const orderTime = that.post.workTime;
      const address = that.post.address;
      const userId = that.req.headers['x-docchat-user-id'];
      const from = that.req.headers['x-docchat-app-type'] || '';
      let updateUserId = '';
      // 获取老订单信息
      const fields = 'userPhoneNum userName orderTime status items';
      let order = yield makeAppointmentOrderService.findAppointmentOrderByOrderId(orderId, fields);
      if(from == 'assistant'){
        let assistant = yield sys_user_service.getUserByUserId(userId, 'assistantId');
        updateUserId = assistant.assistantId;
      }


      let result = yield makeAppointmentOrderService.updateOrder(orderId,
        items,
        instructions,
        checklist_imgs,
        orderTime,
        status,
        address,
        updateUserId);

      // 若取消订单，给用户发送通知
      if (Number(status) === 300) {
        if ((order.status !== 300) && order.userPhoneNum) {
          ServicePackageDoctorAssistantRefService.sendMACancelSmsNew(order.userPhoneNum, order.orderTime, order.userName, order.items);
        }
      }
      return that.success({ code: '200', msg: '修改预约服务订单成功！' })
    }).catch(function (e) {
      console.log(e);
      return that.success({
        code: 1000,
        msg: '修改预约服务订单失败！'
      })
    })
  }
}