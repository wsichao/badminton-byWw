/**
 *
 *  Authors： Jacky.L
 *  Created by Jacky.L on 1/15/15.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var
  commonUtil = require('../../lib/common-util'),
  apiHandler = require('../configs/ApiHandler'),
  configs = require('../configs/api'),
  ErrorHandler = require('../../lib/ErrorHandler'),
  constants = require('../configs/constants'),
  IndexService = require('../services/IndexService')

/**
 * 获取地区列表
 * @param req
 * @param res
 */
exports.getRegionList = function (req, res) {
  IndexService.getRegionList()
    .then(function (cs) {
      apiHandler.OK(res, cs);
    }, function (err) {
      return apiHandler.OUTER_DEF(res, err);
    })
};
/**
 *  更新医院信息
 * @param req
 * @param res
 */
exports.updateHospital = function (req, res) {
  var payload = req.body;
  var fields = {
    "required": ["_id"],
    "optional": ["name", "grade"]
  };
  var onErrorHandler = function (err) {
    var code = err.httpCode;
    if (code) {
      return apiHandler.OUTER_DEF(res, err);
    } else {
      return apiHandler.SYS_DB_ERROR(res, err);
    }
  };
  var onFailure = function (handler, type) {
    return handler(res, type);
  };
  var onSuccess = function (handler, data) {
    IndexService.updateHospital(data)
      .then(function () {
        return apiHandler.CREATED(res);
      }, function (err) {
        return onErrorHandler(err);
      });
  };
  commonUtil.validate(payload, fields, onSuccess, onFailure);
};
/**
 * 获取医院列表
 * @param req
 * @param res
 */
exports.getHospitalList = function (req, res) {
  var pvc = req.query.province || "";
  var districtId = req.query.districtId;
  var q = req.query.q || '';
  var callbackName = req.query.callback;
  var page = req.query.pageNum || 0;
  var size = req.query.size || 20;
  var provinceId = req.query.provinceId;
  var areaId = req.query.areaId;
  var provinceName = req.query.provinceName;

  //console.log("page"+page);

  var pageSlice = commonUtil.getCurrentPageSlice(req, page * 20, size, {doctorCount: -1});

  IndexService.getHospitalList(pvc, q, provinceId, pageSlice, areaId, provinceName)
    .then(function (cs) {
      //console.log("getHospitalList:" + callbackName);

      if (callbackName) {
        str = callbackName + '(' + JSON.stringify(jsonMapService.getHospitalList(0, cs)) + ');';//jsonp
        res.set('Content-Type', "application/x-javascript").end(str);

      } else {
        console.log("getHospitalList OK");

        apiHandler.OK(res, cs);
      }

    }, function (err) {
      if (callbackName) {
        str = callbackName + '(' + JSON.stringify(jsonMapService.getHospitalList(1, null)) + ');';//jsonp
        res.set('Content-Type', "application/x-javascript").end(str);

      } else {
        return apiHandler.OUTER_DEF(res, err);
      }

    })
};

/**
 * 获取科室列表
 * @param req
 * @param res
 */
exports.getDepartmentList = function (req, res) {
  var hospitalId = req.query.hospitalId || '';
  var callbackName = req.query.callback;

  IndexService.getDepartmentList(hospitalId)
    .then(function (cs) {
      if (callbackName) {
        str = callbackName + '(' + JSON.stringify(jsonMapService.getopdList(0, cs)) + ');';//jsonp
        res.set('Content-Type', "application/x-javascript").end(str);

      } else {
        apiHandler.OK(res, cs);
      }
    }, function (err) {
      if (callbackName) {
        str = callbackName + '(' + JSON.stringify(jsonMapService.getopdList(1, null)) + ');';//jsonp
        res.set('Content-Type', "application/x-javascript").end(str);

      } else {
        return apiHandler.OUTER_DEF(res, err);
      }
    })
};



/**
 *
 * @param req
 * @param res
 */
exports.createRegion = function (req, res) {
  var payload = req.body;
  var fields = {
    "required": ["name"],
    "optional": ["source"]
  };

  var onErrorHandler = function (err) {
    var code = err.httpCode;
    if (code) {
      return apiHandler.OUTER_DEF(res, err);
    } else {
      return apiHandler.SYS_DB_ERROR(res, err);
    }
  };
  var onFailure = function (handler, type) {
    return handler(res, type);
  };
  var onSuccess = function (handler, data) {
    IndexService.createRegion(data)
      .then(function () {
        return apiHandler.CREATED(res);
      }, function (err) {
        return onErrorHandler(err);
      });
  };
  commonUtil.validate(payload, fields, onSuccess, onFailure);
};
/**
 *
 * @param req
 * @param res
 */
exports.createHospital = function (req, res) {
  var payload = req.body;
  var fields = {
    "required": ["name", "provinceId", "province", "district", "districtId", "grade"],
    "optional": ["source", "featuredFaculties"]
  };

  var onErrorHandler = function (err) {
    var code = err.httpCode;
    if (code) {
      return apiHandler.OUTER_DEF(res, err);
    } else {
      return apiHandler.SYS_DB_ERROR(res, err);
    }
  };
  var onFailure = function (handler, type) {
    return handler(res, type);
  };
  var onSuccess = function (handler, data) {
    data.gps = [0,0];
    IndexService.createHospital(data)
      .then(function (hospital) {
        baiduService.geocoding(hospital.name,hospital.distinct||hospital.province,function(gps,hospitalId,err){
          if(!err)
            IndexService.update(hospitalId,{$set:{gps:[gps.lng,gps.lat]}});
          return;
        },hospital._id);
        return apiHandler.CREATED(res);
      }, function (err) {
        return onErrorHandler(err);
      });
  };
  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

/**
 *
 * @param req
 * @param res
 */
exports.createDepartment = function (req, res) {
  var payload = req.body;
  var fields = {
    "required": ["name", "provinceId", "province", "hospitalId", "hospital", "districtId", "districtName"],
    "optional": ["source", "category"]
  };

  var onErrorHandler = function (err) {
    var code = err.httpCode;
    if (code) {
      return apiHandler.OUTER_DEF(res, err);
    } else {
      return apiHandler.SYS_DB_ERROR(res, err);
    }
  };
  var onFailure = function (handler, type) {
    return handler(res, type);
  };
  var onSuccess = function (handler, data) {
    IndexService.createDepartment(data)
      .then(function () {
        return apiHandler.CREATED(res);
      }, function (err) {
        return onErrorHandler(err);
      });
  };
  commonUtil.validate(payload, fields, onSuccess, onFailure);
};

exports.updateDepartment = function (req, res) {
  var payload = req.body;
  var fields = {
    "required": ["_id", "name"],
    "optional": []
  };
  var onErrorHandler = function (err) {
    var code = err.httpCode;
    if (code) {
      return apiHandler.OUTER_DEF(res, err);
    } else {
      return apiHandler.SYS_DB_ERROR(req, err);
    }
  };
  var onFailure = function (handler, type) {
    return handler(res, type);
  };
  var onSuccess = function (handler, data) {
    IndexService.updateDepartment(data)
      .then(function () {
        return apiHandler.CREATED(res);
      }, function (err) {
        return onErrorHandler(err);
      });
  };
  commonUtil.validate(payload, fields, onSuccess, onFailure);

};


exports.getFirstLevelDeps = function (req, res) {
  var callbackName = req.query.callback;

  IndexService.getIndexesByType(4)
    .then(function (cs) {
      if (callbackName) {
        console.log("lihuifeng callbackName :" + callbackName.toString());
        str = callbackName + '(' + JSON.stringify({status: 0, data: cs}) + ');';//jsonp
        res.set('Content-Type', "application/x-javascript").end(str);

      } else {
        apiHandler.OK(res, cs);
      }

    }, function (err) {
      if (callbackName) {
        str = callbackName + '(' + JSON.stringify({status: 1, msg: err}) + ');';//jsonp
        res.set('Content-Type', "application/x-javascript").end(str);

      } else {
        return apiHandler.OUTER_DEF(res, err);
      }

    })
};

exports.getSecondLevelDeps = function (req, res) {
  var id = req.query.ID || "";
  var callbackName = req.query.callback;
  IndexService.getIndexesByID(5, id)
    .then(function (cs) {
      if (callbackName) {
        str = callbackName + '(' + JSON.stringify({status: 0, data: cs}) + ');';//jsonp
        res.set('Content-Type', "application/x-javascript").end(str);

      } else {
        apiHandler.OK(res, cs);
      }

    }, function (err) {
      if (callbackName) {
        str = callbackName + '(' + JSON.stringify({status: 1, msg: err}) + ');';//jsonp
        res.set('Content-Type', "application/x-javascript").end(str);

      } else {
        return apiHandler.OUTER_DEF(res, err);
      }

    })
};

exports.getDisease = function (req, res) {
  var id = req.query.ID || "";
  var callbackName = req.query.callback;
  IndexService.getDiseaseByID(id)
    .then(function (cs) {
      if (callbackName) {
        str = callbackName + '(' + JSON.stringify({status: 0, data: cs}) + ');';//jsonp
        res.set('Content-Type', "application/x-javascript").end(str);

      } else {
        apiHandler.OK(res, cs);
      }

    }, function (err) {
      if (callbackName) {
        str = callbackName + '(' + JSON.stringify({status: 1, msg: err}) + ');';//jsonp
        res.set('Content-Type', "application/x-javascript").end(str);

      } else {
        return apiHandler.OUTER_DEF(res, err);
      }

    })
};

exports.getHospitalByGPS = function (req, res) {
  var lon = parseFloat(req.query.lon) || 0;
  var lat = parseFloat(req.query.lat) || 0;
  var GPS = [];
  if (lon && lat && (lon != 0 && lat != 0)) {
    GPS = [lon, lat];
  } else {
    GPS = [180, 90];
  }
  var callbackName = req.query.callback;

  var page = req.query.pageNum || 0;

//  console.log("page"+page);
//
//  var pageSlice = commonUtil.getCurrentPageSlice(req, page*20, 20, {doctorCount: -1});

  IndexService.getIndexesByGPS(GPS, 20, page * 20)
    .then(function (cs) {
      cs = JSON.parse(JSON.stringify(cs));
//      for(var i=0;i<cs.length;i++){
//        var distance = CommonService.getDisance(lat,lon,cs[i].gps[1],cs[i].gps[0]);
//        cs[i].distance = CommonService.formatDistance(distance);
//      }
      if (callbackName) {
        str = callbackName + '(' + JSON.stringify(jsonMapService.getHospitalList(0, cs)) + ');';//jsonp
        res.set('Content-Type', "application/x-javascript").end(str);

      } else {
        apiHandler.OK(res, cs);
      }

    }, function (err) {
      if (callbackName) {
        str = callbackName + '(' + JSON.stringify(jsonMapService.getHospitalList(1, null)) + ');';//jsonp
        res.set('Content-Type', "application/x-javascript").end(str);

      } else {
        return apiHandler.OUTER_DEF(res, err);
      }

    })
};

/**
 * 获取科室列表
 * @param req
 * @param res
 */
exports.getFacultyList = function (req, res) {

  IndexService.getFacultyList()
    .then(function (list) {
      apiHandler.OK(res, list);
    }, function (err) {
      return apiHandler.OUTER_DEF(res, err);
    })
};
/**
 * 获取科室列表
 * @param req
 * @param res
 */
exports.departmentList = function(req,res){
  var level = req.query.level||1 //1:一级科室,2:二级科室
    , fatherId = req.query.fatherId  //二级科室对应的一级科室_id
    , isMain = req.query.isMain||0 //是否是重点科室 0:全部显示,1:重点科室,2:非重点科室
    , pageSlice = commonUtil.getCurrentPageSlice(req,0,100,{sort:1,createdAt:1});
  var conditions = {
    isDeleted:false,
    type:level==1?4:5
  };
  if(fatherId && (level == 2))
    conditions.facultyId = fatherId;
  if(isMain && (level == 2))
    conditions.isMain = isMain==1?true:false;
  IndexService.facultyList(conditions,pageSlice).then(function(data){
    return apiHandler.OK(res,data);
  },function(err){
    return apiHandler.OUTER_DEF(res,err);
  });
};

/**
 * 删除重点科室
 * @param req
 * @param res
 */
exports.deleteMainDepartment = function(req,res){
  var _id = req.query.id;
  if(!_id)
    return apiHandler.OUTER_DEF(res,ErrorHandler.getBusinessErrorByCode(8005));
  IndexService.findOneAndUpdateDept({_id:_id},{isMain:false},{new:true}).then(function(dept){
      return apiHandler.OK(res,dept);
    },
    function(err){
      return apiHandler.OUTER_DEF(res,err);
    });
};
/**
 * 更新重点科室
 * @param req
 * @param res
 */
exports.addMainDepartment = function(req,res){
  var payload = req.body
    , fields = {
    "required": ["id", "description", "sort", "iosImageUrl", "androidImageUrl"],
    "optional": []
  };

  var onFailure = function (handler, type) {
    return handler(res, type);
  };
  var onSuccess = function (handler, data) {
    var condition = {
      description:data.description,
      sort:data.sort,
      iosImageUrl:data.iosImageUrl,
      androidImageUrl:data.androidImageUrl,
      isMain:true,
      updatedAt:Date.now()
    };
    IndexService.findOneAndUpdateDept({_id:data.id},condition,{new:true}).then(function(dept){
      return apiHandler.OK(res,dept);
    },
      function(err){
      return apiHandler.OUTER_DEF(res,err);
    });
  };
  commonUtil.validate(payload, fields, onSuccess, onFailure);
};


exports.getMainDepartment = function(req , res){
  IndexService.getIndexes({isMain:true , type:5} , "_id name description androidImageUrl iosImageUrl sort" , {sort:{sort:1}} )
    .then(function(data){
      apiHandler.OK(res , data);
    } , function(err){
      apiHandler.OUTER_DEF(res ,err);
    })
};

