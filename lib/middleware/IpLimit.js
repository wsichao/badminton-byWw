/**
 *
 *  DocChat-backend
 *  Created by Jacky.L on 5/16/17.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
exports.ipLimit = function (config) {
  return function (req, res, next){

    var ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
    var apiHandler = require('../../app/configs/ApiHandler');
    var ErrorHandler = require('../../lib/ErrorHandler');

    console.log("ip," + ip);

    var legalIps = [ // TODO 配置持久化，可以随时更改 redis || mongo
      '127.0.0.1',    // local
      '::1',          // local
      'localhost',    // local
      '182.92.81.132',// ali
      '182.92.81.107',// ali
      '182.92.11.64', // ali
      '123.57.35.91', // ali
      '221.122.34.69' // 公司
    ];

    if(legalIps.indexOf(ip) > -1){
      return next();
    }

    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(4003));
  };
};
