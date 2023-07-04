/**
 * Created by yichen on 2018/7/3.
 */

const service_package_order_model = require('../../../app/models/service_package/servicePackageOrder');
const service_package_model = require('../../../app/models/service_package/servicePackage');
const patient_info_model = Backend.model('service_package', undefined, 'patient_info');
const service_package_ref_model = require('../../../app/models/service_package/servicePackageDoctorRef');
const servicePackageOrderUtil = require('../../../app/services/service_package/servicePackageOrderUtil');
const servicePackageOrderService = require('../../../app/services/service_package/servicePackageOrderService');
const vip_member_model = Backend.model('service_package', undefined, 'vip_member');
const order_group_ref_model = Backend.model('im', undefined, 'im_group_ps_ref');
const disease_case_model = Backend.model('service_package', undefined, 'disease_case');
const make_appointment_order_model = require('../../../app/models/service_package/makeAppointmentOrder');
const patient_info_service = Backend.service('service_package', 'patient_info_service');
const co = require('co');
const _ = require('underscore');

const user_service_package_order_rel_search = function ( orders) {
  let order_ids = _.map(orders, 'orderId');
  let service_package_ids = _.map(orders, function (item) {
    return item.servicePackageId + ''
  });
  let ref_ids = _.map(orders, function (item) {
    return item.servicePackageDoctorRef + ''
  });
  service_package_ids = _.uniq(service_package_ids);
  order_ids = _.uniq(order_ids);
  ref_ids = _.uniq(ref_ids);
  return Promise.all([
    service_package_model.find({ _id: { $in: service_package_ids }, isDeleted: false }),
    patient_info_model.find({ servicePackageOrder: { $in: order_ids }, isDeleted: false }),
    service_package_ref_model.find({ _id: { $in: ref_ids }, isDeleted: false }),
    order_group_ref_model.find({ servicePackageOrderId: { $in: order_ids }, isDeleted: false }),
    disease_case_model.aggregate([
      { $match: { servicePackageOrderId: { $in: order_ids }, isDeleted: false } },
      { $group: { _id: "$servicePackageOrderId", count: { $sum: 1 } } }
    ]).exec(),
    make_appointment_order_model.aggregate([
      { $match: { servicePackageOrderId: { $in: order_ids }, isDeleted: false, status: 200 } },
      { $group: { _id: "$servicePackageOrderId", count: { $sum: 1 } } }
    ]).exec(),
    make_appointment_order_model.aggregate([
      { $match: { servicePackageOrderId: { $in: order_ids }, isDeleted: false } },
      { $group: { _id: "$servicePackageOrderId", count: { $sum: 1 } } }
    ]).exec()
  ]);
}


module.exports = {
  /**
   * 查询用户所有的服务包和 一些状态
   * @param user_id
   * @return {*}
   */
  get_service_package(user_id, typeStr) {
    const that = this;
    typeStr = typeStr || '';
    let typeArr = typeStr.split(",");
    let statusArr = ['200', '300', '400', '600', '900', '1000'];
    if (typeStr) {
      statusArr = statusArr.concat(typeArr);
      statusArr = _.uniq(statusArr);
    }
    return co(function* () {
      let order_cond = { userId: user_id, isDeleted: false };
      if (_.indexOf(statusArr, '100') != -1) {
        let statusArrWithOut100 = _.without(statusArr);
        order_cond['$or'] = [{
          orderStatus: { $in: statusArrWithOut100 }
        }, {
          orderStatus: 100,
          createdAt: { $gte: (Date.now() - 1000 * 60 * 60) }
        }]
      } else {
        order_cond['orderStatus'] = { $in: statusArr };
      }
      let orders = yield service_package_order_model.find(order_cond).sort({ createdAt: -1 });
      let member = yield vip_member_model.findOne({ userId: user_id, isDeleted: false });
      
      let ref_info_arr = yield user_service_package_order_rel_search( orders);
      let service_packages = ref_info_arr[0];
      let patient_infos = ref_info_arr[1];
      let service_package_ref = ref_info_arr[2];
      let orderGroupRefs = ref_info_arr[3];
      let disease_case_statistisc = ref_info_arr[4];
      let appointment_statistisc = ref_info_arr[5];
      let appointment_total_statistisc = ref_info_arr[6];

      let service_packages_index = _.indexBy(service_packages, '_id');
      let patient_infos_index = _.indexBy(patient_infos, 'servicePackageOrder');
      let service_package_ref_index = _.indexBy(service_package_ref, '_id');
      let orderGroupRefsIndex = _.indexBy(orderGroupRefs, 'servicePackageOrderId');
      let disease_case_statistisc_index = _.indexBy(disease_case_statistisc, '_id');
      let appointment_statistisc_index = _.indexBy(appointment_statistisc, '_id');
      let appointment_total_statistisc_index = _.indexBy(appointment_total_statistisc, '_id');
      let items = [];
      for (var i = 0; i < orders.length; i++) {
        let resItem = {
          "doctor": {
            "name": orders[i].doctorName,
            "title": orders[i].doctorJobTitle,
            "hospital": orders[i].doctorHospital,
            "department": orders[i].doctorDepartment,
            "avatar": orders[i].doctorAvatar,
            "_id": orders[i].doctorId
          },
          "order": {
            "orderId": orders[i].orderId,
            "wxOrderId": orders[i].wxorderId,
            "name": orders[i].servicePackageName,
            "beginAt": orders[i].paidTime,
            "endAt": orders[i].deadlinedAt,
            "icon": "",
            "desc": '',
            "price": (orders[i].mountOfRealPay / 100),
            vipPrice: orders[i].vipPrice && (orders[i].vipPrice / 100) || orders[i].mountOfRealPay / 100,//会员价   单位分
            vipDiscountsPrice: member && orders[i].vipDiscountsPrice && (orders[i].vipDiscountsPrice / 100) || 0,//会员优惠金额 单位是分
            "is_patient_info": false,
            "is_expire": orders[i].orderStatus == 600 ? true : false,
            "is_need_pay": orders[i].orderStatus == 100 ? true : false,
            "service_package_ref_type": '',
            "url": '',
            patientName: "",
            patientAge: 0,
            patientSex: "",
            serviceType: orders[i].serviceType || '',
            orderStatus: orders[i].orderStatus,
            diease_case_count: 0,
            appointment_count: 0,
            appointment_total_count: 0,
            pregnant_week_str:'',
            last_menstruation:null
          },
          im_group_id: orderGroupRefsIndex[orders[i].orderId] && orderGroupRefsIndex[orders[i].orderId].groupId || ''
        };
        if (!resItem.order.endAt && orders[i].paidTime) {
          let paidTimeObj = new Date(orders[i].paidTime);
          resItem.order.endAt = paidTimeObj.setMonth((paidTimeObj.getMonth() + orders[i].duration))
        }
        if (resItem.order.endAt < Date.now()) {
          resItem.order.is_expire = true
        }
        if (service_packages_index[orders[i].servicePackageId]) {
          resItem.order.icon = service_packages_index[orders[i].servicePackageId].icon;
          resItem.order.desc = service_packages_index[orders[i].servicePackageId].desc;
        }
        if (patient_infos_index[orders[i].orderId]) {
          resItem.order.is_patient_info = true;
          resItem.order.patientName = patient_infos_index[orders[i].orderId].name;
          resItem.order.patientAge = yield patient_info_service.getAge(patient_infos_index[orders[i].orderId].birth, Date.now());
          resItem.order.patientSex = patient_infos_index[orders[i].orderId].sex;
          resItem.order.last_menstruation = patient_infos_index[orders[i].orderId].lastMenstruation || null;
        }
        if (service_package_ref_index[orders[i].servicePackageDoctorRef]) {
          resItem.order.service_package_ref_type = service_package_ref_index[orders[i].servicePackageDoctorRef].type || '';
          if(resItem.order.service_package_ref_type == '产科'){
            resItem.order.url = '/health/checklist.html';
            if(patient_infos_index[orders[i].orderId] && patient_infos_index[orders[i].orderId].lastMenstruation){
              let week = Math.floor((Date.now() -patient_infos_index[orders[i].orderId].lastMenstruation)/(7*24*60*60*1000));
              let day = Math.floor(((Date.now() -patient_infos_index[orders[i].orderId].lastMenstruation)%(7*24*60*60*1000))/(24*60*60*1000));
              let pregnant_week_str = week > 41 ? '已生产': (day ? '孕'+ week +'周' + day + '天' : '孕'+ week +'周');
              resItem.order.pregnant_week_str =  pregnant_week_str;
            }  
          }
          
        }
        if (disease_case_statistisc_index && disease_case_statistisc_index[orders[i].orderId]) {
          resItem.order.diease_case_count = disease_case_statistisc_index[orders[i].orderId].count;
        }
        if (appointment_statistisc_index && appointment_statistisc_index[orders[i].orderId]) {
          resItem.order.appointment_count = appointment_statistisc_index[orders[i].orderId].count;
        }
        if (appointment_total_statistisc_index && appointment_total_statistisc_index[orders[i].orderId]) {
          resItem.order.appointment_total_count = appointment_total_statistisc_index[orders[i].orderId].count;
        }
        items.push(resItem);

      }
      return {
        code: '200',
        msg: '',
        items: items
      }
    })
  },
  insert_service_package_order_assistant: function (assistant_id, data, req) {
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
      let order = yield servicePackageOrderService.createOrder(
        data.userId,
        data.servicePackageDoctorRefId,
        data.doctorId,
        undefined,
        undefined,
        req,
        undefined,
        true
      )
      result.data = order;
      return result
    })
  }
}