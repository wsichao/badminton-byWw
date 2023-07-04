/**
 * Created by yichen on 2018/8/21.
 */
'use strict';
module.exports = {
  __beforeAction() {
    this.post.choose_reasons = this.post.choose_reasons || [];
    this.post.understand_channels = this.post.understand_channels || [];
  },
  __rule: function (valid) {
    return valid.object({
      assistant_id: valid.string().required(),
      common_used_patient_id: valid.string().required(),
      orderId: valid.string().required(),
      is_new_patient: valid.string().required(),
      choose_reasons: valid.array(),
      understand_channels: valid.array()
    });
  },
  async postAction() {
    const that = this;
    const order_service = Backend.service('applet', 'order_service');
    let userId = this.req.identity.userId;
    const result = await order_service.insert_patient_info(userId,this.post);
    return this.success(result);
  }
}