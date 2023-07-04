const advertising_service = Backend.service('applet', 'advertising_service');
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
      const advertisings = yield advertising_service.getAdvertisings();
      res.items = advertisings;
      return self.success(res);
    })
  }
}