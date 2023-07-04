/**
 * 预约医生订单表 service
 * Created by Mr.Carry on 2017/12/14.
 */
"use strict";
let makeAppointmentOrder = require('./../../models/service_package/makeAppointmentOrder'),
  servicePackageOrderService = require('./../../services/service_package/servicePackageOrderService'),
  servicePackageOrderUtil = require('./servicePackageOrderUtil'),
  TransactionMysqlService = require('./../../services/TransactionMysqlService'),
  ServiceSignedDoctorsService = require('./../../services/service_package/serviceSignedDoctorsService'),
  ServicePackageDoctorAssistantRefService = require('./../../services/service_package/servicePackageDoctorAssistantRefService'),
  ServicePackageAssistantService = require('../../services/service_package/servicePackageAssistantService'),
  servicePackageDoctorService = require('../../services/service_package/servicePackageDoctorService'),

  Promise = require('promise'),
  constants = require('./../../configs/constants'),
  commonUtil = require('../../../lib/common-util'),
  moment = require('moment'),
  _ = require('underscore');


let makeAppointmentOrderService = function () {};

/**
 * 在预约订单中添加数据
 * @param arg
 */
let createOrder = (arg) => {
  console.log('创建订单');
  arg.price = arg.price * 100;
  return makeAppointmentOrder
    .create(arg)
    .then(function () {
      arg.price = arg.price / 100;
      return {
        "orderId": arg.orderId,
        "wxorderId": arg.wxorderId,
        "servicePackageOrderId": arg.servicePackageOrderId,
        "wxtimeStamp": arg.wxTimeStamp,
        "price": arg.price,
        "orderName": arg.orderName,
        "orderDesc": arg.orderDesc,
        "orderTime": arg.orderTime
      };
    });
};

/**
 * 创建订单
 * @param userId 用户唯一标识
 * @param servicePackageOrderId 服务包订单唯一标识
 * @param workTime 预约的出诊时间
 * @param address 预约的出诊地址
 * @param items 预约项目
 * @param instructions 预约说明
 * @param checklist_imgs 检查单
 * @param operatePhoneNum 操作人员手机号
 */
makeAppointmentOrderService.prototype.createOrder = function (
  userId,
  servicePackageOrderId,
  workTime,
  address,
  req,
  items,
  instructions,
  checklist_imgs,
  operatePhoneNum) {
  workTime = parseInt(workTime);
  var arg, order = {};
  const self = this;
  return servicePackageOrderService
    .findByOrderId(servicePackageOrderId)
    .then(function (orders) {
      if (orders && orders.length > 0) {
        order = orders[0];
      }
      console.log('订单信息', order);
      arg = {
        orderId: servicePackageOrderUtil.createOrderId('M'), //生成订单号
        servicePackageOrderObjectId: order.order._id, //服务包唯一标识
        servicePackageOrderId: servicePackageOrderId,
        wxorderId: '', //生成微信订单号
        wxTimeStamp: Date.now(), //微信时间戳
        userId: order.user._id, //用户id
        userName: order.user.name, //用户名
        userPhoneNum: order.user.phoneNum, //用户手机号
        doctorId: order.doctor._id, //服务包医生id
        doctorAvatar: order.doctor.avatar, //医生头像
        doctorName: order.doctor.name, //医生姓名
        doctorHospital: order.doctor.hospital, //医生所属医院
        doctorDepartment: order.doctor.department, //医生科室
        orderName: order.order.servicePackageName + ' ' + order.doctor.name + ' 预约时间：' + moment(new Date(workTime)).format('YYYY-MM-DD HH:mm'),
        orderDesc: order.order.servicePackageName + ' ' + order.doctor.name + ' 预约时间：' + moment(new Date(workTime)).format('YYYY-MM-DD HH:mm'),
        doctorJobTitle: order.doctor.title, //医生职称
        orderTime: workTime, //预约时间
        address: address, //预约地址
        price: order.servicePackageDoctorRef.orderPrice / 100, //预约费用
        items: items, //预约项目
        desc: instructions, //预约说明
        guidePic: checklist_imgs, //检查单,
        price: 0,
        operatePhoneNum: operatePhoneNum
      };
      if (operatePhoneNum) {
        arg.from = 2;
      }
      //items, instructions, checklist_imgs

      return ServicePackageDoctorAssistantRefService.findOneAssistantInfo(arg.doctorId + '');
    })
    .then(function (_ass) {
      _ass = _ass;
      console.log(_ass);
      if (arg.price === 0) {
        arg.status = 200;
        arg.paidTime = Date.now();

        // 发送短信
        self.sendSMS(arg.userPhoneNum, arg.userName, arg.items, arg.orderTime);

        return createOrder(arg);
      } else {
        return servicePackageOrderUtil
          .createWXOrderId(arg.price, arg.orderId, arg.orderName, req)
          .then(function (wxDT) {
            arg.wxorderId = wxDT.prepayId;
            return createOrder(arg);
          });
      }
    })
};

/**
 * 修改预约服务订单
 * @param {*} orderId 订单唯一标识
 * @param {*} items 预约项目
 * @param {*} instructions 预约说明
 * @param {*} checklist_imgs 检查单
 * @param {*} orderTime 预约时间
 * @param {*} status 订单状态（100 未支付, 200支付成功,300取消订单,400预约完成，600订单过期）
 * @param {*} address 地址
 */
makeAppointmentOrderService.prototype.updateOrder = function (
  orderId,
  items,
  instructions,
  checklist_imgs,
  orderTime,
  status,
  address,
  assistantId
) {
  let update = {};
  if (items) {
    update.items = items;
  }
  if (instructions || instructions === '') {
    update.desc = instructions;
  }
  if (checklist_imgs) {
    update.guidePic = checklist_imgs;
  }
  if (orderTime) {
    update.orderTime = orderTime;
  }
  if (status) {
    update.status = status;
  }
  if (address) {
    update.address = address;
  }
  if (assistantId) {
    update.operateAssistantId = assistantId
  }
  let cond = {
    orderId: orderId,
    isDeleted: false
  }

  return makeAppointmentOrder.update(cond, update);
}

/*
 * 获取支付状态
 */
makeAppointmentOrderService.prototype.getPayStatus = function (orderId) {

  if (!orderId) {
    return false;
  }
  let cond = {
    isDeleted: false,
    'orderId': orderId
  };
  return makeAppointmentOrder.findOne(cond)
    .then(function (order) {
      if (order && order.status && order.status > 100) {
        return true;
      } else {
        return false;
      }
    })
};


/**
 * 取消订单
 */
makeAppointmentOrderService.prototype.cancelOrder = function (userId, orderId) {
  if (!orderId) {
    return {
      code: 400,
      messsage: '请求参数有误'
    };
  }
  let cond = {
    isDeleted: false,
    'orderId': orderId,
    status: 200
  };
  let now = Date.now();
  let orderMA;
  return makeAppointmentOrder.findOne(cond)
    .then(function (order) {
      if (!order) {
        throw {
          code: 8005,
          message: "请求参数有误"
        };
      }
      orderMA = order;
      if (order.orderTime - now < constants.TIME1D) {
        throw {
          code: 2428,
          message: "取消预约需要至少提前24小时"
        };
      }
      return makeAppointmentOrder.findOneAndUpdate(cond, {
        status: 300
      }, {
        new: true
      })
    })
    .then(function (order) {
      console.log('取消预约时的预约信息', order);
      console.log('取消预约时的预约信息', order.status);
      console.log('取消预约时的预约信息', order.status == 300);
      if (order && order.status && order.status == 300) {
        var sqls = TransactionMysqlService.genMAIncomeSqls(
          userId + '',
          order.price / 100,
          order.orderId + '',
          "预约医生退款"
        );
        return TransactionMysqlService.execSqls(sqls)
      } else {
        throw {
          code: 2429,
          message: "取消预约失败"
        };
      }
    })
    .then(function (_sql) {
      console.log('进入_sql', _sql);
      console.log(typeof orderMA.doctorId);
      console.log(typeof (orderMA.doctorId + ''));
      return ServicePackageDoctorAssistantRefService.findOneAssistantInfo(orderMA.doctorId + '');
    })
    .then(function (_ass) {
      console.log('取消预约助理信息', _ass);
      //取消提醒
      ServicePackageDoctorAssistantRefService.sendMACancelSmsNew(orderMA.userPhoneNum, orderMA.orderTime, orderMA.userName, orderMA.items);

      return {
        code: 200
      };
    })
};
makeAppointmentOrderService.prototype.findOrderByOrderIdSample = function (orderId) {
  var cond = {
    isDeleted: false,
    orderId: orderId
  }
  return makeAppointmentOrder.findOne(cond);
}

makeAppointmentOrderService.prototype.commonPayOrderById = function (orderId, payType) {
  var cond = {
    isDeleted: false,
    orderId: orderId
  }
  var update = {
    $set: {
      paidType: payType,
      status: 200,
      paidTime: Date.now()
    }
  }

  if (payType == 'wx') {
    update['$set'].paidType = 'wechat';
  } else if (payType == 'ali') {
    update['$set'].paidType = 'alipay';
  } else if (payType == 'sys_pay') {
    update['$set'].paidType = 'balance';
  }
  return makeAppointmentOrder.update(cond, update, {
    new: true
  });
}


/**
 * 星期的数字转换为中文
 * @param number [ 1-7 ]
 * @return 中文字符串
 */
let numberConvertChinese = (number) => {
  switch (number) {
    case 1:
      return '一';
    case 2:
      return '二';
    case 3:
      return '三';
    case 4:
      return '四';
    case 5:
      return '五';
    case 6:
      return '六';
    case 0:
      return '日';

  }
};

/**
 * 转换时间格式
 * @param time
 * @return {void|string|XML|*}
 */
let timeConvert = (time) => {
  let timeObj = moment(time);
  let day = timeObj.day();
  let timeStr = timeObj.format('MM月DD日时区 HH:mm');
  let hour = timeObj.hour();
  if (hour <= 11) {
    hour = '上午';
  } else if (hour == 12) {
    hour = '中午';
  } else if (hour <= 18) {
    hour = '下午';
  } else if (hour > 18) {
    hour = '晚上';
  }
  return timeStr.replace('时区', '(周' + numberConvertChinese(day) + ')' + hour);
}

/**
 * 获取所有预约医生订单信息
 * @param userId 用户唯一标识
 * @param status 订单状态
 * @param servicePackageOrderObjectId 服务包订单唯一标识
 * @param orderId 订单唯一标识
 * @param servicePackageOrderId 服务包订单标识
 * @return Promise<T>
 */
makeAppointmentOrderService.prototype.findAll = (userId, status, servicePackageOrderObjectId, orderId, servicePackageOrderId) => {
  let cond = {
    isDeleted: false,
    userId: userId,
    status: {
      '$gt': 100
    }
  };
  if (status) {
    cond.status = status;
  }
  if (servicePackageOrderObjectId) {
    cond.servicePackageOrderObjectId = servicePackageOrderObjectId;
  }
  if (servicePackageOrderId) {
    cond.servicePackageOrderId = servicePackageOrderId;
  }
  if (orderId) {
    cond.orderId = orderId;
  }
  console.log(cond)
  let now = Date.now();
  let orders = [];
  let service_evaluations_index;
  let patient_info_index;

  return makeAppointmentOrder
    .find(cond, '')
    .sort({
      'orderTime': -1
    })
    .then(function (dt) {
      if (dt && dt.length > 0) {
        orders = dt;
      }
      let orderIds = _.map(orders, 'orderId');
      let servicePackageOrderIds = _.map(orders, 'servicePackageOrderId');
      let service_evaluation_model = Backend.model("service_package", undefined, 'service_evaluation');
      const patient_info_model = Backend.model('service_package', undefined, 'patient_info');
      return Promise.all([
        service_evaluation_model.find({
          isDeleted: false,
          makeAppointmentOrderId: {
            $in: orderIds
          }
        }),
        patient_info_model.find({
          isDeleted: false,
          servicePackageOrder: {
            $in: servicePackageOrderIds
          }
        })
      ])
    })
    .then(function (allRes) {
      let service_evaluations = allRes[0];
      const patient_infos = allRes[1];
      patient_info_index = _.indexBy(patient_infos, 'servicePackageOrder');
      service_evaluations_index = _.indexBy(service_evaluations, 'makeAppointmentOrderId');
      let assistantIds = _.map(orders, 'operateAssistantId');
      assistantIds = _.uniq(assistantIds)
      return ServicePackageAssistantService.findAssistantByIds(assistantIds);
    })
    .then(function (assistant) {
      let assistant_index = _.indexBy(assistant, '_id');
      orders = orders.map(function (item) {
        let timeStr = timeConvert(item.orderTime);
        let resItem = {
          _id: item._id,
          doctor: {
            name: item.doctorName,
            title: item.doctorJobTitle,
            hospital: item.doctorHospital,
            department: item.doctorDepartment,
            avatar: item.doctorAvatar,
          },
          order: {
            orderId: item.orderId,
            price: item.price / 100,
            status: item.status,
            workTimeStr: timeStr,
            workTime: item.orderTime,
            address: item.address,
            items: item.items,
            instructions: item.desc,
            checklist_imgs: item.guidePic,
            servicePackageOrderId: item.servicePackageOrderId,
            is_cancle: (Date.now() + 24 * 60 * 60 * 1000) < item.orderTime,
            is_evaluate: item.status == 400,
            patientName: patient_info_index[item.servicePackageOrderId] && patient_info_index[item.servicePackageOrderId].name || ''
          },
          evaluation: {
            doctorId: item.doctorId, //医生id
            doctorName: item.doctorName || '', //医生名字
            doctorAvatar: item.doctorAvatar || '', //医生头像
            doctorStarRating: null, //医生评价星级
            doctorEvaluationDesc: '', //医生评价详情

            assistantId: '', //助理id
            assistantName: '',
            assistantAvatar: '',
            assistantStarRating: null, //医生评价星级
            assistantEvaluationDesc: '', //医生评价详情

            isShow: false
          }
        }
        if (assistant_index[item.operateAssistantId]) {
          resItem.evaluation.assistantId = assistant_index[item.operateAssistantId]._id;
          resItem.evaluation.assistantName = assistant_index[item.operateAssistantId].name || '';
          resItem.evaluation.assistantAvatar = assistant_index[item.operateAssistantId].avatar || '';
        }
        if (service_evaluations_index[item.orderId]) {
          resItem.order.is_evaluate = false;
          resItem.evaluation.doctorStarRating = service_evaluations_index[item.orderId].doctorStarRating || null;
          resItem.evaluation.doctorEvaluationDesc = service_evaluations_index[item.orderId].doctorEvaluationDesc || '';
          resItem.evaluation.assistantStarRating = service_evaluations_index[item.orderId].assistantStarRating || null;
          resItem.evaluation.assistantEvaluationDesc = service_evaluations_index[item.orderId].assistantEvaluationDesc || '';
          resItem.evaluation.isShow = true;
        }
        return resItem;
      })
      return orders;
    })

};

makeAppointmentOrderService.prototype.findMakeAppointmentOrderServiceByCond = function (cond) {

  cond.isDeleted = false;
  return makeAppointmentOrder.find(cond).exec();
};

/**
 * 获取某一天所有医生的有效预约数量，和医生下预约用户的头像
 * 只获取未就诊
 * @param doctorIds
 * @param beginAt
 * @param endAt
 * @returns {AggregationCursor|Aggregate|Promise|*}
 */
makeAppointmentOrderService.prototype.getDoctorsAppointmentInfo = function (doctorIds, beginAt, endAt) {
  const now = Date.now(); //2017-12-21 todo:打开
  // const now = new Date('2017-12-21'); //2017-12-21
  const beginTS = getDateBeginTS(now);
  const endTS = getDateEndTS(now);
  beginAt = beginAt || beginTS;
  endAt = endAt || endTS;
  const match = {
    doctorId: {
      $in: doctorIds
    },
    isDeleted: false,
    status: 200,
    orderTime: {
      $gt: beginAt,
      $lte: endAt
    }
  };
  const match_cout = {
    doctorId: {
      $in: doctorIds
    },
    isDeleted: false,
    // status: { $in: [200, 400] },
    orderTime: {
      $gt: beginAt,
      $lte: endAt
    }
  };
  const group = {
    _id: '$doctorId',
    count: {
      $sum: 1
    },
    userIds: {
      $push: '$userId'
    },
  };
  return Promise.all([
    makeAppointmentOrder.aggregate([{
        $match: match
      },
      {
        $group: group
      }
    ]).exec(),
    makeAppointmentOrder.aggregate([{
        $match: match_cout
      },
      {
        $group: group
      }
    ]).exec()
  ]);
};

/**
 * 获取预约详情
 */
makeAppointmentOrderService.prototype.getAppointmentsByOrderId = function (orderId) {
  const cond = {
    isDeleted: false,
    orderId,
  };
  return makeAppointmentOrder.findOne(cond, '');
};

/**
 * 获取预约详情Map
 */
makeAppointmentOrderService.prototype.getAppointmentsByOrderIdMap = async function (orderIds) {
  const cond = {
    isDeleted: false,
    orderId: {
      $in: orderIds
    }
  };
  const result = await makeAppointmentOrder.find(cond, '');
  return _.indexBy(result, "orderId");
};

/**
 * 通过订单号查询预约订单
 * @param orderId
 * @returns {Query|Promise|void|*}
 */
makeAppointmentOrderService.prototype.findAppointmentOrderByOrderId = function (orderId, fields) {
  const cond = {
    isDeleted: false,
    orderId: orderId
  };
  return makeAppointmentOrder.findOne(cond, fields || undefined);
};

/**
 * 预约成功提醒
 * @param phoneNum
 * @param userName
 * @param items
 * @param orderTime
 */
makeAppointmentOrderService.prototype.sendSMS = function (phoneNum, userName, items, orderTime) {
  //todo: sms_template
  //2377990 会员name 预约项目items 时间date
  const text = '#name#=' + userName +
    "&#date#=" + dateFormat(orderTime, 'yyyy年MM月dd日hh时mm分') +
    "&#items#=" + (items || []).slice(0, 2).join('、');
  commonUtil.sendSms('2377990', phoneNum, text);
};

/**
 * 转换时间格式,eg: 07月15日(周日)下午 15:50
 * @param time
 * @returns {void|string|XML|*}
 */
makeAppointmentOrderService.prototype.timeConvert = function (time) {
  return timeConvert(time);
};
module.exports = new makeAppointmentOrderService();