/**
 *  Redis 分布式缓存服务
 *  DocChat-backend
 *  Created by Jacky.L on 2/23/17.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var redis = require("redis");
var CONFIG = {
  db_enum: {
    // 公用
    "default_all": 0,
    // 系统公用配置
    "configs_test": 1,
    "configs_pro": 21
  },
  OPTIONS: {
    host: "10.162.201.58",
    port: 6379,
    path: null,//The UNIX socket string of the Redis server
    url: null,//The URL of the Redis server. Format: [redis:]//[[user][:password@]][host][:port][/db-number][?db=db-number[&password=bar[&option=value]]]
    password: "Aliyunredis2017",//Redis auth command on connect. Alias auth_pass(node_redis < 2.5)
    db: 0,//Redis select command on connect
    //Redis number to string, big number error
    string_numbers: null,
    //Return Buffers instead of Strings.
    return_buffers: false,// 所有string都转成buffer接收
    //Not all,Switch between Buffers and Strings on a per-command basis
    detect_buffers: true,// 允许监听到buffer数据
    //The keep-alive functionality is enabled on the underlying socket
    socket_keepalive: true,
    //Whether the server is ready for more commands
    no_ready_check: false,
    //By default, if there is no active connection to the Redis server,
    //commands are added to a queue and are executed once the connection has been established.
    enable_offline_queue: true,
    //If set to true, all commands that were unfulfilled while the connection
    //is lost will be retried after the connection has been reestablished.
    //This is especially useful if you use blocking commands.
    retry_unfulfilled_commands: false,
    //Can force to 'IPv6'
    family: 'IPv4',
    //If set to true, a client won't resubscribe after disconnecting.
    disable_resubscribing: false,
    //Passing an object with renamed commands to use instead of the original functions
    //Ref: Redis security topics
    rename_commands: {},//!!can not be null!!
    //An object containing options to pass to tls.connect to set up a TLS connection to Redis
    tls: null,
    //A string used to prefix all used keys (e.g. namespace:test)
    prefix: null,
    //retry_strategy: function(){}
    retry_strategy: function (options) {
      if (options.error && options.error.code === 'ECONNREFUSED') {
        // End reconnecting on a specific error and flush all commands with a individual error
        console.log("Error->Retry: " + options.error);
        return new Error('The server refused the connection');
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
        // End reconnecting after a specific timeout and flush all commands with a individual error
        console.log("Error->Retry: time exhausted");
        return new Error('Retry time exhausted');
      }
      if (options.times_connected > 10) {
        // End reconnecting with built in error
        console.log("Error->Retry: times out range");
        return undefined;
      }
      // reconnect after
      return Math.min(options.attempt * 100, 3000);
    }
  }
};

// Gen Client
exports.genClient = function (db) {
  CONFIG.OPTIONS.db = CONFIG.db_enum[db] || 0;
  return redis.createClient(CONFIG.OPTIONS);
};
// CRUD operations
exports.crud = (function(client){
  "use strict";
  var op = {};
  /**
   * 新增/修改 缓存
   */
  op.add = function (key, value, callback){
    client.set(key, value, callback);
  };
  op.addObj = function (key, obj, callback){
    client.hmset(key, obj, callback);
  };
  op.addArray = function (key, array, callback){
    client.hmset(key, array, callback);
  };
  op.addSet = function (key, set, callback){
    client.hmset(key, set, callback);
  };
  /**
   * 删除缓存
   * @param key
   */
  op.del = function (key) {
  };
  /**
   * 清空缓存
   */
  op.clean = function (now, inter) {
  };
  /**
   * 查询缓存
   * @param key
   * @returns {*}
   */
  op.get = function (key) {
  };
  return op;
})();