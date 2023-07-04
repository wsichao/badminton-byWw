/**
 * 订单公共方法 service
 * Created by Mr.Carry on 2017/12/13.
 */
"use strict";

let commonUtil = require('../../../lib/common-util'),
  servicePackageDoctorRef = require('./../../models/service_package/servicePackageDoctorRef'),
  servicePackage = require('./../../models/service_package/servicePackage'),
  servicePackageOrder = require('./../../models/service_package/servicePackageOrder'),
  makeAppointmentOrder = require('./../../models/service_package/makeAppointmentOrder'),
  WXController = require('./../../controllers/WXController'),
  Promise = require('promise'),
  moment = require('moment');


let ServicePackageOrderUtil = function () {
};


/**
 * 生成订单号
 * 订单唯一标识 xxxx20171213111224
 * xxxx:为MongoDB.ObjectId md5 -> {0,3}
 * 20171213111224  秒
 * @param prefixes 订单前缀，标识订单类型
 * @return String
 */
ServicePackageOrderUtil.prototype.createOrderId = (prefixes) => {
  let objectId = commonUtil.getNewObjectId() + '';
  let md5 = commonUtil.genCommonMD5(objectId);
  let xxxx = md5.substring(0, 4);
  let now = Date.now();
  return (prefixes || '') + xxxx + commonUtil.getyyyyMMddhhmmss(now);
};


/**
 * 生成微信订单
 * @param money 支付金额
 * @param orderId 订单号
 * @param prdName 订单标题
 * @param req
 * @return Promise
 */
ServicePackageOrderUtil.prototype.createWXOrderId = (money, orderId, prdName, req,applet,assistant) => {
  let d = {
    money: money,
    tradeNo: orderId,
    body: prdName
  };
  if(applet){
    d.openid = applet.openid;
    return WXController.WXPayApplet(req, d);
  }else if(assistant){
    return WXController.WXAssistantPay(req, d);
  }
  else{
    return WXController.WXPay(req, d);
  }

};


/**
 * 验证订单是否可创建
 * 1、医生--服务包 是否有绑定关系
 * 2、验证该服务包是否超出下单限制
 * @param doctorId 医生唯一标识
 * @param servicePackageDoctorRefId 服务包医生关系唯一标识
 * @return Promise<string> "" 成功，失败有错误信息
 */
ServicePackageOrderUtil.prototype.validOrderRef = (doctorId, servicePackageDoctorRefId) => {
  let result = '';
  let cond = {
    _id: servicePackageDoctorRefId,
    isDeleted: false
  };
  let vipNum;
  return servicePackageDoctorRef.findOne(cond)
    .then(function (ref) {
      if (!ref || (ref.doctorId + "") != (doctorId + "")) {
        result = '该医生没有绑定服务包';
      }
      vipNum = ref && ref.vipNum || 0;
      let cond2 = {
        isDeleted: false,
        servicePackageDoctorRef: servicePackageDoctorRefId,
        orderStatus: 200
      };
      return servicePackageOrder.count(cond2)
    })
    .then(function (count) {
      if (vipNum) {
        if (count >= vipNum) {
          result = '医生该服务包的会员名额已满';
        }
      }
      return result;
    })
};


/**
 * 获取当天开始、结束时间戳
 * @return { startTime ,  endTime }
 */
let dayTime = function (workTime) {
  let startTime = moment(workTime).format('YYYY-MM-DD');
  let endTime = startTime + ' 23:59:59';

  startTime = (new Date(startTime + ' 00:00:01')).getTime();
  endTime = (new Date(endTime)).getTime();

  return {startTime: startTime, endTime: endTime};
};

/**
 * 验证预约订单是否可创建
 * 验证该服务包是否超出下单限制
 * @param servicePackageOrderId 服务包订单id
 * @param userId 用户id
 * @param workTime 预约时间
 * @return Promise<string> "" 成功，失败有错误信息
 */
ServicePackageOrderUtil.prototype.validmakeAppointmentOrder = (servicePackageOrderId, userId, workTime) => {
  workTime = parseInt(workTime);
  let cond = {
    orderId: servicePackageOrderId,
    isDeleted: false
  };

  let servicePackageId;
  let doctorId;
  let limitCount = 0;
  let appointmentCount = 0;


  // 获取当前最大最小时间
  let cond_1 = {
    isDeleted: false,
    userId: commonUtil.getObjectIdByStr(userId),
    servicePackageOrderId: servicePackageOrderId,
    status: 200,
    $and: [
      {orderTime: {'$gt': dayTime(workTime).startTime}},
      {orderTime: {'$lt': dayTime(workTime).endTime}}
    ]
  };


  // 当天成单数
  let successOrderCount = 0;
  // 预约时间
  let workTimeCount = 0;

  return Promise.all([
    servicePackageOrder.findOne(cond),
    makeAppointmentOrder.count(cond_1)
  ])
    .then(function (res) {
      let spOrder = res[0];
      successOrderCount = res[1];


      if (!spOrder) {
        return '请求参数有误'
      }
      servicePackageId = spOrder.servicePackageId;
      doctorId = spOrder.doctorId;
      let cond2 = {
        _id: servicePackageId,
        isDeleted: false
      }
      return servicePackage.findOne(cond2)
    })
    .then(function (servicePackage) {
      limitCount = servicePackage.frequency;
      let cond3 = {
        doctorId: doctorId,
        isDeleted: false,
        servicePackageOrderId: servicePackageOrderId,
        status: 200
      }

      let count_2 = {
        isDeleted: false,
        orderTime: workTime,
        doctorId: doctorId,
        status: 200
      };


      return Promise.all([makeAppointmentOrder.count(cond3), makeAppointmentOrder.count(count_2)])
    })
    .then(function (dt) {
      appointmentCount = dt[0];
      workTimeCount = dt[1];
      if (appointmentCount >= limitCount) {
        return '已超出最大预约限制';
      } else if (successOrderCount > 0) {
        return '当天只可预约一单';
      } else if (workTimeCount > 0) {
        return '该时间已被预约';
      }
      else {
        return '';
      }
    })
};
module.exports = new ServicePackageOrderUtil();