


"use strict";
module.exports = {
  __beforeAction: function () {
    let ip = getClientIp(this.req);
    if (ip.indexOf("127.0.0.1") == -1) {
      return this.fail("必须 127.0.0.1 启用 Controller");
    }
  },
  async getAction () {
    const patient_info_model = Backend.model('service_package',undefined,'patient_info');
    const common_used_patient_model = Backend.model('service_package',undefined,'common_used_patient');
    const patient_infos = await patient_info_model.find({isDeleted:false});
    for(let i = 0;i< patient_infos.length;i++){
        let item = patient_infos[i];
        const new_common_used_patient = {
            userId : item.userId, //用户id
            name : item.name,
            sex : item.sex,
            phoneNum : item.phoneNum,
            birth:item.birth, //出生日期
            medicalNumber : item.medicalNumber, //医疗卡号
            lastMenstruation : item.lastMenstruation, //末次月经
            expectedDate : item.expectedDate , //预产期
        }
        const common_used_patient = await common_used_patient_model.create(new_common_used_patient);
        console.log('第'+i+'条记录完成');
    }
    console.log('all complete');
    return this.success('all complete');
  }
}