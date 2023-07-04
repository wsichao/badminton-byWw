/**
 * 支付服务相关路由
 */
var
  VERSION = "/1",
  router = require('express').Router(), 
  Transaction = require('../../controllers/TransactionController');

//1006 第三方回调接口
router.post(VERSION + "/transactions/alipayDeposit", Transaction.rechargeByALi);//支付宝充值回调
router.post(VERSION + "/transactions/wxRechargeNotify", Transaction.rechargeByWX);//微信充值回调

//1006 服务包订单、预约医生订单第三方回调接口
router.post(VERSION + "/servicePackage/alipayDeposit", Transaction.servicePackageRechargeByALi);//支付宝充值回调
//router.post(VERSION + "/servicePackage/wxRechargeNotify", Transaction.servicePackageRechargeByWX);//微信充值回调


// API-2011  我的钱包
router.get(VERSION+"/customer/wallet", Transaction.wallet);
// API-2012  支出明细
router.get(VERSION+"/customer/payment", Transaction.payment);
// API-2015  收入明细
router.get(VERSION+"/customer/income", Transaction.income);
// API-2316  收入支出明细
router.get(VERSION+"/customer/transactions", Transaction.transactions);
// API-3015 申请提现
router.post(VERSION+"/customer/applyWithdraw", Transaction.applyWithdraw);

//API-2315
/**
 * 接收ios端发过来的购买凭证。
 判断凭证是否已经存在或验证过，然后存储该凭证。
 将该凭证发送到苹果的服务器验证，并将验证结果返回给客户端。
 如果需要，修改用户相应的会员权限。
 考虑到网络异常情况，服务器的验证应该是一个可恢复的队列，如果网络失败了，应该进行重试。
 */
router.post(VERSION + "/customer/iap/auth", Transaction.authIAP);

module.exports = router;