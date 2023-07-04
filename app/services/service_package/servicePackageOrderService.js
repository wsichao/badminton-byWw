/**
 * 服务包订单 service
 * Created by Mr.Carry on 2017/12/11.
 */
"use strict";
let servicePackageOrder = require('./../../models/service_package/servicePackageOrder');
let servicePackageUtil = require('./servicePackageOrderUtil');
let servicePackageDoctorRefSreivce = require('./servicePackageDoctorRefSreivce');
let userModel = require('./../../models/Customer');
let commonUtil = require('./../../../lib/common-util');
let Promise = require('promise');
let moment = require('moment');


let ServicePackageServiceOrder = function () {
};

/**
 * 获取服务包订单列表
 * @param userId 用户唯一标识 非空
 * @return {Array|{index: number, input: string}}
 */
ServicePackageServiceOrder.prototype.findAll = function (userId) {
  if (!userId) {
    throw new Error('userId 不能为空');
  }
  userId = commonUtil.getObjectIdByStr(userId);
  let cond = {
    'isDeleted': false,
    'userId': userId,
    // 'orderStatus': {'$gt': 200}
  };

  return servicePackageOrder.aggregate([
    {'$match': cond},
    {'$sort': {createdAt:-1}},
    {
      '$lookup':
        {
          'localField': "doctorId",
          'from': "servicePackageDoctor",
          'foreignField': "_id",
          'as': "servicePackageDoctor"
        }
    },
    {
      '$lookup':
        {
          'localField': "userId",
          'from': "users",
          'foreignField': "_id",
          'as': "user"
        }
    },
    {
      '$project': {
        'orderId': 1,
        'wxorderId': 1,
        'wxTimeStamp': 1,
        'servicePackageName': 1,
        'mountOfRealPay': 1,
        'orderStatus': 1,
        'paidType': 1,
        'createdAt': 1,
        'caseDescription': 1,
        'casePics': 1,
        'servicePackageDoctor.name': 1,
        'servicePackageDoctor.title': 1,
        'servicePackageDoctor.hospital': 1,
        'servicePackageDoctor.department': 1,
        'servicePackageDoctor.avatar': 1,
        'user.name': 1,
        'user.phoneNum': 1,
      }
    }
  ])
    .exec()
    .then(function (dt) {
      if (dt) {
        dt = dt.map((item) => {
          let valObj = {order: {}, doctor: {}};
          let user = {};
          if (item.servicePackageDoctor && item.servicePackageDoctor.length > 0) {
            valObj.doctor = item.servicePackageDoctor[0];
          }
          if (item.user && item.user.length > 0) {
            user = item.user[0];
          }
          valObj.order = {
            "_id": item._id,
            "orderId": item.orderId || '',
            "wxorderId": item.wxorderId || '',
            "wxTimeStamp": item.wxTimeStamp || '',
            "price": item.mountOfRealPay || 0,
            "name": item.servicePackageName || '',
            "caseDescription": item.caseDescription || '',
            "casePics": item.casePics || [],
            "status": item.orderStatus,
            "createdAt": item.createdAt,
            'contractor': user.name || '',
            'contractorPhone': user.phoneNum || '',
            'paidType': item.paidType || ''
          };
          valObj.order.price = valObj.order.price / 100;
          return valObj;
        })
      }
      return dt;
    });
};

ServicePackageServiceOrder.prototype.findOrderByOrderIdSample = function (orderId) {
  var cond = {
    isDeleted: false,
    orderId: orderId
  }
  return servicePackageOrder.findOne(cond);
}

ServicePackageServiceOrder.prototype.commonPayOrderById = function (orderId, payType,order_duration) {
  var cond = {
    isDeleted: false,
    orderId: orderId
  }
  var update = {
    $set: {
      paidType: payType,
      orderStatus: 200,
      paidTime: Date.now()
    }
  }
  if (payType == 'wx') {
    update['$set'].paidType = 'wechat';
  } else if (payType == 'ali') {
    update['$set'].paidType = 'alipay';
  }else if(payType=='sys_pay'){
      update['$set'].paidType = 'balance';
  }
  if(order_duration){
    let paidTimeObj = new Date(update['$set'].paidTime);
    update['$set'].deadlinedAt = paidTimeObj.setMonth((paidTimeObj.getMonth() +order_duration));
  }
  return servicePackageOrder.findOneAndUpdate(cond, update, {new: true});
}


/**
 * 获取服务包信息
 * @return {Array|{index: number, input: string}}
 */
ServicePackageServiceOrder.prototype.findByOrderId = function (servicePackageOrderId) {
  if (!servicePackageOrderId) {
    throw new Error('servicePackageOrderId 不能为空');
  }
  let cond = {
    'isDeleted': false,
    'orderId': servicePackageOrderId
  };
  return servicePackageOrder.aggregate([
    {'$match': cond},
    {
      '$lookup':
        {
          'localField': "doctorId",
          'from': "servicePackageDoctor",
          'foreignField': "_id",
          'as': "servicePackageDoctor"
        }
    },
    {
      '$lookup':
        {
          'localField': "userId",
          'from': "users",
          'foreignField': "_id",
          'as': "user"
        }
    },
    {
      '$lookup':
        {
          'localField': "servicePackageDoctorRef",
          'from': "servicePackageDoctorRef",
          'foreignField': "_id",
          'as': "servicePackageDoctorRef"
        }
    },
    {
      '$project': {
        'orderId': 1,
        'servicePackageName': 1,
        'mountOfRealPay': 1,
        'orderStatus': 1,
        'paidType': 1,
        'createdAt': 1,
        'caseDescription': 1,
        'casePics': 1,
        'servicePackageDoctor._id': 1,
        'servicePackageDoctor.name': 1,
        'servicePackageDoctor.title': 1,
        'servicePackageDoctor.hospital': 1,
        'servicePackageDoctor.department': 1,
        'servicePackageDoctor.avatar': 1,
        'user._id': 1,
        'user.name': 1,
        'user.phoneNum': 1,
        'servicePackageDoctorRef._id': 1,
        'servicePackageDoctorRef.orderPrice': 1
      }
    }
  ])
    .exec()
    .then(function (dt) {
      if (dt) {
        dt = dt.map((item) => {
          let valObj = {order: {}, doctor: {}, user: {}, servicePackageDoctorRef: {}};
          let user = {};
          if (item.servicePackageDoctor && item.servicePackageDoctor.length > 0) {
            valObj.doctor = item.servicePackageDoctor[0];
          }
          if (item.user && item.user.length > 0) {
            valObj.user = item.user[0];
          }
          if (item.servicePackageDoctorRef && item.servicePackageDoctorRef.length > 0) {
            valObj.servicePackageDoctorRef = item.servicePackageDoctorRef[0];
          }
          valObj.order = {
            "_id": item._id,
            "orderId": item.orderId,
            "mountOfRealPay": item.mountOfRealPay,
            "servicePackageName": item.servicePackageName,
            "caseDescription": item.caseDescription,
            "casePics": item.casePics,
            "orderStatus": item.orderStatus,
            "createdAt": item.createdAt,
          };
          return valObj;
        })
      }
      return dt;
    });
};

/**
 * 根据用户id获取订单列表
 * @param userId
 * @return {T|{set, expr}|*|{ID, NAME, TAG}|{}}
 */
ServicePackageServiceOrder.prototype.findOrdersByUserId = function (userId) {
  var cond = {
    isDeleted: false,
    'userId': userId,
    'orderStatus': {'$gt': 200}
  };
  return servicePackageOrder.find(cond).sort({createdAt:-1})
};

/**
 * 查询订单支付结果
 * @param orderId status
 * @return {Boolean }
 */
ServicePackageServiceOrder.prototype.getPayStatus = function (orderId) {
  if (!orderId) {
    return false;
  }
  let cond = {
    isDeleted: false,
    'orderId': orderId
  };
  return servicePackageOrder.findOne(cond)
    .then(function (order) {
      if (order && order.orderStatus && order.orderStatus > 100) {
        return true;
      } else {
        return false;
      }
    })
};


/**
 * 根据用户id获取用户信息
 * @param id
 * @return {Array|{index: number, input: string}}
 */
let getUserInfoByID = (id) => {
  let cond = {
    '_id': id,
    'isDeleted': false
  };
  return userModel.findOne(cond, 'name phoneNum').exec();
};

/**
 * servicePackageOrder 创建一条订单记录
 * @param arg
 */
let createPackageOrder = function (arg) {
  arg.mountOfRealPay = arg.mountOfRealPay * 100;
  return servicePackageOrder.create({
    orderId: arg.orderId,
    wxorderId: arg.wxorderId,
    wxTimeStamp: arg.wxTimeStamp,
    duration: arg.duration,
    deadlinedAt: arg.deadlinedAt,
    userId: arg.userId,
    userName: arg.userName,
    userPhoneNum: arg.userPhoneNum,
    mountOfRealPay: arg.mountOfRealPay,
    vipPrice:arg.vipPrice,//会员价   单位分
    vipDiscountsPrice : arg.vipDiscountsPrice,//会员优惠金额 单位是分

    servicePackageId: arg.servicePackageId,
    servicePackageDoctorRef: arg.servicePackageDoctorRef,
    servicePackageName: arg.servicePackageName,
    doctorId: arg.doctorId,
    doctorAvatar: arg.doctorAvatar,
    doctorName: arg.doctorName,
    doctorHospital: arg.doctorHospital,
    doctorDepartment: arg.doctorDepartment,
    doctorJobTitle: arg.doctorJobTitle,
    caseDescription: arg.caseDescription,
    casePics: arg.casePics,
    serviceType: arg.serviceType
  })
    .then(function (res) {
      return {
        orderId: arg.orderId,
        wxorderId: arg.wxorderId,
        wxtimeStamp: arg.wxTimeStamp,
        price: arg.mountOfRealPay / 100,
        orderName: arg.servicePackageName,
        orderDesc: arg.servicePackageDesc,
        createdAt: res.createdAt,
      }
    });
};


/**
 * 创建服务包订单
 * @param userId 用户唯一标识
 * @param servicePackageDoctorRefId 医生服务包关联唯一标识
 * @param doctorId 医生唯一标识
 * @param caseDescription
 * @param casePics
 * @param req
 */
ServicePackageServiceOrder.prototype.createOrder = (
  userId,
  servicePackageDoctorRefId,
  doctorId,
  caseDescription,
  casePics,
  req,
  applet,
  assistant) => {
  let orderId = servicePackageUtil.createOrderId('S'); // 系统订单号
  let wxTimeStamp = Date.now(); //微信时间戳
  // 1、取服务包信息 [ 服务包截止时间:deadlinedAt,服务包服务时长(月为单位):duration,服务包名称:servicePackageName, ]
  let serviceDt = servicePackageDoctorRefSreivce.findServicePackage(servicePackageDoctorRefId);
  // 2、获取用户信息 [ 用户id:userId,用户姓名:userName ]
  let userDt = getUserInfoByID(userId);

  return Promise.all([serviceDt, userDt])
    .then((res) => {
      let serviceObj = res[0];
      let userObj = res[1];
      let arg = {
        orderId: orderId, // 订单号
        wxTimeStamp: wxTimeStamp, //微信时间戳
        duration: serviceObj.servicePackage.duration,// 服务包时长
        deadlinedAt: serviceObj.servicePackage.deadlinedAt,// 服务包时长
        userId: userObj._id, // 用户唯一标识
        userName: userObj.name,  // 用户名
        userPhoneNum: userObj.phoneNum, //手机号码
        mountOfRealPay: serviceObj.vipPrice / 100, //实付金额
        vipPrice:serviceObj.vipPrice,//会员价   单位分
        vipDiscountsPrice : serviceObj.vipDiscountsPrice,//会员优惠金额 单位是分

        servicePackageId: serviceObj.servicePackage._id, //服务包ID
        servicePackageDoctorRef: serviceObj._id, //服务包医生关系Id
        servicePackageName: serviceObj.servicePackage.name,// 服务包名称
        servicePackageDesc: serviceObj.servicePackage.desc,// 服务包名称
        doctorId: serviceObj.servicePackageDoctor._id, // 服务包医生id
        doctorAvatar: serviceObj.servicePackageDoctor.avatar, // 医生头像
        doctorName: serviceObj.servicePackageDoctor.name, // 医生姓名
        doctorHospital: serviceObj.servicePackageDoctor.hospital, //医生所属医院
        doctorDepartment: serviceObj.servicePackageDoctor.department, //医生科室
        doctorJobTitle: serviceObj.servicePackageDoctor.title, //医生职称
        wxorderId: '',
        caseDescription: caseDescription,
        casePics: casePics,
        
        serviceType: serviceObj.serviceType
      };
      if(assistant){
        arg.fromApp = 'assistant'
      }
      let vip_member_model = Backend.model('service_package',undefined,'vip_member');
      return vip_member_model.methods.isVipMember(userId)
        .then(function(isVipRes){
          if(isVipRes && serviceObj.vipDiscountsPrice){
            arg.mountOfRealPay =  (serviceObj.vipPrice-serviceObj.vipDiscountsPrice)/100
          }
          if(req){
            return servicePackageUtil
            .createWXOrderId(arg.mountOfRealPay, orderId, arg.servicePackageName, req,applet,assistant)
          }
        })
        .then(function (wxDt) {
          if(wxDt){
            arg.wxorderId = wxDt.prepayId;
          }
          return createPackageOrder(arg);
        })
        .then(function(resObj){
          resObj.servicePackageType = serviceObj.type || '';
          return resObj
        })
    })
};
/**
 * 通过会员服务包ID，查询会员服务包信息
 * @param servicePackageOrderId
 * @returns {Promise}
 */
ServicePackageServiceOrder.prototype.getServicePackageOrderInfoById = function (servicePackageOrderId) {
  let cond = {
    isDeleted: false,
    'orderId': servicePackageOrderId
  };
  return servicePackageOrder.findOne(cond).exec();
};
/**
 * 通过用户ID和医生ID，查询审核通过的服务包订单
 * @param userId
 * @param doctorId
 */
ServicePackageServiceOrder.prototype.findOrdersByUserIdAndDoctorId = function (userId,doctorId) {
    var cond = {
        isDeleted: false,
        'userId': userId,
        'doctorId':doctorId,
        'orderStatus': 200
    };
    return servicePackageOrder.find(cond).sort({createdAt:-1})
};
/**
 * 通过order主键_id 查询order
 * @param orderid
 */
ServicePackageServiceOrder.prototype.findOrder = function (orderid) {
  var cond = {
    isDeleted: false,
    '_id': orderid,
  };
  return servicePackageOrder.findOne(cond)
};

/**
 *  最新的十条成交记录
 * @returns {Query|Promise|void|*}
 */
ServicePackageServiceOrder.prototype.getTheNewestOrders = function () {
  var cond = {
    isDeleted: false,
    orderStatus: {$in: [200, 400]} //TODO:
  };
  return servicePackageOrder.find(cond, 'paidTime userName userPhoneNum doctorHospital servicePackageName',
    {limit: 10, sort: {paidTime: -1}});
};

/**
 * 通过医院名称获取订单
 * @param hospitalNames
 * @param fields
 */
ServicePackageServiceOrder.prototype.getOrdersByHospitalNames = function (hospitalNames, fields) {
  const cond = {
    doctorHospital: {$in: hospitalNames},
    isDeleted: false,
    orderStatus: {$in: [200, 600, 700]}
  };
  return servicePackageOrder.find(cond, fields || 'userId');
};

/**
 * 通过医生名字查询订单
 * @param doctorIds
 * @param fields
 */
ServicePackageServiceOrder.prototype.getOrdersByDocotrIds = function (doctorIds, fields) {
  const cond = {
    doctorId: {$in: doctorIds},
    isDeleted: false,
    orderStatus: {$in: [200,300,400, 600, 700]}
  };
  return servicePackageOrder.find(cond, fields || 'userId');
};

module.exports = new ServicePackageServiceOrder();
