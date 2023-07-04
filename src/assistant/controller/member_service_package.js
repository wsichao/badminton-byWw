/**
 *
 * api 10072 助理-会员 查询会员购买过服务包
 *
 * Created by yichen on 2018/7/3.
 */


'user strict';
const order_service = Backend.service('assistant','order');

const co = require('co');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required()
    });
  },
  getAction: function () {
    const self = this;
    const query = this.query;
    let user_id = this.req.identity.userId;
    let result = co(function* () {
      console.log(query);
      return yield order_service.get_service_package(query.user_id,query.type);
    });
    console.log(result);
    return self.success(result);
  }
}
