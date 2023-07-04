/**
 *  基本信息服务
 *  Copyright (c) 2015 ZLYCare. All rights reserved.
 */
var
  Q = require("q"),
  _ = require('underscore'),
  qiniu = require('../configs/qiniu'),
  commonUtil = require('../../lib/common-util'),
  constants = require('../configs/constants');

var CommonInfoService = function () {};
var CONS = {
    PARAMS: {
        APP_UI: "_sys_info_ui",
        CDN: "_sys_info_cdn",
        ZLY400: "_sys_info_400",
        DOC_CHAT_NUM_REG: "_sys_info_doc_chat_num_regex"
    }
};

CommonInfoService.prototype.constructor = CommonInfoService;

CommonInfoService.prototype.getCDN = function () {
  return {
    uri: qiniu.CDN_URI_HTTPS_PRO,
    token: commonUtil.getToken(),
    smallView: qiniu.SMALL_VIEW,
    middleView: qiniu.MID_VIEW,
    commentDelay: 2 * 1000 // 评价延迟,毫秒
  };
};

CommonInfoService.prototype.get400 = function () {
  return {
    "phoneNum": constants.zly400,
    "ivrCallPhone": constants.ivrCallPhone,
    "callbackPhone": constants.callbackPhone,
    "callbackPhones": constants.callbackPhones,
    "brokerTel": constants.brokerTel
  };
};

CommonInfoService.prototype.getDocChatNumRegex = function (){
  return [
    //"^[0-5][0-9]{4}$",  // 0-5开头的5位数字
    "^00001$",  // brian
    "^00002$",  // 陈一凡
    //"^[6][0-9]{8}$",    // 6开头的9位数字
    //"^[7][0-9]{8}$",    // 7开头的9位数字
    "^[8][0-9]{8}$"    // 8开头的9位数字
    //"^[*][0-9]{3}",       // *开头的3位数字-for test
    //"^[#][0-9]{4}"        // #开头的4位数字-for test
    // "^0[0-9]{2,3}[1-9]{1}[0-9]{6,7}" //0开头
    ];
};

CommonInfoService.prototype.getUIInfo = function (version){
  var ui = {};
  //if (version == "4.4.0") {// 当前待审核版本,需要特殊处理
    ui["me_membership"] = {
      "title": "会员充值",
      "isVisible": true
    };
    ui["me_marketing"] = {
      "title": "付费推广",
      "isVisible": true
    };
    ui["msg_membership"] = {
        "title": "全城购会员专区",
        "isVisible": true
    };
  //}
  return ui;
};

CommonInfoService.prototype.CONS = CONS;

module.exports = exports = new CommonInfoService();
