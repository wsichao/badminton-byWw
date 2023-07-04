/**
 *
 * 查询自己的的服务包健康档案
 *
 *
 * Created by yichen on 2018/7/2.
 */

'user strict';

const disease_case_model = Backend.model('service_package',undefined,'disease_case');
const patient_info_model = Backend.model('service_package',undefined,'patient_info');

const service_package_order_model = require('../../../app/models/service_package/servicePackageOrder');
const service_package_ref_model = require('../../../app/models/service_package/servicePackageDoctorRef');

const co = require('co');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      service_package_order_id: valid.string().required(),
    });
  },
  getAction: function () {
    const self = this;
    const post = this.query;
    let user_id = this.req.identity.userId
    let result = co(function* () {
      let disease_cases = yield disease_case_model.find({servicePackageOrderId:post.service_package_order_id,userId:user_id,isDeleted:false}).sort({checkTime:-1});
      let result = {
        code : '200',
        msg: '',
        items:[]
      }
      let order  = yield service_package_order_model.findOne({orderId:post.service_package_order_id,isDeleted:false});
      let ref  = yield service_package_ref_model.findOne({_id:order.servicePackageDoctorRef,isDeleted:false});
      for(var i = 0;i<disease_cases.length;i++){
        let resItem = {
          check_time : disease_cases[i].checkTime,
          selected_reservations : disease_cases[i].selectedReservations,
          check_detail :disease_cases[i].checkDetail,
          check_imgs : disease_cases[i].checkImgs,
          memo : disease_cases[i].memo,
          "week_str" : '',
          "_id" : disease_cases[i]._id
        };
        if(ref && ref.type == '产科'){
          let patient_info = yield patient_info_model.findOne({userId:user_id,servicePackageOrder:post.service_package_order_id,isDeleted:false})
          if(patient_info.lastMenstruation){
            let pregnant_time = disease_cases[i].checkTime - patient_info.lastMenstruation;
            let week_time = 7 * 24 * 60 * 60 * 1000;
            let day_time = 24 * 60 * 60 * 1000;
            if (pregnant_time > week_time * 41) {
              resItem.week_str = '已生产';
            } else {
              const weeks = Math.floor(pregnant_time / week_time);
              const remained_time = pregnant_time % week_time;
              const days = Math.floor(remained_time / day_time);
              if (days == 0) {
                resItem.week_str = '孕' + weeks + '周';
              } else {
                resItem.week_str = '孕' + weeks + '周' + days + '天';
              }
            }
          
          }
        }

        result.items.push(resItem);
      }
      return result;
    });
    return self.success(result);
  }
}