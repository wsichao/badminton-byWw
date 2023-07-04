/**
 *
 *会员资料
 *
 * Created by yichen on 2018/7/3.
 */


'user strict';

const patient_info_model = Backend.model('service_package',undefined,'patient_info');
const service_package_order_model = require('../../../app/models/service_package/servicePackageOrder');
const service_package_doctor_ref_model = require('../../../app/models/service_package/servicePackageDoctorRef');
const co = require('co');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required()
    });
  },
  getAction: function () {
    const self = this;
    const query = this.query;
    let result = co(function* () {
      let patient_info = yield patient_info_model.findOne({userId:query.user_id,servicePackageOrder:query.order_id,isDeleted:false});
      if(!patient_info){
        return {
          code : '8005',
          msg : "参数有误"
        }
      }
      let order = yield service_package_order_model.findOne({orderId:query.order_id,isDeleted:false});
      if(!order){
        return {
          code : '8005',
          msg : "参数有误"
        }
      }
      let service_package_doctor_ref = yield service_package_doctor_ref_model.findOne({_id:order.servicePackageDoctorRef,isDeleted:false});
      return {
        code : '200',
        msg : '',
        data : {
          "name": patient_info.name || '',
          "birth": patient_info.birth || null,
          "phoneNum": patient_info.phoneNum,
          "sex": patient_info.sex || '',
          "medical_number": patient_info.medicalNumber || '',
          "last_menstruation": patient_info.lastMenstruation || null,
          "expected_date": patient_info.expectedDate || null,
          "patient_info_id" : patient_info._id,
          "assistant_id" : patient_info.assistantIds,
          "servicePackageType" : service_package_doctor_ref && service_package_doctor_ref.type || '',
          "baby_birth" : patient_info.babyBirth || null,
          "note" : patient_info.note || '',
          "allergy_history" : patient_info.allergyHistory || '',
        }
      }

    });
    return self.success(result);
  }
}