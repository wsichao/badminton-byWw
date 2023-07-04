/**
 * Created by Mr.Carry on 2017/5/17.
 */

'use strict';

let dbUrl = require('./../../../app/configs/server').dbUrl;


module.exports = {
  // 广告配置
  ssp_url: 'http://123.57.35.128:8088',
  wetsite: 'https://dev.mtxhcare.com',
  ms_banner_ip: 'http://182.92.106.199:18080',
  port: 1,
  //mongo: {
  //    user: '',
  //    pwd: '',
  //    connect: '127.0.0.1',
  //    port: '27017',
  //    db: 'mydb',
  //    options: ''
  //}
  mongo: Backend.util.parsingMongoDBURL(dbUrl),
  // redis: {
  //   port: 9736,
  //   connect: '182.92.154.16',
  //   pwd: 'zly2017_',
  //   expiration_time: 60 * 60 * 24 * 2
  // },
  baas_url: 'http://10.81.233.161:8360',
  //baas_url : 'http://localhost:8260'
}