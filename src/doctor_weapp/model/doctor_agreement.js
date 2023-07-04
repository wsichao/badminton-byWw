/**
 * 医生端  用户协议记录
 */
"use strict";
module.exports = {
  config: {
    userId: Backend.Schema.Types.ObjectId,
    isAgreed: {
      type: Boolean,
      default: true
    }
  },
  options: {
    collection: 'doctorAgreement'
  }
}