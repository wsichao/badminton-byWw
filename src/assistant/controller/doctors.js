/**
 *  获取当前助理所服务的所有医生的预约情况，只获取有效的
 *  按医生的姓名排序
 *  findDoctorsByAssistant
 *  getDoctorsAppointmentInfo
 */
const servicePackageDoctorAssistantRefService = require('../../../app/services/service_package/servicePackageDoctorAssistantRefService');
const makeAppointmentOrderService = require('../../../app/services/service_package/makeAppointmentOrderService');
const servicePackageDoctorService = require('../../../app/services/service_package/servicePackageDoctorService');

const user_service = Backend.service('common', 'user_service');
const sys_user_service = Backend.service('assistant', 'user');
const pinyin = require("pinyin");

const _ = require('underscore');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      beginAt: valid.string().required(),
      endAt: valid.string().required()
    });
  },
  async getAction() {
    const self = this;
    const beginAt = Number(this.req.query.beginAt);
    const endAt = Number(this.req.query.endAt);
    const userId = this.req.identity.userId;

    const res = {
      code: '200',
      msg: '',
      items: []
    };
    const sysUser = await sys_user_service.getUserByUserId(userId, 'assistantId');
    let assistantId = sysUser.assistantId;
    if (!assistantId) {
      console.log('not found assistantId!');
      return self.success(res);
    };
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
    const result = await makeAppointmentOrderService.getDoctorsAppointmentInfo(doctorIds, beginAt, endAt);
    const appointments = result[0];
    const appointments_count = result[1];

    const appointment_map = _.indexBy(appointments, '_id');
    const appointment_map_count = _.indexBy(appointments_count, '_id');
    let userIds = [];
    appointments.forEach(function (appointment) {
      userIds = _.union(userIds, appointment.userIds);
    });

    const users = await user_service.getInfoByUserIds(userIds, '_id avatar');
    const user_map = _.indexBy(users, '_id');

    let items = doctors.map(function (doctor) {
      const appointment = appointment_map[doctor._id + ''];
      const appointment_count = appointment_map_count[doctor._id + ''];
      let _userIds = appointment && appointment.userIds || [];
      const avatars = [];
      _userIds.forEach(_userId => {
        const avatar = user_map[_userId] && user_map[_userId].avatar || '';
        avatars.push(avatar);
      });
      const p_style = {
        style: pinyin.STYLE_FIRST_LETTER, // 设置拼音风格
      };
      return {
        _id: doctor._id,
        name: doctor.name,
        avatar: doctor.avatar,
        title: doctor.title,
        hospital: doctor.hospital,
        department: doctor.department,
        count: appointment && appointment.count || 0,
        sum: appointment_count && appointment_count.count || 0,
        avatars: avatars,
        pinyin: doctor.name ? pinyin(doctor.name, p_style)[0][0] : ''
      }
    });
    items = _.filter(items, (item) => {
      return item.sum > 0;
    })
    try {
      items.sort((a, b) => {
        return a.pinyin.localeCompare(b.pinyin);
      });
    } catch (e) {
      console.log(e);
      console.log('拼音排序报错');
    }
    res.items = items;
    return self.success(res);
  }
}