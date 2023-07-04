/**
 *
 * 服务评价
 *
 * Created by yichen on 2018/7/25.
 */

'use strict';

const co = require('co');
const service_evaluation_model = Backend.model("service_package", undefined, 'service_evaluation');
module.exports = {
  __beforeAction() {
    this.post.servicePackageOrderId = this.post.servicePackageOrderId || "undefined";
  },
  __rule: function (valid) {
    return valid.object({
      servicePackageOrderId: valid.string(),
      doctorId: valid.string(),
      doctorStarRating: valid.number(),
      doctorEvaluationDesc: valid.string(),


      makeAppointmentOrderId: valid.string(),
      assistantId: valid.string(),
      assistantStarRating: valid.number(),
      assistantEvaluationDesc: valid.string(),
    });
  },
  async postAction() {
    let result = {
      code: '200',
      msg: ''
    }
    let that = this;
    let post = this.post;
    const user_id = this.req.identity.userId;
    if (post.doctorStarRating > 5 || post.doctorStarRating < 1 || post.assistantStarRating > 5 || post.assistantStarRating < 1) {
      return that.fail(8005);
    }
    if (this.post.servicePackageOrderId == "undefined") {
      post.type = 1;
      post.servicePackageOrderId = undefined;
    } else {
      post.type = 0;
    }
    post.userId = user_id;
    await service_evaluation_model.create(that.post);
    return this.success(result);
  }
}