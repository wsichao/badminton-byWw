/**
 *
 * 支付完成之后补充信息
 *
 * Created by yichen on 2018/7/2.
 */


'user strict';

const order_service = Backend.service('applet', 'order_service');
const co = require('co');
module.exports = {
  __beforeAction() {
    this.post.choose_reasons = this.post.choose_reasons || [];
    this.post.understand_channels = this.post.understand_channels || [];
  },
  __rule: function (valid) {
    return valid.object({
      name: valid.string().required(),
      sex: valid.string().required(),
      birth: valid.number().required(),
      phone_num: valid.string().required(),
      orderId: valid.string().required(),
      choose_reasons: valid.array(),
      understand_channels: valid.array()
    });
  },
  postAction: function () {
    const self = this;
    const post = this.post;
    let user_id = this.req.identity.userId
    let result = co(function* () {
      //todo: sms_template
      let result = yield order_service.insert_patient_info(user_id, post);
      return result;
    });
    return self.success(result);
  }
}