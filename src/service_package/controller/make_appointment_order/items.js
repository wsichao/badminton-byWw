const co = require('co');
const service = Backend.service('service_package', 'make_appointment_orderItems_dict');
module.exports = {
  getAction() {
    let that = this;
    return co(function* () {
      let result = yield service.getItems();
      return that.success({
        code: '200',
        msg: '',
        items: result
      });
    }).catch(function (e) {
      console.log(e);
      return that.success({
        code: '1000',
        msg: '获取数据失败'
      })
    })
  }
}