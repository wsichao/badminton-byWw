const doctor_model = Backend.model("mc_weapp", undefined, 'mc_doctor');
const _ = require('underscore');
module.exports = {
  /**
   * 获取医生详情
   * @param {*} doctorId 
   */
  async getDoctorInfoListMap(doctorIds) {
    const cond = {
      _id: {$in : doctorIds},
      isDeleted: false
    }

    const list = await doctor_model.find(cond);
    return _.indexBy(list, '_id');
  }
}