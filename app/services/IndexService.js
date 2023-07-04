/**
 * IndexService
 * Authors: Michael Luo
 * Date: 15-1-15
 * Copyright (c) 2014 Juliye Care. All rights reserved.
 */
var Index = require('../models/Index'),
  ErrorHandler = require('../../lib/ErrorHandler'),
  Constants = require('../configs/constants'),
  Utils = require('../../lib/Utils'),
  util = require('util'),
  Q = require("q"),
  Promise = require('promise');


var IndexService = function () {

};

IndexService.prototype.constructor = IndexService;
/**
 *
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
IndexService.prototype.getRegionList = function () {
  return Index.find({type: 1, isDeleted: false}).exec();
};
/**
 *
 * @param pvc
 * @param q
 * @param districtId
 * @param options
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
IndexService.prototype.getHospitalList = function (pvc, q, provinceId, options, areaId, provinceName) {
  var con = {
    type: 2,

    isDeleted: false
  };

  if (provinceId) {
    con.provinceId = provinceId;
  } else {
    if (provinceName !== undefined) {
      con.provinceName = new RegExp(provinceName);
    } else {
      con.provinceId = Constants.BEIJING_ID
    }
  }
  
  
  if (areaId)
    con.districtId = areaId;


  var ora = [];
  //var fields = 'name';

  if (q && q.length > 0) {
    var kwsString = '';

    for (var i = 0; i < q.length; i++) {
      if (q[i] !== '')
        kwsString += q[i] + ".*";
    }

    ora.push({"name": new RegExp(kwsString, "i")});
    con['$or'] = ora;
  }

  //console.info("getHospitalList:\n" + util.inspect(con) + "\n" + util.inspect(options));


  return Index.find(con, null, options).exec();
};
/**
 *
 * @param hospitalId
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
IndexService.prototype.getDepartmentList = function (hospitalId) {
  var fields = 'name';
  var con = {
    type: 3,
    hospitalId: hospitalId
  };

  return Index.find(con, {}, {'sort': {'pinYinName': 1}}).exec();
};
/**
 *
 * @param hospitalId
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
IndexService.prototype.getDepartmentById = function (departmentId) {
  var fields = '_id name hospitalId hospitalName provinceId provinceName districtId districtName';
  var con = {
    _id: departmentId,
    type: 3
  };

  return Index.find(con, fields).exec();
};

IndexService.prototype.getDepartmentByNameAndHospitalName = function (name, hospitalName) {
  var fields = '_id name hospitalId hospitalName provinceId provinceName districtId districtName';
  var con = {
    isDeleted: {$ne: true},
    name: name,
    hospitalName: hospitalName,
    type: 3
  };

  return Index.find(con, fields).exec();
};

/**
 * 新建地区
 * @param data
 * @returns {index}
 */
IndexService.prototype.createRegion = function (data) {
  var index = {};
  index.type = 1;
  index.source = data.source || 'bd';
  index.name = data.name || '';

  return Index.create(index);
};
IndexService.prototype.facultyList = function (conditions, options) {
  return Index.find(conditions, {}, options).exec();
};

/**
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
IndexService.prototype.getFacultyList = function () {
  return Index.aggregate(
    {
      $match: {type: 5}
    }, {
      $group: {
        _id: {id: '$facultyId', name: '$facultyName'},
        nodes: {$push: {text: "$name", facultyId: "$_id", grpId: '$facultyId', grpName: '$facultyName'}}
      }
    }, {
      $project: {
        _id: 0,
        nodes: 1,
        text: "$_id.name",
        facultyId: "$_id.id"
      }
    }
  ).exec();
};
/**
 * 新建医院
 * @param data
 * @returns {index}
 */
IndexService.prototype.createHospital = function (data) {
  var index = {};
  index.type = 2;
  index.source = data.source || 'bd';
  index.name = data.name || '';
  index.provinceId = data.provinceId;
  index.provinceName = data.province || '';
  index.districtId = data.districtId;
  index.districtName = data.district || '';
  index.grade = data.grade || 0;
  index.featuredFaculties = data.featuredFaculties || '';

  return Index.create(index);
};

/**
 * 更新医院信息
 * @param conditions
 * @returns {Promise|Array|{index: number, input: string}}
 */
IndexService.prototype.updateHospital = function (data) {
  var condition = {};
  condition._id = data._id;
  if (data.grade)
    data.grade = parseInt(data.grade);
  return Index.findOneAndUpdate(condition, data).exec();
};

IndexService.prototype.updateDepartment = function (data) {
  var condition = {
    _id: data._id,
  };
  var updater = {
    name: data.name
  }
  return Index.findOneAndUpdate(condition, updater).exec();
};

IndexService.prototype.findOneAndUpdateDept = function (condition, update, options) {
  return Index.findOneAndUpdate(condition, update, options).exec();
};
/**
 * 新建科室
 * @param data
 * @returns {index}
 */
IndexService.prototype.createDepartment = function (data) {
  var index = {};
  index.type = 3;
  index.source = data.source || 'bd';
  index.name = data.name || '';
  index.provinceId = data.provinceId;
  index.provinceName = data.province || '';
  index.hospitalId = data.hospitalId;
  index.hospitalName = data.hospital || '';
  index.category = data.category || '其它';
  index.districtId = data.districtId;
  index.districtName = data.districtName;
  return Index.create(index);
};


IndexService.prototype.getIndexesByType = function (type) {

  var con = {
    'type': type,
    isDeleted: false
  };


  return Index.find(con, '_id name').exec();
};


IndexService.prototype.getIndexesByID = function (type, id) {

  var condition = {
    'type': type,
    isDeleted: false
  };
  if (type === 5) {
    condition.facultyId = id;
  }
  if (type === 6) {
    condition.subFacultyId = id;
  }

  return Index.find(condition, '_id name').exec();
};

IndexService.prototype.getDiseaseByID = function (id) {

  var condition = {
    'subFacultyId': id,
    'type': 6,
    'isDeleted': false
  };
  return Index.find(condition, '_id name').exec();
};


IndexService.prototype.getIndexesByGPS = function (GPS, pageSize, pageStart) {
  var limit = {"$limit": pageSize};
  var skip = {"$skip": pageStart};
  var project = {
    "$project": {
      "_id": "$_id",
      "name": "$name",
      "grade": "$grade",
      "gps": "$gps",
      "doctorCount": "$doctorCount"
    }
  };
  var geoNear = {
    '$geoNear': {
      "spherical": true,
      "distanceField": 'gps_2d',
      "maxDistance": 10000,
      "limit": 1000,
      "includeLocs": 'gps',
      near: GPS
    }
  };
  return Index.aggregate(geoNear, project, skip, limit).exec();

};
/**
 *
 * @param conditions
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
IndexService.prototype.getOneIndex = function (conditions, params) {
  return Index.findOne(conditions, params).exec();
};
IndexService.prototype.update = function (id, update, options) {
  return Index.findByIdAndUpdate(id, update, options).exec();
};
/**
 *
 * @param conditions
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
IndexService.prototype.getIndexes = function (conditions, params, options) {
  return Index.find(conditions, params, options).exec();
};


module.exports = exports = new IndexService();