/**
 * Created by yichen on 2018/8/21.
 */
'use strict';
const patient_service = Backend.service('assistant', 'patient');
let util = require('../../../lib/common-util');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required(),
      name: valid.string().required(),
      sex: valid.string().required(),
      birth: valid.number().required(),
      phone_num: valid.string().required()
    });
  },
  async postAction() {
    const that = this;
    const post =  this.post;
    console.log('-------------------');
    console.log(post);
    console.log('-------------------');
    const common_used_patient_model = Backend.model('service_package', undefined, 'common_used_patient');
    let result = { code: 200, msg: '', data: {} };
    const new_common_used_patient = {
        userId : post.user_id, //用户id
        name : post.name,
        sex : post.sex,
        phoneNum : post.phone_num,
        birth:post.birth, //出生日期
        medicalNumber : post.medical_number, //医疗卡号
        lastMenstruation : post.last_menstruation, //末次月经
        expectedDate : post.expected_date , //预产期s
        babyBirth :post.baby_birth,//生产日期 v5.28.0
        allergyHistory : post.allergy_history,//过敏史 v5.28.0
        note : post.note //备注 v5.28.0
    }
    const common_used_patient = await common_used_patient_model.create(new_common_used_patient);
    if(post.baby_birth){
       //todo:v5.28.0-填写生产日期，给用户发短信
       let tplId = '2630352';
       await util.sendSms(tplId,post.phone_num);//发送短信
    }
    result.data = {
        "name": common_used_patient.name, 
        "sex": common_used_patient.sex, 
        "phone_num": common_used_patient.phoneNum, 
        "_id": common_used_patient._id
    }
    return this.success(result);
  }
}