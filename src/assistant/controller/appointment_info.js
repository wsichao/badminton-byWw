/**
 * api 10066 助理－预约 医生预约列表
 * 展示未就诊、已就诊、已取消
 * 排序
 ＊  未就诊－200 已就诊-400 已取消-300
 ＊  时间从小到大
 */
const makeAppointmentOrderService = require('../../../app/services/service_package/makeAppointmentOrderService');
const user_service = Backend.service('common', 'user_service');
const patient_info_service = Backend.service('service_package', 'patient_info_service');
const service_evaluation_model = Backend.model('service_package', undefined, 'service_evaluation');
const doctor_model = require('../../../app/models/service_package/servicePackageDoctor');
const assistant_model = require("../../../app/models/service_package/servicePackageAssistant");
const service_package_order = require('../../../app/models/service_package/servicePackageOrder');
const service_package_doctor_ref = require('../../../app/models/service_package/servicePackageDoctorRef');

const _ = require('underscore');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      order_id: valid.string().required(),
      // beginAt: valid.string().required(),
      // endAt: valid.string().required()
    });
  },
  async getAction() {
    let self = this;
    // const doctorId = this.req.query.doctorId;
    let orderId = this.req.query.order_id;

    const res = {
      code: '200',
      msg: '',
      data: {}
    };
    let appointment = await makeAppointmentOrderService.getAppointmentsByOrderId(orderId);
    let user_id = appointment.userId;
    let doctorId = appointment.doctorId;
    let sp_orderId = appointment.servicePackageOrderId;
    // console.log('userIds:', userIds);
    const user = await user_service.getInfoByUserId(user_id, '_id name avatar phoneNum');
    const patient = (await patient_info_service.getPatientInfoByServicePackageOrderId(sp_orderId,
      'servicePackageOrder name phoneNum medicalNumber birth sex lastMenstruation')) || {};
    //v5.28.0 todo 查询就诊人年龄
    let patient_age = '';
    if (patient.birth && appointment.orderTime) {
      patient_age = await patient_info_service.getAge(patient.birth, appointment.orderTime);
    }
    const service_evaluations = await service_evaluation_model.find({
      isDeleted: false,
      makeAppointmentOrderId: orderId
    });
    let assistantIds = [];
    service_evaluations.forEach(function (item) {
      assistantIds.push(item.assistantId);
    });
    assistantIds = _.uniq(assistantIds);
    let assistants = await assistant_model.find({
      isDeleted: false,
      _id: {
        $in: assistantIds
      }
    });
    let assistants_index = _.indexBy(assistants, '_id')
    const service_evaluation_index = _.indexBy(service_evaluations, 'makeAppointmentOrderId');
    const doctor = await doctor_model.findOne({
      isDeleted: false,
      _id: doctorId
    });

    res.data = {
      user: {
        _id: user._id,
        avatar: user.avatar || '', //用户头像
        name: patient.name || '', //就诊人姓名
        phoneNum: patient.phoneNum || '', //就诊人手机号
        age: patient_age,//就诊人年龄
        sex: patient.sex || ''//就诊人性别
      },
      order: {
        orderId: appointment.orderId,
        servicePackageOrderId: appointment.servicePackageOrderId,
        items: appointment.items || [],
        workTime: appointment.orderTime,
        workTimeStr: makeAppointmentOrderService.timeConvert(appointment.orderTime),
        address: appointment.address || '',
        status: appointment.status,
        instructions: appointment.desc || '',
        checklist_imgs: appointment.guidePic || [],
        medical_number: patient.medicalNumber || '',
        last_menstruation: patient.lastMenstruation || 0
      }
    };
    //v5.28.0查询服务包订单是否过期
    let service_package_order_info = await service_package_order.findOne({
      orderId: appointment.servicePackageOrderId,
      isDeleted: false
    });
    if (service_package_order_info) {
      res.data.order.service_package_order_over_due = false;
      if (service_package_order_info.deadlinedAt < Date.now()) {
        res.data.order.service_package_order_over_due = true;
      }
      let service_type = await service_package_doctor_ref.findOne({
        _id: service_package_order_info.servicePackageDoctorRef,
        isDeleted: false
      }, 'type');
      res.data.order.service_type = service_type.type || '';
    }
    if (service_evaluation_index[appointment.orderId]) {
      res.data['evaluation'] = {
        "doctorId": service_evaluation_index[appointment.orderId].doctorId,
        "doctorName": doctor.name || '',
        "doctorAvatar": doctor.avatar || '',
        "doctorStarRating": service_evaluation_index[appointment.orderId].doctorStarRating || null,
        "doctorEvaluationDesc": service_evaluation_index[appointment.orderId].doctorEvaluationDesc || '',
        "assistantId": service_evaluation_index[appointment.orderId].assistantId,
        "assistantStarRating": service_evaluation_index[appointment.orderId].assistantStarRating || null,
        "assistantEvaluationDesc": service_evaluation_index[appointment.orderId].assistantEvaluationDesc || '',
        "assistantName": assistants_index[service_evaluation_index[appointment.orderId].assistantId].name || '',
        "assistantAvatar": assistants_index[service_evaluation_index[appointment.orderId].assistantId].avatar || '',
        isShow: true
      }
    }
    return self.success(res);
    // return self.success({name : 1})
  }
}