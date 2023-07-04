/**
 * 患者管理
 *  Authors: Tom
 *  Created by Tom on 5/20/15.
 *  Copyright (c) 2015 ZLYCare. All rights reserved.
 */
var
  _ = require('underscore'),
  Q = require("q"),
  Channel = require('../models/Channel');

var ChannelService = function () {
};

ChannelService.prototype.constructor = ChannelService;

ChannelService.prototype.getInfoByChannelCode = function (code) {
  var condition = {};
  condition.code = code;
  condition.isDeleted = false;

  return Channel.findOne(condition).exec();
};
ChannelService.prototype.findAll = function(conditions){
  return Channel.find(conditions).exec();
};
ChannelService.prototype.distinctChannel = function(field, conditions){
  conditions[globalSource] = neZS;
  return Channel.distinct(field, conditions).exec();
};


//======================from zlycare-web==================
/**
 * 渠道列表
 * @param conditions
 * @param pageSlice
 * @param params
 * @returns {Promise|Array|{index: number, input: string}}
 */
/**
 * 创建渠道
 * @param conditons
 * @returns {conditons}
 */
ChannelService.prototype.create = function(conditions){
  "use strict";
  return Channel.create(conditions);
};

ChannelService.prototype.list = function(conditions, pageSlice, params){
  "use strict";
  return Channel.find(conditions, params, pageSlice).exec();
};

ChannelService.prototype.findOne = function(conditions, fields){
  "use strict";
  return Channel.findOne(conditions, fields).exec();

};
/**
 * 更新渠道
 * @param conditions
 * @param update
 * @param options
 * @returns {Promise|Array|{index: number, input: string}}
 */
ChannelService.prototype.update = function(conditions, update, options){
  "use strict";
  return Channel.findOneAndUpdate(conditions, update, options).exec();
};


module.exports = exports = new ChannelService();
