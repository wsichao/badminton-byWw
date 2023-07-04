/**
 * 服务包订单 router
 * Created by Mr.Carry on 2017/12/13.
 */
"use strict";

let
  VERSION = "/1",
  router = require('express').Router(),
  servicePackageOrderService = require('./../../services/service_package/servicePackageOrderService'),
  makeAppointmentOrderService = require('./../../services/service_package/makeAppointmentOrderService'),
  TransactionMysqlService = require('../../services/TransactionMysqlService'),
  ServicePackageDoctorAssistantRefService = require('./../../services/service_package/servicePackageDoctorAssistantRefService');

/**
 * 获取服务包订单
 * @method get
 * @param pageSize : 每页显示条数 默认值10
 * @param pageNum : 当前页数 默认值1
 * @token 获取当前用户id
 */
router.get(
  VERSION + "/servicepackage/orders", function (req, res, next) {
    let userId = req.identity.userId;
    let pageSize = req.query.pageSize;
    let pageNum = req.query.pageNum;
    servicePackageOrderService
      .findAll(userId, pageSize, pageNum)
      .then((dt) => {
        res.send({ items: dt });
      })
  });


/**
 * 创建服务包订单
 * @method post
 * @param userId 用户唯一标识 必填
 * @param servicePackageDoctorRefId 服务包关联唯一标识 必填
 * @param doctorId 医生唯一标识 必填
 * @caseDescription 病例说明 必填
 * @casePics 病例图片 必填
 */
router.post(
  VERSION + "/servicepackage/order/create", function (req, res, next) {
    let userId = req.identity.userId;
    let servicePackageDoctorRefId = req.body.servicePackageDoctorRefId;
    let doctorId = req.body.doctorId;
    let caseDescription = req.body.caseDescription;
    let casePics = eval(req.body.casePics);
    let secret = req.body.secret;
    let servicePackageOrderUtil = require('./../../services/service_package/servicePackageOrderUtil');
    // 检查订单是否已满
    servicePackageOrderUtil
      .validOrderRef(doctorId, servicePackageDoctorRefId)
      .then(function (flag) {
        let result = { data: { secret: secret } };
        if (flag) {
          result.code = '2420';
          result.msg = '该服务包会员名额已满';
          res.send(result);
        } else {
          // 返回已创建的订单信息
          servicePackageOrderService
            .createOrder(userId, servicePackageDoctorRefId, doctorId, caseDescription, casePics, req)
            .then((dt) => {
              dt.secret = secret;
              result.code = '200';
              result.msg = '';
              result.data = dt;
              return TransactionMysqlService.getAccountByUserIdAndDoctorId(userId + '');
            })
            .then(function (_account) {
              result.data.amount = Math.floor(_account.amount * 100) / 100;
              console.log('创建订单的返回值', result);
              res.send(result);
            })
        }
      })
  });

/**
 * 创建预约服务订单
 * @method post
 * @param workTime 预约时间(时间戳) : number
 * @param servicePackageOrderId : 服务包订单id
 * @params address : 服务包订单id
 */
router.post(
  VERSION + "/servicepackage/make_appointment_order/create", function (req, res, next) {
    let userId = req.identity.userId;
    let workTime = req.body.workTime;
    let servicePackageOrderId = req.body.servicePackageOrderId;
    let address = req.body.address;
    let secret = req.body.secret || '0';
    let items = req.body.items;
    let instructions = req.body.instructions;
    let checklist_imgs = req.body.checklist_imgs;
    try {
      if (/\[(.+?)\]/g.test(items)) {
        items = eval(items);
      }
    } catch (e) {
      return res.send({
        code: 1000,
        msg: '预约项目 格式不正确'
      })
    }

    try {
      if (/\[(.+?)\]/g.test(checklist_imgs)) {
        checklist_imgs = eval(checklist_imgs);
      }
    } catch (e) {
      return res.send({
        code: 1000,
        msg: '检查单 格式不正确'
      })
    }

    let resultObj;
    let servicePackageOrderUtil = require('./../../services/service_package/servicePackageOrderUtil');
    servicePackageOrderUtil.validmakeAppointmentOrder(servicePackageOrderId, userId, workTime)
      .then(function (flag) {
        let result = { data: { secret: secret } };
        if (flag) {
          result.code = '2427';
          result.msg = flag;
          res.send(result);
        } else {
          makeAppointmentOrderService
            .createOrder(userId, servicePackageOrderId, workTime, address, req, items, instructions, checklist_imgs)
            .then((dt) => {
              resultObj = {
                code: '200',
                msg: '',
                data: {}
              };
              resultObj.data = dt;
              resultObj.data.secret = secret;
              return TransactionMysqlService.getAccountByUserIdAndDoctorId(userId + '');
            })
            .then(function (_account) {
              resultObj.data.amount = Math.floor(_account.amount * 100) / 100;
              console.log('创建订单的返回值', result);
              res.send(resultObj);
            })
        }
      })

  });

// /**
//  * 10054 修改预约服务订单
//  * @method post
//  * @param orderId 订单唯一标识
//  * @param items 预约项目
//  * @param instructions 预约说明
//  * @param checklist_imgs 
//  */
// router.post(VERSION + "/servicepackage/make_appointment_order/update", function (req, res, next) {
//   let orderId = req.body.orderId;
//   let items = req.body.items;
//   let instructions = req.body.instructions;
//   let checklist_imgs = req.body.checklist_imgs;
//   let workTime = req.body.workTime;
//   let status = req.body.status;

//   try {
//     if (/\[(.+?)\]/g.test(items)) {
//       items = eval(items);
//     }
//   } catch (e) {
//     return res.send({
//       code: 1000,
//       msg: '预约项目 格式不正确'
//     })
//   }

//   try {
//     if (/\[(.+?)\]/g.test(checklist_imgs)) {
//       checklist_imgs = eval(checklist_imgs);
//     }
//   } catch (e) {
//     return res.send({
//       code: 1000,
//       msg: '检查单 格式不正确'
//     })
//   }


//   makeAppointmentOrderService.updateOrder(orderId, items, instructions, checklist_imgs, workTime, status).then(function (dt) {
//     res.send({ code: 200, msg: '成功' });
//   });
// });

/**
 * 获取服务包订单支付状态
 * @method get
 * @param orderId : 订单id
 * @param type : 订单类型
 * @token 获取当前用户id
 */
router.get(
  VERSION + "/servicepackage/order_status", function (req, res, next) {
    let orderId = req.query.orderId;
    let type = req.query.type;
    if (type == 'servicePackage') {
      servicePackageOrderService
        .getPayStatus(orderId)
        .then((flag) => {
          if (flag) {
            res.send({ code: 200 });
          } else {
            res.send({ code: 400, message: '支付失败', phone: '4006182273' });
          }
        })
    } else if (type == 'makeAppointment') {
      makeAppointmentOrderService
        .getPayStatus(orderId)
        .then((flag) => {
          if (flag) {
            res.send({ code: 200 });
          } else {
            res.send({ code: 400, message: '支付失败', phone: '4006182273' });
          }
        })
    } else {
      res.send({ code: 400, message: "请求参数有误" });
    }

  });


/**
 * 取消预约订单
 * @method post
 * @param userId 用户唯一标识 必填
 * @param makeAnAappointmentOrderId 预约订单唯一标识 必填
 */
router.post(
  VERSION + "/makeAppointment/order/cancel", function (req, res, next) {
    let userId = req.identity.userId;
    let makeAnAappointmentOrderId = req.body.makeAnAappointmentOrderId;
    makeAppointmentOrderService
      .cancelOrder(userId, makeAnAappointmentOrderId)
      .then((dt) => {
        res.send(dt);
      }).catch(function (err) {
        console.log(err);
        res.send(err);
      });
  });

/**
 * 获取订单列表
 * @param status 订单状态
 */
router.get(VERSION + "/servicepackage/make_appointment_orders", function (req, res, next) {
  let userId = req.identity.userId;
  let status = req.query.status;
  let orderId = req.query.orderId;
  if (status) {
    try {
      status = parseInt(status);
    } catch (e) {
      console.log(e);
    }
  }
  makeAppointmentOrderService
    .findAll(userId, status, undefined, orderId)
    .then(function (dt) {
      res.send({ items: dt });
    });
});

module.exports = router;