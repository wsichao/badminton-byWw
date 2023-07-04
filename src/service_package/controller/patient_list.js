/**
 * Created by yichen on 2018/3/12.
 */
'use strict';
module.exports = {
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required()
    });
  },
  async getAction() {
    const common_used_patient_model = Backend.model('service_package', undefined, 'common_used_patient');
    let result = { code: 200, msg: '', items: [] };
    const patient_infos = await common_used_patient_model.find({ 
      userId: this.query.user_id,
      isDeleted: false 
    }).sort({createdAt:-1});
    patient_infos.forEach(item => {
      let resItem = {
        "name":item.name || '',
        "sex": item.sex || '',
        "phone_num": item.phoneNum || '',
        "_id": item._id
      }
      result.items.push(resItem);
    })
    return this.success(result);
  }
}