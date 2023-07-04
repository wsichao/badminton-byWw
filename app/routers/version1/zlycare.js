/**
 * Created by Mr.Carry on 2017/8/22.
 */
// "use strict";
var VERSION = "/1",
    Zlycare = require('../../controllers/ZlycareController');
var router = require('express').Router();
var service = require('./../../services/zlycareService');
var appVersion = '';
var versionRouter = function (version,router1, router2) {
    return function handler(req, res) {
        appVersion = req.identity && req.identity.appVersion ? req.identity.appVersion : '';
        appVersion >=version ? router1(req, res) : router2(req, res);
    };
};
router.get("/1/zlycare/get_token", function (req, res) {
    var user_id = req.query.user_id;
    service.getToken(user_id).then(function (token) {
        res.send({token_id: token})
    })
});

//商品分类目录
router.get(VERSION + "/zlycare/types", Zlycare.types);
// router.get(VERSION + "/zlycare/member_info", Zlycare.getMemberInfo);
router.get(VERSION + "/zlycare/services", Zlycare.getServices);
router.post(VERSION + "/zlycare/buy_certification", Zlycare.buyCertification);
router.put(VERSION + "/zlycare/cancel_certification", Zlycare.cancel_certification);
router.get(VERSION + '/zlycare/wxConfig', Zlycare.getWXConfig);
//6001 热搜词
router.get(VERSION + '/zlycare/page/hotSearch', Zlycare.hotSearch);
//6002 导航条
router.get(VERSION + '/zlycare/page/banner', Zlycare.banner);
//6003 关键词搜索
router.get(VERSION + '/zlycare/page/search', Zlycare.search);
//6058.文章详情
router.get(VERSION + '/zlycare/page/detail', Zlycare.pageDetail);
//==== 6010.文章点赞====
router.put(VERSION + '/zlycare/page/approve', Zlycare.approve);
//==== 6011.文章取消点赞====
router.put(VERSION + '/zlycare/page/disApprove', Zlycare.disApprove);
//通过药品ID，获取药品详情
router.get(VERSION + '/zlycare/getProductInfo', Zlycare.getProductInfo);

//6004 头条文章列表
router.get(VERSION + '/zlycare/page/topPage', Zlycare.pageList);

// 6006.消息中心====
router.get(VERSION + '/zlycare/message/myMessageCenter', Zlycare.myMessageCenter);
//==== 6007.更新消息状态====
router.put(VERSION + '/zlycare/message/setMyMessageViewed', Zlycare.setMyMessageViewed);
//==== 6008.删除我的消息====
router.post(VERSION + '/zlycare/message/delMyMessage', Zlycare.delMyMessage);
router.get(VERSION + '/zlycare/message/getMessage', Zlycare.getMessage);


// ==== 6012.文章评论列表====
router.get(VERSION + '/zlycare/page/comments', Zlycare.comments);
// ==== 6013.文章的点赞数、是否点赞、评论数、是否收藏====
router.get(VERSION + '/zlycare/page/statisticals', Zlycare.statisticals);
// ==== 6014.发布评论 ====
router.post(VERSION + "/zlycare/page/publishComment", Zlycare.publishComment);
// ==== 6015.收藏文章 ====
router.put(VERSION + "/zlycare/page/collect", Zlycare.collect);
// ==== 6015.取消收藏文章 ====
router.put(VERSION + "/zlycare/page/cancelCollect", Zlycare.cancelCollect);
// ==== 6017.我的收藏列表 ====
router.get(VERSION + '/zlycare/page/myCollection', Zlycare.myCollection);
// ==== 6018.文章不感兴趣 ====
router.post(VERSION + '/zlycare/page/unInterested', Zlycare.unInterested);

// ==== 6019.第三方登录 ====
router.post(VERSION + "/customer/thirdPartyLogin", Zlycare.thirdPartyLogin);
// ==== 6020.第三方注册 ====
router.post(VERSION + "/customer/thirdPartyRegister", Zlycare.thirdPartyRegister);
// ==== 6021.绑定第三方 ====
router.put(VERSION + "/customer/bindThirdParty", Zlycare.bindThirdParty);
// ==== 6022.解除第三方绑定 ====
router.put(VERSION + "/customer/cancelThirdParty", Zlycare.cancelThirdParty);
// ==== 6023.第三方账号绑定列表 ====
router.get(VERSION + "/customer/thirdPartyList", Zlycare.thirdPartyList);
// ==== 6024.给用户打标签 ====
router.post(VERSION + "/feedFlow/tagUser", Zlycare.tagUser);
//==== 6025.设置用户地理位置 ====
router.put(VERSION + "/customer/setLocation", Zlycare.setLocation);
// ==== 6026.获取广告信息 ====
router.get(VERSION + "/feedFlow/getAd", Zlycare.getAd);


//==== 6028.广告不感兴趣 ====
router.post(VERSION + '/feedFlow/unInterestedAd', Zlycare.unInterestedAd);
// ==== 6029.获取banner广告 ====
router.get(VERSION + "/feedFlow/getBannerAd", Zlycare.getBannerAd);

//药品补贴
// ==== 6036.药品可选择的城市 ====
router.get(VERSION + "/allowance/getDrugCityList", Zlycare.getDrugCityList);
// ==== 6037.根据当前所在城市，查询药品 ====
// router.get(VERSION + "/allowance/searchDrug", versionRouter('5.5.1',Zlycare.searchDrugNew,Zlycare.searchDrug));
// ==== 6039.申请报销 ====
router.post(VERSION + "/allowance/applyReimburse", versionRouter('5.5.1',Zlycare.applyReimburseNew,Zlycare.applyReimburse));
// ==== 6040.我的补贴列表 ====
router.get(VERSION + "/allowance/getMyReimburse", Zlycare.getMyReimburse);
// ==== 6041.会员维护计划详情 ====
router.get(VERSION + "/allowance/getPlanDetail", Zlycare.getPlanDetail);
// ==== 6052.获取药品助理手机号码 ====
router.get(VERSION + "/allowance/getDrugAssistantPhones", Zlycare.getDrugAssistantPhones);


// ==== 6053.补贴详情 ====
router.get(VERSION + "/allowance/getOneReimburse", Zlycare.getOneReimburse);


// 6054.获取健康号用户信息
router.get(VERSION + "/feedFlow/getAuthorInfo", Zlycare.getAuthorInfo);
// 6055.关注健康号
router.post(VERSION + "/feedFlow/favorite", Zlycare.favorite);
// 6056.取消关注健康号
router.post(VERSION + "/feedFlow/cancelFavorite", Zlycare.cancelFavorite);
// 6057.我的健康号关注列表
router.get(VERSION + "/feedFlow/myFavorites", Zlycare.myFavorites);
// 6059.通过cmsID获取用户发表过的文章
router.get(VERSION + "/feedFlow/getAuthorPageList", Zlycare.getAuthorPageList);

//tagGroup数据
// router.get(VERSION + "/allowance/modifyTagGroup", Zlycare.modifyTagGroup);

//1.19
// 6060.通过orderId获取签约医生订单详情
router.get(VERSION + "/servicepackage/getServicepackageInfo", Zlycare.getServicepackageInfo);
// 6061.删除评论
router.post(VERSION + "/feedFlow/deleteComment", Zlycare.deleteComment);
// 6062.设置支付密码
router.put(VERSION + "/feedFlow/setPayPassword", Zlycare.setPayPassword);
// 6063.余额支付服务包订单
router.put(VERSION + "/servicepackage/balancePaymentOfServicepackage", Zlycare.balancePaymentOfServicepackage);
// 6064.余额支付医生预约
router.put(VERSION + "/servicepackage/balancePaymentOfMakeAppointment", Zlycare.balancePaymentOfMakeAppointment);
// 6065.通过orderId获取预约医生订单详情
router.get(VERSION + "/servicepackage/getMakeAppointmentOrderInfo", Zlycare.getMakeAppointmentOrderInfo);
router.get(VERSION + "/feedFlow/cmsRecommend", Zlycare.cmsRecommend);
module.exports = router;
