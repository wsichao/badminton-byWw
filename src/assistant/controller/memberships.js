/**
 * api 10067 助理－会员  会员搜索功能 todo: urlAuth
 * 逻辑：助理－>医生－>医生所在的医院－>医院订单
 * 会员：购买过服务的用户 订单状态：200支付成功, 600订单过期, 700已退款；800已变更？todo:
 * 排序：按字母
 */
const servicePackageDoctorAssistantRefService = require('../../../app/services/service_package/servicePackageDoctorAssistantRefService');
const servicePackageDoctorService = require('../../../app/services/service_package/servicePackageDoctorService');
const servicePackageHospital = require('../../../app/services/service_package/servicePackageHospital');
const servicePackageOrderService = require('../../../app/services/service_package/servicePackageOrderService');
const user_service = Backend.service('common', 'user_service');
const sys_user_service = Backend.service('assistant', 'user');
const co = require('co');
const _ = require('underscore');

module.exports = {
  getAction: function () {
    const self = this;
    const userId = this.req.identity.userId;
    const keyword = this.req.query.keyword || '';
    const doctor_id = this.query.doctor_id;
    const res = {
      code: '200',
      msg: '',
      items: []
    };
    return co(function* () {
      const all_doctor_ids = [];

      if (!doctor_id) {
        const sysUser = yield sys_user_service.getUserByUserId(userId, 'assistantId');
        // console.log('sysUser:', sysUser);
        const assistantId = sysUser.assistantId;
        //const assistantId = '5a3b30bd0dd25d035d25ea51';

        if (!assistantId) {
          console.log('not found assistantId!');
          return self.success(res);
        }
        let doctors = yield servicePackageDoctorAssistantRefService.findDoctorsByAssistant(assistantId);
        const doctorIds = doctors.map(doctorId => doctorId.doctorId);
        // console.log('doctorIds:', doctorIds);
        const fields = 'hospitalId';
        doctors = yield servicePackageDoctorService.getDoctorsByIds(doctorIds, fields);
        // console.log('doctors:', doctors);
        const hospitalIds = [];
        doctors.forEach(doctor => {
          if (hospitalIds.indexOf(doctor.hospitalId) < 0) {
            hospitalIds.push(doctor.hospitalId);
          }
        });
        // 获取医院下的所有医生
        const all_doctors = yield servicePackageDoctorService.getDoctorsByHospitalIds(hospitalIds);

        // console.log('hospitals:', hospitals);
        all_doctors.forEach(item => {
          all_doctor_ids.push(item._id);
        });
      }else{
        all_doctor_ids.push(doctor_id);
      }
      // console.log(hospitalNames);
      //获取该医院下的所有订单
      const orders = yield servicePackageOrderService.getOrdersByDocotrIds(all_doctor_ids);
      let userIds = [];
      orders.forEach(function (order) {
        if (userIds.indexOf(order.userId) < 0) {
          userIds.push(order.userId);
        }
      });
      // console.log('userIds:', userIds);
      const users = yield user_service.gentUsersByName(userIds, keyword, '_id avatar name phoneNum');
      // console.log('users:',users);
      const items = users.map(function (user) {
        return {
          _id: user._id,
          name: user.name || '',
          avatar: user.avatar || '',
          phoneNum: user.phoneNum || '',
          pinyin: user.name ? toPinYin(user.name) : ''
        };
      });
      /*res.items = items.sort(function (a, b) {
        console.log(a.pinyin, b.pinyin, a.pinyin > b.pinyin);
        return a.pinyin > b.pinyin; //todo: 无效
      });*/
      res.items = _.sortBy(items, 'pinyin');
      return self.success(res);
    })

  }
}