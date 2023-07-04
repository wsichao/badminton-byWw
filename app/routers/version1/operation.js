/**
 * 业务运营相关操作路由
 */
var
    VERSION = "/1",
    router = require('express').Router(),
    OrderController = require('../../controllers/OrderController'),
    TransactionController = require('../../controllers/TransactionController'),
    OperationController = require('../../controllers/OperationController');

//运营端相关接口
router.post(VERSION + "/operation/login", OperationController.login);
router.post(VERSION + "/operation/sendSmsToAllArrearCustomer", OperationController.sendSmsToAllArrearCustomer); //给所有欠费用户发短信
router.post(VERSION + "/operation/sendSmsToArrearCustomer", OperationController.sendSmsToArrearCustomer); //给指定号码发欠费短信
router.post(VERSION + "/operation/addDoctor", OperationController.addDoctor);
router.post(VERSION + "/operation/applyHandle", OperationController.applyHandle);
router.put(VERSION + "/operation/broker", OperationController.updateBroker);

//顾问信息修改申请
router.get(VERSION + "/operation/brokerModifyApplication", OperationController.getBrokerModifyApplicationList)
router.put(VERSION + "/operation/brokerModifyApplicationStatus", OperationController.brokerModifyApplicationStatus)
//广告购买记录
router.get(VERSION + "/operation/bidList", OperationController.bidList);
//付款记录
router.get(VERSION + "/operation/paymentList", OperationController.paymentList);
router.delete(VERSION + "/operation/broker", OperationController.delBroker);
router.get(VERSION + "/operation/brokers", OperationController.brokers);
//router.get(VERSION+"/operation/brokerStatistics", OperationController.brokerStatistics);
router.get(VERSION + "/operation/customerStatistics", OperationController.customerStatistics);
//router.get(VERSION+"/operation/allDoctorStatistics", OperationController.getAllDoctorStatistics);
router.get(VERSION + "/operation/allCustomerStatistics", OperationController.getAllCustomerStatistics);
router.get(VERSION + "/operation/allRechargeCustomerStatistics", OperationController.getAllRechargeCustomerStatistics);
router.get(VERSION + "/operation/doctorOrders", OrderController.getDoctorPhoneOrdersById);
router.get(VERSION + "/operation/doctorValidOrders", OrderController.getDoctorValidPhoneOrdersById);
router.get(VERSION + "/operation/customerOrders", OrderController.getCustomerPhoneOrdersById);
router.get(VERSION + "/operation/customerValidOrders", OrderController.getCustomerValidPhoneOrdersById);
router.get(VERSION + "/operation/allOrders", OperationController.getAllPhoneOrders);
router.get(VERSION + "/operation/orders", OperationController.phoneOrders);
router.get(VERSION + "/operation/allValidOrders", OperationController.getAllValidPhoneOrders);
router.get(VERSION + "/operation/allDoctorApply", OperationController.getAllDoctorApply);
router.get(VERSION + "/operation/allWithdrawApply", OperationController.getAllWithdrawApply);
router.get(VERSION + "/operation/customerRechargeDetail", TransactionController.rechargeInfo);
router.get(VERSION + "/operation/favorites", OperationController.favorites);
router.get(VERSION + "/operation/createStatistics", OperationController.createStatistics);
router.get(VERSION + "/operation/indicatorStatistics", OperationController.getIndicatorStatistics);
router.get(VERSION + "/operation/indicatorStatisticsCSV", OperationController.getIndicatorStatisticsCSV);
router.get(VERSION + "/operation/yesterdayIndicatorStatistics", OperationController.yesterdayIndicatorStatistics);//昨天累计数据
router.get(VERSION + "/operation/todayIndicatorStatistics", OperationController.todayIndicatorStatistics);//今日累计数据
//医生有效订单数和对应患者统计
router.get(VERSION + "/operation/doctorValidOrderNumAndCustomers", OperationController.doctorValidPhoneOrderNumAndCustomers);

//输入手机号送优惠券
//router.get(VERSION+"/operation/getCoupon", OperationController.getPhoneCoupon);
//促成医生成单送免起步价的优惠券活动
router.get(VERSION + "/operation/getPromoteCoupon", OperationController.getPromotePhoneCoupon);
//给无法升级ios用户送券
router.post(VERSION + "/operation/iosCoupon", OperationController.iosPhoneCoupon);

//给所有用户姓名生成拼音
router.get(VERSION + "/operation/setPinyinName", OperationController.setPinyinName);
//给所有订单添加医生性别
router.get(VERSION + "/operation/addDoctorSexToOrder", OperationController.addDoctorSexToOrder);
//修补Collected不包含favoriteDocs字段数据的问题
router.get(VERSION + "/operation/patchCollectedColumn", OperationController.patchCollectedColumn);

// boss查看评价
router.get(VERSION + "/operation/commentList", OperationController.getCommentList);
// boss审核评价
router.put(VERSION + "/operation/checkComment", OperationController.checkComment);
// boss查看医生分组列表
router.get(VERSION + "/operation/getDocGrpList", OperationController.getDocGrpList);
// boss修改医生分组信息
router.post(VERSION + "/operation/updateDocGrpList", OperationController.updateDocGrpList);

//从boss给用户充值
router.post(VERSION + "/operation/bossRecharge", OperationController.bossRecharge);

//发短信
router.post(VERSION + "/operation/sendSMS", OperationController.sendSMS);
//router.get(VERSION+"/operation/sendSMSToExclusiveDoctor", OperationController.sendSMSToExclusiveDoctor);
//router.get(VERSION+"/operation/sendUpgradeSMSToAllCustomer", OperationController.sendUpgradeSMSToAllCustomer);

//拜年活动
//router.get(VERSION+"/operation/sendSMSToAllDoctor", OperationController.sendSMSToAllDoctor);//2.1发送给医生
//router.get(VERSION+"/operation/sendSMS1ToAllCustomer", OperationController.sendSMS1ToAllCustomer);//2.1发送给患者
//router.get(VERSION+"/operation/sendSMS2ToAllCustomer", OperationController.sendSMS2ToAllCustomer);//2.7发送给患者
//router.get(VERSION+"/operation/sendSMS3ToAllCustomer", OperationController.sendSMS3ToAllCustomer);//2.9发送给患者

//customer与doctor合并 脚本
router.get(VERSION + "/operation/doctor2customer", OperationController.doctor2customer);
router.get(VERSION + "/operation/userNameToPinyin", OperationController.userNameToPinyin);
router.get(VERSION + "/operation/oldToNewOrder", OperationController.oldToNewOrder);

// 修复财务记账bug,清空误删除记录,
router.get(VERSION + "/operation/fixBlockedUserTransaction", OperationController.fixBlockedUserTransaction);
//将老用户的message2Customer,更新到主账号currentMoment,和momentRef,更新动态
router.get(VERSION + "/operation/updateMoment", OperationController.updateMoment);

//router.get(VERSION + "/operation/d2c_occupation", OperationController.d2c_occupation);
//router.get(VERSION + "/operation/d2c_city", OperationController.d2c_city);
//router.get(VERSION + "/operation/d2c_password", OperationController.d2c_password);
//router.get(VERSION + "/operation/setUserMomentMsg", OperationController.setUserMomentMsg);

//router.get(VERSION + "/operation/setShopNameSearch", OperationController.setFieldSearch);

//用户领取了返利代金券,但未使用,2天后过期;过期的返利代金券,商家收回,饭给商家,忽略用户. todo: to be noted
//router.get(VERSION + "/operation/backVenderTheExpired", OperationController.backVenderTheExpired);
//批量帮商户充值推广金额、设置cps并且计算相关参数
//router.post(VERSION + "/operation/marketingRecharge", OperationController.marketingRecharge)

//批量帮用户充值会员额度 TODO: to be removed
//router.post(VERSION + "/operation/membershipRecharge", OperationController.membershipRecharge);

//以领取的未使用代金券加上两个随机数
//router.get(VERSION + "/operation/couponAddRandom", OperationController.couponAddRandom);

//将有效的1元抵6元的全城购·代金券,转化为带有二维码的通用券
//router.get(VERSION + "/operation/coupon5To9", OperationController.coupon5To9);

//生成会员额度交易明细
//router.get(VERSION + "/operation/genMembershipTrades", OperationController.genMembershipTrades);

//生成数据迁移前的会员额度交易明细
//router.get(VERSION + "/operation/genOldMembershipTrade", OperationController.genOldMembershipTrade);

//统计前perior日每日付费会员订单数量
router.get(VERSION + '/operation/periorOrderCount', OperationController.periorOrderCount);
//2、统计前perior日每日商户充值推广额度
router.get(VERSION + '/operation/periorMarketingRecharge', OperationController.periorMarketingRecharge);
//3、统计前perior日每日代金券核销数
router.get(VERSION + '/operation/periorCouponConsume', OperationController.periorCouponConsume);
//4、统计前perior日每日新注册用户数
router.get(VERSION + '/operation/periorNewUser', OperationController.periorNewUser);


//router.get(VERSION + "/operation/membershipTransfer", OperationController.membershipTransfer);

// 9001 添加运营商户
router.post(VERSION + '/operation/addOpShop', OperationController.addOpShop);
// 9002 更改运营商户信息
router.put(VERSION + '/operation/updateOpShop', OperationController.updateOpShop);
// 9003 开启/停止运营商户推广
router.put(VERSION + '/operation/switchOpShopStatus', OperationController.switchOpShopStatus);
// 9004 运营商户list
router.get(VERSION + '/operation/opShop', OperationController.getOpShop);

// 查看 申请-提现列表
router.get(VERSION + '/operation/withdrawals/list', OperationController.withdrawals);
// 处理 申请-提现
router.put(VERSION + "/operation/withdrawals/:uuid", OperationController.handleWithdrawal);
//意见列表
router.get(VERSION + "/operation/suggestions", OperationController.getSuggestions);
//意见处理 _id, status
router.put(VERSION + "/operation/suggestion", OperationController.handleSuggestion);

//纸质名片申请记录
router.get(VERSION + '/operation/cardApply', OperationController.cardApply);
//给纸质名片记录添加备注
router.put(VERSION + '/operation/cardApplyMemo', OperationController.cardApplyMemo);

//商户认证资料申请记录
router.get(VERSION + '/operation/shopApply', OperationController.shopApply);
//商户认证资料操作
router.put(VERSION + "/operation/shopApply", OperationController.handleShopApply);
//============================from zly-web======================================
//LM channel
//渠道列表
router.get(VERSION + "/operation/channels", OperationController.list);
router.post(VERSION + "/operation/channels", OperationController.create);
router.put(VERSION + "/operation/channels", OperationController.modify);
router.delete(VERSION + "/operation/channels", OperationController.del);
router.get(VERSION + "/operation/channels/init", OperationController.init);
router.get(VERSION + "/operation/users/list", OperationController.userList);


//API -1219 查询用户列表 for boss
router.get(VERSION + "/operation/versions", OperationController.findVersions);
//2101 创建发布版本信息
router.post(VERSION + "/operation/version", OperationController.createVersion);


//消息通知类的boss接口
router.get(VERSION + "/operation/notification/getNotificationList", OperationController.getNotificationList);
router.post(VERSION + "/operation/notification/addNotification", OperationController.createNotification);
router.put(VERSION + "/operation/notification/modifyNotification", OperationController.modifyNotification);
router.delete(VERSION + "/operation/notification/delNotification", OperationController.delNotification);
router.get(VERSION + "/operation/notification/getCityList", OperationController.getCityList);
// router.get(VERSION + "/operation/notification/testPush", OperationController.testPush);//测试推送用户


//会员复购限定额度boss接口
router.get(VERSION + "/operation/purchase/getPurchaseList", OperationController.getPurchaseList);
router.put(VERSION + "/operation/purchase/modifyPurchase", OperationController.modifyPurchase);

//信息流接口
router.get(VERSION + "/operation/feedFlow/getTagGroupList", OperationController.getTagGroupList);
router.post(VERSION + "/operation/feedFlow/addTagGroup", OperationController.addTagGroup);
// router.put(VERSION + "/operation/feedFlow/modifyTagGroup", OperationController.modifyTagGroup);
router.delete(VERSION + "/operation/feedFlow/delTagGroup", OperationController.delTagGroup);
router.get(VERSION + "/operation/feedFlow/getTagUserList", OperationController.getTagUserList);

//信息流-渠道码管理
router.post(VERSION + "/operation/feedFlow/addTagCode", OperationController.addTagCode);
router.put(VERSION + "/operation/feedFlow/modifyTagCode", OperationController.modifyTagCode);
router.get(VERSION + "/operation/feedFlow/getTagCodeList", OperationController.getTagCodeList);
router.delete(VERSION + "/operation/feedFlow/delTagCode", OperationController.delTagCode);

//信息流-用户标签组管理
router.get(VERSION + "/operation/feedFlow/getTagUserInfo", OperationController.getTagUserInfo);
router.put(VERSION + "/operation/feedFlow/modifyTagUserInfo", OperationController.modifyTagUserInfo);

//购药补贴管理-厂家管理
router.post(VERSION + "/operation/allowance/addFactory", OperationController.addFactory);
router.get(VERSION + "/operation/allowance/getFactoryList", OperationController.getFactoryList);
router.get(VERSION + "/operation/allowance/getFactoryCodeNameList", OperationController.getFactoryCodeNameList);
router.put(VERSION + "/operation/allowance/modifyFactory", OperationController.modifyFactory);


//购药补贴管理-厂家充值
router.post(VERSION + "/operation/allowance/addFactoryRecharge", OperationController.addFactoryRecharge);
router.get(VERSION + "/operation/allowance/getFactoryRechargeList", OperationController.getFactoryRechargeList);


//购药补贴管理-厂家金额查询
router.get(VERSION + "/operation/allowance/getFactoryValueList", OperationController.getFactoryValueList);

//购药补贴管理-药品库管理
router.post(VERSION + "/operation/allowance/addDrug", OperationController.addDrug);
router.get(VERSION + "/operation/allowance/getDrugList", OperationController.getDrugList);
router.get(VERSION + "/operation/allowance/getDrugListByFactoryCode", OperationController.getDrugListByFactoryCode);
router.put(VERSION + "/operation/allowance/modifyDrug", OperationController.modifyDrug);

//购药补贴管理-会员维护计划管理
router.post(VERSION + "/operation/allowance/addFactoryDrugRel", OperationController.addFactoryDrugRel);
router.get(VERSION + "/operation/allowance/getFactoryDrugRelList", OperationController.getFactoryDrugRelList);
router.put(VERSION + "/operation/allowance/modifyFactoryDrugRel", OperationController.modifyFactoryDrugRel);
router.put(VERSION + "/operation/allowance/handleFactoryDrugRePlan", OperationController.handleFactoryDrugRePlan);

//购药补贴管理-审核药品补贴材料
router.get(VERSION + "/operation/allowance/getReimburseList", OperationController.getReimburseList);
router.put(VERSION + "/operation/allowance/handleReimburse", OperationController.handleReimburse);



module.exports = router;
//============================end from zly-web=================================

//商家库存管理
//添加商家
router.post(VERSION + "/operation/business", OperationController.createBusinessman);
//显示商家列表
router.get(VERSION + "/operation/business", OperationController.listBusinessman);
//删除商家
router.delete(VERSION + "/operation/business", OperationController.delBusinessman);

//代金券运营号管理
//添加代金券运营号
router.post(VERSION + "/operation/coupon", OperationController.createCoupon);
//给运营号添加代金券
router.post(VERSION + "/operation/product", OperationController.createProduct);
//显示代金券运营号列表
router.get(VERSION + "/operation/coupon", OperationController.listCoupon);

//将mysql中的省市县数据导入到mongo
router.get(VERSION + "/operation/addregion", OperationController.addRegion);

//router.post(VERSION + "/operation/testDrugReimbursement", OperationController.testDrugReimbursement);
// 修复 动态转发 在momentMsg表中没有记录momentUser
//router.get(VERSION+"/operation/momentMessageMomentUser",OperationController.momentMessageMomentUser);
