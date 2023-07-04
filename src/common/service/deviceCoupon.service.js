/**
 * Created by yichen on 2017/5/25.
 */
'use strict';

var _  = require('underscore')

module.exports = {
  hadDeviceGot: function (deviceId, ignoredUserId, couponType, boundVenderId, appVersion, activityNO) {

    let CustomerModel = Backend.model('common', undefined, 'customer');
    let CouponModel = Backend.model('common' , undefined, 'coupon');

    console.log(deviceId, couponType, appVersion, activityNO);

    if(!deviceId || appVersion < '4.4.2'){
      return false;
    }
    var now = Date.now();
    var nowTime = new Date();
    var dayBeginTS = new Date(dateFormat(now, 'yyyy-MM-dd 00:00:00:000')).getTime();
    var dayEndTS = new Date(dateFormat(now, 'yyyy-MM-dd 23:59:59:999')).getTime();
    console.log(dayBeginTS, dayEndTS);
    var deviceCond = {
      deviceId: deviceId,
      isDeleted: false
    };
    var userIds = [];
    var hasGot = false; //自定义,狂欢券 + 100元会员额度,couponType = -1
    return CustomerModel.find(deviceCond, '_id marketing').exec()
      .then((_customers) => {
        userIds = _.map(_customers, function(_customer){
          if(_customer.marketing && _customer.marketing.isShareRewardReceived){
            hasGot = true;
          }
          return _customer._id + '';
        });
        userIds = _.without(userIds, ignoredUserId + '');
        console.log(userIds,ignoredUserId);
        if(userIds && userIds.length == 0){
          return false;
        }
        var couponCond = {
          isDeleted: false,
          boundUserId: {$in: userIds},
        };

        if(couponType == -1){
          return hasGot;
        }
        if(activityNO){
          couponCond.activityNO = activityNO;
        }else if(couponType){
          couponCond.type = couponType;
          if(couponType == 8){ //返利代金券
            couponCond.boundVenderId = boundVenderId|| '' ;
            couponCond['$or'] = [
              //今天领过
              {
                createdAt: {$gte: dayBeginTS, $lte: dayEndTS}
              },
              //以前领过,未使用且为过期
              {
                createdAt: {$lt: dayBeginTS},
                isConsumed: false,
                expiredAt: {$gt: now}
              }
            ];
          }else if(couponType == 5){ //一周只能领一次
            var day = nowTime.getDay();
            var weekBeginTS = new Date(dateFormat(new Date(nowTime.setDate(nowTime.getDate() - day + 1)), 'yyyy-MM-dd 00:00:00:000')).getTime();
            couponCond.createdAt = {$gte: weekBeginTS};
          }else{
            return false;
          }
        }else{
          return false;
        }
        return CouponModel.findOne(couponCond).exec();
      })
      .then((_coupon) => {
        if(couponType == -1){
          return hasGot;
        }
        if(_coupon){
          return true;
        }
        return false;
      })
  }
}