/**
 *
 *  Created by Jacky.L on 4/19/14.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */

var
  express = require('express'),
  connect = require('connect'),
  path = require('path'),
  router = require('./app/router'),
  configs = require('./app/configs/server'),
  clientAuth = require('./lib/middleware/ClientAuthentication'),
  Handlers = require('./lib/middleware/ExpressMidware'),
  logConfig = require('./app/configs/logger'),
  timeout = require('connect-timeout'),
  qiniu = require('qiniu'),
  runtime = require('./runtime/run'),
  qiniuConfig = require('./app/configs/qiniu'),
  xmlparser = require('express-xml-bodyparser'),
  util = require('util'),
  run = require("./runtime/run"),
  ejs = require('ejs');
var SessionStore = require("session-mongoose")(connect);

var app = express();

// all environments
app
  .use(timeout('30s'))
  .use(Handlers.haltOnTimedout)
  .use(connect.static(path.join(__dirname, 'public')))
  .use(connect.favicon(path.join(__dirname, 'public/zlycare.ico')))
  .use(connect.static(path.join("/js", 'public/js')))
  //.use(connect.bodyParser())
  //.use(connect.logger('dev'))
  //.use(connect.multipart())
  //.use(connect.bodyParser())
  .use(connect.bodyParser({ uploadDir: './uploads' }))
  .use(connect.json())
  .use(xmlparser())
  .use(connect.urlencoded())
  .use(connect.cookieParser('zlycare'))
  //.use(function (req, res, next) {
  //  console.log(req.body);
  //  //console.log(util.inspect(req));
  //  next();
  //})
  .use(logConfig.log4js.connectLogger(logConfig.getLogger('HTTP'), logConfig.configs))
  //客户端身份认证
  .use(clientAuth.clientSession({}))
  .set('views', './public')
  .engine('.html', ejs.__express)
  .set('view engine', 'html')
  .use(connect.session({
    store: new SessionStore({
      url: configs.dbUrl,
      interval: 120000
    }),
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // session过期时间设置为7天
  }));


var type = configs.type == '_test' || configs.type == 'test' ? 'dev' : configs.type == 'production' ? 'pro' : 'dev';
Backend.run({
  type: type
}, app);

qiniu.conf.ACCESS_KEY = qiniuConfig.ACCESS_KEY;
qiniu.conf.SECRET_KEY = qiniuConfig.SECRET_KEY;

var uptoken = new qiniu.rs.PutPolicy(qiniuConfig.BUCKET);

//TODO 七牛上传图片使用
app.get('/uptoken', function (req, res, next) {
  console.log("uptoken token:" + uptoken.token());
  var token = uptoken.token();
  res.header("Cache-Control", "max-age=0, private, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  if (token) {
    res.json({
      uptoken: token
    });
  }
});

router(app);
app.use(Handlers.unCatchErrorHandler);
exports.server = app;








