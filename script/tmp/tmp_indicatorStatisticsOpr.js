/**
 * 计算指标统计数据
 */

var
  util = require('../lib/common-util'),
  _ = require('underscore'),
  constants = require('../app/configs/constants'),
  OperationController = require('../app/controllers/OperationController'),
  fs = require('fs');

var statisticsLength = 105;

for (var i = 1; i <= statisticsLength; i++) {
  var dateFormat = new Date(Date.now() - i * constants.TIME_1_DAY).format("yyyy-MM-dd 23:59:59");
  var expiryDate = new Date(dateFormat).getTime();

  OperationController.createExpiryDateIndicatorStatistics(expiryDate);
}
