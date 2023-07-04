/**
 *
 * 创建服务包订单
 *
 *
 * Created by yichen on 2018/7/4.
 */


'user strict';

const order_service = Backend.service('assistant','order');
const co = require('co');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      servicePackageDoctorRefId: valid.string().required(),
      doctorId: valid.string().required(),
      userId : valid.string().required()
    });
  },
  postAction: function () {
    const self = this;
    const post = this.post;
    let assistant_id = this.req.identity.userId
    let result = co(function* () {
      return yield order_service.insert_service_package_order_assistant(assistant_id,post,self.req);
    });
    console.log(result);
    return self.success(result);
  }
}

