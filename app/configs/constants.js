/**
 *  constant configs
 *  常量信息
 *  Created by LuoMiao on 7/21/14.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */

var ZLYCARE_DOC_EMCHAT_INTERNAL_ID = "YXA6yxZ3sEEXEee_PQUmgmZYHw",
    ZLYCARE_DOC_EMCHAT_INTERNAL_SECRET = "YXA6s9w2s2UQ6DqWkcZVgVvd1a-gYj8",
    ZLYCARE_DOC_EMCHAT_ID = "YXA6XXiOANqsEeWxpEHkQ3fM3A",
    ZLYCARE_DOC_EMCHAT_SECRET = "YXA6wsUqMpMPjdo1lNaZ8YErY6D2yug",
    HOST = process.env.NODE_ENV == "production" ? 'http://wx.zlycare.com' : 'http://wx-test.zlycare.com',
    CHOST = process.env.NODE_ENV == "production" ? 'http://wx.zlycare.com' : 'http://182.92.11.64:8081',
    WEB_HOST = process.env.NODE_ENV == "production" ? 'http://web.zlycare.com' : 'http://web-test.zlycare.com',
    CLOOPEN_URL = 'https://app.cloopen.com:8883/2013-12-26',
    CLOOPEN_SID = '8191d160ddc311e48ad3ac853d9f54f2';

var yhPrice = 1;//高级会员优惠价格
module.exports = {
    IS_PROD_ENV: (process.env.NODE_ENV == "production"),// ? true : false,
    WEB_HOST: (process.env.NODE_ENV == "production") ? "https://web.dc.zlycare.com" : "https://dev.mtxhcare.com",//,
    PARAM_IS_1ST_FV: "_statistic_is_1st_fv",// 首次关注字段
    // 新用户关注邀请人(第一个主动关注)
    PARAM_IS_INVITER_FV: "_statistic_is_inviter_fv",
    PARAM_CUSTOMER_PHONE: 'customerPhone',
    PARAM_DOCTOR_PHONE: 'doctorPhone',
    RECOMMEND_AD_HINT_DEF: "想要出现在这里？立即出价",
    RECOMMEND_AD_HINT_MORE: "稳固排名？增加出价",
    RECOMMEND_AD_HINT_LINK: "/advertising/bid.html",
    RECOMMEND_BAK: {
        item: "bak",
        isVisiable: true,
        disabled: true,
        type: "doctor",  // 该条目首推类型
        title: "暂无",    // 该条目首推标题
        docChatNum: "",  // 类型为doctor该条目为医疗号
        link: "",
        more: { // 更多
            disabled: false,
            type: "doctor_list",
            title: "推荐人",
            url: (process.env.NODE_ENV == "production") ? "https://pro.mtxhcare.com/1/customer/doctor/recommendList/bakContact" : "https://dev.mtxhcare.com/1/customer/doctor/recommendList/bakContact"
        }
    },  // 1
    RECOMMEND_ASS: {
        item: "ass",
        isVisiable: true,// 是否显示该推荐条目
        disabled: true,
        type: "doctor",
        title: "暂无",
        docChatNum: "",
        link: "",
        more: { // 更多
            type: "doctor_list",
            title: "服务助理",
            url: (process.env.NODE_ENV == "production") ? "https://pro.mtxhcare.com/1/customer/doctor/recommendList/assistant" : "https://dev.mtxhcare.com/1/customer/doctor/recommendList/assistant",
            disabled: false
        }
    },  // 2
    RECOMMEND_AD: {
        item: "ad",
        isVisiable: true,// 是否显示该推荐条目
        disabled: true,
        type: "doctor",
        title: "暂无",
        docChatNum: "",
        link: "",
        //},
        more: { // 更多
            type: "doctor_list",
            title: "猜你喜欢",
            url: (process.env.NODE_ENV == "production") ? "https://pro.mtxhcare.com/1/customer/doctor/recommendList/ad" : "https://dev.mtxhcare.com/1/customer/doctor/recommendList/ad",
            disabled: false
        }
    },    // 3
    RECOMMEND_FANS_SH: {
        "item": "recmnd_fans_shanghai",
        "link": "",
        "docChatNum": "",
        "title": "暂无",
        "type": "doctor",
        "disabled": true,
        "isVisiable": true,
        "more": {
            "url": (process.env.NODE_ENV == "production") ? "https://pro.mtxhcare.com/1/customer/doctor/recommendList/recmnd_fans_shanghai" : "https://dev.mtxhcare.com/1/customer/doctor/recommendList/recmnd_fans_shanghai",
            "title": "推荐人",
            "type": "doctor_list",
            "disabled": false
        }
    },
    RECOMMEND_ASS_SH: {
        "item": "ass_shanghai",
        "link": "",
        "docChatNum": "",
        "title": "暂无",
        "type": "doctor",
        "disabled": true,
        "isVisiable": true,
        "more": {
            "url": (process.env.NODE_ENV == "production") ? "https://pro.mtxhcare.com/1/customer/doctor/recommendList/ass_shanghai" : "https://dev.mtxhcare.com/1/customer/doctor/recommendList/ass_shanghai",
            "title": "服务助理",
            "type": "doctor_list",
            "disabled": false
        }
    },
    RECOMMEND_AD_SH: {
        "item": "ad_shanghai",
        "link": "",
        "docChatNum": "",
        "title": "暂无",
        "type": "doctor",
        "disabled": true,
        "isVisiable": true,
        "more": {
            "url": (process.env.NODE_ENV == "production") ? "https://pro.mtxhcare.com/1/customer/doctor/recommendList/ad_shanghai" : "https://dev.mtxhcare.com/1/customer/doctor/recommendList/ad_shanghai",
            "title": "猜你喜欢",
            "type": "doctor_list",
            "disabled": false
        }
    },
    //COMMENT_CONF: {
    //  rank: 3,
    //  contentTxtSize: 60,
    //  contentHint: "感谢的话,说给顾问听~",
    //  tags: ["给了详细建议","消除了我的困惑","顾问很给力","牛牛牛!!","羊羊羊!!!"]
    //},
    RECHARGE_OPTS: [
        {
            price_dis: 10,
            price_pay: 10,
            price_act: 10,
            desc: ""
        },
        {
            price_dis: 30,
            price_pay: 30,
            price_act: 30,
            desc: ""
        },
        {
            price_dis: 50,
            price_pay: 50,
            price_act: 50,
            desc: ""
        },
        {
            price_dis: 100,
            price_pay: 100,
            price_act: 100,
            desc: ""
        },
        {
            price_dis: 150,
            price_pay: 150,
            price_act: 150,
            desc: ""
        },
        {
            price_dis: 200,
            price_pay: 200,
            price_act: 200,
            desc: ""
        },
        {
            price_dis: 500,
            price_pay: 500,
            price_act: 500,
            desc: ""
        },
        {
            price_dis: 1000,
            price_pay: 1000,
            price_act: 1000,
            desc: ""
        },
        {
            price_dis: 2000,
            price_pay: 2000,
            price_act: 2000,
            desc: ""
        }
    ],
    zlyDocChatId: "56f249f6699f404fea736d6c",//zly医聊账户ID
    zlyCouponId: "1002", //优惠券账号id
    hongbaoAccountId: "1005",//红包交易明细id
    rebateAccountId: "1010",//会员使用商家返利代金券补贴
    brokerTel: "010-56291996",
    brokerToolsDownloadURL: "http://app-consultant.zlycare.com/",

    zly400: "010-56291996",
    zly400Phone: "18601920795",
    notifyPhones: "18810562253,18601920795",
    ivrCallPhone: "4006501445",//ivr外呼呼叫号码
    ivrShowPhone: "4006501445", //ivr外呼被叫方显示的400号码

    DoctorId_00120: "55d68d9b8faee0fbe0c4be97",
    favoritedRewardDocChatNum: ['00028', '77777', '00055'], //患者收藏奖励的医生医聊号
    double12DoctorIds: ["582ecf99cde164f96d24a281", "58364e76b8cceda93d273518", "58364daca0fc41134b471aa1", "58340d9adbd040f80be88067",
        "582da2ec94fd52a67d0a991a", "57bbbc1c3394174a3438e282", "57bbba60f0265176319c0673", "57bbbdea3394174a3438e289", "57bbbe50f0265176319c067e", "57bbbdb6f0265176319c0678",
        "583d5560039d1c274a3e1b5a", "5804a8cc9da6618763906ff2", "583d57621e02851373ef058a", "583d563a039d1c274a3e1dde", "583d5710039d1c274a3e2068",
        "583d57b31e02851373ef0682", "583d58d01e02851373ef09d0"],  //双12用户登陆后默认收藏的医生
    webCall: ["584f5ce9479acf7a5b53845c"],  //webCall用户登录后默认收藏的医生
    COUPON_ACTIVITYNO_FAVORITE: '20160815001', //输入邀请码送优惠券
    COUPON_ACTIVITYNO_FAVORITE_RMB: 30, //COUPON_ACTIVITYNO_FAVORITE送的金额
    COUPON_ACTIVITYNO_FAVORITE_RMB_20: 20, //COUPON_ACTIVITYNO_FAVORITE优惠券的金额20
    COUPON_ACTIVITYNO_FAVORITE_RMB_10: 10, //COUPON_ACTIVITYNO_FAVORITE优惠券的金额10
    COUPON_ACTIVITYNO_FAVORITE_RMB_5: 5, //COUPON_ACTIVITYNO_FAVORITE优惠券的金额5
    COUPON_ACTIVITYNO_FAVORITE_TIME: 30 * 24 * 60 * 60 * 1000,//COUPON_ACTIVITYNO_FAVORITE优惠券有效时长30天

    COUPON_ACTIVITYNO_NEWUSER: '20161104001', //新用户获取10元代金券
    COUPON_ACTIVITYNO_NEWUSER_RMB: 10, //COUPON_ACTIVITYNO_NEWUSER送的金额
    COUPON_ACTIVITYNO_NEWUSER_RMB_5: 5, //COUPON_ACTIVITYNO_NEWUSER优惠券的金额5
    COUPON_ACTIVITYNO_NEWUSER_TIME: 30 * 24 * 60 * 60 * 1000,//COUPON_ACTIVITYNO_NEWUSER优惠券有效时长30天

    COUPON_ACTIVITYNO_SHARE: '20161105001', //分享获取2元代金券
    COUPON_ACTIVITYNO_SHARE_RMB: 2, //COUPON_ACTIVITYNO_NEWUSER送的金额
    COUPON_ACTIVITYNO_SHARE_RMB_2: 2, //COUPON_ACTIVITYNO_NEWUSER优惠券的金额5
    COUPON_ACTIVITYNO_SHARE_RMB_5: 5, //COUPON_ACTIVITYNO_NEWUSER优惠券的金额5
    COUPON_ACTIVITYNO_SHARE_TIME: 30 * 24 * 60 * 60 * 1000,//COUPON_ACTIVITYNO_NEWUSER优惠券有效时长30天

    COUPON_ACTIVITYNO_DOUBLE12: '201612121001', //双12优惠券
    COUPON_ACTIVITYNO_DOUBLE12_RMB: 100, //COUPON_ACTIVITYNO_NEWUSER送的金额
    COUPON_ACTIVITYNO_DOUBLE12_TIME: 30 * 24 * 60 * 60 * 1000,//COUPON_ACTIVITYNO_NEWUSER优惠券有效时长30天


    COUPON_ACTIVITYNO_PROMOTE: '201610070022', //促单优惠券
    COUPON_ACTIVITYNO_PROMOTE_TIME: 14 * 24 * 60 * 60 * 1000,//COUPON_ACTIVITYNO_PROMOTE优惠券有效时长14天
    COUPON_ACTIVITYNO_EXCLUSIVE_DOCTOR: '201603011007', //购买专属医生折扣券
    COUPON_ACTIVITYNO_EXCLUSIVE_END_TIME: 1460563199000,//COUPON_ACTIVITYNO_EXCLUSIVE_DOCTOR优惠券结束日期2016-4-13 23:59:59

    COUPON_ACTIVITYNO_PURCHASE: '2017031060001', //全城购·代金券
    COUPON_ACTIVITYNO_PURCHASE_RMB_5: 6, //面值5元
    COUPON_ACTIVITYNO_PURCHASE_RMB_DISCOUNT_5: 1, //面值5元折扣价
    COUPON_ACTIVITYNO_PURCHASE_REWARD_RMB_5: 2, //面值5元推手返利
    COUPON_ACTIVITYNO_PURCHASE_RMB_10: 10, //面值10元
    COUPON_ACTIVITYNO_PURCHASE_RMB_DISCOUNT_10: 7, //面值10元折扣价
    COUPON_ACTIVITYNO_PURCHASE_REWARD_RMB_10: 3, //面值10元推手返利
    COUPON_ACTIVITYNO_PURCHASE_RMB_20: 20, //面值20元
    COUPON_ACTIVITYNO_PURCHASE_RMB_DISCOUNT_20: 15, //面值20元折扣价
    COUPON_ACTIVITYNO_PURCHASE_REWARD_RMB_20: 4, //面值20元推手返利
    COUPON_ACTIVITYNO_PURCHASE_TIME: 6 * 30 * 24 * 60 * 60 * 1000,//优惠券有效时长6个月
    COUPON_ACTIVITYNO_PURCHASE_TIME_MONTH: 6,//优惠券有效时长6个月

    COUPON_ACTIVITYNO_SPECIAL: '2017031008130', //24全城购特惠券,在当月的24号可用，过期不可用，25号0点后获得的特惠券在下月24号使用
    COUPON_ACTIVITYNO_SPECIAL_TITLE: '全城购·特惠券', //
    COUPON_ACTIVITYNO_SPECIAL_RMB: 5, //面值5元

    COUPON_ACTIVITYNO_DISCOUNT_SHARE_5: '2017040400001', //5折狂欢券
    COUPON_ACTIVITYNO_DISCOUNT_SHARE_TITLE_5: '5折狂欢券', //
    COUPON_ACTIVITYNO_DISCOUNT_SHARE_SUBTITLE_5: '20元以下5折最多抵扣10元', //
    COUPON_ACTIVITYNO_DISCOUNT_SHARE_RMB_5: 10, //
    COUPON_ACTIVITYNO_DISCOUNTVAL_SHARE_5: 0.5, //
    MEMBERSHIP_ACTIVITYNO_DISCOUNT_SHARE_5: 100, //5折狂欢券对应的会员额度

    COUPON_ACTIVITYNO_CASH_SHARE_5: '2017041200001', //5元代金券（分享活动）
    COUPON_ACTIVITYNO_CASH_SHARE_TITLE_5: '5元代金券', //
    COUPON_ACTIVITYNO_CASH_SHARE_SUBTITLE_5: '可以对所有商户使用', //
    COUPON_ACTIVITYNO_CASH_SHARE_RMB_5: 5, //
    MEMBERSHIP_ACTIVITYNO_CASH_SHARE_5: 100, //5元代金券（分享活动）对应的会员额度

    COUPON_ACTIVITYNO_CASH_3DAY_6: '2017041700001', //8元代金券（3天3夜活动）
    COUPON_ACTIVITYNO_CASH_3DAY_TITLE_6: '6元代金券', //
    COUPON_ACTIVITYNO_CASH_3DAY_SUBTITLE_6: '可以对所有商户使用,仅限本月22、23、24号使用', //
    COUPON_ACTIVITYNO_CASH_3DAY_RMB_6: 6, //
    COUPON_ACTIVITYNO_CASH_3DAY_EXPIREDAT_6: 1493049599000,//过期时间
    COUPON_ACTIVITYNO_CASH_3DAY_VALIDAT_6: 1492790400000,//生效时间

    COUPON_ACTIVITYNO_CASH_3DAY_7: '2017041700001', //10元代金券（3天3夜活动）
    COUPON_ACTIVITYNO_CASH_3DAY_TITLE_7: '7元代金券', //
    COUPON_ACTIVITYNO_CASH_3DAY_SUBTITLE_7: '可以对所有商户使用，仅限本月23号使用', //
    COUPON_ACTIVITYNO_CASH_3DAY_RMB_7: 7, //
    COUPON_ACTIVITYNO_CASH_3DAY_EXPIREDAT_7: 1492963199000,//过期时间
    COUPON_ACTIVITYNO_CASH_3DAY_VALIDAT_7: 1492876800000,//生效时间

    COUPON_ACTIVITYNO_CASH_3DAY_8: '2017041700001', //8元代金券（3天3夜活动）
    COUPON_ACTIVITYNO_CASH_3DAY_TITLE_8: '8元代金券', //
    COUPON_ACTIVITYNO_CASH_3DAY_SUBTITLE_8: '可以对所有商户使用，仅限本月24号使用', //
    COUPON_ACTIVITYNO_CASH_3DAY_RMB_8: 8, //
    COUPON_ACTIVITYNO_CASH_3DAY_EXPIREDAT_8: 1493049599000,//过期时间
    COUPON_ACTIVITYNO_CASH_3DAY_VALIDAT_8: 1492963200000,//生效时间

    COUPON_ACTIVITYNO_DISCOUNT_5: '2017031008130', //24全城购折扣券,在3的24号可用，过期不可用
    COUPON_ACTIVITYNO_DISCOUNT_TITLE_5: '全城购·5折券', //
    COUPON_ACTIVITYNO_DISCOUNT_SUBTITLE_5: '限24号使用，最高抵扣12元', //
    COUPON_ACTIVITYNO_DISCOUNT_RMB_5: 12, //
    COUPON_ACTIVITYNO_DISCOUNTVAL_5: 0.5, //

    COUPON_ACTIVITYNO_REBATE: '2017032100001', //24全城购折扣券,在3的24号可用，过期不可用
    COUPON_ACTIVITYNO_REBATE_TITLE: '会员专属代金券',
    COUPON_ACTIVITYNO_REBATE_TIME: 2 * 24 * 60 * 60 * 1000, //2天

    COUPON_ACTIVITYNO_CASH_0524_7: '2017051500001', //7元代金券（5月24号活动）
    COUPON_ACTIVITYNO_CASH_0524_TITLE_7: '7元代金券', //
    COUPON_ACTIVITYNO_CASH_0524_SUBTITLE_7: '可以对所有活动商户使用，仅限本月24号使用', //
    COUPON_ACTIVITYNO_CASH_0524_RMB_7: 7, //
    COUPON_ACTIVITYNO_CASH_0524_EXPIREDAT_7: 1495641599000,//过期时间
    COUPON_ACTIVITYNO_CASH_0524_VALIDAT_7: 1495555200000,//生效时间

    COUPON_ACTIVITYNO_CASH_0524_5: '2017051500002', //5元代金券（5月24号活动）
    COUPON_ACTIVITYNO_CASH_0524_TITLE_5: '5元代金券', //
    COUPON_ACTIVITYNO_CASH_0524_SUBTITLE_5: '可以对所有活动商户使用，仅限本月24号使用', //
    COUPON_ACTIVITYNO_CASH_0524_RMB_5: 5, //
    COUPON_ACTIVITYNO_CASH_0524_EXPIREDAT_5: 1495641599000,//过期时间
    COUPON_ACTIVITYNO_CASH_0524_VALIDAT_5: 1495555200000,//生效时间

    COUPON_ACTIVITYNO_CASH_COMMON_0524_5: '2017051500003', //5元代金券（25号后7日可用）
    COUPON_ACTIVITYNO_CASH_COMMON_0524_TITLE_5: '5元代金券', //
    COUPON_ACTIVITYNO_CASH_COMMON_0524_SUBTITLE_5: '可以对所有商户使用', //
    COUPON_ACTIVITYNO_CASH_COMMON_0524_RMB_5: 5,
    COUPON_ACTIVITYNO_CASH_COMMON_0524_EXPIREDAT_5: 1496246399000,//过期时间
    COUPON_ACTIVITYNO_CASH_COMMON_0524_VALIDAT_5: 1495641600000,//生效时间

    COUPON_ACTIVITYNO_CASH_0526_5: '2017052200001', //7元代金券（5月24号活动）
    COUPON_ACTIVITYNO_CASH_0526_TITLE_5: '5元代金券', //
    COUPON_ACTIVITYNO_CASH_0526_SUBTITLE_5: '可以对所有商户使用', //
    COUPON_ACTIVITYNO_CASH_0526_RMB_5: 5,


    ZLYCARE_DOC_EMCHAT_ID_RUNTIME: process.env.NODE_ENV == "production" ? ZLYCARE_DOC_EMCHAT_INTERNAL_ID : ZLYCARE_DOC_EMCHAT_INTERNAL_ID,
    ZLYCARE_DOC_EMCHAT_SECRET_RUNTIME: process.env.NODE_ENV == "production" ? ZLYCARE_DOC_EMCHAT_INTERNAL_SECRET : ZLYCARE_DOC_EMCHAT_INTERNAL_SECRET,
    ZLYCARE_DOC_EMCHAT_ORG_NAME: encodeURIComponent('zlycare'),
    ZLYCARE_DOC_EMCHAT_APP_NAME: process.env.NODE_ENV == "production" ? '24' : '24',


    customerPublicDownloadURL: "http://dc-c.zlycare.com",
    doctorPublicDownloadURL: "http://dc-d.zlycare.com",
    // 双向回拨固定号段-
    callbackPhone: "010-57733871",
    // 双向回拨固定号段资源
    callbackPhones: ["01057733871", "01053827891", "02868073247", "03165630449", "02160927001", "02160927006"],
    callbackPhonesFeiyuCloud: ["862160927001", "862160927006"], //飞语显号

    showCallbackPhone: "01057733871",
    callbackMaxCallTime: 60 * 60,//双向回拨通话最长60分钟
    callback30MinCallTime: 30 * 60,
    callback15MinCallTime: 15 * 60,
    callback1Min: 60, // 1 * 60
    SeedDoctorCouponLimitPerDay: 10, // 每日种子医生优惠券使用次数限制
    SeedDoctorCouponLimitAll: 200, // 总的种子医生优惠券使用次数限制

    weixinToken: "43df24da619b8703432d2aw2",        //微信token
    weixinServer: "wx.zlycare.com/weixin",

    weixinappid: "wxe2374aa483c7f35a",
    weixinsecret: "6c381a084156ce768bbcb96b5620e00b",
    weixinKey: "BJZLYCAREhiejl34n53kCCXPE94859lp", //微信支付签名key
    weixinNum: "Juliye_Care",
    // 助理端 微信商户
    assistantWeixinMchId:"1509440451",
    assistantWeixinMchKey:'Rjayd2NX3JN8J4qOK8XxCrcIU3vf9Zxt',

    // 2030 医疗圈 微信商户
    mcWeixinMchId : "1513373921",
    mcWeixinMchKey : "mantianxinghui2019mantianxinghui",

    DEFAULT_PAGE_SIZE: 20,
    DEFAULT_PAGE_SIZE_1K: 1000,
    DEFAULT_PAGE_SIZE_2K: 2000,
    ORDER_AUTH_INC_ID: '54be1f11031c5c861c90b37a',
    UNION_CODE_AUTH_INC_ID: '58d2355a69202f562cd0beae',
    ACTIVITY_0524_COUPON_LIMIT_ID: '591a979def5de8ed051bf26e',
    ACTIVITY_0526_COUPON_LIMIT_ID: '5922afae40b2a92513f9c225',
    BEIJING_ID: '5509080d8faee0fbe0c4a6c9',
    CHAOYANG_ID: '5509080d8faee0fbe0c4a6eb',

    AUTH_EXPIRE_TIME: 60 * 60 * 1000,//验证码过期时间 一小时

    TIME_1_DAY: 24 * 60 * 60 * 1000,
    TIME_7_DAY: 7 * 24 * 60 * 60 * 1000,
    TIME_10_DAY: 240 * 60 * 60 * 1000,
    TIME_0: 0,
    TIME_10_YEAR: 10 * 365 * 24 * 60 * 60 * 1000,

    TIME2014BASE: 1388620800000,//
    TIME5M: 5 * 60 * 1000,// 30分钟
    TIME30M: 30 * 60 * 1000,// 30分钟
    TIME15M: 15 * 60 * 1000,// 15分钟间隔
    TIME10M: 10 * 60 * 1000,// 10分钟间隔
    TIME15S: 15 * 1000,// 15秒间隔
    TIME3M: 3 * 60 * 1000,// 3分钟间隔
    TIME1M: 60 * 1000,// 1分钟间隔
    TIME1H: 60 * 60 * 1000,//时间1小时
    TIME6H: 6 * 60 * 60 * 1000,//时间6小时

    TIME2H: 2 * 60 * 60 * 1000,//时间2小时
    TIME12H: 12 * 60 * 60 * 1000,//时间12小时

    TIME1D: 1 * 24 * 60 * 60 * 1000,//1天
    TIME3D: 3 * 24 * 60 * 60 * 1000,//3天 —— 评价过期
    TIME2D: 2 * 24 * 60 * 60 * 1000,//2天
    TIME30D: 30 * 24 * 60 * 60 * 1000,
    TIME60D: 60 * 24 * 60 * 60 * 1000,
    TIME1Y: 360 * 24 * 60 * 60 * 1000,//1年 —— 拟无限

    TIME7D: 7 * 24 * 60 * 60 * 1000,//提现默认拒绝时间

    TIME1MONTH: 30 * 24 * 60 * 60 * 1000,// 1月

    TIMEPREEXECTASK1: 24 * 60 * 60 * 1000,

    PendingTime: 12 * 60 * 60 * 1000,// 12小时
    CloseTime: 48 * 60 * 60 * 1000,  // 48小时

    ORDER_NUMBER_DIS: 3,//标识开始几单分账

    REWARD_FIRST_COMPLETE_ORDER_PAYMENT: 50,

    ORDER_AD_RADIO: 0.1, // 广告订单的分账比例, 医生分层比例
    //TimeTask 定时任务
    TimeTask10M: '0 */10 * * * *',
    TimeTask20M: '0 */20 * * * *',
    TimeTask30M: '0 */30 * * * *',
    TimeTask10H: '0 0 */10 * * *',
    TimeTask23H: '0 0 */23 * * *',

    HEADER_USER_ID: "x-docchat-user-id",
    HEADER_DEVICE_ID: "x-docchat-application-device-mark",
    HEADER_SESSION_TOKEN: "x-docchat-session-token",
    HEADER_APP_VERSION: "x-docchat-app-version",
    HEADER_APP_TYPE: "x-docchat-app-type",
    WEBCALL_TYPE: [
        {
            from: 'ucom',
            salt: "ucome1",
            needAuth: true
        },
        {
            from: 'ad',
            salt: 'ad1',
            needAuth: false
        },
        {
            from: 'fahaiwang',
            salt: 'fahaiwang1',
            needAuth: false
        },
        {
            from: 'blued',
            salt: 'blued1',
            needAuth: false
        }
    ],
    FREE_CALL_PRICE: {
        "incomePerMin": 0,
        "paymentPerMin": 0,
        "initiateIncome": 0,
        "initiatePayment": 0,
        "doctorInitiateTime": 5,
        "customerInitiateTime": 5,
        "discount": 1
    },
    voipAppKey: '3b7d1a897158f8d2dd0705d6efeaa8cb',
    voipAppSecret: '312c30ab09b8',
    phoneType: {
        'mobile': 'mobile',
        'fixed': 'fixed',
        'other': 'other'
    },
    twoFourHotLineTeamId: "540e606bc56a45326f2b6836",
    _24hlFixed: {
        appAccountId: '24hlFixed',
        appId: 'B9F71C0DEFF75D8178C120C96FA737D0',
        appToken: 'CFC2AC7EF114108DD83AF3BA98E1E64C',
        version: '2.1.0'
    },
    _24hlTestFixed: {
        appAccountId: '24hlTestFixed',
        appId: 'F3488134F1B37D40CB48005225C9F1C4',
        appToken: '265AA6521D403723B3E020380F3F7D16',
        version: '2.1.0'
    },
    _specl24hl: {
        appAccountId: 'specl24hl',
        appId: '01A149B54AA6BFA25E86345D1F531948',
        appToken: 'B02ECB3C103810ACB941E3F798C46569',
        version: '2.1.0'
    },
    _specl24hlTest: {
        appAccountId: 'specl24hlTest',
        appId: '5E539ADA1C32F6ECFB4D74F105FBA291',
        appToken: 'CCF47F08DAC64D76048F376D1E026397',
        version: '2.1.0'
    },
    _24hlIdTokenMap: {
        'B9F71C0DEFF75D8178C120C96FA737D0': 'CFC2AC7EF114108DD83AF3BA98E1E64C',
        'F3488134F1B37D40CB48005225C9F1C4': '265AA6521D403723B3E020380F3F7D16',
        '01A149B54AA6BFA25E86345D1F531948': 'B02ECB3C103810ACB941E3F798C46569',
        '5E539ADA1C32F6ECFB4D74F105FBA291': 'CCF47F08DAC64D76048F376D1E026397',
    },
    yhPrice: yhPrice,
    membershipVals: [ //可购买的会员额度列表
        {
            type: 'city_buy',
            title: '会员额度',
            subTitle: '',
            benefitVal: 300, //会员额度
            cost: (process.env.NODE_ENV == "production") ? 25 : 0.01, //售价
            cardNo: '2017050300001',
            expired30Days: 90 * 24 * 60 * 60 * 1000 //过期时间90天
        },
        {
            type: 'zlycare',
            title: '高级会员额度',
            subTitle: '',
            benefitVal: 2000, //会员额度
            cost: (process.env.NODE_ENV == "production") ? yhPrice : 0.01, //售价
            cardNo: '2017062200001',
            expiredTime: 10 * 365 * 24 * 60 * 60 * 1000
        },
        {
            type: 'zlycare_vip',
            title: 'vip会员额度',
            subTitle: '',
            benefitVal: 5000, //会员额度
            cost: (process.env.NODE_ENV == "production") ? 648 : 0.03, //售价
            cardNo: '2017062200002',
            expiredTime: 10 * 365 * 24 * 60 * 60 * 1000 //过期时间90天
        }

    ],
    membershipCardNo: '2017050300000', //用户User表中membership转到Membership表中
    couponRateInCPS: { //用户购买代价券的浮动区间,以CPS(cost per sale)为基准
        min: 0.4,
        max: 0.6
        //min: 0.6,
        //max: 0.7
    },
    couponAndRebateRateInCPS: { //用户购买的代价券和返现总值的浮动区间,以CPS(cost per sale)为基准
        min: 0.5,
        max: 1.5
    },
    couponRebateRate: 1 / 4,// 1 / 3
    //sysReward: 12,
    sysMaxReward: 5,
    qrToPath: '/business_coupon/received_coupon',
    withdrawalsMax: 20000,
    specialCities: ["北京市", "天津市", "上海市", "重庆市"],
    specialShopType: ["医疗"],
    withdrawalsMin: 10,
    qrDesc: '到店出示使用，还有机会获得惊喜',
    nowAppVersion: "4.4.0",
    IOS_SHARED_SECRET: 'bc9c62bc0799478ca276779ae6ff8555',
    qrDefaultAvatar: '',
    shopTypeVersion: 4,
    shopTypeMap: {
        '0100': '餐饮',
        '0101': '甜点饮品',
        '0102': '咖啡酒吧',
        '0103': '糕点',
        '0104': '火锅',
        '0105': '自助餐',
        '0106': '小吃快餐',
        '0107': '日韩料理',
        '0108': '西餐',
        '0109': '聚餐宴请',
        '0110': '烤肉',
        '0111': '烤串',
        '0112': '川湘菜',
        '0113': '江浙菜',
        '0114': '香锅烤鱼',
        '0115': '粤菜',
        '0116': '西北菜',
        '0117': '云贵菜',
        '0118': '北京菜',
        '0119': '鲁菜',
        '0120': '东北菜',
        '0121': '港澳台餐厅',
        '0122': '海鲜',
        '0123': '素食菜',
        '0124': '新疆菜',
        '0125': '外国菜',
        '0126': '汤粥铺',
        '0199': '其他',

        '0200': '酒店住宿',
        '0201': '特价酒店',
        '0202': '经济型酒店',
        '0203': '主题酒店',
        '0204': '高端酒店',
        '0205': '高星酒店',
        '0206': '度假酒店',
        '0207': '公寓型酒店',
        '0208': '青年旅社',
        '0299': '其他',

        '0300': '商超',
        '0301': '超市',
        '0302': '化妆品',
        '0303': '数码产品',
        '0304': '鲜花',
        '0305': '家电',
        '0306': '服饰',
        '0307': '鞋',
        '0308': '包包',
        '0309': '配饰',
        '0310': '母婴亲子',
        '0311': '眼镜',
        '0399': '其他',

        '0400': '果蔬生鲜',
        '0401': '水果',
        '0402': '蔬菜',
        '0403': '生鲜',
        '0499': '其他',

        '0500': '休闲娱乐',
        '0501': '电影院',
        '0502': '网吧/网咖',
        '0503': '洗浴',
        '0504': 'KTV',
        '0505': '酒吧',
        '0506': '电玩',
        '0507': '运动健身',
        '0508': '理疗/足疗按摩',
        '0509': 'VR体验馆',
        '0510': '中医养生',
        '0511': 'DIY手工坊',
        '0512': '密室逃脱',
        '0513': '茶馆',
        '0514': '棋牌室',
        '0515': '桌游',
        '0599': '其他',

        '0600': '生活服务',
        '0601': '洗衣店',
        '0602': '家政服务',
        '0603': '旅游',
        '0604': '汽车服务',
        '0605': '搬家',
        '0606': '体检',
        '0607': '家居维修',
        '0608': '电脑维修',
        '0609': '家电维修',
        '0610': '手机维修',
        '0611': '充值服务',
        '0612': '婚纱摄影',
        '0613': '家庭摄影',
        '0614': '个性写真',
        '0615': '宠物服务',
        '0616': '照片冲洗',
        '0699': '其他',

        '0700': '美体',
        '0701': '美发',
        '0702': '美容美体',
        '0703': '美甲美瞳',
        '0704': '瑜伽舞蹈',
        '0705': '瘦身纤体',
        '0706': '纹身',
        '0799': '其他',

        '0800': '医疗',
        '0801': '药店',
        '0802': '诊所',
        '0803': '私立医院',
        '0804': '保健品',
        '0899': '其他'
    },
    allShopType: [
        {
            name: '餐饮',
            subType: [
                '甜点饮品',
                '咖啡酒吧',
                '糕点',
                '火锅',
                '自助餐',
                '小吃快餐',
                '日韩料理',
                '西餐',
                '聚餐宴请',
                '烤肉',
                '烤串',
                '川湘菜',
                '江浙菜',
                '香锅烤鱼',
                '粤菜',
                '西北菜',
                '云贵菜',
                '北京菜',
                '鲁菜',
                '东北菜',
                '港澳台餐厅',
                '海鲜',
                '素食菜',
                '新疆菜',
                '外国菜',
                '汤粥铺',
                '其他餐饮'
            ]
        },
        {
            name: '酒店住宿',
            subType: [
                '特价酒店',
                '经济型酒店',
                '主题酒店',
                '高端酒店',
                '高星酒店',
                '度假酒店',
                '公寓型酒店',
                '青年旅社',
                '其他酒店住宿'
            ]
        },
        {
            name: '商超',
            subType: [
                '超市',
                '化妆品',
                '数码产品',
                '鲜花',
                '家电',
                '服饰',
                '鞋',
                '包包',
                '配饰',
                '母婴亲子',
                '眼镜',
                '其他商超'
            ]
        },
        {
            name: '果蔬生鲜',
            subType: [
                '水果',
                '蔬菜',
                '生鲜',
                '其他果蔬生鲜'
            ]
        },
        {
            name: '休闲娱乐',
            subType: [
                '电影院',
                '网吧/网咖',
                '洗浴',
                'KTV',
                '酒吧',
                '电玩',
                '运动健身',
                '理疗/足疗按摩',
                'VR体验馆',
                '中医养生',
                'DIY手工坊',
                '密室逃脱',
                '茶馆',
                '棋牌室',
                '桌游',
                '其他休闲娱乐'
            ]
        },
        {
            name: '生活服务',
            subType: [
                '洗衣店',
                '家政服务',
                '旅游',
                '汽车服务',
                '搬家',
                '体检',
                '家居维修',
                '电脑维修',
                '家电维修',
                '手机维修',
                '充值服务',
                '婚纱摄影',
                '家庭摄影',
                '个性写真',
                '宠物服务',
                '照片冲洗',
                '其他生活服务'
            ]
        },
        {
            name: '美体',
            subType: [
                '美发',
                '美容美体',
                '美甲美瞳',
                '瑜伽舞蹈',
                '瘦身纤体',
                '纹身',
                '其他美体'
            ]
        },
        {
            name: '医疗',
            subType: [
                '药店',
                '诊所',
                '私立医院',
                '保健品',
                '其他医疗'
            ]
        }
    ],
    shopAuthorizedStatus: [3, 4, 5],
    couponValidTimeDes: '自领取起两日', //代金券有效期描述
    membershipExpiringTS: 5 * 24 * 60 * 60 * 1000,
    opShopProp: [1],
    contactUs: '010-57733866',
    SENIOR_COST: 298,
    wxConfigTest: {
        appId: 'wxe2374aa483c7f35a',
        secret: 'f31c8607ab0e9cc2510a06925d30d711'
    },
    wxConfig: {
        appId: 'wxb042e08b7ffe1091',
        secret: '4522000f631bcf9859f212b1dea9374d'
    },
    membershipLimit: 100,//购买健康会员卡默认额度限制
    AdvertiseInfo: {//广告接口的调用信息（正式）
        url: 'http://bid.dsp.juliye.cn',
        router: 'inner_ssp_bid',
        source: 'juliyecare'
    },
//测试环境 目前广告位ID对应 10：单图带描述 11：三图带描述 12：banner
    AdvertiseInfoTest: {//广告接口的调用信息（测试）
        url: 'http://bid.dsp_test.juliye.cn',
        source: 'juliyecare',//测试参数
        // source: 'test',//模拟测试参数
        router: 'inner_ssp_bid'
    },
    Introduction:'1.点击“电话咨询”，联系朱李叶服务助理\n2.服务助理会与您确认具体服务项目及服务流程',
    DrugAssistantPhones:'4006182273',
    visitPlanInterval:15*60*1000,//医生出诊，可访问的时间间隔，单位毫秒
};
