/**
 * 医生助理关系表 service
 * Created by yichen on 2017/12/14.
 */

"use strict";
let servicePackageDoctorAssistantRef = require('./../../models/service_package/servicePackageDoctorAssistantRef');
let mongoose = require('mongoose'),
  commonUtil = require('../../../lib/common-util');
let servicePackageDoctorAssistantRefService = function () {
};

/**
 * 获取医生 -- 助理 关系表信息
 * @param doctorId 医生唯一标识 非空
 * @return {Object|{}}
 */
servicePackageDoctorAssistantRefService.prototype.findOneAssistant = function (doctorId) {
  if (!doctorId) {
    throw new Error("医生id不能为空")
  }
  let cond = {
    'isDeleted': false,
    'doctorId': doctorId
  };
  return servicePackageDoctorAssistantRef.findOne(cond);
};
/**
 * 通过医生ID，查找助理详细信息
 * @param doctorId
 * @returns {Query|*}
 */
servicePackageDoctorAssistantRefService.prototype.findOneAssistantInfo = function (doctorId) {
  // console.log();
  // return servicePackageDoctorAssistantRef.aggregate([
  //     {'$match': {"doctorId": mongoose.Types.ObjectId(doctorId)}},
  //     {'$lookup': {from: 'servicePackageAssistant', localField: 'assistantId', foreignField: '_id', as: 'assistantId'}}
  // ]).exec();


  var cond = {
    doctorId: mongoose.Types.ObjectId(doctorId), isDeleted: false
  };
  return servicePackageDoctorAssistantRef.aggregate([
    {'$match': cond},
    {
      '$lookup': {
        from: 'servicePackageAssistant',
        localField: 'assistantId', foreignField: '_id', as: 'assistantInfo'
      }
    },
    {'$match': {'assistantInfo.isDeleted': false}}
  ]).exec();
};


/**
 * 预约医生，给用户和助理发送的短信
 * @param phoneNum
 * @param docName
 * @param time
 * @param assistantPhoneNum
 * @param userName
 */
servicePackageDoctorAssistantRefService.prototype.sendMASms = function (phoneNum, docName, time, assistantPhoneNum, userName) {
  var date = new Date(time);
  var hour = date.getHours();
  var minute = date.getMinutes();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  console.log('发送短信');
  commonUtil.sendSms('1954362', phoneNum,
    "#docname#=" + docName +
    "&#date#=" + month + '月' + day + "日" + +hour + '时' + minute + '分'
    , true);
  console.log('assistantPhoneNum', assistantPhoneNum);
  console.log('userName', userName);

 /* if (assistantPhoneNum) {
    commonUtil.sendSms('2114156', assistantPhoneNum,
      "#name#=" + userName +
      "&#docname#=" + docName +
      "&#date#=" + month + '月' + day + '日' + hour + '时' + minute + '分'
      , true);
  }*/
};

/**
 * 取消预约医生，给用户和助理发送的短信
 * @param phoneNum
 * @param docName
 * @param time
 * @param assistantPhoneNum
 * @param userName
 */
servicePackageDoctorAssistantRefService.prototype.sendMACancelSms = function (phoneNum, docName, time, assistantPhoneNum, userName) {
  var date = new Date(time);
  var hour = date.getHours();
  var minute = date.getMinutes();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  console.log('发送短信');
  commonUtil.sendSms('1954698', phoneNum,
    "#docname#=" + docName +
    "&#date#=" + month + '月' + day + "日" + +hour + '时' + minute + '分'
    , true);
  console.log('assistantPhoneNum', assistantPhoneNum);
  console.log('userName', userName);

  /*if (assistantPhoneNum) {
    commonUtil.sendSms('1954698', assistantPhoneNum,
      "#docname#=" + docName +
      "&#date#=" + month + '月' + day + '日' + hour + '时' + minute + '分'
      , true);
  }*/
};


/**
 * 取消预约医生，只给用户发送短信
 * @param phoneNum
 * @param time
 * @param userName
 * @param items
 */
servicePackageDoctorAssistantRefService.prototype.sendMACancelSmsNew = function (phoneNum,  time, userName, items) {
  console.log(phoneNum, time, userName, items, dateFormat(time, 'yyyy年MM月dd日hh时mm分'));
  //sms_template
  //2377970 会员name 时间date 项目items
  const text = "#name#=" + userName +
    "&#item#=" + (items || []).slice(0,2).join('、') +
    "&#date#=" + dateFormat(time, 'yyyy年MM月dd日hh时mm分');
  console.log('发送短信',text);
  commonUtil.sendSms('2377970', phoneNum, text); //todo: true?
};


/**
 * 通过助理ID，查找其所有的服务医生
 * @param assistantId
 */
servicePackageDoctorAssistantRefService.prototype.findDoctorsByAssistant = function (assistantId) {
  const cond = {
    isDeleted: false,
    assistantId: assistantId
  };
  return servicePackageDoctorAssistantRef.find(cond);
};

module.exports = new servicePackageDoctorAssistantRefService();

