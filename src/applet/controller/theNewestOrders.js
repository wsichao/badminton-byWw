/**
 * 最新的十条服务成交记录
 */
const advertising_service = Backend.service('applet', 'advertising_service');
const ServicePackageServiceOrder = require('../../../app/services/service_package/servicePackageOrderService');
const co = require('co');
module.exports = {
  getAction: function () {
    const self = this;
    const res = {
      code: '200',
      msg: '',
      items: []
    };
    return co(function* () {
      const orders = yield ServicePackageServiceOrder.getTheNewestOrders();
      res.items = orders.map(order => {
        return {
          createdAt: order.paidTime,
          // userName: order.userName || '',
          phoneNum: order.userPhoneNum.replace(/(\w{3})(\w*)(\w{3})/, '$1*****$3'),
          hospital: order.doctorHospital || '',
          servicePackageName: order.servicePackageName || ''
        }
      });
      return self.success(res);
    })
  }
}