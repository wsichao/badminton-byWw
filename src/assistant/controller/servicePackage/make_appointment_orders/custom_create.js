const co = require('co');
const Joi = require('joi');
const servicePackageOrderUtil = require('./../../../../../app/services/service_package/servicePackageOrderUtil');
const makeAppointmentOrderService = require('./../../../../../app/services/service_package/makeAppointmentOrderService');
const TransactionMysqlService = require('./../../../../../app/services/TransactionMysqlService');

module.exports = {
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required(),
      workTime: valid.string().required(),
      servicePackageOrderId: valid.string().required(),
      address: valid.string().required(),
      secret: valid.string().default('0'),
      items: valid.array().required()
    });
  },
  async postAction() {
    let that = this;
    const user = that.req.identity.user;
    let userId = that.post.user_id;
    let workTime = that.post.workTime;
    let servicePackageOrderId = that.post.servicePackageOrderId;
    let address = that.post.address;
    let secret = that.post.secret || '0';
    let items = that.post.items;
    let instructions = that.post.instructions;
    let checklist_imgs = that.post.checklist_imgs;
    if (items) {
      try {
        items = eval(items);
      } catch (e) {
        console.log(e)
      }
    }
    if (checklist_imgs) {
      try {
        checklist_imgs = eval(checklist_imgs);
      } catch (e) {
        console.log(e)
      }
    }

    let resultObj;
    let result = { data: { secret: secret } };

    let dt = await makeAppointmentOrderService
      .createOrder(userId,
        servicePackageOrderId,
        workTime,
        address,
        that.req,
        items,
        instructions,
        checklist_imgs,
        user.userName);

    resultObj = {
      code: '200',
      msg: '',
      data: {}
    };
    resultObj.data = dt;
    resultObj.data.secret = secret;
    let _account = await TransactionMysqlService.getAccountByUserIdAndDoctorId(userId + '');
    resultObj.data.amount = Math.floor(_account.amount * 100) / 100;
    console.log('创建订单的返回值', result);
    // 如果是金牌会员产后复查，发送短信通知
    await Backend.service('applet', 'send_msg').makeAnAppointmentNotice(servicePackageOrderId, userId, workTime, items);
    return that.success(resultObj);

  }
}