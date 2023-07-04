/**
 * 推送服务相关路由
 */
var
  VERSION = "/1",
  router = require('express').Router(),
  Doctor = require('../../controllers/DoctorController'),
  ipAuth = require('../../../lib/middleware/IpLimit').ipLimit();

// API-3025 UCOM(第三方) 同步新增医生
router.post(VERSION + "/open/doctors", Doctor.openRegDoctor);
// API-2065 给用户新增新闻动态
router.post(
  VERSION + "/open/news",
  //ipAuth,
  Doctor.news,
  Doctor.moment);

module.exports = router;