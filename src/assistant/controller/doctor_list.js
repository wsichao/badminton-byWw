/**
 *  获取当前助理所服务的所有医生
 *  按医生的姓名首字母排序
 */
const service = Backend.service('assistant', 'doctor');
const pinyin = require("pinyin");
const _ = require('underscore');
module.exports = {
  async getAction() {
    const userId = this.req.identity.user._id;
    let doctors = await service.findDoctorsByAssistantId(userId);
    let doctorIds = doctors.map(doctorId => doctorId.doctorId);
    doctors = await service.getDoctorsByIds(doctorIds);
    let items = doctors.map(function (doctor) {
        const p_style = {
          style: pinyin.STYLE_FIRST_LETTER, // 设置拼音风格
        };
        return {
            doctor_id: doctor._id,
            doctor_name: doctor.name,
            hospital: doctor.hospital,
            first_py_name: doctor.name ? pinyin(doctor.name, p_style)[0][0] : ''
        }
    })
    const res = {
        code: '200',
        msg: '',
        items: []
    };
    res.items = items;
    return this.success(res);
  }
}