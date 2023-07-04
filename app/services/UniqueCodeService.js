/**
 * uniqueCodelService
 * Authors: menzhongxin
 * Date: 15-08-08
 * Copyright (c) 2014 Juliye Care. All rights reserved.
 */
var
  _ = require('underscore'),
  Q = require("q"),
  util = require('util'),
  UniqueCode = require('../models/UniqueCode').UniqueCode,
  Promise = require('promise'),
  commonUtil = require('../../lib/common-util'),
  ErrorHandler = require('../../lib/ErrorHandler');

var
  logger = require('../configs/logger'),
  filename = 'app/services/UniqueCodeService',
  TAG = logger.getTag(logger.categorys.SERVICE, filename);

/**
 * 根据标题获取code
 * @param title
 * @returns {Promise}
 */
exports.getCode = function(title){
  "use strict";
  return UniqueCode.findOneAndUpdate({title: title}, {$inc: {code: 1}}, {new: true} ).exec();
};
/**
 * init
 * @returns {*}
 */
exports.init = function(){
  "use strict";
  return UniqueCode.create({title: 'LM_CODE', code: 1000});
};

