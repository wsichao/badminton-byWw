var
    _ = require('underscore'),
    util = require('util'),
    constants = require('../configs/constants'),
    commonUtil = require('../../lib/common-util'),
    crypto = require('crypto'),
    sha1 = commonUtil.sha1,
    apiHandler = require('../configs/ApiHandler'),
    ErrorHandler = require('../../lib/ErrorHandler'),
    configs = require('../configs/api'),
    Q = require("q"),
    Promise = require('promise'),
    serverConfigs = require('../configs/server.js'),
    OrderService = require('../services/OrderService'),
    DoctorService = require('../services/DoctorService'),
    CallbackService = require('../services/CallbackService'),
    CustomerService = require('../services/CustomerService'),
    CouponService = require('../services/CouponService'),
    LoggerService = require('../services/LoggerService'),
    TransactionMysqlService = require('../services/TransactionMysqlService');


var CallController = function () {
};
CallController.prototype.constructor = CallController;

//新的分账逻辑
var distribute = function (account, order, option) {
    var callPrice = order.callPrice;
    var restAmount = account.amount + order.couponDeductedRMB, calleeShouldIncome = order.calleeIncome, callerShouldPayment = order.callerPayment;
    console.log('amount:', account.amount, order.callerPayment - order.couponDeductedRMB);
    if(restAmount  >= order.callerPayment){ //金额足够支付全部金额
        return TransactionMysqlService.distribute(
          order.callerId, order.callerRefId, order.calleeId, order.callerPayment > order.couponDeductedRMB ? (order.callerPayment - order.couponDeductedRMB) : 0,
          order.calleeIncome, order.couponDeductedRMB, "" + order._id, "通话支出: " + order.calleeName, "通话收入: " + order.callerName);//分账
    }else if(restAmount >= callPrice.initiatePayment){ //金额足以支付起步价,但不足支付全部金额
        //先支付起步,再按比例支付起步价
        var rate = callPrice.incomePerMin / callPrice.paymentPerMin;
        var calleeIncome = callPrice.initiateIncome + Math.round( (restAmount - callPrice.initiatePayment) * rate * 100 ) / 100 ; //可支付被叫的金额数

    }else if(account.amount > 0){ //金额不足够支付起步价
        //按比例支付起步价
        var rate = callPrice.initiateIncome / callPrice.initiatePayment;
        var calleeIncome = Math.round( restAmount * rate * 100 ) / 100 ; //可支付被叫的金额数
    }
    var platIncome = ((restAmount * 100 - calleeIncome * 100) / 100); //可支付平台的金额数
    var payingCalleeIncome = (calleeShouldIncome * 100 - calleeIncome * 100) / 100; //待支付被叫的金额数
    var payingPlatIncome = (callerShouldPayment * 100 - calleeShouldIncome * 100 - platIncome * 100) / 100; //待支付平台的金额数
    option.calleeIncome = Math.round(calleeIncome * 100) / 100;
    option.platIncome = Math.round(platIncome * 100) / 100;
    option.payingCalleeIncome =Math.round(payingCalleeIncome * 100) / 100 ;
    option.payingPlatIncome = Math.round(payingPlatIncome * 100) / 100;
    option.willIncome = Math.round(payingCalleeIncome * 100) / 100;
    option.callerPayment = Math.round(order.callerPayment * 100) / 100;
    console.log('option:', option);
    return TransactionMysqlService.distribute_when_not_enough(
      order.callerId, order.callerRefId, order.calleeId, (order.callerPayment * 100 - order.couponDeductedRMB * 100) / 100,
      order.couponDeductedRMB, "" + order._id, "通话支出: " + order.calleeName, "通话收入: " + order.callerName, option);//分账

}

var orderNextTodo_old = function (o, res) {
    var order, customerAmount, consumedCoupon;

    return Promise.resolve().then(function () {
            order = o;
            if (order && order.isSeedDoctor && !order.seedDoctorCouponUnlimited)
                return OrderService.countC2DOrderUseSeedCoupon(order.doctorId, true);//true: 老订单
            else
                return {today: 0, all: 0};
        })
        .then(function (_count) {
            console.log("_count:" + JSON.stringify(_count));
            var isSeedCouponOK = order.isSeedDoctor;
            if (_count.today >= constants.SeedDoctorCouponLimitPerDay || _count.all >= constants.SeedDoctorCouponLimitAll)
                isSeedCouponOK = false;

            if (order.isMyExclusiveDoctor)
                return;
            else
                return CouponService.getRMBSortValidUsableAllPhoneCouponsByUerId(order.customerId, isSeedCouponOK, order.double12Doctor, false);//金额升序查询所有可用电话优惠券
        })
        .then(function (coupons) {
            if (order.isMyExclusiveDoctor)
                return;

            //console.log("coupons:" + JSON.stringify(coupons));
            if (coupons && coupons.length > 0 && order.customerPayment > 0) {//收费的订单才使用优惠券

                for (var i = 0; i < coupons.length; i++) {  //选择合适的优惠券
                    if (i == coupons.length - 1) {
                        consumedCoupon = coupons[i];
                    } else if (coupons[i].rmb >= order.customerPayment) {
                        consumedCoupon = coupons[i];
                        break;
                    }
                }
                console.log("consumedCoupon:",  consumedCoupon);

                return OrderService.updateOrderInfo(order._id, {
                    couponId: consumedCoupon._id,
                    couponType: consumedCoupon.type || 0,
                    couponDeductedRMB: (order.customerPayment > consumedCoupon.rmb ? consumedCoupon.rmb : order.customerPayment)
                }); //抵扣优惠券
            }
        })
        .then(function (o) {
            if (order.isMyExclusiveDoctor)
                return;

            if (consumedCoupon) {
                order = o;
                return CouponService.consumedCoupon(consumedCoupon._id, order.couponDeductedRMB);//消费优惠券
            }
        })
        .then(function () {
            return TransactionMysqlService.getTransactionByInnerTradeNo("" + order._id); //查询当前订单是否已分账
        })
        .then(function (t) {
            if (order.direction == 'C2D' && order.time != 0) {
                if (t.length <= 0)
                    return TransactionMysqlService.distribute(order.customerId, '', order.doctorId, order.customerPayment > order.couponDeductedRMB ? (order.customerPayment - order.couponDeductedRMB) : 0,
                        order.doctorIncome, order.couponDeductedRMB, "" + order._id, "顾问: " + order.doctorRealName, "粉丝: " + order.customerName);//分账
                else
                    return TransactionMysqlService.getAccountByUserIdAndDoctorId(order.customerId);
            }
        })
        .then(function (account) {

            if (order.direction == 'C2D' && order.time != 0) {
                //DoctorService.getAllInfoByID(o.doctorId)
                //    .then(function (d) {
                //        if (d) { //给医生发收入短信
                if (consumedCoupon && consumedCoupon.activityNO == '20160207001') { //患者使用拜年优惠券
                    commonUtil.sendSms("1230071", o.doctorPhoneNum, "#name#=" + o.customerName +
                        "&#income#=" + o.doctorIncome);
                } else if (order.isMyExclusiveDoctor) {
                    commonUtil.sendSms("1255203", o.doctorPhoneNum, "#doctorName#=" + order.doctorRealName +
                        "&#customerName#=" + order.customerName);
                } else if (o.doctorIncome != 0) {
                    commonUtil.sendSms("954493", o.doctorPhoneNum, "#price#=" + o.doctorIncome +
                        "&#phone#=" + constants.zly400);
                }
                //}
                //});
                //CustomerService.getInfoByID(o.customerId)
                //    .then(function (u) {
                //        if (u) { //给患者发扣费短信
                if (order.isMyExclusiveDoctor) {
                    commonUtil.sendSms("1255201", o.customerPhoneNum, "#doctorName#=" + order.doctorRealName);
                } else if (customerAmount < 0) { //欠费
                    if (consumedCoupon) { //使用优惠券
                        var paid = (o.customerPayment + customerAmount - order.couponDeductedRMB).toFixed(2);
                        commonUtil.sendSms("1126171", o.customerPhoneNum, "#price#=" + o.customerPayment +
                            "&#coupon#=" + order.couponDeductedRMB +
                            "&#paid#=" + paid +
                            "&#debt#=" + (-customerAmount) +
                            "&#doctorName#=" + order.doctorRealName);
                    } else {
                        var paid = (o.customerPayment + customerAmount).toFixed(2);
                        commonUtil.sendSms("954487", o.customerPhoneNum, "#price#=" + o.customerPayment +
                            "&#paid#=" + paid +
                            "&#debt#=" + (-customerAmount) +
                            "&#doctorName#=" + order.doctorRealName);
                    }

                } else { //不欠费
                    if (o.customerPayment == 0) {
                        var docName = o.doctorRealName;
                        commonUtil.sendSms("1109581", o.customerPhoneNum, "#doctorName#=" + docName);
                    } else {
                        if (consumedCoupon) { //使用优惠券
                            if (consumedCoupon.activityNO == '20160207001') { //拜年活动
                                commonUtil.sendSms("1226413", o.customerPhoneNum, "#url#=" + constants.customerPublicDownloadURL);

                            } else {
                                commonUtil.sendSms("1126169", o.customerPhoneNum, "#price#=" + o.customerPayment +
                                    "&#coupon#=" + order.couponDeductedRMB);
                            }
                        } else {
                            commonUtil.sendSms("954483", o.customerPhoneNum, "#price#=" + o.customerPayment);
                        }
                    }
                }
                //}
                //});

                //if (consumedCoupon && consumedCoupon.activityNO == '20160207001') { //患者使用拜年优惠券
                //  commonUtil.sendSms("1232437", constants.notifyPhones, "#docName#=" + o.doctorRealName +
                //  "&#customerName#=" + o.customerName +
                //  "&#time#=" + o.time +
                //  "&#income#=" + o.doctorIncome);
                //} else {
                //  commonUtil.sendSms("979005", constants.notifyPhones, "#docName#=" + o.doctorRealName +
                //  "&#customerName#=" + o.customerName +
                //  "&#time#=" + o.time +
                //  "&#income#=" + o.doctorIncome +
                //  "&#payment#=" + o.customerPayment);
                //}
            } else if (order.direction == 'D2C' && order.time != 0 && order.from == "freePhone" && ['-11', '-10'].indexOf(order.byetype) < 0) {
                commonUtil.sendSms("1604054", order.customerPhoneNum, "#brokerName#=" + order.doctorRealName +
                    "&#docChatNum#=" + commonUtil.stringifyDocChatNum(order.doctorDocChatNum) +
                    "&#url#=" + constants.customerPublicDownloadURL
                );
            }

            //给医生通话时给医生拨号的患者发送短信
            DoctorService.getInfoByID(order._id)
                .then(function (d) {
                    if (d && d.busyCallers && d.busyCallers.length > 0) {
                        var phones = "";
                        for (var i = 0; i < d.busyCallers.length; i++)
                            phones += d.busyCallers[i] + ",";

                        commonUtil.sendSms("1203115", phones, "#docName#=" + d.realName +
                            "&#docChatNum#=" + commonUtil.stringifyDocChatNum(d.docChatNum) +
                            "&#url#=" + constants.customerPublicDownloadURL);

                        DoctorService.cleanBusyCallers(d._id);
                    }
                });

            if (order.direction == 'C2D' && order.time != 0) { //分账成功后，更新订单支付状态
                customerAmount = account.amount;
                var data = {};
                data.updatedAt = Date.now();
                if (account.amount < 0 && !order.isMyExclusiveDoctor)
                    data.payStatus = 'toPay';
                else
                    data.payStatus = 'paid';

                return OrderService.updateOrderInfo(order._id, data); //更新订单支付状态
            }
        })
        .then(function(){
            return order;
        }, function(err){
            throw err;
        });
};

var orderNextTodo_pre = function (promise, res) {
    return promise
            .then(function (o) {
                if (!o.callerId) {//老订单
                    return orderNextTodo_old(o,res);
                }else{
                    return orderNextTodo_new(o,res);
                }
            })
        .then(function (order) {
                if (order && order._id)
                    OrderService.updateOrderInfo(order._id, {callStatus: 'over'}); //所有操作结束后，才记该订单结束

                apiHandler.OK(res);
            },
            function (err) {
                console.log('err:', err, err.code);
                if (err.code == 1401 || err.code == 1403) //如果是订单不存在或已处理，就不用双向回拨不停的回调了
                    apiHandler.OK(res);
                else
                    apiHandler.handleErr(res, err);
            })

}
var orderNextTodo_new = function (o, res) {
    var order, customerAmount_pre, consumedCoupon, calleeRef, account, account_pre, account_last, option = {willIncome: 0}; //option.willIncome被叫待收入金额
    //promise
    //    .then(function (o) {
    //        if (o.direction == 'C2D') {//老订单
    //            return orderNextTodo_old(promise, res);
    //        }
    //        order = o;
    //        if (o.calleeRefId)
    //            return DoctorService.getInfoByID(o.calleeRefId);
    //        else return null;
    //    })
    order = o;
    return DoctorService.getInfoByID(o.calleeRefId)
        .then(function (d) {
            calleeRef = d;
            if (calleeRef && calleeRef.isSeedDoctor && !calleeRef.seedDoctorCouponUnlimited)
                return OrderService.countC2DOrderUseSeedCoupon(order.calleeId);//??
            return {today: 0, all: 0};
        })
        .then(function (_count) {
            console.log("_count:" + JSON.stringify(_count));
            var isSeedCouponOK = calleeRef && calleeRef.isSeedDoctor ? true : false;
            if (_count.today >= constants.SeedDoctorCouponLimitPerDay || _count.all >= constants.SeedDoctorCouponLimitAll)
                isSeedCouponOK = false;

            var double12Doctor = calleeRef && calleeRef.double12Doctor ? true : false;
            return CouponService.getRMBSortValidUsableAllPhoneCouponsByUerId(order.callerId, isSeedCouponOK, double12Doctor, false);//金额升序查询所有可用电话优惠券
        })
        .then(function (coupons) {
            //console.log("coupons:" + JSON.stringify(coupons));
            if (coupons && coupons.length > 0 && order.callerPayment > 0) {//收费的订单才使用优惠券

                for (var i = 0; i < coupons.length; i++) {  //选择合适的优惠券
                    if (i == coupons.length - 1) {
                        consumedCoupon = coupons[i];
                    } else if (coupons[i].rmb >= order.callerPayment) {
                        consumedCoupon = coupons[i];
                        break;
                    }
                }
                console.log("consumedCoupon:",  consumedCoupon);

                return OrderService.updateOrderInfo(order._id, {
                    couponId: consumedCoupon._id,
                    couponType: consumedCoupon.type || 0,
                    couponDeductedRMB: (order.callerPayment > consumedCoupon.rmb ? consumedCoupon.rmb : order.callerPayment)
                }); //抵扣优惠券
            }
        })
        .then(function (o) {
            if (consumedCoupon) {
                order = o;
                return CouponService.consumedCoupon(consumedCoupon._id, order.couponDeductedRMB);//消费优惠券
            }
        })
        .then(function () {
            return TransactionMysqlService.getAccountByUserIdAndDoctorId(order.callerId, order.callerRefId);
        })
      .then(function (_account) {
          account_pre = _account;
          customerAmount_pre = _account.amount;
            return TransactionMysqlService.getTransactionByInnerTradeNo("" + order._id); //查询当前订单是否已分账
        })
      .then(function (t) {
          if (order.callerPayment != 0 || order.calleeIncome != 0) {
              if (t.length <= 0){
                  //分账
                  return distribute(account_pre, order, option);
              }
          }
      })
        .then(function (_account) {
            if(_account){
                account_last = _account;
            }
            if (order.callerPayment != 0 || order.calleeIncome != 0) {
                console.log('option.willIncome:', option.willIncome, order.maxTime, order.time);
                if (option.willIncome > 0) { //欠费
                    if(Math.abs(order.maxTime - order.time) < 5){ // 判断是否自动挂断
                        commonUtil.sendSms("1724842", o.calleePhoneNum, "#price#=" + o.calleeIncome);
                        commonUtil.sendSms("1725172", o.callerPhoneNum, "#price#=" + o.callerPayment +
                          '&#paid#=' + account_last.callerPaid +
                          '&#debt#=' + account_last.callerDebt );
                    }else{
                        if (order.calleeIncome != 0)
                            commonUtil.sendSms("954493", o.calleePhoneNum, "#price#=" + o.calleeIncome +
                              "&#phone#=" + constants.zly400);
                        if (consumedCoupon) { //使用优惠券
                            var paid = (o.callerPayment + customerAmount_pre - order.couponDeductedRMB).toFixed(2);
                            commonUtil.sendSms("1126171", o.callerPhoneNum, "#price#=" + o.callerPayment +
                              "&#coupon#=" + order.couponDeductedRMB +
                              "&#paid#=" + paid +
                              "&#debt#=" + (-customerAmount_pre) +
                              "&#doctorName#=" + order.calleeName);
                        } else {
                            var paid = (o.callerPayment + customerAmount_pre).toFixed(2);
                            commonUtil.sendSms("954487", o.callerPhoneNum, "#price#=" + o.callerPayment +
                              "&#paid#=" + paid +
                              "&#debt#=" + (-customerAmount_pre) +
                              "&#doctorName#=" + order.calleeName);
                        }
                    }
                } else { //不欠费
                    if (o.callerPayment == 0) {
                        var docName = o.calleeName;
                        commonUtil.sendSms("1109581", o.callerPhoneNum, "#doctorName#=" + docName);
                    }
                    if(Math.abs(order.maxTime - order.time) < 5){ //
                        commonUtil.sendSms("1725174", o.callerPhoneNum, "#price#=" + o.callerPayment +
                          "&#paid#=" + o.callerPayment
                        );
                    }else{
                        if (consumedCoupon) { //使用优惠券
                            if (consumedCoupon.activityNO == '20160207001') { //拜年活动
                                commonUtil.sendSms("1226413", o.callerPhoneNum, "#url#=" + constants.customerPublicDownloadURL);

                            } else {
                                commonUtil.sendSms("1126169", o.callerPhoneNum, "#price#=" + o.callerPayment +
                                  "&#coupon#=" + order.couponDeductedRMB);
                            }
                        } else {
                            commonUtil.sendSms("954483", o.callerPhoneNum, "#price#=" + o.callerPayment);
                        }
                    }
                }

            }


            //if (order.from == "freePhone"  && ['-11', '-10'].indexOf(order.byetype) < 0) {
            //    commonUtil.sendSms("1604054", order.calleePhoneNum, "#brokerName#=" + order.callerName +
            //        "&#docChatNum#=" + commonUtil.stringifyDocChatNum(order.callerDocChatNum) +
            //        "&#url#=" + constants.customerPublicDownloadURL
            //    );
            //}
            if (order.callerPayment != 0 || order.calleeIncome != 0) { //分账成功后，更新订单支付状态
                var data = {};
                data.updatedAt = Date.now();
                data.payStatus = 'toPay';
                if (account_pre.amount + order.couponDeductedRMB  >= order.callerPayment){
                    data.payStatus = 'paid';
                    //被叫有收入,平账
                    CustomerService.payTheNonPayment(order.calleeId, order.calleeRefId);
                } else if (account_pre.amount > 0){
                    data.willIncome = option.willIncome;
                    //被叫有收入,平账
                    CustomerService.payTheNonPayment(order.calleeId, order.calleeRefId);
                }
                return OrderService.updateOrderInfo(order._id, data); //更新订单支付状态
            }
        })
        .then(function(){
            return order;
        }, function(err){
            throw err;
        });
};
var orderNextTodo = function (promise, res) {
    var order,  customerAmount_pre, consumedCoupon, calleeRef, account_pre,account_last, option = { willIncome: 0 };//option.willIncome被叫待收入金额
    promise
        .then(function (o) {
            order = o;
            if (o.calleeRefId)
                return DoctorService.getInfoByID(o.calleeRefId);
            else return null;
        })
        .then(function (d) {
            calleeRef = d;
            if (calleeRef && calleeRef.isSeedDoctor && !calleeRef.seedDoctorCouponUnlimited)
                return OrderService.countC2DOrderUseSeedCoupon(order.calleeId);//??
            return {today: 0, all: 0};
        })
        .then(function (_count) {
            console.log("_count:" + JSON.stringify(_count));
            var isSeedCouponOK = calleeRef && calleeRef.isSeedDoctor ? true : false;
            if (_count.today >= constants.SeedDoctorCouponLimitPerDay || _count.all >= constants.SeedDoctorCouponLimitAll)
                isSeedCouponOK = false;

            var double12Doctor = calleeRef && calleeRef.double12Doctor ? true : false;
            return CouponService.getRMBSortValidUsableAllPhoneCouponsByUerId(order.callerId, isSeedCouponOK, double12Doctor, false);//金额升序查询所有可用电话优惠券
        })
        .then(function (coupons) {
            //console.log("coupons:" + JSON.stringify(coupons));
            if (coupons && coupons.length > 0 && order.callerPayment > 0) {//收费的订单才使用优惠券

                for (var i = 0; i < coupons.length; i++) {  //选择合适的优惠券
                    if (i == coupons.length - 1) {
                        consumedCoupon = coupons[i];
                    } else if (coupons[i].rmb >= order.callerPayment) {
                        consumedCoupon = coupons[i];
                        break;
                    }
                }
                console.log("consumedCoupon:",  consumedCoupon);
                return OrderService.updateOrderInfo(order._id, {
                    couponId: consumedCoupon._id,
                    couponType: consumedCoupon.type || 0,
                    couponDeductedRMB: (order.callerPayment > consumedCoupon.rmb ? consumedCoupon.rmb : order.callerPayment)
                }); //抵扣优惠券
            }
        })
        .then(function (o) {
            if (consumedCoupon) {
                order = o;
                return CouponService.consumedCoupon(consumedCoupon._id, order.couponDeductedRMB);//消费优惠券
            }
        })
      .then(function () {
          return TransactionMysqlService.getAccountByUserIdAndDoctorId(order.callerId, order.callerRefId);
      })
      .then(function (_account) {
          account_pre = _account;
          customerAmount_pre = _account.amount;
          return TransactionMysqlService.getTransactionByInnerTradeNo("" + order._id); //查询当前订单是否已分账
      })
      .then(function (t) {
          if (order.callerPayment != 0 || order.calleeIncome != 0) {
              if (t.length <= 0){
                  //分账
                  return distribute(account_pre, order, option);
              }
          }
      })
        .then(function (_account) {
            if(_account){
                account_last = _account;
            }
            if (order.callerPayment != 0 || order.calleeIncome != 0) { //分账成功后，更新订单支付状态
                var data = {};
                data.updatedAt = Date.now();
                data.payStatus = 'toPay';
                if (account_pre.amount + order.couponDeductedRMB  >= order.callerPayment){
                    data.payStatus = 'paid';
                    //被叫有收入,平账
                    CustomerService.payTheNonPayment(order.calleeId, order.calleeRefId);
                } else if (account_pre.amount > 0){
                    data.willIncome = option.willIncome;
                    //被叫有收入,平账
                    CustomerService.payTheNonPayment(order.calleeId, order.calleeRefId);
                }
                return OrderService.updateOrderInfo(order._id, data); //更新订单支付状态
            }
        })
        .then(function (o) {
                if (order && order._id)
                    OrderService.updateOrderInfo(order._id, {callStatus: 'over'}); //所有操作结束后，才记该订单结束
                if(order.callWay == 'call_both' && order.provider == 'feiyucloud'){
                    apiHandler.OK(res,{
                        "resultCode": "0",
                        "resultMsg": "接收成功"
                    });
                }else{
                    apiHandler.OK(res);
                }
              if (order.callerPayment != 0 || order.calleeIncome != 0) {
                  console.log('option.willIncome:', option.willIncome, order.maxTime, order.time);
                  if (option.willIncome > 0) { //欠费
                      if(Math.abs(order.maxTime - order.time) < 5){ // 判断是否自动挂断
                          commonUtil.sendSms("1724842", o.calleePhoneNum, "#price#=" + o.calleeIncome);
                          commonUtil.sendSms("1725172", o.callerPhoneNum, "#price#=" + o.callerPayment +
                            '&#paid#=' + account_last.callerPaid +
                            '&#debt#=' + account_last.callerDebt );
                      }else{
                          if (order.calleeIncome != 0)
                              commonUtil.sendSms("954493", o.calleePhoneNum, "#price#=" + o.calleeIncome +
                                "&#phone#=" + constants.zly400);
                          if (consumedCoupon) { //使用优惠券
                              var paid = (o.callerPayment + customerAmount_pre - order.couponDeductedRMB).toFixed(2);
                              commonUtil.sendSms("1126171", o.callerPhoneNum, "#price#=" + o.callerPayment +
                                "&#coupon#=" + order.couponDeductedRMB +
                                "&#paid#=" + paid +
                                "&#debt#=" + (-customerAmount_pre) +
                                "&#doctorName#=" + order.calleeName);
                          } else {
                              var paid = (o.callerPayment + customerAmount_pre).toFixed(2);
                              commonUtil.sendSms("954487", o.callerPhoneNum, "#price#=" + o.callerPayment +
                                "&#paid#=" + paid +
                                "&#debt#=" + (-customerAmount_pre) +
                                "&#doctorName#=" + order.calleeName);
                          }
                      }
                  } else { //不欠费
                      if (o.callerPayment == 0) {
                          var docName = o.calleeName;
                          commonUtil.sendSms("1109581", o.callerPhoneNum, "#doctorName#=" + docName);
                      }
                      if(Math.abs(order.maxTime - order.time) < 5){ //
                          commonUtil.sendSms("1724842", o.calleePhoneNum, "#price#=" + o.calleeIncome);
                          commonUtil.sendSms("1725174", o.callerPhoneNum, "#price#=" + o.callerPayment +
                            "&#paid#=" + o.callerPayment
                          );
                      }else{
                          if (consumedCoupon) { //使用优惠券
                              if (consumedCoupon.activityNO == '20160207001') { //拜年活动
                                  commonUtil.sendSms("1226413", o.callerPhoneNum, "#url#=" + constants.customerPublicDownloadURL);

                              } else {
                                  commonUtil.sendSms("1126169", o.callerPhoneNum, "#price#=" + o.callerPayment +
                                    "&#coupon#=" + order.couponDeductedRMB);
                              }
                          } else {
                              commonUtil.sendSms("954483", o.callerPhoneNum, "#price#=" + o.callerPayment);
                          }
                      }
                  }

              }
                if (order.from == "freePhone" && order.time) {
                    commonUtil.sendSms("1604054", order.calleePhoneNum, "#brokerName#=" + order.callerName +
                        "&#docChatNum#=" + commonUtil.stringifyDocChatNum(order.callerDocChatNum) +
                        "&#url#=" + constants.customerPublicDownloadURL
                    );
                }
            },
            function (err) {
                console.log('err:', err, err.code);
                if (err.code == 1401 || err.code == 1403){ //如果是订单不存在或已处理，就不用双向回拨不停的回调了
                    if(order.callWay == 'call_both' && order.provider == 'feiyucloud'){
                        apiHandler.OK(res,{
                            "resultCode": "0",
                            "resultMsg": "接收成功"
                        });
                    }else{
                        apiHandler.OK(res);
                    }
                }
                else
                    apiHandler.handleErr(res, err);
            });
};
CallController.prototype.orderNextTodo_pre = orderNextTodo_pre;

/**
 * 双向回拨通话结束回调(分账、关闭订单)
 * TODO 优化(分D2C；C2D)
 * @param req
 * @param res
 */
CallController.prototype.callbackHangup = function (req, res) {
    var payload = req.body;
    var callWay = 'call_both';
    console.log("callbackHangup data: " + JSON.stringify(payload));

    if (callWay == 'call_both' && payload.cdr.recordurl)
        console.log("recordurl:" + payload.cdr.recordurl[0]);
    var promise =
        OrderService.getOrderByCallbackID(payload.cdr.callsid[0])
            .then(function (o) {
                if (!o)
                    throw ErrorHandler.getBusinessErrorByCode(1401);
                else if (o.callStatus == "over")
                    throw ErrorHandler.getBusinessErrorByCode(1403);
                var data = {};
                data.byetype = payload.cdr.byetype[0];
                if (payload.cdr.recordurl)
                    data.recordurl = payload.cdr.recordurl[0];

                data.begincalltime = payload.cdr.begincalltime[0];
                data.ringingbegintime = payload.cdr.ringingbegintime[0];
                data.ringingendtime = payload.cdr.ringingendtime[0];
                if (data.byetype == '1' || data.byetype == '2' || data.byetype == '3' || data.byetype == '4') //通话成功
                    data.time = payload.cdr.duration[0];
                else
                    data.time = 0;

                data.callerPayment = OrderService.getCustomerPayment(data.time, o);
                data.calleeIncome = OrderService.getDocIncome(data.time, o);
                if (data.callerPayment == 0 && data.calleeIncome == 0) {
                    data.payStatus = 'paid';
                    data.updatedAt = Date.now();
                }
                //if (o.direction == 'C2D' && data.time != 0) {//患者打给医生
                //  data.customerPayment = OrderService.getCustomerPayment(data.time, o);
                //  data.doctorIncome = OrderService.getDocIncome(data.time, o);
                //} else if (data.time != 0) {  //不用付费
                //  data.payStatus = 'paid';
                //  data.updatedAt = Date.now();
                //} else {
                //  data.updatedAt = Date.now();
                //}

                return OrderService.updateOrderInfo(o._id, data); //更新订单相关信息
            });
    orderNextTodo(promise, res);
};

/**
 * 飞语云--双向回拨通话结束回调(分账、关闭订单)
 * TODO 优化(分D2C；C2D)
 * @param req
 * @param res
 */
CallController.prototype.phoneBillCallback = function (req, res) {
    if(_.isEmpty(req.body)){
        return apiHandler.OK(res);
    }
    var payload = req.body;
    console.log("callbackHangup data: " + JSON.stringify(payload));
console.log('au:', payload.au, CallbackService.genFeiyuAuthToken(payload.appId, payload.ti));
if(payload.au !=  CallbackService.genFeiyuAuthToken(payload.appId, payload.ti)){
    console.error('au校验错误');
    return  apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1809));
}
if(payload.action == 'recordEnd'){ //成功录音回调
    OrderService.getOrderByCallbackID(payload.fyCallId)
      .then(function (o) {
              if (!o)
                  throw ErrorHandler.getBusinessErrorByCode(1401);
              var data = {
                  'otherCallbackData.isRecordSuccess': true
              }
              return OrderService.updateOrderInfo(o._id, data); //更新订单相关信息
          })
          .then(function(){
              return apiHandler.OK(res, {
                  "resultCode": "0",
                  "resultMsg": "接收成功"
              });

          }, function(err){
              apiHandler.handleErr(res, err);
          });
    }else if(payload.action == 'callhangup'){ //话单推送
        var promise =
          OrderService.getOrderByCallbackID(payload.fyCallId)
            .then(function (o) {
                if (!o)
                    throw ErrorHandler.getBusinessErrorByCode(1401);
                else if (o.callStatus == "over")
                    throw ErrorHandler.getBusinessErrorByCode(1403);
                var data = {};
                //TODO: 记录别的字段
                data.byetype = payload.stopReason; //非正常通话,为飞语云传值

                if (['1','2'].indexOf(payload.stopReason) > -1) //通话成功, 飞语云不满一分钟按一分钟收费
                    data.time = Math.ceil((Number(payload.callEndTime) - Number(payload.callStartTime)) / 1000); //返回数据单位为ms
                else
                    data.time = 0;

                data.callerPayment = OrderService.getCustomerPayment(data.time, o);
                data.calleeIncome = OrderService.getDocIncome(data.time, o);
                if (data.callerPayment == 0 && data.calleeIncome == 0) {
                    data.payStatus = 'paid';
                    data.updatedAt = Date.now();
                }
                data['otherCallbackData.callbackFirstStartTime'] = payload.callbackFirstStartTime;
                data['otherCallbackData.callbackFirstEndTime'] = payload.callbackFirstEndTime;
                data['otherCallbackData.callStartTime'] = payload.callStartTime;
                data['otherCallbackData.callEndTime'] = payload.callEndTime;
                data['otherCallbackData.trueShowNumberType'] = payload.trueShowNumberType; //真实的显号类型：1为显示号码，2为不显示号码
                data['otherCallbackData.trueIfRecord'] = payload.trueIfRecord; //真实的是否录音：1为录音，0或者2为不录音
                data['otherCallbackData.isRecordSuccess'] = false; //默认录音不成功
                return OrderService.updateOrderInfo(o._id, data); //更新订单相关信息
            });
        orderNextTodo(promise, res);
    }else{
        return apiHandler.OK(res);
    }
};

CallController.prototype.recordCallback = function (req, res) {
    console.log('recordCallback:', req.body);
    res.send({
        "resultCode": "0",
        "resultMsg": "接收成功"
    });
}
/**
 * 有电话呼入进行转接（ivr外呼模式，已废弃）
 * @param req
 * @param res
 * @returns {*}
 */
CallController.prototype.callStart = function (req, res) {
    console.log("callStart query:" + util.inspect(req.query));
    //记录第三方回调日志，用于追踪ivr回拨失败原因
    LoggerService.trace(LoggerService.getTraceDataByReq(req));

    var fromPhoneNum = req.query.from;
    if (!fromPhoneNum) {
        apiHandler.OK(res);
        return;
    }

    if (fromPhoneNum.length > 11) //解决有些号码前面带区号bug
        fromPhoneNum = fromPhoneNum.substr(fromPhoneNum.length - 11);

    OrderService.getBusyPhoneOrderAllInfoByPhoneNum(fromPhoneNum)
        .then(function (o) {
            if (!o)
                throw ErrorHandler.getBusinessErrorByCode(1401);

            console.log("order:" + util.inspect(o));
            var toPhoneNum;
            var recordFileName;
            if (o.direction == 'C2D') {
                toPhoneNum = o.doctorPhoneNum;
                recordFileName = 'customer.wav';
            } else {
                toPhoneNum = o.customerPhoneNum;
                recordFileName = 'doctor.wav';
            }

            var consultationCall = '<?xml version="1.0" encoding="UTF-8"?> <Response> ' +
                '<ConsultationCall number="' + toPhoneNum + '" record="' + ((serverConfigs.env == 1) ? true : false) +
                '" calltime="' + constants.callbackMaxCallTime + '" disnumber="' + constants.ivrShowPhone + '" ringback="true" hangupurl="ivrHangupUrl" noanswerurl="ivrNoanswerurl">' +
                ' <Play loop="1"> ' + recordFileName + ' </Play> ' +
                ' </ConsultationCall> </Response>';

            OrderService.updateOrderInfo(o._id, {callbackId: req.query.callid, callStatus: 'busy'}); //更新订单

            return consultationCall;
        })
        .then(function (c) {
            console.log("consultationCall:" + c);
            apiHandler.OK(res, c, "application/xml");

        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

/**
 * 电话结束（分账、关闭订单）（ivr外呼模式，已废弃）
 * @param req
 * @param res
 */
CallController.prototype.callStop = function (req, res) {
    console.log("callStop query:" + util.inspect(req.query));

    //var callId = req.query.callid;
    //if (!callId) {
    //  apiHandler.OK(res);
    //  return;
    //}
    //
    //var order, customerAmount, consumedCoupon;
    //OrderService.getOrderByCallbackID(callId)
    //  .then(function (o) {
    //    if (!o)
    //      throw ErrorHandler.getBusinessErrorByCode(1401);
    //
    //    var data = {};
    //    data.callStatus = "over";
    //    data.time = req.query.seccallduration;
    //    data.recordurl = req.query.recordurl;
    //    //此处兼容了之前的双向回拨格式
    //    data.begincalltime = req.query.starttime;
    //    data.ringingbegintime = req.query.starttime;
    //    data.ringingendtime = req.query.endtime;
    //
    //    if (o.direction == 'C2D' && data.time != 0) {//需付费
    //      data.customerPayment = OrderService.getCustomerPayment(data.time, o);
    //      data.doctorIncome = OrderService.getDocIncome(data.time, o);
    //    } else { //不用付费
    //      data.payStatus = 'paid';
    //      data.updatedAt = Date.now();
    //    }
    //
    //    return OrderService.updateOrderInfo(o._id, data); //更新订单相关信息
    //  })
    //  .then(function (o) {
    //    order = o;
    //    return CouponService.getRMBDESCValidUsableAllCouponsByUerId(order.customerId);//查询优惠券
    //  })
    //  .then(function (coupons) {
    //    console.log("coupons:" + JSON.stringify(coupons));
    //    if (coupons && coupons[0] && order.customerPayment > 0) {//收费的订单才使用优惠券
    //      consumedCoupon = coupons[0];
    //      return OrderService.updateOrderInfo(order._id, {
    //        couponId: consumedCoupon._id,
    //        couponDeductedRMB: consumedCoupon.rmb
    //      }); //抵扣优惠券
    //    }
    //  })
    //  .then(function (o) {
    //    if (consumedCoupon) {
    //      order = o;
    //      return CouponService.consumedCoupon(consumedCoupon._id, order.customerId,
    //        order.customerPayment > order.couponDeductedRMB ? order.couponDeductedRMB : order.customerPayment);//消费优惠券
    //    }
    //  })
    //  .then(function () {
    //    return TransactionMysqlService.getTransactionByInnerTradeNo("" + order._id); //查询当前订单是否已分账
    //  })
    //  .then(function (t) {
    //    if (order.direction == 'C2D' && order.time != 0) {
    //      if (t.length <= 0)
    //        return TransactionMysqlService.distribute(order.customerId, order.doctorId, order.customerPayment > order.couponDeductedRMB ? (order.customerPayment - order.couponDeductedRMB) : 0,
    //          order.doctorIncome, order.couponDeductedRMB, "" + order._id, "医生: " + order.doctorRealName, "患者姓名: " + order.customerName);//分账
    //      else
    //        return TransactionMysqlService.getAccountByUserId(order.customerId);
    //    }
    //  })
    //  .then(function (account) {
    //    if (order.direction == 'C2D' && order.time != 0) { //分账成功后，更新订单支付状态
    //      customerAmount = account.amount;
    //      var data = {};
    //      data.updatedAt = Date.now();
    //      if (account.amount < 0)
    //        data.payStatus = 'toPay';
    //      else
    //        data.payStatus = 'paid';
    //
    //      return OrderService.updateOrderInfo(order._id, data); //更新订单支付状态
    //    }
    //  })
    //  .then(function (o) {
    //    console.log(o);
    //    apiHandler.OK(res);
    //
    //    if (o.direction == 'C2D' && o.time != 0) {
    //      DoctorService.getAllInfoByID(o.doctorId)
    //        .then(function (d) {
    //          if (d) { //给医生发收入短信
    //            commonUtil.sendSms("954493", d.phoneNum, "#price#=" + o.doctorIncome +
    //            "&#phone#=" + constants.zly400);
    //          }
    //        });
    //      CustomerService.getInfoByID(o.customerId)
    //        .then(function (u) {
    //          if (u) { //给患者发扣费短信
    //            if (customerAmount < 0) {
    //              if (consumedCoupon) { //使用优惠券
    //                var paid = (o.customerPayment + customerAmount - consumedCoupon.rmb).toFixed(2);
    //                commonUtil.sendSms("1126171", u.phoneNum, "#price#=" + o.customerPayment +
    //                "&#coupon#=" + consumedCoupon.rmb +
    //                "&#paid#=" + paid +
    //                "&#debt#=" + (-customerAmount) +
    //                "&#doctorName#=" + order.doctorRealName +
    //                "&#phone#=" + constants.zly400);
    //              } else {
    //                var paid = (o.customerPayment + customerAmount).toFixed(2);
    //                commonUtil.sendSms("954487", u.phoneNum, "#price#=" + o.customerPayment +
    //                "&#paid#=" + paid +
    //                "&#debt#=" + (-customerAmount) +
    //                "&#doctorName#=" + order.doctorRealName +
    //                "&#phone#=" + constants.zly400);
    //              }
    //
    //            } else {
    //              if (o.customerPayment == 0) {
    //                var docName = (order.doctorDocChatNum == '00120') ? o.doctorRealName : (o.doctorRealName + '医生');
    //                commonUtil.sendSms("1109581", u.phoneNum, "#doctorName#=" + docName);
    //              } else {
    //                if (consumedCoupon) { //使用优惠券
    //                  commonUtil.sendSms("1126169", u.phoneNum, "#price#=" + o.customerPayment +
    //                  "&#coupon#=" + consumedCoupon.rmb +
    //                  "&#phone#=" + constants.zly400);
    //                } else {
    //                  commonUtil.sendSms("954483", u.phoneNum, "#price#=" + o.customerPayment +
    //                  "&#phone#=" + constants.zly400);
    //                }
    //              }
    //            }
    //          }
    //        });
    //
    //      commonUtil.sendSms("979005", constants.zly400Phone + ",18810562253", "#docName#=" + o.doctorRealName +
    //      "&#customerName#=" + o.customerName +
    //      "&#time#=" + o.time +
    //      "&#income#=" + o.doctorIncome +
    //      "&#payment#=" + o.customerPayment);
    //    }
    //
    //    //给医生通话时给医生拨号的患者发送短信
    //    DoctorService.getInfoByID(o.doctorId)
    //      .then(function (d) {
    //        if (d && d.busyCallers && d.busyCallers.length > 0) {
    //          var phones = "";
    //          for (var i = 0; i < d.busyCallers.length; i++)
    //            phones += d.busyCallers[i] + ",";
    //
    //          commonUtil.sendSms("1203115", phones, "#docName#=" + d.realName +
    //          "&#url#=" + constants.customerPublicDownloadURL);
    //
    //          DoctorService.cleanBusyCallers(d._id);
    //        }
    //      });
    //  },
    //  function (err) {
    //    console.log(err);
    //    apiHandler.OK(res);
    //
    //    //if (err.code == 1401) //如果是订单不存在，就不用双向回拨不停的回调了
    //    //  apiHandler.OK(res);
    //    //else
    //    //  apiHandler.handleErr(res, err);
    //  });
};

/**
 * 被咨询侧接听并挂机后回调url（ivr外呼模式，已废弃）
 * @param req
 * @param res
 */
CallController.prototype.ivrHangupUrl = function (req, res) {
    console.log("ivrHangupUrl query:" + util.inspect(req.query));

    var callId = req.query.callid;
    if (!callId) {
        apiHandler.OK(res);
        return;
    }

    OrderService.getOrderByCallbackID(callId)
        .then(function (o) {
            if (!o)
                throw ErrorHandler.getBusinessErrorByCode(1401);

            OrderService.updateOrderInfo(o._id, {byetype: '4'}); //更新订单
        })
        .then(function () {
                apiHandler.OK(res);
            },
            function (err) {
                apiHandler.OK(res);
            });
};

/**
 * 被咨询侧未接听挂机回调url（ivr外呼模式，已废弃）
 * @param req
 * @param res
 */
CallController.prototype.ivrNoanswerurl = function (req, res) {
    console.log("ivrNoanswerurl query:" + util.inspect(req.query));

    var callId = req.query.callid;
    if (!callId) {
        apiHandler.OK(res);
        return;
    }

    OrderService.getOrderByCallbackID(callId)
        .then(function (o) {
            if (!o)
                throw ErrorHandler.getBusinessErrorByCode(1401);

            OrderService.updateOrderInfo(o._id, {byetype: '-9'}); //更新订单
        })
        .then(function () {
                apiHandler.OK(res);
            },
            function (err) {
                apiHandler.OK(res);
            });
};

/**
 * 被）
 * @param req
 * @param res
 */
CallController.prototype.callbackAudioRecord = function (req, res) {

    //TODO:

};


module.exports = exports = new CallController();