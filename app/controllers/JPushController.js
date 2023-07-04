var
  util = require('util'),
  commonUtil = require('../../lib/common-util'),
  apiHandler = require('../configs/ApiHandler'),
  ErrorHandler = require('../../lib/ErrorHandler'),
  constants = require('../configs/constants'),
  Q = require("q"),
  JPushService = require('../services/JPushService');

var JPushController = function () {
};
JPushController.prototype.constructor = JPushController;

/**
 * 推送通知
 * regId可以是String或者[String]
 * @param req
 * @param res
 */
JPushController.prototype.pushNotificationByRegId = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['regId', 'notification', 'extras'],
    optional: ['client']
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    JPushService.pushNotification(data.regId, data.notification, data.client, data.extras)
      .then(function (d) {
        console.log(util.inspect(d));
        apiHandler.OK(res);
      },
      function (err) {
        console.log(err);
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

/**
 * 推送消息
 * regId可以是String或者[String]
 * @param req
 * @param res
 */
JPushController.prototype.pushMessageByRegId = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['regId', 'message', 'extras'],
    optional: ['client']
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    if(data.extras && !data.extras.type){
      data.extras.type = 1;
    }
    JPushService.pushMessage(data.regId, data.message, data.client, data.extras)
      .then(function (d) {
        //保存消息
        console.log(util.inspect(d));
        apiHandler.OK(res);
      },
      function (err) {
        console.log(err);
        apiHandler.handleErr(res, err);
      });
  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
};


module.exports = exports = new JPushController();