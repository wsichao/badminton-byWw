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
const co = require('co');
const _ = require('underscore');
const sys_user_service = Backend.service('assistant', 'user');
const makeAppointmentOrder = Backend.service('assistant', 'doctor');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      doctor_ids: valid.array().required(),
      begin_at: valid.number().required(),
      end_at: valid.number().required(),
      status: valid.number().required()
    });
  },
  async postAction() {
    let self = this;
    // let query1 = this.req.query;
    let post = this.post;
    const user_id = this.req.identity.userId;
    const beginAt = Number(post.begin_at);
    const endAt = Number(post.end_at);
    const status = Number(post.status) || -100;
    let doctor_ids = post.doctor_ids || [];
    const page_size = Number(post.page_size) || 20;
    const page_num = Number(post.page_num) || 0;
    const item_type = post.item_type;
    const res = {
      code: '200',
      msg: '',
      items: []
    };
    const sysUser = await sys_user_service.getUserByUserId(user_id, 'assistantId');
    let assistantId = sysUser.assistantId;
    const args = {
      assistantId: assistantId,
      doctor_ids: doctor_ids,
      beginAt: beginAt,
      endAt: endAt,
      status: status,
      page_size: page_size,
      page_num: page_num,
      items: item_type
    };
    // TODO 6.8.0 添加 items 过滤
    let appointments = await makeAppointmentOrder.getAppointmentsByDoctorId(args);
    let userIds = [];
    const servicePackageOrders = [];
    const orderIds = [];
    let doctorIds = [];
    appointments.forEach(function (appointment) {
      userIds.push(appointment.userId);
      orderIds.push(appointment.orderId);
      servicePackageOrders.push(appointment.servicePackageOrderId);
      doctorIds.push(appointment.doctorId);
    });
    //医生信息集合
    doctorIds = _.uniq(doctorIds);

    const doctors = await doctor_model.find({
      isDeleted: false,
      _id: {
        $in: doctorIds
      }
    });
    const doctor_map = _.indexBy(doctors, '_id');
    //用户信息集合
    const users = await user_service.getInfoByUserIds(userIds, '_id name avatar phoneNum');
    const user_map = _.indexBy(users, '_id');
    //就诊人信息集合
    const patients = await patient_info_service.getPatientInfoByServicePackageOrders(servicePackageOrders,
      'servicePackageOrder name phoneNum medicalNumber lastMenstruation birth sex');
    const patient_map = _.indexBy(patients, 'servicePackageOrder');
    const service_evaluations = await service_evaluation_model.find({
      isDeleted: false,
      makeAppointmentOrderId: {
        $in: orderIds
      }
    });
    var makeAppointmentOrderMap = await makeAppointmentOrderService.getAppointmentsByOrderIdMap(orderIds);
    //助理信息集合
    let assistantIds = [];
    service_evaluations.forEach(function (item) {
      assistantIds.push(item.assistantId);
      var makeAppointmentObj = makeAppointmentOrderMap[item.makeAppointmentOrderId];
      if (!makeAppointmentObj) {
        makeAppointmentObj = {};
      }
      item.doctorId = makeAppointmentObj.doctorId || "";
      item.name = makeAppointmentObj.doctorName || "";
      item.avatar = makeAppointmentObj.doctorAvatar || "";
    });
    assistantIds = _.uniq(assistantIds);
    let assistants = await assistant_model.find({
      isDeleted: false,
      _id: {
        $in: assistantIds
      }
    });
    let assistants_index = _.indexBy(assistants, '_id');
    //服务评价集合
    const service_evaluation_index = _.indexBy(service_evaluations, 'makeAppointmentOrderId');
    for (let i = 0; i < appointments.length; i++) {
      const user = user_map[appointments[i].userId + ''] || {};
      const patient = patient_map[appointments[i].servicePackageOrderId + ''] || {};
      //v5.28.0 todo 查询就诊人年龄
      let patient_age = '';
      if (patient.birth && appointments[i].orderTime) {
        patient_age = await patient_info_service.getAge(patient.birth, appointments[i].orderTime);
      }
      const doctor_info = doctor_map[appointments[i].doctorId + ''] || {};
      let resItem = {
        user: {
          avatar: user.avatar || '', //用户头像
          name: patient.name || '', //就诊人姓名
          phoneNum: patient.phoneNum || '', //就诊人手机号
          age: patient_age || '', //就诊人年龄
          sex: patient.sex || '' //就诊人性别
        },
        order: {
          orderId: appointments[i].orderId,
          servicePackageOrderId: appointments[i].servicePackageOrderId,
          items: appointments[i].items || [],
          desc: appointments[i].desc,
          workTime: appointments[i].orderTime,
          workTimeStr: makeAppointmentOrderService.timeConvert(appointments[i].orderTime),
          address: appointments[i].address || '',
          status: appointments[i].status,
          instructions: appointments[i].desc || '',
          checklist_imgs: appointments[i].guidePic || [],
          medical_number: patient.medicalNumber || '',
        },
        doctor: {
          _id: doctor_info._id || '',
          name: doctor_info.name || ''
        }
      };
      //孕周计算
      if (patient.lastMenstruation) {
        let pregnant_time = appointments[i].orderTime - patient.lastMenstruation;
        let week_time = 7 * 24 * 60 * 60 * 1000;
        let day_time = 24 * 60 * 60 * 1000;
        if (pregnant_time > week_time * 41) {
          resItem.order.week_str = '已生产';
        } else {
          const weeks = Math.floor(pregnant_time / week_time);
          const remained_time = pregnant_time % week_time;
          const days = Math.floor(remained_time / day_time);
          if (days == 0) {
            resItem.order.week_str = '孕' + weeks + '周';
          } else {
            resItem.order.week_str = '孕' + weeks + '周' + days + '天';
          }
        }
      } else {
        resItem.order.week_str = '';
      }
      if (service_evaluation_index[appointments[i].orderId]) {
        resItem['evaluation'] = {
          "doctorId": service_evaluation_index[appointments[i].orderId].doctorId,
          "doctorName": doctor_map[service_evaluation_index[appointments[i].orderId].doctorId].name || '',
          "doctorAvatar": doctor_map[service_evaluation_index[appointments[i].orderId].doctorId].avatar || '',
          "doctorStarRating": service_evaluation_index[appointments[i].orderId].doctorStarRating || null,
          "doctorEvaluationDesc": service_evaluation_index[appointments[i].orderId].doctorEvaluationDesc || '',
          "assistantId": service_evaluation_index[appointments[i].orderId].assistantId,
          "assistantStarRating": service_evaluation_index[appointments[i].orderId].assistantStarRating || null,
          "assistantEvaluationDesc": service_evaluation_index[appointments[i].orderId].assistantEvaluationDesc || '',
          "assistantName": assistants_index[service_evaluation_index[appointments[i].orderId].assistantId].name || '',
          "assistantAvatar": assistants_index[service_evaluation_index[appointments[i].orderId].assistantId].avatar || '',
          isShow: true
        }
      }
      res.items.push(resItem);
    }
    return self.success(res);
  }
}