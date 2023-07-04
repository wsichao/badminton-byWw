/**
 *
 * 将康档案列表
 *
 * Created by yichen on 2018/7/4.
 */

/**
 *
 *会员资料
 *
 * Created by yichen on 2018/7/3.
 */


'user strict';

const disease_model = Backend.model('service_package', undefined, 'disease_case');
const patient_info_model = Backend.model('service_package', undefined, 'patient_info');
const service_package_order_model = require('../../../app/models/service_package/servicePackageOrder');
const service_package_ref_model = require('../../../app/models/service_package/servicePackageDoctorRef');
const co = require('co');
const _ = require('underscore')
module.exports = {
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required(),
      service_package_order_id: valid.string().required()
    });
  },
  getAction: function () {
    const self = this;
    const query = this.query;
    let user_id = this.req.identity.userId;
    let result = co(function* () {
      let diseases = yield disease_model
        .find({ userId: query.user_id, servicePackageOrderId: query.service_package_order_id, isDeleted: false })
        .sort({ checkTime: -1 })
      let result = {
        code: '200',
        msg: '',
        items: []
      };
      let order = yield service_package_order_model.findOne({ orderId: query.service_package_order_id, isDeleted: false });
      let ref = yield service_package_ref_model.findOne({ _id: order.servicePackageDoctorRef, isDeleted: false });
      for (var i = 0; i < diseases.length; i++) {
        let resItem = {
          "check_time": diseases[i].checkTime,
          "selected_reservations": diseases[i].selectedReservations || [],
          "check_detail": diseases[i].checkDetail || '',
          "check_imgs": diseases[i].checkImgs || [],
          "_id": diseases[i]._id,
          "week_str": ''
        }
        if (ref && ref.type == '产科') {
          let patient_info = yield patient_info_model.findOne({ userId: query.user_id, servicePackageOrder: query.service_package_order_id, isDeleted: false })
          if (patient_info.lastMenstruation) {
            let pregnant_time = diseases[i].checkTime - patient_info.lastMenstruation;
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