/**
 * 用户服务相关路由
 */
var
    VERSION = "/1",
    router = require('express').Router(),
    Auth = require('../../controllers/AuthController'),
    Order = require('../../controllers/OrderController'),
    Doctor = require('../../controllers/DoctorController'),
    Customer = require('../../controllers/CustomerController');
var appVersion = '';
//var pre = function(req, res, next){
//  appVersion = req.identity && req.identity.appVersion ? req.identity.appVersion : '';
// console.log('appVersion:', appVersion, appVersion > '4.0.0');
// next();
//};
var versionRouter = function (router1, router2) {
    return function handler(req, res) {
        appVersion = req.identity && req.identity.appVersion ? req.identity.appVersion : '';
        appVersion > '4.0.0' ? router1(req, res) : router2(req, res);
    };
};
var versionRouters = function () {
    var args = arguments;
    return function handler(req, res) {
        var routers = args;
        var len = routers.length;
        appVersion = req.identity && req.identity.appVersion ? req.identity.appVersion : '';

        for (var i = 0; i < len; i++) {
            console.log(routers[i]);
            if (i == len - 1) {
                return routers[i].router(req, res);
            } else if (appVersion >= routers[i].version) {
                return routers[i].router(req, res);
            }
        }
        //(appVersion > '4.0.4') ? router1(req, res) : ((appVersion > '4.0.0') ? router2(req, res) : router3(req, res));
    }
};
var limitApiCall = function (api) {
    return function (req, res, next) {
        var userId = req.identity && req.identity.userId;
        var CacheService = require("../../services/CacheService");
        var apiHandler = require('../../configs/ApiHandler');
        var ErrorHandler = require('../../../lib/ErrorHandler');
        if (!api) return next();
        if (!userId) return next();

        // API 限流
        if (CacheService.isUserAPIUseOverLimit(userId, api)) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8003));
        } else {
            CacheService.addOrUpdUserApiLimit(userId, api);
            return next();
        }
    };
};
//API-2017 用户注册绑定JPushId  FIXME: Need Login User Auth Token
router.put(VERSION + "/customer/bindJPush", Customer.bindJPush);

//API-2039 用户查看医生的推荐列表（备用联系人、服务助理、推广合作、等）
router.get(VERSION + "/customer/recommendList", Customer.getDocRecommendList);
//API-2040 用户查看医生的备用联系人列表
router.get(VERSION + "/customer/doctor/recommendList/bakContact", versionRouter(Customer.getDocRecommendListBak_new, Customer.getDocRecommendListBak));
//API-2041 用户查看医生的服务助理列表
router.get(VERSION + "/customer/doctor/recommendList/assistant", versionRouter(Customer.getDocRecommendListAss_new, Customer.getDocRecommendListAss));
//API-2042 用户查看医生的推广合作列表
router.get(VERSION + "/customer/doctor/recommendList/ad", versionRouter(Customer.getDocRecommendListAd_new, Customer.getDocRecommendListAd));
//API-2044 用户查看医生的推广合作列表
router.get(VERSION + "/customer/doctor/recommendList/:type", versionRouter(Customer.getDocRecommendListType_new, Customer.getDocRecommendListType));

////API-2043 用户改变医生推送状态
router.put(VERSION + "/customer/docPushState", Customer.changeDocPushState);

// API-20xx 患者相关接口
// // API-2001 患者登录
// router.post(VERSION + "/customer/login", Auth.loginCustomer);
//API-2002 患者登出
router.put(VERSION + "/customer/logout", Auth.logoutCustomer);

// API-2003 通过id查询患者信息
//router.get(VERSION+"/customer/infoById", Customer.getInfoById);
// API-2004 通过医聊号查询患者信息
router.get(VERSION + "/customer/publicInfoByDocChatNum", versionRouter(Customer.getInfoByDocChatNum_new, Customer.getInfoByDocChatNum));
//router.get(VERSION+"/customer/infoByPhone", Customer.getInfoByPhone);
// API-2050 获取用户的自己的私人信息
router.get(VERSION + "/customer/privateInfoById", Customer.getPrivateInfoById);
// API-2051 通过主账号ID查询用户相关信息
router.get(VERSION + "/customer/publicInfoById", versionRouter(Customer.getPublicInfoById_new, Customer.getPublicInfoById));
// API-2052 通过副账号ID相关信息
router.get(VERSION + "/customer/publicInfoByDocId", versionRouter(Customer.getInfoByDocId_new, Customer.getInfoByDocId));

// API-2005 更新患者基本信息
router.put(VERSION + "/customer/updateBaseInfo", Customer.updateBaseInfo);
// API-2006 所有收藏的医生
router.get(VERSION + "/customer/favoriteDocs", versionRouter(Customer.getFavorites, Customer.getFavoriteDocs));
// API-2007 收藏医生
router.put(VERSION + "/customer/favoriteDoc", Customer.favoriteDoc_new);
// API-2008 取消收藏医生
router.delete(VERSION + "/customer/favoriteDoc", Customer.cancelFavoriteDoc);
// API-2009 拨号
router.post(VERSION + "/customer/callDoc", Customer.callDoc);
// API-2010 通话记录
router.get(VERSION + "/customer/calls", versionRouters(
    {version: "4.2.0", router: Order.getCustomerPhoneOrdersByIdAndBookmark},
    {version: "0", router: Order.getCustomerPhoneOrdersById}
));
// API-2016  订单列表
//router.get(VERSION+"/customer/allorders", Order.getCustomerAllOrdersById);
// API-2018 批量收藏医生
router.put(VERSION + "/customer/favoriteDocs", Customer.favoriteDoctors);
// API-2019 获取临时账户
router.get(VERSION + "/customer/temporaryAccount", Auth.getTemporaryAccount);
// API-2020 患者分享医生统计
router.put(VERSION + "/customer/shareDoctorTrace", Doctor.shareDoctorTrace);
// API-2021 患者所有的优惠券
router.get(VERSION + "/customer/allCouponById", Customer.getAllCouponById);
// API-2022 患者所有有效的代金券
router.get(VERSION + "/customer/validCouponsById", Customer.getValidCouponsById);

// API-2304 患者已使用或者过期的的代金券,有分页
router.get(VERSION + "/customer/historyCoupons", Customer.getHistoryCoupons);
// API-2023 患者面额最大的有效电话代金券
router.get(VERSION + "/customer/maxValidPhoneCouponById", Customer.getMaxValidPhoneCouponById);
// API-2024 微信充值
router.post(VERSION + "/customer/wxRecharge", Customer.WXRecharge);
//////API-2026 获得拜年活动代金券
//router.get(VERSION+"/customer/activityCoupon", Customer.getActivityPhoneCoupon);
//API-2029 意见反馈
router.post(VERSION + "/customer/suggestion", Customer.receiveSuggestion);
////API-2030 输入短信验证码关注医生
//router.post(VERSION+"/customer/msgFollowDoc", Customer.msgFollowDoc);
////API-2031 输入短信验证码关注医生
router.post(VERSION + "/customer/msgFollowDocs", Auth.msgFollowDocs);
////API-2032 用户获取自己最近待评价订单
router.get(VERSION + "/customer/orders/needComment", Order.getCLastNeedCommentOrders);
////API-2033 用户评价订单
router.post(VERSION + "/customer/orders/comment", Order.commentOrder);
////API-2034 用户查看某顾问的评价信息
router.get(VERSION + "/customer/docCommentInfo", Order.getDocCommentedInfo);
////API-2035 下载页面领取优惠券
//router.post(VERSION + "/customer/getCouponByPhone", Customer.getCouponByPhone);
////API-2036 邀请有奖:入口,获取活动信息;
router.get(VERSION + "/customer/getFriendShare", Customer.getFriendShare);
////API-2037 邀请有奖:新用户,则获取验证码
router.get(VERSION + "/customer/getAuthCodeForTheNew", Customer.getAuthCodeForTheNew);
////API-2038 邀请有奖:拉新双方获取代金券,
//router.post(VERSION + "/customer/getCouponByFriend", Customer.getCouponByFriend);
////API-2039 双12活动:获取代金券,
//router.post(VERSION+"/customer/getCouponByDouble12", Customer.getCouponByDouble12);
// API-2044 我的粉丝
router.get(VERSION + "/customer/allFavoriteCustomer", versionRouters(
    //{version: "4.2.1", router: Customer.getFans_421},
    //{version: "4.0.5", router: Customer.getFans_421},
    {version: "4.0.5", router: Customer.getFans_421},
    {version: "4.0.1", router: Customer.getFans},
    {version: "0", router: Customer.allFavoriteCustomer}
));
// API-2045 获得热线号
router.post(VERSION + "/customer/apply", Doctor.applyTobeDoctor);
// API-2046 切换上下班
router.put(VERSION + "/customer/switchOnline", Doctor.switchOnline);
// API-2047 更新专业基本信息
router.put(VERSION + "/customer/updateProfileInfo", Doctor.moment);
// API-2048 设置支付密码
router.put(VERSION + "/customer/setPayPwd", Customer.setPayPwd);
// API-2053 修改对其他用户的备注
router.put(VERSION + "/customer/updateUserNote", Doctor.updateCustomerNote);
// API-2054 得到对某一个用户设置的信息
router.get(VERSION + "/customer/otherUserConfig", Customer.infoToOtherUser);
// API-2055 将其他用户加入黑名单
router.put(VERSION + "/customer/changeBlackList", Customer.changeBlackList);
// API-2056 邀请其他用户开通热线号
router.put(VERSION + "/customer/inviteToApply", Customer.inviteToApply);
// API-2057 查看其它用户主页（未开通热线号），返回最近7天是否发送过邀请
router.get(VERSION + "/customer/isThisUserInvited", Customer.isThisUserInvited);
//API-2058 修改资料
router.post(VERSION + "/customer/modifyProfileInfo", Doctor.modifyProfileInfo);
//API-2059 修改收费等级
router.put(VERSION + "/customer/updateChargeLevel", Doctor.updateChargeLevel);
// API-3014- 实名认证
router.post(VERSION + "/customer/sidAuth", Customer.sidAuth);

/// API-2045 web拨号
router.post(VERSION + "/customer/webCall", Customer.webCall);
// API-2059 免费电话
router.post(VERSION + "/customer/freePhone", Doctor.freePhone);
////API-2046 双12活动:查询代金券
router.get(VERSION + "/customer/getStatusDouble12", Customer.getStatusDouble12);

//API-2061 获取被拨打用户的收费情况
router.get(VERSION + "/customer/getCalleePrice", Customer.getCalleePrice);

//API-2062 webcall新用户注册
router.post(VERSION + "/customer/webcallRegister", Auth.webcallRegister);
// API-2063 动态点赞
router.put(VERSION + "/customer/momentZan", Doctor.momentZan);

// API-2064 动态转发
router.put(VERSION + "/customer/momentTransfer", Doctor.momentTransfer);
// API-2065 更新动态
router.post(VERSION + "/customer/moment", Doctor.moment);
// API-2066 获取网页中转发的动态
router.get(VERSION + "/customer/getMoment", Doctor.getMoment);

// API-2067 初始化用户信息(首次登录后)
router.put(VERSION + "/customer/initUserInfo", Customer.initUserInfo);
// API-2068 通过验证码更改用户密码
router.put(VERSION + "/customer/setPwdByAuthCode", Customer.setPwdByAuthCode);
// API-2069 通过初始密码更改用户密码
router.put(VERSION + "/customer/setPwdByOldPwd", Customer.setPwdByOldPwd);
// API-2070 申请纸质名片
router.post(VERSION + "/customer/cardApply", Customer.businessCardApply);
// API-2071 自定义咨询定价
router.post(VERSION + "/customer/callPrice", Customer.setCallPrice);
// API-2072 获取咨询定价信息
router.get(VERSION + "/customer/callPrice", Customer.getCallPrice);
// API-2073 通过手机号获取用户部分信息（热线号 、 id）
router.get(VERSION + "/customer/getPartInfoByPhoneNum", Customer.getPartInfoByPhoneNum);
// API-2074 设置cps
router.post(VERSION + "/customer/marketing/costPerSale", Customer.setCostPerSale);

// API-2080 搜索-模糊匹配
router.get(VERSION + "/customer/search/all", Customer.searchAll);
// API-2081 搜索-我的收藏                                                                                                                                                                 ```1`1q                         q
router.get(VERSION + "/customer/search/favorites", Customer.searchFavorites);
// API-2082 搜索-我的粉丝 可搜索到被拉黑的人
router.get(VERSION + "/customer/search/fans", Customer.searchFans);
// API-2083 搜索-其他
router.get(VERSION + "/customer/search/others", Customer.searchOthers);
// API-2084 分享领取优惠券和会员额度活动
router.get(VERSION + "/customer/sharePromotion", Customer.sharePromotion);
// API-2085 外部被分享出去页面领取优惠券和会员额度活动
router.post(VERSION + "/customer/sharePromotionByAuthCode", Customer.sharePromotionByAuthCode);
// API-2086 商户认证申请
router.post(VERSION + "/customer/shopApply", Customer.shopApply);


// API-2087 领取3天3夜优惠券活动, 6元 ＋ 7元
router.get(
    VERSION + "/customer/getCouponConsumedMembership",
    limitApiCall("get3DayCouponStep1"),
    Customer.getCouponConsumedMembership);
// API-2088 分享领取3天3夜领取优惠券活动, 8元
router.get(
    VERSION + "/customer/getCouponConsumedMembershipByShare",
    limitApiCall("get3DayCouponStep2"),
    Customer.getCouponConsumedMembershipByShare);
// API-2089 外部 分享领取3天3夜领取优惠券活动
router.post(
    VERSION + "/customer/getCouponConsumedMembershipByShareOut",
    Customer.getCouponConsumedMembershipByShareOut);


//api- 消息
//获取所有的消息
router.get(VERSION + "/customer/messages", Customer.getMessages);
router.post(VERSION + "/customer/message/mark", Customer.markMessageRead);
router.get(VERSION + "/customer/transaction", Customer.getTransaction);
//API-2102 给某用户留言
router.post(VERSION + "/customer/message", Customer.createMessage);
//API-2103 获取信息查看状态
router.get(VERSION + "/customer/msgReadStatus", Customer.getMsgReadStatus);
//API-2104 获取信息信息
router.get(VERSION + "/customer/message", Customer.getMessage);
//API-2105 获取收到的动态消息
router.get(VERSION + "/customer/momentMessage", Customer.momentMessage);
//API-2106 消息-删除收听动态列表中的item
router.put(VERSION + "/customer/delMomentMessage", Customer.delMomentMessage);
//API-2107 删除某一条信息
router.delete(VERSION + "/customer/message", Customer.deleteMessage);


//API-2300 备注-设置备注
router.post(VERSION + "/customer/note", Customer.setNote);
//API-2301 获取留言-用户自己发送的留言
router.get(VERSION + "/customer/myMessages", Customer.getMyMessages);
// API-2302 查询最优的优惠券
router.get(VERSION + "/customer/getAmountAndBestCoupon", Customer.getBestCoupon);
//API-2303 删除通话记录
router.put(VERSION + "/customer/delCallsRecord", Customer.delCallsRecord);

//API-2108 设置自动离线
router.put(VERSION + "/customer/offline", Customer.autoOffline);

//API-2109 获取折扣券
router.get(VERSION + "/customer/getDiscountCoupon", Customer.getDiscountCoupon);
//API-2110 获取会员信息
router.get(VERSION + "/customer/getMembershipInfo", Customer.getMembershipInfo);
//API-2111 获取营销相关信息
router.get(VERSION + "/customer/getMarketingInfo", Customer.getMarketingInfo);

// API-2112 患者所有有效的转账代金券
router.get(VERSION + "/customer/validTransferCouponsById", Customer.getValidTransferCouponsById);
// API-2113 获取当前商户认证信息
router.get(VERSION + "/customer/shopInfo", Customer.shopInfo);
// API-2114 获取商户分类
router.get(VERSION + "/customer/allShopType", Customer.allShopType);
// API-2115 获取用户会员额度列表
router.get(VERSION + "/customer/membershipList", Customer.membershipList);


//API-2310 获取所有商家所在的地区
router.get(VERSION + "/customer/marketing/regions", Customer.getMarketingRegions);
//API-2311 获取用户所选地区的可领取返利代金券的商家,朱丽叶健康调用
router.get(VERSION + "/customer/marketing/venders", Customer.getMarketingVenders);

//API-2320 获取用户所选地区的可领取返利代金券的商家,全城购商家调用
router.get(VERSION + "/customer/marketing/cityVenders", Customer.getMarketingCityVenders);

//API-2312 用户在某商户下领取代金券
router.post(VERSION + "/customer/marketing/coupon",
    limitApiCall("getMarketingCoupon"),
    Customer.getMarketingCoupon);
//API-2313 商家获取返利代金券信息
router.get(VERSION + "/customer/marketing/couponInfo", Customer.getCouponInfo);
//API-2314 商户确认收券
router.post(VERSION + "/customer/coupon/checkin", Customer.checkinCoupon);//全城购使用
router.get(VERSION + "/customer/coupon/test", function (req, res) {
    Backend.service("home", "users").getHomeList().then(function (data) {
        "use strict";
        res.send(data)
    })

});

//API-2317 设置最低消费(满减金额)
router.post(VERSION + "/customer/marketing/lowestCost", Customer.setLowestCost);
//API-2318 获取用户所在地附近可领取返利代金券的商家
router.get(VERSION + "/customer/coordinate/venders", Customer.getCoordinateVenders);

//API-2319 商户列表进行种类选择,获取所有的商户分类,包含"所有"和"其他"
router.get(VERSION + "/customer/shop/types", Customer.getAllChooseShopTypes);
// //api - 2407 用户会员额度
// router.get(VERSION + "/customer/membership",Customer.membership);

//api - 2414 获取个人历史动态
router.get(VERSION + "/customer/moment_history", Customer.moment_history);
// API-2417 新发送动态（动态红包活动）
router.post(VERSION + "/customer/moment_red_paper", Doctor.moment_red_paper);


//new
// API-2001 患者登录
router.post(VERSION + "/customer/login", Auth.loginCustomer);
//api - 2407 用户会员额度
router.get(VERSION + "/customer/membership", Customer.membership);

//批量同步登陆时间
// router.get(VERSION + "/customer/synLoginTime", Customer.synLoginTime);
//批量同步常用药品额度
// router.get(VERSION + "/customer/synNormalValue", Customer.synNormalValue);
module.exports = router;
