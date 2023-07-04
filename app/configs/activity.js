/**
 *  运营活动
 */

var constants = require('./constants');

var CONS = {
  haveActivity: false, //以haveActivity函数为准，以防忘记将活动关闭

  //送购买专属医生专用折扣券
  activityNO: constants.COUPON_ACTIVITYNO_EXCLUSIVE_DOCTOR, //活动序号
  dateBegin: 1457884800000, //活动起始日期
  dateEnd: 1460476800000,//活动结束日期
  timeBegin: 0, //活动日起始时间
  timeEnd: 24, //活动日结束时间
  couponType: 2, //对应优惠券类型
  activityImageUrl: 'activity_201603011007_1.png'


  ////拜年活动
  //activityNO: '20160207001', //活动序号
  //rmb: 100,
  //callbackMaxCallTime: 3 * 60, //最长通话3分钟
  //dateBegin: 1454774400000, //活动起始日期
  //dateEnd: 1454947200000,//活动结束日期
  //timeBegin: 9, //活动日起始时间
  //timeEnd: 21, //活动日结束时间
  //couponType: 1, //对应优惠券类型
  //couponTitle: '拜年券',//对应优惠券title
  //activityTips: '拜年活动',//活动提示
  //activityCouponTips: '领取拜年活动优惠券',//领取优惠券提示
  //activityDetail: '拜年活动详情',//活动详情
  //activityCallTips: '当前使用拜年券给医生拨号'//拨号时的提示
};

var Activity = function () {
};
Activity.prototype.constructor = Activity;

//当前是否有活动
Activity.prototype.haveActivity = function () {
  var endTime = CONS.dateEnd + CONS.timeEnd * constants.TIME1H;
  return (CONS.haveActivity && Date.now() <= endTime);
};

//当前时间是否为活动日期
Activity.prototype.isActivityDate = function () {
  var endTime = CONS.dateEnd + CONS.timeEnd * constants.TIME1H;
  return (Date.now() >= CONS.dateBegin && Date.now() <= endTime);
};

//当前时间是否为活动时间段
Activity.prototype.isActivityTime = function () {
  var isActivityTime = false;
  var endTime = CONS.dateEnd + CONS.timeEnd * constants.TIME1H;

  for (var start = CONS.dateBegin; start <= endTime;) {
    if (Date.now() >= start + CONS.timeBegin * constants.TIME1H &&
      Date.now() <= start + CONS.timeEnd * constants.TIME1H) {
      isActivityTime = true;
      break;
    }
    //console.log("start:" + start);
    start = start + constants.TIME_1_DAY;
  }

  return isActivityTime;
};

Activity.prototype.CONS = CONS;

module.exports = exports = new Activity();