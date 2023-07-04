/**
 *
 * 医生评价
 *
 * Created by yichen on 2018/7/25.
 */


"use strict";

module.exports = {
  config: {
    servicePackageOrderId: String, // 服务包订单id
    makeAppointmentOrderId: String, //预约订单id
    userId: Backend.Schema.Types.ObjectId, // 评价人id

    doctorId: Backend.Schema.Types.ObjectId, //医生id
    doctorStarRating: Number, //医生评价星级
    doctorEvaluationDesc: String, //医生评价详情

    assistantId: Backend.Schema.Types.ObjectId, //助理id
    assistantStarRating: Number, //助理评价星级
    assistantEvaluationDesc: String, //助理评价详情

    type: {
      type: Number,
      default: 0
    },
    
    isShow: {
      type: Boolean,
      default: false
    }
  },
  options: {
    collection: 'serviceEvaluation'
  }
};