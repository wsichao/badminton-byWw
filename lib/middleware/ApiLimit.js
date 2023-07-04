/**
 *
 *  DocChat-backend
 *  Created by Jacky.L on 4/16/17.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var limitApiCall = function (api) {
  return function (req, res, next){
    var userId = req.identity && req.identity.userId;
    var CacheService = require("../../services/CacheService");
    var apiHandler = require('../../configs/ApiHandler');
    var ErrorHandler = require('../../../lib/ErrorHandler');
    if (!api) return next();
    if (!userId) return next();

    // API 限流
    if (CacheService.isUserAPIUseOverLimit(userId, api)){
      return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8003));
    }else{
      CacheService.addOrUpdUserApiLimit(userId, api);
      return next();
    }
  };
};
