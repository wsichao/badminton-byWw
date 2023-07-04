/**
 * Created by Mr.Carry on 2017/5/17.
 */
'use strict';
let dbUrl = require('./../../../app/configs/server').dbUrl;


module.exports = {
  // 广告配置
  ssp_url: 'http://ssp.juliye.cn',
  wetsite: 'https://pro.mtxhcare.com',
  ms_banner_ip: 'http://10.170.240.206:18080',
  port: 1,

  //mongo: {
  //    user: '',
  //    pwd: '',
  //    connect: '127.0.0.1',
  //    port: '27017',
  //    db: 'mydb'
  //}
  mongo: Backend.util.parsingMongoDBURL(dbUrl),
  // redis: {
  //   port: 6379,
  //   connect: 'r-2zea8647ebd69944.redis.rds.aliyuncs.com',
  //   pwd: 'Aliyunredis2017',
  //   expiration_time: 60 * 60 * 24 * 2
  // },
  baas_url: 'http://39.107.58.204:8360'
}