/**
 *  server
 *  服务器基本配置
 *  Created by Jacky.L on 4/16/14.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var
  db_name = "zlyweb",
  db_name_pro = 'zlydata-pro',
  db_name_test = "zlydata",

  $user = process.env.UserJuliye,
  $pwd = process.env.PasswordJuliye,

  db_pre = 'mongodb://' + $user + ':' + $pwd + '@',

  // Old ECS MongoDB Servers
  db_hosts = 'ZLY-MONGODB-1,ZLY-MONGODB-2,ZLY-MONGODB-3/',
  db_params = '?replicaSet=zlywebRepl',

  // AliYun MongoDB Production
  db_hosts_pro_pri = "dds-2zedff644574b9041597-pub.mongodb.rds.aliyuncs.com:3717", // 3727
  db_hosts_pro_sec = "dds-2zedff644574b9042603-pub.mongodb.rds.aliyuncs.com:3717", // 3728
  db_hosts_pro = db_hosts_pro_pri + "," + db_hosts_pro_sec + "/",
  db_params_pro = '?replicaSet=mgset-16160511',

  // AliYun MongoDB Test
  db_hosts_test_pri = "dds-2zedff644574b9041597-pub.mongodb.rds.aliyuncs.com:3717",
  db_hosts_test_sec = "dds-2zedff644574b9042603-pub.mongodb.rds.aliyuncs.com:3717",
  db_hosts_test = db_hosts_test_pri + "," + db_hosts_test_sec + "/",
  db_params_test = '?replicaSet=mgset-16160511',


  //dbUrl_production = db_pre + db_hosts + db_name + db_params,
  dbUrl_pro = db_pre + db_hosts_pro + db_name_pro + db_params_pro,
  dbUrl_test = db_pre + db_hosts_test + db_name_test + db_params_test,
  //'mongodb://10.162.201.58/' + db_name,
  dbUrl_local = db_pre + 'dds-2zedff644574b9041597-pub.mongodb.rds.aliyuncs.com:3717,dds-2zedff644574b9042603-pub.mongodb.rds.aliyuncs.com:3717/' + db_name_test + db_params_test,

  $mysqluser = process.env.MysqlUserJuliye,
  $mysqlpwd = process.env.MysqlPasswordJuliye,
  MYSQL_PRO_URL = "rm-2ze3439r4k93853p7oo.mysql.rds.aliyuncs.com",
  // MYSQL_TEST_URL = "localhost",//TODO MYSQL 访问的IP地址 改成10.162.201.58就可以了
  MYSQL_TEST_URL = "rm-2ze3439r4k93853p7oo.mysql.rds.aliyuncs.com",
  MYSQL_UT_URL = "rm-2ze3439r4k93853p7oo.mysql.rds.aliyuncs.com",


  // HOST_PRODUCTION = "https://pro.mtxhcare.com",
  // HOST_TEST = "https://api.zlycare-bate.zlycare.com",
  //
  // WEB_PRODUCTION = "https://pro.mtxhcare.com",
  // WEB_TEST = "https://api.zlycare-bate.zlycare.com",
  //   https://care-dev.zlycare.com


  HOST_PRODUCTION = "https://pro.mtxhcare.com", //正式域名
  HOST_TEST = "https://dev.mtxhcare.com", //测试域名
  HOST_DEV = "https://dev.mtxhcare.com", //开发域名

  WEB_PRODUCTION = "https://pro.mtxhcare.com",
  WEB_TEST = "https://dev.mtxhcare.com",
  // 测试环境区分
  PRO = "production", // 生产环境
  TEST = "test", // 测试环境
  LOCAL = "_test", // Other 本地测试,
  NODE_ENV = process.env.NODE_ENV;



module.exports = {
  type: NODE_ENV,
  dbPort: 27017,
  // 当前API主机
  HOST: NODE_ENV == PRO ? HOST_PRODUCTION : HOST_TEST,
  webHOST: NODE_ENV == PRO ? WEB_PRODUCTION : WEB_TEST,
  DB_CONN_STR: NODE_ENV == PRO ? 'mongodb://zlyweb:fvxqhey9Elqok@dds-2ze6653f230978641926-pub.mongodb.rds.aliyuncs.com:3717,dds-2ze6653f230978642845-pub.mongodb.rds.aliyuncs.com:3717/zlyweb?replicaSet=mgset-2813849' :
    'mongodb://opadmin:opadmin_2016@dds-2zecda7e082ebb241641-pub.mongodb.rds.aliyuncs.com:3717,dds-2zecda7e082ebb242806-pub.mongodb.rds.aliyuncs.com:3717/zlyweb?replicaSet=mgset-2628167', //同步到旧版zly数据库
  // 当前API启动的端口
  port: 9050,
  // 当前API链接的MongoDB数据库地址
  dbUrl: NODE_ENV == PRO ? dbUrl_pro : NODE_ENV == TEST ? dbUrl_test : dbUrl_local,
  secret: 'wecare',
  env: NODE_ENV == PRO ? 1 : 0, // 0 测试环境, 1 生产环境
  MYSQL_URL: NODE_ENV == PRO ? MYSQL_PRO_URL : (NODE_ENV == TEST ? MYSQL_TEST_URL : MYSQL_UT_URL),
  MYSQL_DB_NAME: NODE_ENV == PRO ? "zlydata_pro" : "zlydata",
  MYSQL_DB_PORT: 3306,
  MYSQL_DB_USER: $mysqluser,
  MYSQL_DB_PWD: $mysqlpwd,

  WX_TICKET: '',
  WX_TICKET_TIME: 0
};