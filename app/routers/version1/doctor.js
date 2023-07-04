/**
 * 医生服务相关路由
 */
var
  VERSION = "/1",
  router = require('express').Router(),
  Auth = require('../../controllers/AuthController'),
  Order = require('../../controllers/OrderController'),
  Doctor = require('../../controllers/DoctorController');

//API 医生注册绑定JPushId FIXME:  Need Login User Auth Token
router.put(VERSION+"/doctor/bindJPush", Doctor.bindJPush);

//API-30xx 医生相关接口
// API-3001 医生登录
router.post(VERSION+"/doctor/login", Auth.loginDoctor);
// API-3002 医生登出
router.put(VERSION+"/doctor/logout", Auth.logoutDoctor);
// API-3003 申请成为医生
router.post(VERSION+"/doctor/apply", Doctor.applyTobeDoctor);
// API-3004 通过id查询医生信息
router.get(VERSION+"/doctor/infoById", Doctor.getInfoByID);
// API-3005 通过医聊号查询医生信息
router.get(VERSION+"/doctor/infoByDocChatNum", Doctor.getInfoByDocChatNum);
//router.get(VERSION+"/doctor/infoByPhone", Doctor.getInfoByPhone);
// API-3006 重置密码
router.put(VERSION+"/doctor/resetPWD", Doctor.resetPWD);//  重置登录密码
// API-3007 更新医生基本信息
//router.put(VERSION+"/doctor/updateBaseInfo", Doctor.updateBaseInfo);
// API-3008 切换上下班
router.put(VERSION+"/doctor/switchOnline", Doctor.switchOnline);
// API-3009 通话记录
router.get(VERSION+"/doctor/orders", Order.getDoctorPhoneOrdersById);
// API-3016  订单列表
//router.get(VERSION+"/doctor/allOrders", Order.getDoctorAllOrdersById);
// API-3018 批量查询医生信息
router.put(VERSION+"/doctor/infoListByIds", Doctor.getInfoListByIds);
// API-3019 拨号患者
router.post(VERSION+"/doctor/callCustomer", Doctor.callCustomer);
// API-3020 患者扫描医生二维码统计
router.get(VERSION+"/doctor/scanQRCode", Doctor.scanQRCode);
// API-3021 患者扫描医生二维码下载router统计
router.get(VERSION+"/doctor/downloadTrace", Doctor.downloadTrace);
// API-3022 收藏医生的患者列表
//router.get(VERSION+"/doctor/allFavoriteCustomer", Doctor.allFavoriteCustomer);
// API-3023 修改患者备注
router.put(VERSION+"/doctor/updateCustomerNote", Doctor.updateCustomerNote);
// API-3024 发送短信给患者
router.post(VERSION+"/doctor/sendSmsToCustomer", Doctor.sendSmsToCustomer);
//// API-3025 UCOM 同步新增医生
//router.post(VERSION+"/open/doctors", Doctor.openRegDoctor);
// API-3026 免费电话
//router.post(VERSION+"/doctor/freePhone", Doctor.freePhone);
// API-3027 通过医生群组查询医生列表
router.get(VERSION+"/doctor/infoByDocGrpId", Doctor.getInfoByDocGrpId);
// API-3028 顾问/医生 查看自己粉丝的评价信息
router.get(VERSION+"/doctor/fansComment", Order.getDocCommentedInfo);
//API-3029 意见反馈
router.post(VERSION+"/doctor/suggestion", Doctor.receiveSuggestion);

//API-3030 医生修改信息申请
//router.post(VERSION+"/doctor/docInfoApplication", Doctor.docInfoApplication);
//API-3031 医生修改个人描述
router.put(VERSION+"/doctor/updateDescription", Doctor.updateDescription);
//API-3032 医生修改收费等级
router.put(VERSION+"/doctor/updateChargeLevel", Doctor.updateChargeLevel);
//API-3033 获取医生修改信息申请
router.get(VERSION+"/doctor/docInfoApplication", Doctor.getDocInfoApplication);

// API-3034 拨号患者
//router.post("/doctor/voip/callCustomer", Doctor.callCustomer);
module.exports = router;