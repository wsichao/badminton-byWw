/**
 * Authors: Tom
 * Date: 2015.05.20
 * Copyright (c) 2015 Juliye Care. All rights reserved.
 */
var
  VERSION = "/1",
  requireDir = require('./require-dir'),
  routersV1 = requireDir('./routers/version1'),
  routersV2 = requireDir('./routers/version2'),
  routersView = requireDir('./routers/view'),
  CallController = require('./controllers/CallController'),
  VersionController = require('./controllers/VersionController');

module.exports = function (app) {
  //ivr外呼相关（已废弃）
  //app.post('/startservice', CallController.callStart);//启动电话
  //app.post('/stopservice', CallController.callStop);//电话结束
  //app.post('/ivrHangupUrl', CallController.ivrHangupUrl);//被咨询侧接听并挂机后回调url
  //app.post('/ivrNoanswerurl', CallController.ivrNoanswerurl);//被咨询侧未接听挂机回调url
  //app.get(VERSION + "/call", OrderController.call);//TODO DEL

  //双向回拨结束通话回调
  //app.post('/callback/hangup', CallController.callbackHangup);
    //版本升级
  app.get('/androidVersion-c.json', VersionController.latest);
  // app.get('/androidVersion-d.json', VersionController.latest);
  // app.get('/iOSVersion-24Hotline-Adviser.json', VersionController.latest);
  app.get('/iosVersion.json', VersionController.latest);


  // 加载各服务模块路由
  console.log("Loading services routers: ");
  // Loading V1 routers
  for (var router in routersV1) {
    console.log("Service " + router);
    // app.use(VERSION, routersV1[router]);
    app.use(routersV1[router]);
  }
  // Loading V2 routers : TODO
  // Loading view
  for (var router in routersView) {
    console.log("view " + router);
    // app.use(VERSION, routersV1[router]);
    app.use(routersView[router]);
  }
};

