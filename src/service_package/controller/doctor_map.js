const spackage_doctor_model = require('./../../../app/models/service_package/servicePackageDoctor');
const pinyin = require("pinyin");
const _ = require('underscore');
const servicePackageDoctorAssistantRefService = require('../../../app/services/service_package/servicePackageDoctorAssistantRefService');
const servicePackageDoctorService = require('../../../app/services/service_package/servicePackageDoctorService');

module.exports = {
  async getAction() {
    const p_style = {
      style: pinyin.STYLE_FIRST_LETTER, // 设置拼音风格
    };
    const userId = this.req.identity.userId;
    const sys_user_service = Backend.service('assistant', 'user');
    const sysUser = await sys_user_service.getUserByUserId(userId, 'assistantId');
    let assistantId = sysUser.assistantId;
    let doctors = await servicePackageDoctorAssistantRefService.findDoctorsByAssistant(assistantId);
    let doctorIds = doctors.map(doctorId => doctorId.doctorId);
    const fields = 'name avatar title hospital department hospitalId';
    doctors = await servicePackageDoctorService.getDoctorsByIds(doctorIds, fields);
    const hospitalIds = [];
    doctors.forEach(doctor => {
      if (hospitalIds.indexOf(doctor.hospitalId) < 0) {
        hospitalIds.push(doctor.hospitalId);
      }
    });
    // 通过医院获取医生
    doctors = await servicePackageDoctorService.getDoctorsByHospitalIds(hospitalIds, fields);
    doctorIds = doctors.map(doctor => doctor._id);

    let result = await spackage_doctor_model.find({
      _id : {$in : doctorIds},
      isDeleted: false
    }, 'name hospital avatar');
    result = result.map(doctor => {
      const pinyin = toPinYin(doctor.name).toLowerCase();
      const first = pinyin.length > 0 ? pinyin[0] : '';
      return {
        _id: doctor._id,
        name: doctor.name,
        hospital : doctor.hospital,
        avatar : doctor.avatar,
        first: first
      };
    });

    try {
      result.sort((a, b) => {
        const a_p = pinyin(a.first, p_style);
        const b_p = pinyin(b.first, p_style);
        return a_p[0][0].localeCompare(b_p[0][0]);
      });
    } catch (e) {
      console.log(e);
      console.log('拼音排序报错');
    }

    let map = _.groupBy(result, 'first',item=>{
      console.log(item)
      return item;
    });

    return this.success({ code: '200', msg: '', data: map });
  }
}