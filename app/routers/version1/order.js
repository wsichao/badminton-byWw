/**
 * 订单服务相关路由
 */
var
  VERSION = "/1",
  router = require('express').Router(),
  Auth = require('../../controllers/AuthController'), 
  Order = require('../../controllers/OrderController'),
  CallController = require('../../controllers/CallController');


  // API-40xx 订单相关接口
  // API-4001 订单详情
  router.get(VERSION+"/order", Order.getOrderById);
  // API-4002 待支付广告订单
  router.post(VERSION+"/order/ad", Order.createAdPreOrder);
  // API-4003 待支付转账订单
  router.post(VERSION+"/order/transfer", Order.createTransferPreOrder);
  //API-4005 双向回拨结束通话回调
  router.post('/callback/hangup', CallController.callbackHangup);
  router.post('/callback/phoneBillCallback', CallController.phoneBillCallback);

  // API-
  router.post(VERSION+"/order/hongbao", Order.createHongbaoPreOrder);
// API-
  router.delete(VERSION+"/order/hongbao", Order.deleteHongbaoOrder);

  // API-4004  查询预支付订单的最新支付状态 TODO:新增type=hongbao
  router.get(VERSION+"/order/prepareOrderStatus", Order.getOrderStatus);
// API-4006  上传共享图片
  router.post(VERSION+"/order/sharePics", Order.uploadOrderSharePics);
// API-4007  获取某一订单共享的图片列表
  router.get(VERSION+"/order/sharePics", Order.getOrderSharePics);
// API-4008  待支付购买会员/付费推广订单
router.post(VERSION+"/order/service", Order.createServicePreOrder);

  module.exports = router;  