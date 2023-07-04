/**
 * Created by menzhongxin on 2016/9/27.
 */
var VersionService = require('../services/VersionService'),
  _ = require('underscore'),
  util = require('util'),
  commonUtil = require('../../lib/common-util'),
  apiHandler = require('../configs/ApiHandler'),
  ErrorHandler = require('../../lib/ErrorHandler'),
  constants = require('../configs/constants'),
  CustomerService = require('../services/CustomerService'),
  CommonInfoService = require('../services/CommonInfoService'),
  Promise = require('promise');
var VersionController = function () {

};

module.exports = new VersionController();

VersionController.prototype.latest = function (req, res) {

  commonUtil.reqFilter(req, res, {}, function () {
    // var typeMap = {
    //   'androidVersion-c.json': '24customer-android',
    //   'iOSVersion-24Hotline-C.json': '24customer-ios',
    //
    //   'androidVersion-d.json': '24broker-android',
    //   'iOSVersion-24Hotline-Adviser.json': '24broker-ios'
    // };
    var typeMap = {
      'androidVersion-c.json': 'zly-android',
      'iOSVersion-24Hotline-C.json': '24customer-ios',

      'androidVersion-d.json': '24broker-android',
      'iosVersion.json': 'zly-ios'
    };
    var url = req.url.substr(1);
    var type = typeMap[url] || '';
    var verMeta = req.get(constants.HEADER_APP_VERSION) || '';
    var verCode = verMeta.split(".")[0];

    //try {//兼容ios升级问题
    //  verCode = parseInt(verCode);
    //  if (type == '24customer-ios' && verCode < 4) {
    //    return {
    //      "minCode": 21,
    //      "badCode": "",
    //      "url": "itms-apps://itunes.apple.com/app/id1077645137",
    //      "code": 21,
    //      "name": "v4.0.0",
    //      "desc": "1.合并顾问版主要功能\n2.优化整体用户体验\n3.新的一年祝大家身体健康，心想事成",
    //      "time": 1483496489125
    //    };
    //  }
    //} catch (e) {
    //  console.log("handle exception : " + e);
    //}

    if (req.identity.userId) {
     return  CustomerService.getInfoByID(req.identity.userId)
        .then(function (c) {
          //if (c  && c.doctorRef && c.doctorRef.toVeryPhone) {
          if (false) {
            var downloadUrl = (type == '24customer-ios') ?
              "itms-apps://itunes.apple.com/app/id1214757407" : "http://7j1ztl.com1.z0.glb.clouddn.com/veryphone-2.apk";

            return {
              "minCode": 0,
              "badCode": "",
              "url": downloadUrl,
              "code": 100,
              "name": "v1.0.0",
              "desc": "朱李叶健康已全面升级为“专属热线”，为了您能正常使用现有功能，请立即下载更新",
              "time": 1483496489125
            };
          } else {

            return Promise.resolve(VersionService.find({type: type}))
              .then(function (data) {
                data = JSON.parse(JSON.stringify(data[0] || {}));
                data[CommonInfoService.CONS.PARAMS.APP_UI] = CommonInfoService.getUIInfo(verMeta);
                return Promise.resolve(data);
              }).catch(function (err) {
                return Promise.reject(err);
              });
          }
        }, function () {

          return Promise.resolve(VersionService.find({type: type}))
            .then(function (data) {
              data = JSON.parse(JSON.stringify(data[0] || {}));
              data[CommonInfoService.CONS.PARAMS.APP_UI] = CommonInfoService.getUIInfo(verMeta);
              return Promise.resolve(data);
            }).catch(function (err) {
              return Promise.reject(err);
            });
        });
    } else {
      return Promise.resolve(VersionService.find({type: type}))
        .then(function (data) {
          data = JSON.parse(JSON.stringify(data[0] || {}));
          data[CommonInfoService.CONS.PARAMS.APP_UI] = CommonInfoService.getUIInfo(verMeta);
          return Promise.resolve(data);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    }

  });
};