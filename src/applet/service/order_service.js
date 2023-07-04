/**
 *
 * 订单相关service
 * Created by yichen on 2018/7/2.
 */

'user strict';

const service_package_order_model = require('../../../app/models/service_package/servicePackageOrder');
const patient_info_model = Backend.model('service_package', undefined, 'patient_info');
const user_model = require("../../../app/models/Customer");
const assistant_model = Backend.model('assistant', undefined, 'sys_user');

const disease_case_model = Backend.model('service_package', undefined, 'disease_case');
const servicePackageOrderUtil = require('../../../app/services/service_package/servicePackageOrderUtil');
const servicePackageOrderService = require('../../../app/services/service_package/servicePackageOrderService');
const servicePackageAssistantService = require('../../../app/services/service_package/servicePackageAssistantService');
const co = require('co');
const sendSms = require('../../../lib/common-util').sendSms;
const common_used_patient_model = Backend.model('service_package', undefined, 'common_used_patient');

module.exports = {
  /**
   * 新增就诊人信息
   * @returns {*|Promise|RegExpExecArray}
   */
  insert_patient_info: function (user_id, data) {
    return co(function* () {
      // 数据完整有效
      const alreadyExistPatientInfo = yield patient_info_model.findOne({
        servicePackageOrder: data.orderId,
        isDeleted: false
      });
      if (alreadyExistPatientInfo) {
        return {
          code: '1000',
          msg: '就诊人信息已存在'
        }
      }
      const service_package_order = yield service_package_order_model.findOne({
        orderId: data.orderId,
        isDeleted: false
      });
      if (!service_package_order) {
        return {
          code: '8005',
          msg: '参数有误'
        }
      }
      let common_used_patient = {};
      if (data.common_used_patient_id) {
        // 从常用联系人中拿去数据
        common_used_patient = yield common_used_patient_model.findOne({
          _id: data.common_used_patient_id,
          isDeleted: false
        });
        data.name = common_used_patient.name;
        data.sex = common_used_patient.sex;
        data.birth = common_used_patient.birth;
        data.phone_num = common_used_patient.phoneNum;
        if (data.is_new_patient == '1') {
          data.medical_number = common_used_patient.medicalNumber;
          data.last_menstruation = common_used_patient.lastMenstruation;
          data.expected_date = common_used_patient.expectedDate;
          data.baby_birth = common_used_patient.babyBirth;
          data.allergy_history = common_used_patient.allergyHistory;
          data.note = common_used_patient.note;
        }
      } else {
        if (!data.name || !data.sex || !data.birth || !data.phone_num || !data.orderId) {
          return {
            code: '8005',
            msg: '参数有误'
          }
        }
      }
      //新增patientInfo 数据组装
      let patioent_info_new = {
        servicePackageOrder: data.orderId,
        userId: user_id,
        buyer: user_id,
        //buyerFrom : String, // 购买者来源 user-普通用户 assistant-助理
        name: data.name,
        sex: data.sex,
        birth: data.birth, //出生日期
        medicalNumber: data.medical_number, //医疗卡号
        lastMenstruation: data.last_menstruation, //末次月经
        expectedDate: data.expected_date,
        assistantIds: data.assistant_id, //助理id
        phoneNum: data.phone_num,
        babyBirth: data.baby_birth,
        allergyHistory: data.allergy_history,
        note: data.note,
        chooseReasons: data.choose_reasons,
        understandChannels: data.understand_channels
      };
      let user = yield user_model.findOne({
        _id: user_id,
        isDeleted: false
      });
      if (user) {
        patioent_info_new.buyerFrom = 'user';
      } else {
        let assistant = yield assistant_model.findOne({
          _id: user_id,
          isDeleted: false
        });
        if (assistant) {
          patioent_info_new.buyerFrom = 'assistant';
          patioent_info_new.buyer = assistant.assistantId;
          patioent_info_new.userId = data.userId || common_used_patient.userId;
        } else {
          return {
            code: '8005',
            msg: '参数有误'
          }
        }
      }
      let patient_info = yield patient_info_model.create(patioent_info_new); //todo: open
      //todo: sms_template
      // 给助理发送短信
      // 2378254 会员name 时间date 购买title
      let _assistant = yield servicePackageAssistantService.findAssistant(data.assistant_id);
      if (_assistant && _assistant.phoneNum) {
        const date = dateFormat(service_package_order.createdAt, 'yyyy年MM月dd日hh时mm分');
        const title = service_package_order.doctorName + service_package_order.servicePackageName;
        sendSms('2378254', _assistant.phoneNum, '#name#=' + service_package_order.userName +
          "&#date#=" + date +
          "&#title#=" + title);
      }
      let sysAssistant = yield assistant_model.findOne({
        assistantId: data.assistant_id,
        isDeleted: false
      });
      const groupService = Backend.service('im', 'group');
      //创建群组
      let groupResult = undefined;
      // if (sysAssistant && service_package_order.serviceType == 'zs') {
      //   groupResult = yield groupService.createGroup({
      //     group_name: data.name + '-专属服务群',
      //     desc: data.name + '-专属服务群',
      //     owner_user_id: sysAssistant._id,
      //     group_user_ids: [service_package_order.userId, sysAssistant._id]
      //   })
      //   //创建order群组关联表
      //   const refResult = yield groupService.groupPackageServiceRef(
      //     service_package_order.orderId,
      //     groupResult.data.group_id,
      //     service_package_order.servicePackageId
      //   );
      //   //发送欢迎消息
      //   const messageService = Backend.service('im', 'message');
      //   const msgResult = yield messageService.sendMsg({
      //       user_id: sysAssistant._id,
      //       to_user_id: groupResult.data.group_id,
      //       message_type: "text",
      //       message_txt: "您好，欢迎您成为朱李叶专属医生会员，我们为您建立了VIP服务咨询通道，有任何服务需要可以在这里联系我们，服务团队将竭诚为您服务。",
      //       target_type: "chatgroups"
      //     },
      //     "chatgroups"
      //   );
      // }
      return {
        code: '200',
        msg: '',
        data: {
          "name": patient_info.name,
          "birth": patient_info.birth,
          "phoneNum": patient_info.phoneNum,
          "sex": patient_info.sex,
          "medical_number": patient_info.medicalNumber || '',
          "last_menstruation": patient_info.lastMenstruation || 0,
          "patient_info_id": patient_info._id,
          "assistant_id": patient_info.assistantIds || '',
          "group_id": groupResult && groupResult.data && groupResult.data.group_id || '',
          "service_type": service_package_order.serviceType || ''
        }
      }
    })
  },
  /**
   * 新增健康记录
   * @param user_id
   * @param data
   * @return {*}
   */
  insert_disease_case: function (user_id, data) {
    return co(function* () {
      const service_package_order = yield service_package_order_model.findOne({
        orderId: data.service_package_order_id,
        isDeleted: false
      });
      if (!service_package_order) {
        return {
          code: '8005',
          msg: '参数有误'
        }
      }
      let disease_case_new = {
        servicePackageOrderId: data.service_package_order_id,
        userId: user_id,
        checkTime: data.check_time,
        checkDetail: data.check_detail,
        checkImgs: data.check_imgs,
        memo: data.memo,
        selectedReservations: data.selected_reservations
      };
      let disease_case = yield disease_case_model.create(disease_case_new);
      return {
        code: '200',
        msg: '',
        data: {
          "check_time": disease_case.checkTime || null,
          "selected_reservations": disease_case.selectedReservations || [],
          "check_detail": disease_case.checkDetail || '',
          "check_imgs": disease_case.checkImgs || [],
          "_id": disease_case._id
        }
      }
    })
  },
  /**
   * 新增健康记录
   * @param user_id
   * @param data
   * @return {*}
   */
  insert_service_package_order: function (user_id, data, req) {
    return co(function* () {
      let result = {
        code: '200',
        msg: '',
        data: {}
      }
      let flag = yield servicePackageOrderUtil.validOrderRef(data.doctorId, data.servicePackageDoctorRefId);
      console.log(flag)
      if (flag) {
        result.code = '2420';
        result.msg = '该服务包会员名额已满';
        return result;
      }
      let applet = {
        openid: data.openid
      }
      let order = yield servicePackageOrderService.createOrder(
        user_id,
        data.servicePackageDoctorRefId,
        data.doctorId,
        undefined,
        undefined,
        req,
        applet)
      result.data = order;
      return result
    })
  }
}