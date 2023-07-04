/**
 * RegionController
 * Authors: Michael Luo
 * Date: 15-3-17
 * Copyright (c) 2014 Juliye Care. All rights reserved.
 */
var
  commonUtil = require('../../lib/common-util'),
  constants = require("../configs/constants"),
  apiHandler = require('../configs/ApiHandler'),
  configs = require('../configs/api'),
  _ = require('underscore'),
  RegionService = require('../services/RegionService');


/**
 * 获取地区列表
 * @param req
 * @param res
 */
exports.getRegionList = function (req, res) {
  var areaId = req.query.areaId;
  var name = req.query.name;

  var con = {
    //hospitalNum: {$gt: 0},
    isDeleted: {$ne: true}};
  if (areaId)
    con.areaId = areaId;

  if (name !== undefined) {
    con.name = new RegExp(name);
  }

  RegionService.findRegion(con)
    .then(function (rs) {
      rs = JSON.parse(JSON.stringify(rs));

      var rg1 = [];//省市
      var rg2 = [];//市区
      for (var i= 0, len = rs.length; i < len; i++) {
        if (rs[i].type === 1){
          rs[i].subArea = [];
          rg1.push(rs[i]);
        } else if(rs[i].type === 2){
          rg2.push(rs[i]);
        }
      };

      var ids = _.pluck(rg1, '_id');//省市ID
      for (var i= 0, len = rg2.length; i < len; i++) {
        var index = ids.indexOf(rg2[i].provinceId);
        //console.log("index: " + index + "   ids:" + ids)
        if (index >= 0){
          //console.log(rg1[index])
          rg1[index].subArea.push(rg2[i]);
        }
      };

      apiHandler.OK(res, rg1);
    }, function (err) {
      return apiHandler.OUTER_DEF(res, err);
    })
};

/**
 *  1801 省市地区信息（全国）
 * @param req
 * @param res
 */
exports.getRegions = function(req , res){
  var condition = {type:2 , isDeleted:false,hospitalNum: {$gt: 0}};
  RegionService.findRegions(condition)
    .then(function(data){
      if(data && data.length >0){
        for(i=0;i<data.length;i++){
          var cities = data[i].cities;
          cities = _.sortBy(cities , "areaId");
          data[i].cities = cities;
        }
      }

      apiHandler.OK(res, data);
    },function(err){
      apiHandler.OUTER_DEF(res, err);
    });
};

exports.getAllRegions = function (req, res) {
  RegionService.getAllRegions()
    .then(function(_regions){
      var regions = _regions.map(function(_region){
        return _region.name;
      });
      regions = regions.concat(constants.specialCities);
      regions = regions.map(function(region){
        return {
          city: region,
          regionPinyin: commonUtil.toPinYin(region)
        };
      });
      console.log(regions.length)
      apiHandler.OK(res, {items: regions});
    },function(err){
      apiHandler.OUTER_DEF(res, err);
    });
}