/**
 * Created by zhaoyifei on 14-10-16.
 */

var info = require("./Errors.json");
//var Error = require('verror');

function BackendSysError(message, code, httpCode, err) {
  this.message = message;
  this.code = code;
  this.httpCode = httpCode;
  this.detail = "";
  if(err){
    this.prototype = err;
  }else{
    this.prototype = new Error();
  }

}

//BackendSysError.prototype = new Error();



function BackendBusinessError(message, code, httpCode, err) {
  this.message = message;
  this.code = code;
  this.httpCode = httpCode;
  this.detail = "";
  if(err){
    this.prototype = err;
  }else{
    this.prototype = new Error();
  }
}
//BackendBusinessError.prototype = new Error();




function ErrorHandler() {

}

ErrorHandler.prototype.constructor = ErrorHandler;

/**
 *
 * @param errCode
 * @returns {BackendSysError}
 */
ErrorHandler.prototype.getSysErrorByCode = function (errCode, err) {
  if (info.hasOwnProperty(errCode)) {
    return new BackendSysError(info[errCode].sysMessage, errCode, info[errCode].httpCode, err);
  } else {
    return new BackendSysError(errCode, errCode, 400, err);
  }
};

/**
 *
 * @param errCode
 * @returns {BackendBusinessError}
 */
ErrorHandler.prototype.getBusinessErrorByCode = function (errCode, err) {
  if (info.hasOwnProperty(errCode)) {
    return new BackendBusinessError(info[errCode].businessMessage, errCode, info[errCode].httpCode, err);
  } else {
    return new BackendBusinessError(errCode, errCode, 400, err);
  }
};

/**
 *
 * @param errCode
 * @returns {BackendBusinessError}
 */
ErrorHandler.prototype.genBackendError = function (errCode, httpCode, message, err) {
  return new BackendBusinessError(message, errCode, httpCode, err);
};

module.exports = exports = new ErrorHandler;