/**
 *  db
 *  文档数据库基本配置
 *  Created by Jacky.L on 4/16/14.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var mongoose = require('mongoose');
var settings = require('./server');
var
  logger = require('./logger'),
  filename = 'db.js';

mongoose.connect(settings.dbUrl);
var connection = mongoose.connection;

connection.on('error', function (err) {
  logger.log(logger.categorys.INIT, logger.levels.FATAL, filename,
    'Connection to mongodb error: ' + err + settings.dbUrl);
});

connection.once('open', function () {
  logger.log(logger.categorys.INIT, logger.levels.DEBUG, filename,
    'Connect to mongodb sucessfully: ' + settings.dbUrl);
});
if (process.env.NODE_ENV == 'production') {
  mongoose.set('debug', false);
} else {
  mongoose.set('debug', true);
}


exports.mongoose = mongoose;
