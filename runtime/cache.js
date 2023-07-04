/**
 * 缓存
 * Created by Mr.Carry on 2017/5/25.
 */
"use strict";
const redis = require('redis');
let redis_connect, def_expiration_time;


// 启动 redis 服务
const run = function () {
  if (!redis_connect) {
    const config = Backend.config;
    let redus_config = config.getConfig(Backend.type).redis;
    redis_connect = redis.createClient(redus_config.port, redus_config.connect, { auth_pass: redus_config.pwd });
    def_expiration_time = redus_config.expiration_time;
  }
}


module.exports = {
  /**
   * 设置缓存数据
   * @param key
   * @param value
   * @param expiration_time 过期时间,不设置默认使用全局配置
   */
  set: function (key, value, expiration_time) {
    console.log("set key:" + key);
    run();
    redis_connect.set(key, value);
    redis_connect.expire(key, expiration_time || def_expiration_time);
  },
  /**
   * 设置缓存数据(同步方法)
   * @param key
   * @param value
   * @param expiration_time 过期时间,不设置默认使用全局配置
   */
  setSync: function (key, value, expiration_time) {
    console.log("set key:" + key);
    let deferred = Backend.Deferred.defer();
    run();
    redis_connect.set(key, value, function (err, res) {
      deferred.resolve(res);
    });
    redis_connect.expire(key, expiration_time || def_expiration_time);
    return deferred.promise;
  },
  /**
   * 设置缓存数据,于expired_at这个时间点过期
   * @param key
   * @param value
   * @param expired_at 在某个时间点过期,不设置默认当天过期,时间戳单位为s
   */
  setAt: function (key, value, expired_at) {
    console.log("set key:" + key);
    run();
    redis_connect.set(key, value);
    let default_expired_at = Math.ceil(getDateEndTS(Date.now()) / 1000);
    redis_connect.expireat(key, expired_at || default_expired_at);
  },
  /**
   * 获取缓存数据
   * @param key
   * @returns { promise }
   */
  get: function (key) {
    run();
    let deferred = Backend.Deferred.defer();
    redis_connect.get(key, function (err, res) {
      deferred.resolve(res);
    });
    return deferred.promise;
  },
  /**
   * 删除缓存
   * @param key
   */
  delete: function (key) {
    run();
    redis_connect.expire(key, 0);
  },
  /**
   * 获取过期时间
   * @param key
   */
  getExpireTime: function (key) {
    run();
    let deferred = Backend.Deferred.defer();
    redis_connect.ttl(key, function (err, res) {
      console.log(res);
      deferred.resolve(res);
    });
    return deferred.promise;
  }
}