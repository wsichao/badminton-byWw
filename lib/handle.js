/**
 *  handle
 *  处理不同的Http响应
 *  Created by Jacky.L on 4/30/14.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var commonUtil = require('./common-util'),
  apiConfig = require('../app/configs/api');
var commonResult = commonUtil.commonResult,
  commonResponse = commonUtil.commonResponse;
var Handle = function () {
};

/**
 * 一切正常
 * 请求处理成功,返回结果
 * @param req
 * @param res
 * @param resultCode
 * @param resultMsg
 * @param resultData
 * @param redirect
 * @returns {*}
 */
Handle.prototype.handle200 = function (req, res,
                                       resultCode,
                                       resultMsg,
                                       resultData,
                                       redirect) {
  var code = apiConfig.OK_CODE;
  var msg = apiConfig.NULL_MSG;
  var data = apiConfig.NULL_DATA;
  if (commonUtil.acceptHtml(req)) {
    console.info("Request Accept type is html, redirect to return html view");
    if(redirect) {
      console.log("redirect....");
      return redirect(req, res, 200);
    } else {
      console.log("common response....");
      return commonResponse(res, 200, msg, 'text/html');
    }
  }
  console.info("Request Accept type (default) is json, return json data");
  if (resultCode) code = resultCode;
  if (resultMsg)  msg = "" + resultMsg;
  if (resultData) data = resultData;
  return commonResponse(res, 200, commonResult(code, msg, data));
};
/**
 * 新增操作成功
 * @param req
 * @param res
 */
Handle.prototype.handle201 = function (req, res,
                                       resultCode,
                                       resultMsg,
                                       resultData,
                                       redirect) {
  var code = apiConfig.OK_CODE;
  var msg = apiConfig.HTTP_201_MSG;
  var data = apiConfig.NULL_DATA;
  if (commonUtil.acceptHtml(req)) {
    console.info("Request Accept type is html, redirect to return html view");
    if(redirect) {
      console.log("redirect....");
      return redirect(req, res, 201);
    }
    else{
      console.log("common response....");
      return commonResponse(res, 201, msg, 'text/html');
    }
  }
  console.info("Request Accept type (default) is json, return json data");
  if (resultCode) code = resultCode;
  if (resultMsg)  msg = "" + resultMsg;
  if (resultData) data = resultData;
  commonResponse(res, 201, commonResult(code, msg, data));
};
/**
 * 请求被成功接收，但尚未处理完毕
 * @param req
 * @param res
 */
Handle.prototype.handle202 = function (req, res, resultCode, resultMsg, resultData) {
  var code = apiConfig.OK_CODE;
  var msg = apiConfig.HTTP_202_MSG;
  var data = apiConfig.NULL_DATA;
  if (resultCode) code = resultCode;
  if (resultMsg)  msg = "" + resultMsg;
  if (resultData) data = resultData;
  commonResponse(res, 202, commonResult(code, msg, data));
};
/**
 * 缓存文档未改变
 * @param req
 * @param res
 */
Handle.prototype.handle304 = function (req, res, resultCode, resultMsg, resultData) {
  var code = apiConfig.OK_CODE;
  var msg = apiConfig.HTTP_304_MSG;
  var data = apiConfig.NULL_DATA;
  if (resultCode) code = resultCode;
  if (resultMsg)  msg = "" + resultMsg;
  if (resultData) data = resultData;
  commonResponse(res, 304, commonResult(code, msg, data));
};
/**
 * 请求参数造成的错误
 * @param req
 * @param res
 */
Handle.prototype.handle400 = function (req, res, resultCode, resultMsg, resultData) {
  var code = apiConfig.ERROR_CODE;
  var msg = apiConfig.REQUEST_400_MSG;
  var data = apiConfig.NULL_DATA;
  if (resultCode) code = resultCode;
  if (resultMsg)  msg = "" + resultMsg;
  if (resultData) data = resultData;
  commonResponse(res, 400, commonResult(code, msg, data));
};
/**
 * 请求未经授权
 * @param req
 * @param res
 */
Handle.prototype.handle401 = function (req, res, resultCode, resultMsg, resultData) {
  var code = apiConfig.ERROR_CODE;
  var msg = apiConfig.HTTP_401_MSG;
  var data = apiConfig.NULL_DATA;
  if (resultCode) code = resultCode;
  if (resultMsg)  msg = "" + resultMsg;
  if (resultData) data = resultData;
  commonResponse(res, 401, commonResult(code, msg, data));
};
/**
 * 请求资源Forbidden
 * @param req
 * @param res
 */
Handle.prototype.handle403 = function (req, res, resultCode, resultMsg, resultData) {
  var code = apiConfig.ERROR_CODE;
  var msg = apiConfig.HTTP_403_MSG;
  var data = apiConfig.NULL_DATA;
  if (resultCode) code = resultCode;
  if (resultMsg)  msg = "" + resultMsg;
  if (resultData) data = resultData;
  commonResponse(res, 403, commonResult(code, msg, data));
};
/**
 * 请求资源未找到
 * @param req
 * @param res
 */
Handle.prototype.handle404 = function (req, res, resultCode, resultMsg, resultData) {
  var code = apiConfig.ERROR_CODE;
  var msg = apiConfig.HTTP_404_MSG;
  var data = apiConfig.NULL_DATA;
  if (resultCode) code = resultCode;
  if (resultMsg)  msg = "" + resultMsg;
  if (resultData) data = resultData;
  commonResponse(res, 404, commonResult(code, msg, data));
};
/**
 * 服务端操作异常
 * @param req
 * @param res
 */
Handle.prototype.handle500 = function (req, res, resultCode, resultMsg, resultData) {
  var code = apiConfig.ERROR_CODE;
  var msg = apiConfig.HTTP_500_MSG;
  var data = apiConfig.NULL_DATA;
  if (resultCode) code = resultCode;
  if (resultMsg)  msg = "" + resultMsg;
  if (resultData) data = resultData;
  commonResponse(res, 500, commonResult(code, msg, data));
};

module.exports = new Handle();