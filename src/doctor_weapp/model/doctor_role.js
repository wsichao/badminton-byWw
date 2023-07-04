/**
 * 朱李叶健康 医生端小程序 医生关联信息表
 */
"use strict";
module.exports = {
  config: {
    userId: Backend.Schema.Types.ObjectId,
    mcDoctorId : Backend.Schema.Types.ObjectId, // 2030 小程序 医生id
    servicePackageDoctorId : Backend.Schema.Types.ObjectId, //服务包 医生 id
  }, options: {
    collection: 'doctorRole'
  }
}