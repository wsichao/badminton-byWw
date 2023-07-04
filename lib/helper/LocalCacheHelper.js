/**
 *  单机缓存服务
 *  DocChat-backend
 *  Created by Jacky.L on 1/22/17.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var _cache = {};//用来存放缓存的全局变量。
var latestCleanAt = 0;
//var __redis = {};

exports.crud = (function(){
  "use strict";
  var op = {};
  /**
   * 新增/修改 缓存
   * @param key
   * @param value
   */
  op.add = function (key, value){
    _cache[key] = value;
  };
  /**
   * 删除缓存
   * @param key
   */
  op.del = function (key) {
    delete _cache[key];
  };
  /**
   * 清空缓存
   */
  op.clean = function (now, inter) {
    if (now - latestCleanAt > inter){
      console.log("Clean Local Cache");
      latestCleanAt = now;
      _cache = {};
    }
  };
  /**
   * 查询缓存
   * @param key
   * @returns {*}
   */
  op.get = function (key) {
    return _cache[key];
  };
  return op;
})();