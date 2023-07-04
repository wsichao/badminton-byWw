/**
 *
 * 新增健康记录
 *
 *
 * Created by yichen on 2018/7/2.
 */



'user strict';

const order_service = Backend.service('applet','order_service');
const co = require('co');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      service_package_order_id: valid.string().required(),
      check_time: valid.number().required(),
      selected_reservations: valid.array(),
      check_imgs: valid.array(),
    });
  },
  postAction: function () {
    const self = this;
    const post = this.post;
    let user_id = this.req.identity.userId;
    let result = co(function* () {
      return yield order_service.insert_disease_case(user_id,post);
    });
    console.log(result);
    return self.success(result);
  }
}