const co = require('co');
const makeAppointmentOrderService = require('./../../../../app/services/service_package/makeAppointmentOrderService')


module.exports = {
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required(),
      avatar: valid.string()
    });
  },
  getAction() {
    let that = this;
    const user_id = that.query.user_id;
    const servicePackageOrderId = that.query.servicePackageOrderId;

    return co(function* () {
      let result = yield makeAppointmentOrderService.findAll(user_id, undefined, undefined, undefined, servicePackageOrderId);
      return that.success({
        code: '200',
        msg: '',
        items: result
      });
    }).catch(function (e) {
      console.log(e)
      return that.success({
        code: '1000',
        msg: '系统错误，获取服务包信息失败！'
      })
    });
  }
}