/**
 * RegionService
 * Authors: Michael Luo
 * Date: 15-3-17
 * Copyright (c) 2014 Juliye Care. All rights reserved.
 */
var Region = require('../models/Region'),
  ErrorHandler = require('../../lib/ErrorHandler'),
  Q = require("q"),
  constants = require("../configs/constants"),
  Promise = require('promise');

exports.findRegion = function (conditions, fields, options) {
  return Region.find(conditions, fields, options).exec();
};

exports.findRegionOne = function (conditions, fields) {
  return Region.findOne(conditions, fields).exec();
};

exports.findRegions = function (conditions) {
  return Region.aggregate(
    {"$match": conditions},
    {
      "$group": {
        "_id": "$provinceId",
        "name": {"$first": "$provinceName"},
        "areaId": {"$first": "$areaId"},
        cities: {
          "$addToSet": {
            "_id": "$_id",
            "name": "$name",
            "areaId": "$areaId"
          }
        },
        "count": {"$sum": 1}
      }
    },
    {
      "$sort": {
        "areaId": 1,
        "_id": 1
      }
    }
  ).exec();
};

exports.getAreaById = function (areaId) {
  return Region.findOne({
    isDeleted: {$ne: true},
    type: 2,
    areaId: areaId,
  }).exec();
};

exports.getProvinceById = function (provinceId) {

  return Region.findOne({
    isDeleted: {$ne: true},
    // type: 1,
    type: 2,
    provinceId: provinceId,
  }).exec();
};

exports.getAllRegions = function () {
  var cond = {
    type: 2,
    provinceName: {$nin: constants.specialCities}
  }
  return Region.find(cond, 'name', {sort: {name: 1}}).exec();
};