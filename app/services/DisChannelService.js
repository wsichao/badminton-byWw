/**
 *  Authors: Jacky.L
 *  Created by Jacky.L on 1/15/15.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var
  _ = require('underscore'),
  Q = require("q"),
  commonUtil = require('../../lib/common-util'),
  Channel = require('../models/DistributionChannel'),
  ErrorHandler = require('../../lib/ErrorHandler');

/**
 * 新建渠道
 * @param doc
 * @returns {*}
 */
exports.createChannel = function (doc) {

  return Channel.create(doc);
};


exports.getChannelList = function (conditions, params, pageSlice){

  return Channel.find(conditions, params, pageSlice).exec();
};

exports.getOneChannel = function (brokerRId, brokerSId) {
  var deferred = Q.defer();
  if (!commonUtil.isUUID24bit(brokerRId)) {

    throw ErrorHandler.getSysErrorByCode(8005);
  }
  if (!commonUtil.isUUID24bit(brokerSId)) {

    throw ErrorHandler.getSysErrorByCode(8005);
  }
  var conditions = {
    brokerRId: brokerRId,
    brokerSId: brokerSId,
    isDeleted: false
  };
  return Channel.findOne(conditions).exec()
    .then(function (data) {
      deferred.resolve(data);
      return deferred.promise;
    }, function (err) {
      deferred.reject(err);
      return deferred.promise;
    });
};

/**
 *
 * @param conditions
 * @param channleDoc
 * @param args
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
exports.updateChannel = function (conditions, channleDoc, args) {
  return Channel.findOneAndUpdate(conditions, channleDoc, args).exec();
};


