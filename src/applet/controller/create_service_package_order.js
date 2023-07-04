/**
 *
 * 小程序购买医生下单
 *
 *
 * Created by yichen on 2018/7/3.
 */

'user strict';

const order_service = Backend.service('applet','order_service');
const co = require('co');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      openid: valid.string().required(),
      servicePackageDoctorRefId: valid.string().required(),
      doctorId: valid.string().required()
    });
  },
  postAction: function () {
    const self = this;
    const post = this.post;
    let user_id = this.req.identity.userId
    let result = co(function* () {
      return yield order_service.insert_service_package_order(user_id,post,self.req);
    });
    return self.success(result);
  }
}
