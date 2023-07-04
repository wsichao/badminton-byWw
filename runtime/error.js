/**
 * Created by Mr.Carry on 2017/6/6.
 */
"use strict";

const path = require('path');
let error_conf = undefined;

try {
  error_conf = require(path.join(__dirname, './../src/config/error'))
} catch (e) {

}


let getErrorConfig = () => {
  if(error_conf){
    return error_conf.method();
  }
  return {};
}

module.exports = {
  getApiError: function () {
    return getErrorConfig();
  }
}