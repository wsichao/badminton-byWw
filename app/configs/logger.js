/**
 *  logger
 *  日志输出
 *  Created by Jacky.L on 4/20/14.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var log4js = require('log4js');
var defaultCategory = 'default';
var tag = "LOG";
var delimiter = " - ";

log4js.configure({
  appenders: [
    { type: 'console'},
    //{
    //  type: "dateFile",
    //  filename: 'logs/HTTP.log',
    //  pattern: "_yyyy-MM-dd",       //日期文件格式
    //  alwaysIncludePattern: false,
    //  maxLogSize: 1024 * 1024,
    //  backups: 3,
    //  category: 'HTTP'
    //},
    //{
    //  type: "dateFile",
    //  filename: 'logs/all.log',
    //  pattern: "_yyyy-MM-dd",       //日期文件格式
    //  alwaysIncludePattern: false,
    //  maxLogSize: 1024 * 1024,
    //  backups: 3
    //}
  ],
  replaceConsole: true,
  levels: {
    HTTP: 'INFO',
    //console: 'TRACE',
    console: 'INFO',
    app: 'TRACE',
    controller: 'TRACE',//'WARN',
    dao: 'TRACE',//'WARN',
    mongodb: 'TRACE'
  }
});

exports.configs = {
  level: log4js.levels.INFO,
  format: ':remote-addr' + delimiter +  ':method' + delimiter + ':url',
  delimiter: delimiter
};

exports.levels = {
  TRACE: 1,
  DEBUG: 2,
  INFO: 3,
  WARN: 4,
  ERROR: 5,
  FATAL: 6
};

exports.categorys = {
  INIT: 'init',
  CONTROLLER: 'controller',
  SERVICE: 'service',
  DAO: 'dao',
  MONGODB: 'mongodb'
};
/**
 *
 * @param category
 * @returns {Logger}
 */
exports.getLogger = function (category) {
  if (!category)
    category = defaultCategory;
  var logger = log4js.getLogger(category);

  return logger;
};
/**
 *
 * @param category
 * @param tag
 */
exports.getTag = function (category, tag) {
  var TAG = {};
  TAG.category = category;
  TAG.tag = tag;

  return TAG;
};
/**
 * 格式化log方法
 * @param filename, level, filename, msg
 * level分级对应:trace-1, debug-2, info-3, warn-4, error-5, fatal-6
 *
 */
exports.log = function (category, level, TAG, msg) {
  var logger = this.getLogger(category);
  levelLog(logger,level,TAG,msg);
};
/**
 *
 * @param TAG
 * @param msg
 */
exports.trace = function (TAG, msg) {
  var logger = this.getLogger(TAG.category);
  levelLog(logger, this.levels.TRACE,TAG.tag, "" + msg);
};
/**
 *
 * @param TAG
 * @param msg
 */
exports.debug = function (TAG, msg) {
  var logger = this.getLogger(TAG.category);
  levelLog(logger, this.levels.DEBUG,TAG.tag, "" + msg);
};
/**
 *
 * @param TAG
 * @param msg
 */
exports.info = function (TAG, msg) {
  var logger = this.getLogger(TAG.category);
  levelLog(logger, this.levels.INFO,TAG.tag, "" + msg);
};
/**
 *
 * @param TAG
 * @param msg
 */
exports.warn = function (TAG, msg) {
  var logger = this.getLogger(TAG.category);
  levelLog(logger, this.levels.WARN,TAG.tag, "" + msg);
};
/**
 *
 * @param TAG
 * @param msg
 */
exports.error = function (TAG, msg) {
  var logger = this.getLogger(TAG.category);
  levelLog(logger, this.levels.ERROR,TAG.tag,"" + msg);
};
/**
 *
 * @param TAG
 * @param msg
 */
exports.fatal = function (TAG, msg) {
  var logger = this.getLogger(TAG.category);
  levelLog(logger, this.levels.FATAL,TAG.tag,"" + msg);
};



function levelLog(logger,level,TAG,msg) {

  switch (level){

    case 1:
      logger.trace(TAG + delimiter + msg);
      break;

    case 2:
      logger.debug(TAG + delimiter + msg);
      break;

    case 3:
      logger.info(TAG + delimiter + msg);
      break;

    case 4:
      logger.warn(TAG + delimiter + msg);
      break;

    case 5:
      logger.error(TAG + delimiter + msg);
      break;

    case 6:
      logger.fatal(TAG + delimiter + msg);
      break;

    default:
      logger.error('Logger level is undefinded' + ' filename: ' + TAG + ' msg: ' + msg);
  }
}

exports.log4js = log4js;
