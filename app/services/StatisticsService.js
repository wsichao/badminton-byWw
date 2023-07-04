var
  _ = require('underscore'),
  Q = require("q"),
  commonUtil = require('../../lib/common-util'),
  encrypt = commonUtil.commonMD5,
  serverconfigs = require('../../app/configs/server'),
  constants = require('../configs/constants'),
  Statistics = require('../models/Statistics'),

  ErrorHandler = require('../../lib/ErrorHandler'),
  Promise = require('promise');

var
  logger = require('../configs/logger'),
  filename = 'app/services/AuthService',
  TAG = logger.getTag(logger.categorys.SERVICE, filename);

var StatisticsService = function () {
};
StatisticsService.prototype.constructor = StatisticsService;

StatisticsService.prototype.createStatistics = function (statistics) {
  return Statistics.create(statistics);
};

StatisticsService.prototype.getAllStatistics = function (pageSlice) {
  var condition = {};
  condition.source = 'docChat';
  condition.isDeleted = false;

  return Statistics.find(condition, null, pageSlice).exec();
};

module.exports = exports = new StatisticsService();