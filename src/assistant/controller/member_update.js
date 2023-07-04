/**
 *
 * 修改就诊人信息
 *
 * Created by yichen on 2018/7/4.
 */



'user strict';

const patient_info_model = Backend.model('service_package', undefined, 'patient_info');
const co = require('co');
const util = require('../../../lib/common-util');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      patient_info_id: valid.string().required()
    });
  },
  postAction: function () {
    const self = this;
    const post = this.post;
    let user_id = this.req.identity.userId;
    let result = co(function* () {
      const orgin_patient_info = yield patient_info_model
        .findOne({ _id: post.patient_info_id, isDeleted: false });
      if (!orgin_patient_info) {
        return {
          code: '8005',
          msg: "参数有误"
        }
      }
      let update = {};
      if (post.name) {
        update.name = post.name
      }
      if (post.sex) {
        update.sex = post.sex
      }
      if (post.birth) {
        update.birth = post.birth
      }
      if (post.phone_num) {
        update.phoneNum = post.phone_num
      }
      if (post.medical_number || post.medical_number === '') {
        update.medicalNumber = post.medical_number
      }
      if (post.last_menstruation) {
        update.lastMenstruation = post.last_menstruation
      }
      if (post.expected_date) {
        update.expectedDate = post.expected_date
      }
      if (post.baby_birth) {
        update.babyBirth = post.baby_birth;
      }
      if (post.note) {
        update.note = post.note
      }
      if (post.allergy_history) {
        update.allergyHistory = post.allergy_history
      }
      let patient_info =
        yield patient_info_model.findOneAndUpdate({ _id: post.patient_info_id, isDeleted: false }, { $set: update }, { new: true });
      if (patient_info.babyBirth) {
        if (patient_info.babyBirth != orgin_patient_info.babyBirth) {
          let tplId = '2630352';
          util.sendSms(tplId, patient_info.phoneNum);//发送短信
        }
      }

      return {
        code: '200',
        msg: ''
      }

    });
    return self.success(result);
  }
}