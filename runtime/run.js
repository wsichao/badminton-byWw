/**
 * Created by Mr.Carry on 2017/5/17.
 */

"use strict";
const cmodel = require("./cmodel"),
  cservice = require("./cservice"),
  controller = require("./controller/controller"),
  cache = require("./cache"),
  util = require("./util"),
  config = require("./config"),
  Deferred = require("bluebird"),
  mongoose = require('mongoose');
require('./../src/common/global');

global.Backend = {
  type: 'dev',
  Schema: mongoose.Schema,
  config: config
};
/**
 * 应用配置
 * @param c
 */
Backend.run = (c, app)=> {
  Backend.type = c.type || "dev";
  Backend.util = util;
  Backend.Promise = Backend.Deferred = Deferred;
  if(app)
    controller.use(app);
}


/**
 * 获取数据模型实例
 * @param module 模块
 * @param db    数据库 默认为 monogo
 * @param md    数据模型
 * @returns { mongoose 数据模型实例 }
 */
Backend.model = cmodel.model;

/**
 * 获取 service 实例对象
 * @param module 模块
 * @param service
 * @returns { service 实例对象 }
 */
Backend.service = (module, service)=> {
  const service_config = cservice.getService(module, service);
  return service_config;
}


/**
 *
 * @param key
 * @param value
 * @param time
 */
Backend.cache = cache;
