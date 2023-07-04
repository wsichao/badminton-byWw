/**
 * Created by Mr.Carry on 2017/12/11.
 */
"use strict";

let
  VERSION = "/1",
  router = require('express').Router(),
  servicePackageService = require('./../../services/service_package/servicePackageService'),
  servicePackageDoctorService = require('./../../services/service_package/servicePackageDoctorService'),
  servicePackageSearchService = require('./../../services/service_package/servicePackageSearchService'),
  servicePackageVisitCycleService = require('./../../services/service_package/servicePackageVisitCycleService'),
  servicePackageDoctorRefSreivce = require('./../../services/service_package/servicePackageDoctorRefSreivce'),
  servicePackageDoctorAssistantRefService = require('./../../services/service_package/servicePackageDoctorAssistantRefService'),
  servicePackageAssistantService = require('./../../services/service_package/servicePackageAssistantService'),
  servicePackageOrderService = require('./../../services/service_package/servicePackageOrderService'),
  serviceSignedDoctorsService = require('./../../services/service_package/serviceSignedDoctorsService'),
    constants = require('../../configs/constants'),
    TransactionMysqlService = require('../../services/TransactionMysqlService'),
  _ = require('underscore'),
  Promise = require('promise');


/**
 * 获取服务包列表
 * @method get
 * @token
 */
router.get(
  VERSION + "/servicepackage/list", function (req, res, next) {
    servicePackageService
      .findAll()
      .then((dt) => {
        res.send({items: dt});
      })
  });

/**d9
 * 获取服务包详情
 * @method get
 * @param id ：服务包唯一标识
 */
router.get(
  VERSION + "/servicepackage/get", function (req, res, next) {
    let id = req.query.id;
    servicePackageService
      .get(id)
      .then((dt) => {
        res.send(dt);
      })
  });

/**
 * 获取服务包详情页面
 * @method get
 * @param id ：服务包唯一标识
 */
router.get(
  VERSION + "/servicepackage/detail_page", function (req, res, next) {
    let id = req.query.id;
    let mock = req.query.mock;
    if (!id) {
      return res.send('null id');
    }
    servicePackageService
      .get(id)
      .then((dt) => {
        let res_obj = {
          name: '',
          desc: ''
        }
        if (mock) {
          res_obj = {
            name: '无忧健康服务包A',
            desc: '1. 朱李叶普通用户注册协议（以下简称“本协议”）是您与朱李叶客户端（以下简称“本客户端”）所有者，北京朱李叶健康科技有限公司（以下简称“朱李叶”或“我们”）之间就本客户端所提供的服务等事宜订立的契约。\n2. 请您仔细阅读本协议，您在登录页点击“确定”按钮后，本协议即构成对双方有约束力的法律文件。'
          }
        }
        res_obj = {
          'name': dt && dt.name || '',
          'desc': dt && dt.desc && dt.desc.replace('\n', '<br>') || ''
        };
        res.render('./health/servicepackage_detail_page', res_obj);
      })
  });

/**
 * 获取医生全部服务包页面
 * @method get
 * @param id ：服务包唯一标识
 */
router.get(
  VERSION + "/servicepackage/doctor_services_page", function (req, res, next) {
    let doctorId = req.query.doctorId;
    let mock = req.query.mock;
    if (!doctorId) {
      return res.send('null doctorId');
    }
    let res_obj = {
      items: []
    }
    if (mock) {
      res_obj.items = [
        {
          name: '无忧健康服务包A',
          desc: '1. 朱李叶普通用户注册协议（以下简称“本协议”）是您与朱李叶客户端（以下简称“本客户端”）所有者，北京朱李叶健康科技有限公司（以下简称“朱李叶”或“我们”）之间就本客户端所提供的服务等事宜订立的契约。\n2. 请您仔细阅读本协议，您在登录页点击“确定”按钮后，本协议即构成对双方有约束力的法律文件。'
        },
        {
          name: '无忧健康服务包B',
          desc: '1. 朱李叶普通用户注册协议（以下简称“本协议”）是您与朱李叶客户端（以下简称“本客户端”）所有者，北京朱李叶健康科技有限公司（以下简称“朱李叶”或“我们”）之间就本客户端所提供的服务等事宜订立的契约。\n2. 请您仔细阅读本协议，您在登录页点击“确定”按钮后，本协议即构成对双方有约束力的法律文件。'
        }
      ]
      res_obj.items = res_obj.items.map((item) => {
        return {
          name: item.name || '',
          desc: item.desc.replace('\n', '<br>') || ''
        }
      })
      return res.render('./health/doctor_services_page', res_obj);
    } else {
      serviceSignedDoctorsService.getDoctorAllServices(doctorId).then(function (dt) {
        res_obj.items = dt.map((item) => {
          if (item && item.serviceInfo && item.serviceInfo.length > 0) {
            return {
              name: item.serviceInfo[0].name || '',
              desc: item.serviceInfo[0].desc && item.serviceInfo[0].desc.replace('\n', '<br>') || ''
            }
          }
        })
        res.render('./health/doctor_services_page', res_obj);
      })
    }
  });

/**
 * 获取会员服务协议页面
 * @method get
 */
router.get(
  VERSION + "/servicepackage/memberServicesAgreement_page", function (req, res, next) {
    res.render('./health/memberServicesAgreement_page');
  });

/**
 * 获取服务包医生详情
 * @method get
 * @param id ：医生唯一标识
 */
router.get(
  VERSION + "/servicepackage/doctorDetail", function (req, res, next) {
    let id = req.query.doctorId;
        let userId = req.headers[constants.HEADER_USER_ID] || '';
        if(req.headers['x-docchat-app-type'] == 'assistant'){
          userId = req.query.userId || '';
        }
    let result;
    let refs,serviceRef,isMember = false;
    let vip_member_model = Backend.model('service_package',undefined,'vip_member');
      servicePackageDoctorService
          .findDoctorById(id)
      .then((dt) => {
        dt = JSON.parse(JSON.stringify(dt));
        result = dt;
        if(userId){
          return vip_member_model.methods.isVipMember(userId)
        }
      })
      .then(function(isVip){
        isMember = isVip;
        return servicePackageVisitCycleService.findCycleByDoctorId(id)
      })
      .then(function (visit) {
        result.visitCycle = visit || [];
        return servicePackageDoctorRefSreivce
          .findRefByDoctorId(id);
      })
      .then(function (ref) {
          serviceRef=ref;
          return TransactionMysqlService.getAccountByUserIdAndDoctorId(userId + '');
      })
        .then(function (_account) {
            result.amount = Math.floor(_account.amount * 100) / 100;
            //console.log('创建订单的返回值',result);
        let vipPrices = _.map(serviceRef, function (item) {
          return item.vipPrice;
        });
        result.maxPrice = _.max(vipPrices) / 100;
        result.minPrice = _.min(vipPrices) / 100;
        result.assistantPhone = '';
        result.assistantAvatar = '';
        let servicePackageIds = _.map(serviceRef, function (item) {
          return item.serviceId;
        });
        return servicePackageService.findPackageServicesByIds(servicePackageIds);
      })
      .then(function (packageServices) {
        packageServices = JSON.parse(JSON.stringify(packageServices));
        let packageServicesIndex = _.indexBy(packageServices,'_id');
        let userPackageServices = [];
        serviceRef.forEach(function(item){
          if (packageServicesIndex[item.serviceId]) {
            let packageServiceItem = {
              vipPrice : item.vipPrice / 100,
              vipDiscountsPrice : isMember && item.vipDiscountsPrice && item.vipDiscountsPrice/ 100 || 0,
              packageServicesDoctorRefId : item._id,
              desc : item.desc || '',
              serviceType : item.serviceType || '',
              name :  packageServicesIndex[item.serviceId].name || '',
              icon :  packageServicesIndex[item.serviceId].icon || '', 
              serviceType : item.serviceType || ''
            }
            userPackageServices.push(packageServiceItem);
          }
        })
        result.packageServices = userPackageServices;
        return servicePackageDoctorAssistantRefService.findOneAssistant(id)
      })
      .then(function (ref) {
        if (ref) {
          const sys_user_model = Backend.model('assistant',undefined,'sys_user');
          return Promise.all([
            servicePackageAssistantService.findAssistant(ref.assistantId),
            sys_user_model.findOne({isDeleted:false, assistantId:ref.assistantId })
          ]);
        }
      })
      .then(function (assistantRes) {
        if (assistantRes && assistantRes.length) {
          let assistant = assistantRes[0];
          let sysUser = assistantRes[1];
          result.assistantPhone = assistant.phoneNum || result.preSalesPhone || '';
          result.assistantAvatar = assistant.avatar || '';
          result.assistantUserId = sysUser && sysUser._id || '';
        }else{
          result.assistantPhone = result.preSalesPhone || '';
          result.assistantUserId = '';
        }
        result.department = result.departmentName;
        result.departmentName = undefined;

        result.hospital = result.hospitalName;
        result.hospitalName = undefined;
        if(userId){
          return servicePackageOrderService.findOrdersByUserIdAndDoctorId(userId, id)
        }
      })
      .then(function(orders){
        result.isSigned = false;
        if(orders && orders.length){
          result.isSigned = true;
        }
        res.send({data: result});
      })
  });


/**
 * 获取服务包医生详情——web页面
 * @method get
 * @param id ：医生唯一标识
 */
router.get(
  VERSION + "/servicepackage/doctor_home_page", function (req, res, next) {
    let id = req.query.doctorId;
    let result;
    let refs,serviceRef;
    servicePackageDoctorService
      .findDoctorById(id)
      .then((dt) => {
        dt = JSON.parse(JSON.stringify(dt));
        result = dt;
        return servicePackageVisitCycleService.findCycleByDoctorId(id)
      })
      .then(function (visit) {
        result.visitCycle = visit || [];
        return servicePackageDoctorRefSreivce
          .findRefByDoctorId(id);
      })
      .then(function (ref) {
        serviceRef=ref;
        refs = _.indexBy(serviceRef, 'serviceId');
        let vipPrices = _.map(serviceRef, function (item) {
          return item.vipPrice;
        });
        result.maxPrice = _.max(vipPrices) / 100;
        result.minPrice = _.min(vipPrices) / 100;
        result.assistantPhone = '';
        let servicePackageIds = _.map(serviceRef, function (item) {
          return item.serviceId;
        });
        return servicePackageService.findPackageServicesByIds(servicePackageIds);
      })
      .then(function (packageServices) {
        packageServices = JSON.parse(JSON.stringify(packageServices));
        packageServices.forEach(function (item) {
          if (refs[item._id]) {
            item.vipPrice = refs[item._id].vipPrice / 100;
            item.packageServicesDoctorRefId = refs[item._id]._id;
          }
        });

        packageServices = _.sortBy(packageServices,function(item){
          return item.vipPrice
        });
        result.packageServices = packageServices;
        return servicePackageDoctorAssistantRefService.findOneAssistant(id)
      })
      .then(function (ref) {
        if (ref) {
          return servicePackageAssistantService.findAssistant(ref.assistantId);
        }
      })
      .then(function (assistant) {
        if (assistant) {
          result.assistantPhone = assistant.phoneNum || '';
        }
        result.department = result.departmentName;
        result.departmentName = undefined;

        result.hospital = result.hospitalName;
        result.hospitalName = undefined;
        res.render('./doctor/home', {data:JSON.stringify(result)});

      })
  });


/**
 * 获取省市县\医院\科室默认信息
 * @method get
 */
router.get(
  VERSION + "/servicepackage/search_def_data", function (req, res, next) {
    servicePackageSearchService
      .getSearchDefData()
      .then((dt) => {
        res.send(dt);
      })
  });

/**
 * 获取省市县\医院\科室默认信息
 * @method get
 * @param type : 数据类型
 * @param id : 唯一标识
 */
router.get(
  VERSION + "/servicepackage/search_data", function (req, res, next) {
    let type = req.query.type;
    let id = req.query.id;
    servicePackageSearchService
      .getSearchById(type, id)
      .then((dt) => {
        dt.query = req.query;
        res.send(dt);
      })
  });


/**
 * 签约医生列表
 * @method get
 * @param type : 数据类型
 * @param id : 唯一标识
 */
router.get(
  VERSION + "/servicepackage/doctors", function (req, res, next) {
    let id = req.identity && req.identity.userId;
    let resOrders;
    let result = {
      items: []
    };
    servicePackageOrderService
      .findOrdersByUserId(id)
      .then((orders) => {
        resOrders = orders;
        let doctorIds = _.map(orders, function (item) {
          return item.doctorId
        });
        return servicePackageDoctorService.findDoctorByIds(doctorIds)
      })
      .then(function (doctors) {
        doctors = _.indexBy(doctors, "_id");
        resOrders.forEach(function (order) {
          let item = {
            order: {
              "name": order.servicePackageName || '',
              "status": order.orderStatus,
              "orderId": order.orderId || ''
            }
          };
          if (doctors[order.doctorId]) {
            item.doctor = {
              "name": doctors[order.doctorId].name || '',
              "_id": doctors[order.doctorId]._id,
              "avatar": doctors[order.doctorId].avatar || '',
              "title": doctors[order.doctorId].title || '',
              "hospital": doctors[order.doctorId].hospital || '',
              "department": doctors[order.doctorId].department || ''
            }
          }
          result.items.push(item)
        });
        res.send(result);
      })
  });

module.exports = router;
