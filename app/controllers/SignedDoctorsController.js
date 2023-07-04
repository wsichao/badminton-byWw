/**
 * Created by lijinxia on 2017/12/12.
 */

var
  ServiceSignedDoctorsService = require('../services/service_package/serviceSignedDoctorsService'),
  ServicePackageService = require('../services/service_package/servicePackageService'),
  ServicePackageDoctorRefSreivce = require('../services/service_package/servicePackageDoctorRefSreivce'),
  ServicePackageVisitCycleService = require('../services/service_package/servicePackageVisitCycleService'),
  MakeAppointmentOrderService = require('../services/service_package/makeAppointmentOrderService'),
  ServicePackageVisitDetailService = require('../services/service_package/servicePackageVisitDetailService'),
  ServicePackageOrderService = require('../services/service_package/servicePackageOrderService'),
  ServicePackageDoctorAssistantRefService = require('../services/service_package/servicePackageDoctorAssistantRefService'),
  mongoose = require('mongoose'),
  commonUtil = require('../../lib/common-util'),
  request = require('request'),
  encrypt = commonUtil.commonMD5,
  serverConfigs = require('../configs/server'),
  _ = require('underscore'),
  util = require('util'),
  apiHandler = require('../configs/ApiHandler'),
  ErrorHandler = require('../../lib/ErrorHandler'),
  constants = require('../configs/constants'),
  Server = require('../configs/server'),
  httpHandler = require('../../lib/CommonRequest'),
  configs = require('../configs/api'),
  async = require('async'),
  Promise = require('promise'),
  SignedDoctorsController = function () {

  };

SignedDoctorsController.prototype.constructor = SignedDoctorsController;

/**
 * 排序规则：按照boss端的医生创建时间越早越靠上
 * @param req
 * @param res
 */
SignedDoctorsController.prototype.searchDoctors = function (req, res) {
  var pageNum = Number(req.query.pageNum || 0);
  var pageSize = Number(req.query.pageSize || 20);
  pageSize = 300;// 兼容未处理分页的情况，需等前端修改完成后，删除该处理

  console.log('ewfwf', pageNum, pageSize);
  // var pageSlice = commonUtil.getCurrentPageSlice(req, pageNum, pageSize, {createdAt: -1});

  var userId = req.headers[constants.HEADER_USER_ID];
  var user = req.identity && req.identity.user ? req.identity.user : null;

  var cond = {};

  if (req.query.areaType && req.query.areaId) {
    switch (req.query.areaType) {
      case 'province':
        cond.provinceId = mongoose.Types.ObjectId(req.query.areaId);
        break;
      case 'city':
        cond.cityId = mongoose.Types.ObjectId(req.query.areaId);
        break;
      case 'county':
        cond.townId = mongoose.Types.ObjectId(req.query.areaId);
        break;
      case 'hospital':
        cond.hospitalId = mongoose.Types.ObjectId(req.query.areaId);
        break;
    }
  }

  //按照科室搜索
  if (req.query.department) {
    cond.department = new RegExp(req.query.department, 'i');
  }
  var condServicePackage = {};
  if (req.query.servicePackageId) {
    condServicePackage["doctor.serviceId"] = mongoose.Types.ObjectId(req.query.servicePackageId);
  }


  //关键词搜索
  if (req.query.keys && req.query.type) {
    switch (req.query.type) {
      case 'doctor':
        cond.name = new RegExp(req.query.keys, 'i');
        break;
      case 'hospital':
        cond.hospital = new RegExp(req.query.keys, 'i');
        break;
      case 'department':
        cond.department = new RegExp(req.query.keys, 'i');
        break;
    }
  }


  ServiceSignedDoctorsService.getServiceSignedDoctorsByArea(cond, condServicePackage, '', pageSize, pageNum)
    .then(function (_r) {
      // console.log('得到数据', _r);
      var retData = {
        items: [],
        query: {
          servicePackageId: req.query.servicePackageId || '',
          areaType: req.query.areaType || '',
          areaId: req.query.areaId || '',
          department: req.query.department || '',
          keys: req.query.keys || '',
          type: req.query.type || ''
        }
      };
      _r.forEach(function (item) {
        for (var i = 0; i < item.doctor.length; i++) {
          if (req.query.servicePackageId) {
            if ((item.doctor[i].serviceId == req.query.servicePackageId) && (item.doctor[i].isDeleted == false)) {
              retData.items.push({
                doctor: {
                  _id: item._id,
                  name: item.name,
                  title: item.title,
                  hospital: item.hospital,
                  department: item.department,
                  avatar: item.avatar
                }
              });
              break;
            }
          } else {
            retData.items.push({
              doctor: {
                _id: item._id,
                name: item.name,
                title: item.title,
                hospital: item.hospital,
                department: item.department,
                avatar: item.avatar
              }
            });
            break;

          }

        }
      });


      console.log('返回结果', retData.items.length);
      apiHandler.OK(res, retData);
    }, function (err) {
      console.log('err:', err);
      apiHandler.handleErr(res, err);
    });
};

SignedDoctorsController.prototype.getServicePhoneNum = function (req, res) {
  var pageNum = Number(req.query.pageNum || 0);
  var pageSize = Number(req.query.pageSize || 20);


  // if (!userId) {
  //     return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
  // }


  var doctorId = req.query.doctorId;
  if (!doctorId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }


  ServiceSignedDoctorsService.getServicePhoneNumByDoctorId(doctorId, '', pageSize, pageNum)
    .then(function (_r) {
      console.log('电话', _r);
      // var retDataTest = {phoneNum: '11111111111'};
      var retData = { phoneNum: '' };
      for (var i = 0; i < _r.length; i++) {
        var item = _r[i];
        if (item && item.doctor && item.doctor.length && item.doctor[0].phoneNum) {
          retData.phoneNum = item.doctor[0].phoneNum;
          break;
        }
      }

      apiHandler.OK(res, retData);
    },
      function (err) {
        console.log('err:', err);
        apiHandler.handleErr(res, err);
      });
};

/**
 * 展示列表的时候，将医生的截至时间，向前减少10分钟，进行列表展示
 * @param req
 * @param res
 */
SignedDoctorsController.prototype.makeAppointmentList = function (req, res) {
  // if (!userId) {
  //     return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
  // }

  var servicePackageOrderId = req.query.servicePackageOrderId;
  if (!servicePackageOrderId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }

  var services = [], plan, rules;
  var spdr;


  ServicePackageOrderService.getServicePackageOrderInfoById(servicePackageOrderId)
    .then(function (_spos) {
      // console.log('服务包订单信息', _spos);
      if (!_spos) {
        throw ErrorHandler.getBusinessErrorByCode(2425);
      }

      console.log('服务包的有效期判断', Date.now() > _spos.deadlinedAt);
      if (Date.now() > _spos.deadlinedAt) {
        throw ErrorHandler.getBusinessErrorByCode(2425);
      }

      return ServicePackageDoctorRefSreivce.findServicePackageDoctorRefById(_spos.servicePackageDoctorRef);
    })
    .then(function (_spdr) {
      // console.log('datadata', _spdr);
      if (!_spdr || _spdr.length == 0) {
        throw ErrorHandler.getBusinessErrorByCode(2423);
      }
      spdr = JSON.parse(JSON.stringify(_spdr[0]));


      return ServicePackageVisitCycleService.findCycleAndAddressByDoctorIdObject(spdr.doctorId);
    })
    .then(function (data) {

      var retData = {};
      // console.log('出诊时间', data);
      // var results = [];

      var workTime = [];
      data.forEach(function (item) {
        // console.log('地址', item.addressInfo[0].address);
        workTime.push({
          startTime: item.startTime,
          endTime: item.endTime,
          period: item.timeQuantum,
          week: item.week,
          place: item.addressInfo[0].address
        });
      });

      rules = _visitPlan.sortRules(workTime);

      plan = _visitPlan.rules2plan(rules, []);
      // console.log(plan);

      return ServicePackageVisitDetailService.findVisitDetailByDoctorIdObject(spdr.doctorId);
    })
    .then(function (_noWorkDay) {

      // console.log('不出诊时间wedwdwedwed', _noWorkDay.length);
      // console.log('不出诊时间wedwdwedweddwedwedwe', _noWorkDay);

      var flag = false;
      for (var i = 0; i < _noWorkDay.length; i++) {
        for (var j = 0; j < plan.length; j++) {
          // console.log('明细时间', (new Date(_noWorkDay[i].date).format('yyyy-MM-dd')));
          // console.log('周期时间', (new Date(plan[j].date).format('yyyy-MM-dd')));
          // console.log('明细period', _noWorkDay[i].timeQuantum);
          // console.log('周期period', plan[j].period);
          // console.log('周期period', plan[j].timeQuantum == _noWorkDay[i].timeQuantum);
          if (((new Date(_noWorkDay[i].date).format('yyyy-MM-dd')) == (new Date(plan[j].date).format('yyyy-MM-dd'))) && (_noWorkDay[i].timeQuantum == plan[j].period)) {
            if (_noWorkDay[i].status == 1) {//常规出诊时间内，替换出诊时间和地址
              plan[j].place = _noWorkDay[i].addressInfo[0].address;
              plan[j].startTime = _noWorkDay[i].startTime;
              plan[j].endTime = _noWorkDay[i].endTime;
              flag = true;
              break;
            } else if (_noWorkDay[i].status == 2) {//删除出诊时间
              plan.splice(j, 1);
              j--;
              flag = true;
              break;
            }
          }
        }
        // if (!flag && (_noWorkDay[i].status == 1)) {//不在常规出诊时间内的出诊时间
        //   plan.push({
        //     date: _noWorkDay[i].date,
        //     period: _noWorkDay[i].timeQuantum,
        //     week: _noWorkDay[i].week,
        //     place: _noWorkDay[i].addressInfo[0].address
        //   });
        // }
      }


      // console.log('我的预约时间的返回值', plan);
      var nowTime = Date.now() + constants.TIME10M;
      for (var i = 0; i < plan.length; i++) {
        var yearMonthDayWork = (new Date(plan[i].date).format('yyyy-MM-dd'));
        var yearMonthDayToday = (new Date(Date.now()).format('yyyy-MM-dd'));
        var timeWork = (new Date(yearMonthDayWork + " " + plan[i].endTime + ":00")).getTime();
        // console.log('yearMonthDayWork', yearMonthDayWork);
        // console.log('yearMonthDayToday', yearMonthDayToday);
        // console.log('timeWork', timeWork);
        // console.log('yearMonthDayWork==yearMonthDayToday', yearMonthDayWork == yearMonthDayToday);
        // console.log('timeWork>nowTime', timeWork, nowTime, timeWork < nowTime);
        if ((yearMonthDayWork == yearMonthDayToday) && (timeWork < nowTime)) {
          plan.splice(i, 1);
          i--;
        } else {
          // console.log('come in ', i);
          plan[i].visitPlanDate = plan[i].date;
          plan[i].visitPlanPeriod = plan[i].period;
          plan[i].visitPlanWeek = plan[i].week;
          plan[i].visitPlanPlace = plan[i].place;

          delete plan[i].startTime;
          delete plan[i].endTime;
          delete plan[i].period;
          delete plan[i].week;
          delete plan[i].place;
          delete plan[i].date;
        }
      }

      if (plan) {
        plan = _.sortBy(plan, 'date');
      }
      apiHandler.OK(res, { items: plan });
    }, function (err) {
      apiHandler.OUTER_DEF(res, err);
    });
  // ServicePackageDoctorRefSreivce.findServicePackageDoctorRefById(servicePackageOrderId)
  //     .then(function (_spdr) {
  //         console.log('datadata', _spdr);
  //         //TODO 医生服务包有效期，没找到字段
  //         if (!_spdr || _spdr.length == 0) {
  //             throw ErrorHandler.getBusinessErrorByCode(2423);
  //         }
  //         spdr = JSON.parse(JSON.stringify(_spdr));
  //         return ServicePackageService.get(spdr[0].serviceId);
  //     })
  //     .then(function (_s) {
  //
  //
  //         console.log('时间', constants.TIME1MONTH * _s.duration + _s.createdAt, Date.now());
  //         var expirt = constants.TIME1MONTH * _s.duration + _s.createdAt;
  //         console.log('shengu', expirt - Date.now());
  //         if ((constants.TIME1MONTH * _s.duration + _s.createdAt - Date.now()) < 0) {
  //             throw ErrorHandler.getBusinessErrorByCode(2424);
  //         }
  //
  //         console.log('服务包信息', _s);
  //
  //         return ServicePackageVisitCycleService.findCycleAndAddressByDoctorIdObject(spdr[0].doctorId);
  //     })
  //     .then(function (data) {
  //
  //         var retData = {};
  //         console.log('出诊时间', data);
  //         // var results = [];
  //
  //         var workTime = [];
  //         data.forEach(function (item) {
  //             console.log('地址', item.addressInfo[0].address);
  //             workTime.push({
  //                 startTime: item.startTime,
  //                 endTime: item.endTime,
  //                 period: item.timeQuantum,
  //                 week: item.week,
  //                 place: item.addressInfo[0].address
  //             });
  //         });
  //
  //         // retData.workTime = setDefaultVisitPlan(workTime);
  //         //
  //         // retData.workTime = workTime;
  //         rules = _visitPlan.sortRules(workTime);
  //
  //         plan = _visitPlan.rules2plan(rules, []);
  //         console.log(plan);
  //
  //         return ServicePackageVisitDetailService.findVisitDetailByDoctorIdObject(spdr[0].doctorId);
  //     })
  //     .then(function (_noWorkDay) {
  //
  //         console.log('不出诊时间', _noWorkDay);
  //
  //
  //         // var noWorkTime = [];
  //         // for(var i=0;i<_noWorkDay.length;i++){
  //         //     noWorkTime.push(_noWorkDay[i].date);
  //         // }
  //         // console.log('不出诊时间，具体时间',noWorkTime);
  //         //
  //         // var plan = _visitPlan.rules2plan(rules, noWorkTime);
  //         // console.log('出去未出诊时间',plan);
  //         // var data=1513555200000;
  //         // console.log('得到的日期',new Date(data).format('yyyy-MM-dd'));
  //
  //         // for (var k = 0; k < _noWorkDay.length; k++) {
  //         //     _noWorkDay[k].dateStart = (new Date(new Date(_noWorkDay.date).format('yyyy-MM-dd') + " " + _noWorkDay.startTime + ":00")).getTime();
  //         //     _noWorkDay[k].dateEnd = (new Date(new Date(_noWorkDay.date).format('yyyy-MM-dd') + " " + _noWorkDay.endTime + ":00")).getTime();
  //         // }
  //
  //         var flag = false;
  //         for (var i = 0; i < _noWorkDay.length; i++) {
  //             for (var j = 0; j < plan.length; j++) {
  //                 console.log('不出诊时间', _noWorkDay);
  //                 if (((new Date(_noWorkDay[i].date).format('yyyy-MM-dd')) == (new Date(plan[j].date).format('yyyy-MM-dd'))) && (_noWorkDay[i].timeQuantum == plan[j].timeQuantum)) {
  //                     if (_noWorkDay[i].status == 1) {//常规出诊时间内，替换出诊时间和地址
  //                         plan[j].place = _noWorkDay[i].addressInfo[0].address;
  //                         plan[j].startTime = _noWorkDay[i].startTime;
  //                         plan[j].endTime = _noWorkDay[i].endTime;
  //                         flag = true;
  //                         break;
  //                     } else if (_noWorkDay[i].status == 2) {//删除出诊时间
  //                         plan.splice(j, 1);
  //                         j--;
  //                         flag = true;
  //                         break;
  //                     }
  //
  //
  //                     // if (_noWorkDay[i].status == 1) {//替换出诊地址
  //                     //     plan[j].startTime = _noWorkDay[i].startTime;
  //                     //     plan[j].endTime = _noWorkDay[i].endTime;
  //                     // } else if (_noWorkDay[i].status == 2) {//删除出诊时间
  //                     //     if(_noWorkDay[i].startTime>=plan[j].startTime){
  //                     //         if(_noWorkDay[i].endTime>=plan[j].endTime){
  //                     //             plan.splice(j, 1);
  //                     //             j--;
  //                     //         }else if(_noWorkDay[i].endTime<plan[j].endTime){
  //                     //             plan[j].startTime=_noWorkDay[i].endTime;
  //                     //         }
  //                     //
  //                     //     }else if(_noWorkDay[i].){
  //                     //
  //                     //     }
  //                     //     plan.splice(j, 1);
  //                     //     j--;
  //                     // }
  //                 }
  //             }
  //
  //             if (!flag && (_noWorkDay[i].status == 1)) {//不在常规出诊时间内的出诊时间
  //                 plan.push({
  //                     date: _noWorkDay[i].date,
  //                     peroid: _noWorkDay[i].timeQuantum,
  //                     week: _noWorkDay[i].week,
  //                     place: _noWorkDay[i].addressInfo[0].address
  //                 });
  //             }
  //         }
  //
  //
  //         console.log('我的预约时间的返回值', plan);
  //         for (var i = 0; i < plan.length; i++) {
  //             plan[i].visitPlanDate = plan[i].date;
  //             plan[i].visitPlanPeriod = plan[i].period;
  //             plan[i].visitPlanWeek = plan[i].week;
  //             plan[i].visitPlanPlace = plan[i].place;
  //             delete plan[i].startTime;
  //             delete plan[i].endTime;
  //             delete plan[i].period;
  //             delete plan[i].week;
  //             delete plan[i].place;
  //             delete plan[i].date;
  //         }
  //
  //         if (plan) {
  //             plan = _.sortBy(plan, 'date');
  //         }
  //         apiHandler.OK(res, {items: plan});
  //     }, function (err) {
  //         apiHandler.OUTER_DEF(res, err);
  //     });
};

var setDefaultVisitPlan = function (visitPlan) {
  for (var i = 0; i < visitPlan.length; i++) {
    if (!visitPlan[i].startTime) {
      switch (visitPlan[i].period) {
        case 1:
          visitPlan[i].startTime = 2678400000;
          visitPlan[i].endTime = 2692800000;
          break;
        case 2:
          visitPlan[i].startTime = 2700000000;
          visitPlan[i].endTime = 2714400000;
          break;
        case 3:
          visitPlan[i].startTime = 2718000000;
          visitPlan[i].endTime = 2725200000;
          break;
      }
    }
  }
  return visitPlan
};
var _visitPlan = {
  // Q: Q,
  sortRules: function (rules) {
    return _.sortBy(rules, function (rule) {
      return (rule.week == 0 ? 7 : rule.week) + rule.period * .1;
    });
  },
  _genPlanEle: function (rule, week, date, weekTimes) {

    var ele = {
      date: new Date(),
      week: rule.week,
      period: rule.period,
      place: rule.place,
      startTime: rule.startTime,
      endTime: rule.endTime
    };
    var dayOffset = weekTimes * 7 + rule.week - week;
    //ele.date.setDate(date + dayOffset)
    ele.date = ele.date.setDate(date + dayOffset).valueOf();
    return ele;
  },
  _ifPassPeriod: function (hours, period) {
    switch (period) {
      case 1:
        if (hours < 12) return false; else return true;
      case 2:
        if (hours < 18) return false; else return true;
      case 3:
        if (hours < 22) return false; else return true;
      default:
        return true;
    }
  },
  rules2plan: function (rules, noWorkDay) {
    console.log('排除不出诊时间');
    var now = new Date();
    var week = now.getDay() == 0 ? 7 : now.getDay(),//当前是周几
      date = now.getDate(),
      hours = now.getHours();
    var plan = [], subPlan = [], rule, WEEK_NUM = 5;


    for (var weekTimes = 0; weekTimes < WEEK_NUM; weekTimes++) {
      //for(var index in rulesSorted){
      for (var i = 0; i < rules.length; i++) {
        rule = rules[i];
        // 第一周去前
        if (!weekTimes && week > (rule.week == 0 ? 7 : rule.week)) continue;
        if (!weekTimes && week == (rule.week == 0 ? 7 : rule.week)) {
          if (_visitPlan._ifPassPeriod(hours, rule.period)) continue;
        }
        // 最后一周去后
        if (weekTimes == WEEK_NUM - 1 && (rule.week == 0 ? 7 : rule.week) > week) break;
        plan.push(_visitPlan._genPlanEle(rule, week, date, weekTimes))
      }
    }


    var temp, retPlan = [];
    if (noWorkDay && noWorkDay.length > 0) {
      for (var i = 0; i < plan.length; i++) {
        temp = new Date(new Date(new Date(plan[i].date).format('yyyy-MM-dd 00:00:00'))).getTime();
        if (_.indexOf(noWorkDay, temp) == -1) {
          retPlan.push(plan[i]);
        } else {
          console.log('不可以预约');
        }
      }
    } else {
      retPlan = plan;
    }

    return retPlan;
  }
};

/**
 * 查询医生出诊时间
 */
// exports.getDoctorWorkTime = function (req, res) {
//
//     var userId = BizHelper.ctl.getUserId(req);
//     var doctorId = req.query.doctorId;
//     var condition = {
//         isTemplate: false,
//         isDeleted: false,
//         status: {"$gte": 10},
//         doctorId: doctorId,
//         category: {"$in": [1, 8]},
//         isSigned: true
//     };
//
//     var pageSlice = commonUtil.getCurrentPageSlice(req, 0, 20, {isSigned: -1, position: -1, _id: -1});
//     var user, services, sign;
//     UserService.findUserByID(userId)
//         .then(function (_user) {
//             user = _user;
//             if (user && user.myDoctors && user.myDoctors.length > 0) {  //有购买过家庭医生的订单
//                 for (var i = 0; i < user.myDoctors.length; i++) {
//                     if (user.myDoctors[i].doctorId == doctorId) {
//                         sign = user.myDoctors[i];
//                         break;
//                     }
//                 }
//             }
//             return SrvService.findServices(condition, {sort: {isSigned: -1, brokerRank: -1, refPriceL: -1}});
//         })
//         .then(function (data) {
//             console.log('datadata', data);
//             var results = [];
//             if (data && data.length > 0) {     //家庭医生列表
//                 data=JSON.parse(JSON.stringify(data));
//                 for (var i = 0; i < data.length; i++) {  //考虑老版本的兼容性
//                     var y = {};
//                     if (i === 0) {
//                         y.sharedUrl = "http://web.zlycare.com/share/followdoc/" + data[i].doctorId;
//                     }
//
//                     if (!sign) {// 未签约
//                         y.isSignedOrder = false;
//                         if (data[i].isSigned) {
//                             y.membershipPrice = data[i].membershipPrices[0].price;
//                         }
//                         else {
//                             y.membershipPrice = -1;
//                         }
//                     } else {// 已签约
//                         y.isSignedOrder = true;
//                         if (data[i].isSigned) {
//                             y.membershipPrice = data[i].membershipPrices[0].price;
//                             y.validAt = sign.validAt;
//                             y.expiredAt = sign.expiredAt;
//                         } else {
//                             y.membershipPrice = -1;
//                             y.validAt = -1;
//                             y.expiredAt = -1;
//                         }
//                     }
//                     //console.log(data[i]);
//                     y._id = data[i]._id;
//                     y.brokerId = data[i].brokerId;
//                     y.brokerName = data[i].brokerName;
//                     y.brokerAvatar = data[i].brokerAvatar;
//                     y.brokerContact = data[i].brokerContact;
//                     y.brokerRank = data[i].brokerRank;
//                     y.serviceCount = data[i].serviceCount;
//                     y.discount = data[i].discount;
//                     y.refPriceL = data[i].refPriceL;
//                     y.description = data[i].description;
//                     y.title = data[i].title;
//                     y.isSigned = data[i].isSigned;
//                     y.hospitalName = data[i].hospitalName;
//                     y.isPriceVisible = data[i].isPriceVisible;
//                     if (data[i].assistant) {
//                         y.assistantPhoneNum = data[i].assistant.phoneNum;
//                     }
//                     if (data[i].membershipSize) {
//                         y.membershipSize = data[i].membershipSize;
//                         y.soldNum = data[i].soldNum;
//                     }
//                     if (data[i].workPlace) {
//                         y.workPlace = data[i].workPlace;
//                     }
//                     if (data[i].workTime) {
//                         console.log('data[i].workTime111',data[i].workTime);
//                         data[i].workTime=SummaryController.setDefaultVisitPlan(data[i].workTime);
//
//                         console.log('data[i].workTime',data[i].workTime);
//                         y.workTime = data[i].workTime;
//                         var rules = data[i].workTime = _visitPlan.sortRules(data[i].workTime);
//                         console.log('rules', rules);
//                         var plan = _visitPlan.rules2plan(rules, data[i].noWorkDay);
//                         console.log(plan);
//                         y.visitPlan = plan;
//
//                         y.visitPlanInterval = constants.visitPlanInterval;
//                     } else {
//                         data[i].workTime = [];
//                     }
//                     //x.services.push(y);
//                     results.push(y);
//                 }
//             }
//
//             return results;
//         }).then(function (retArr) {
//         services = retArr[0];
//         if(services&&services.visitPlan){
//             services.visitPlan=_.sortBy(services.visitPlan,'date');
//         }
//         console.log("拍一下熟顺序", JSON.stringify(services));
//
//         apiHandler.OK(res, services || []);
//     }, function (err) {
//         apiHandler.OUTER_DEF(res, err);
//     });
//
// };


SignedDoctorsController.prototype.makeAppointmentTime = function (req, res) {

  var servicePackageOrderId = req.query.servicePackageOrderId;
  var date = Number(req.query.time);
  var period = Number(req.query.visitPlanPeriod);
  if (!servicePackageOrderId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  if (!date) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  if (!period) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }

  var week = new Date(Number(date)).getDay();
  if (week == 0) {
    week = 7;
  }
  var retData = {};
  var startTime, endTime, spdrf, spos, visitCircle, visitDetail;
  var orderTimeStart = (new Date((new Date(Number(date))).format("yyyy-MM-dd 00:00:00"))).getTime();
  var orderTimeEnd = orderTimeStart + constants.TIME1D;
  console.log('defrefrefref', new Date(Number(date)).getDay(), period);

  ServicePackageOrderService.getServicePackageOrderInfoById(servicePackageOrderId)
    .then(function (_spos) {
      console.log('服务包订单信息', _spos);
      if (!_spos) {
        throw ErrorHandler.getBusinessErrorByCode(2426);
      }

      spos = JSON.parse(JSON.stringify(_spos));
      return ServicePackageService.get(_spos.servicePackageId);
    })
    .then(function (_sp) {
      let dt = new Date(spos.paidTime);
      dt.setMonth(dt.getMonth() + _sp.duration);
      if (!_sp || (dt.getTime() < Date.now())) {
        throw ErrorHandler.getBusinessErrorByCode(2424)
      }
      return ServicePackageDoctorRefSreivce.findServicePackageDoctorRefById(spos.servicePackageDoctorRef)
    })
    .then(function (_spdrf) {
      spdrf = JSON.parse(JSON.stringify(_spdrf[0]));
      retData.price = spdrf.orderPrice / 100;

      console.log('服务包医生关联表', spdrf);

      return ServicePackageVisitCycleService.findCycleAndAddress(spos.doctorId, week, period);
    })
    .then(function (_t) {
      if (!_t) {
        throw ErrorHandler.getBusinessErrorByCode(3001);
      }

      visitCircle = JSON.parse(JSON.stringify(_t));
      console.log('');
      //不在常规出诊时间内，从出诊明细中查询
      console.log('出诊明细查询');
      return ServicePackageVisitDetailService.findVisitDetailByCond({
        doctorId: mongoose.Types.ObjectId(spos.doctorId),
        timeQuantum: period,
        status: 1,
        week: visitCircle[0].week,
        date: { $gt: orderTimeStart, $lt: orderTimeEnd }
      });

    })
    .then(function (_t) {
      visitDetail = JSON.parse(JSON.stringify(_t));
      console.log('医生出诊周期', visitCircle);
      console.log('出诊明细', visitDetail);
      if (visitDetail.length > 0) {
        _t = visitDetail;
      } else {
        _t = visitCircle;
      }
      _t = JSON.parse(JSON.stringify(_t));
      _t.workTime = [];
      _t.forEach(function (item) {
        _t.workTime.push({
          startTime: srtToDate(item.startTime),
          endTime: srtToDate(item.endTime),
          period: item.timeQuantum,
          week: item.week,
          // place: item.place
          place: item.addressInfo[0].address
        });
      });

      console.log('周期', _t.workTime);

      _t.workTime = setDefaultVisitPlan(_t.workTime);
      var startTime, endTime;
      _t.workTime.forEach(function (item) {
        if (item.week == week && item.period == period) {
          startTime = Number(item.startTime);
          endTime = Number(item.endTime);
        }
      });
      retData.workTimes = [];
      var nowTime = Date.now();
      for (var i = startTime; i < endTime; i = i + Number(constants.visitPlanInterval)) {
        if (!(((new Date(i).format('yyyy-MM-dd')) == (new Date(date).format('yyyy-MM-dd'))) && (i < nowTime))) {
          retData.workTimes.push(new Date(i).format('hh:mm'));
        }
      }

      console.log('预约时间', typeof date, orderTimeStart, orderTimeEnd);
      return MakeAppointmentOrderService.findMakeAppointmentOrderServiceByCond({
        doctorId: spos.doctorId,
        status: 200,
        'orderTime': {
          "$gte": orderTimeStart,
          "$lt": orderTimeEnd
        }
      });
    })
    .then(function (_maos) {
      retData.bookedTimes = [];
      console.log('_maos', _maos);


      for (var i = 0; i < _maos.length; i++) {
        retData.bookedTimes.push(new Date(_maos[i].orderTime).format('hh:mm'));
      }


      apiHandler.OK(res, retData);
    }, function (err) {
      apiHandler.OUTER_DEF(res, err);
    });

};


var srtToDate = function (time) {
  var now = Date.now();
  // console.log('年月日',(new Date(now).format('yyyy-MM-dd')));
  var yearMonthDay = (new Date(now).format('yyyy-MM-dd'));
  var after = (new Date(yearMonthDay + " " + time + ":00")).getTime();
  console.log('转换后的时间', after);
  return after;
};


SignedDoctorsController.prototype.sendSmsToUsers = function (req, res) {
  var startTime = new Date((new Date()).format("yyyy-MM-dd 00:00:00")).getTime();
  var endTime = startTime + constants.TIME1D - 1;
  apiHandler.OK(res);


  MakeAppointmentOrderService.findMakeAppointmentOrderServiceByCond({
    isDeleted: false,
    status: 200,
    $and: [{ "orderTime": { $gt: startTime } }, { "orderTime": { $lt: endTime } }]
  }).then(function (_o) {
    _o.forEach(function (item) {
      var date = new Date(item.orderTime);
      var hour = date.getHours();
      var minute = date.getMinutes();
      console.log('发送短信', hour + '时' + minute + '分');
      console.log('医生姓名', item.doctorName);


      ServiceSignedDoctorsService.sendSms("1954366", item.userPhoneNum, item.doctorName, item.orderTime, true);
      // ServiceSignedDoctorsService.sendSms("1954366","17745216206",item.doctorName,item.orderTime,true);
    });
  });
};


SignedDoctorsController.prototype.getDoctorServicesDesc = function (req, res) {
  var doctorId = req.query.doctorId;
  if (!doctorId) {
    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
  }
  ServiceSignedDoctorsService.getDoctorAllServices(doctorId)
    .then(function (_s) {
      console.log('所有的服务信息', _s);
      var services = JSON.parse(JSON.stringify(_s));
      var retData = [];
      for (var i = 0; i < services.length; i++) {
        retData.push({ name: services[i].serviceInfo[0].name, desc: services[i].serviceInfo[0].desc });
      }

      apiHandler.OK(res, { items: retData });
    }, function (err) {
      apiHandler.OUTER_DEF(res, err);
    });


};

module.exports = exports = new SignedDoctorsController();


