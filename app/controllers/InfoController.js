/**
 * InfoController
 * Authors: Michael Luo
 * Date: 15-1-19
 * Copyright (c) 2014 Juliye Care. All rights reserved.
 */

var
    commonUtil = require('../../lib/common-util'),
    qiniu = require('../configs/qiniu'),
    apiHandler = require('../configs/ApiHandler'),
    constants = require('../configs/constants'),
    practice = require('../json/practice'),
    configs = require('../configs/api'),
    _ = require('underscore'),
    CustomerService = require('../services/CustomerService'),
    CommonInfoService = require('../services/CommonInfoService');

var InfoController = function () {
};
InfoController.prototype.constructor = InfoController;

/**
 * 获取充值列表
 * @param req
 * @param res
 * @returns {*}
 */
InfoController.prototype.getRechargeOptions = function (req, res) {
    return apiHandler.OK(res, {
        data: constants.RECHARGE_OPTS,
        ts: Date.now()
    });
};
/**
 * TODO: 抽离banner service
 * @param req
 * @param res
 * @returns {*}
 */
InfoController.prototype.getCurrentBanners = function (req, res) {
    //var fakeBanners = [{
    //  title: "百度啦啦啦啦", // 显示标题
    //  img_url: "http://7j1ztl.com1.z0.glb.clouddn.com/banner_demo.png", // 显示图片
    //  link: "http://baidu.com",
    //  // http://
    //  // https://
    //  // app://recharge/
    //  // app://dial/00120
    //  // app://broker/xxx_brokerId_xxx
    //  ts_online: 1476792746189,
    //  ts_interval: 1000 * 60 * 3 // 3 Min
    //},{
    //  title: "拨号", // 显示标题
    //  img_url: "http://7j1ztl.com1.z0.glb.clouddn.com/banner_demo.png", // 显示图片
    //  link: "app://dial/00120",
    //  // http://
    //  // https://
    //  // app://recharge/
    //  // app://dial/00120
    //  // app://broker/xxx_brokerId_xxx
    //  ts_online: 1476792746189,
    //  ts_interval: 1000 * 60 * 5 // 3 Min
    //}
    //];
    // TODO: USER.findById
    var userId = req.identity.userId;
    var appVersion = req.identity && req.identity.appVersion ? req.identity.appVersion : '';
    var user;
    //var appUser = req.identity && req.identity.user ? req.identity.user : '';
    var lastUpdateBannerTS = parseInt(req.query.lastUpdate || 0);
    var Banner = require("../models/Banner");
    var interval = Date.now() - lastUpdateBannerTS;
    console.log("interval ts : " + interval);
    //var data = _.filter(fakeBanners, function(d){ return interval >= d.ts_interval; });
    var conditions = {
        type: 5,
        alertTimeInterval: {$lt: interval},
        isDeleted: false
    };
    var project = {
        title: "$commercialName", // 显示标题
        img_url: "$commercialImg", // 显示图片
        link: "$commercialLink",
        minVer: "$supportMinVer",
        maxVer: "$supportMaxVer",
        needId: "$commercialLinkNeedId",
        needBroker: "$needBrokerAuth",
        ts_online: "$createdAt",
        ts_interval: "$alertTimeInterval",
        bannerImage: "$bannerImage",
        isShare: "$isShare",
        commercialLinkType: "$commercialLinkType"
    };
    CustomerService.getInfoByID(userId).then(function (u) {
        user = u;
        return Banner.aggregate([
            {$match: conditions},
            {$project: project}
        ]).exec().then(function (_banners) {
            var banners = [];
            _banners = _banners || [];
            _banners = JSON.parse(JSON.stringify(_banners));
            //_banners = JSON.parse(JSON.stringify(_banners))|| [];
            // TODO: banners.forEach -> if needId -> link+="userId=sss&userName=???"
            //console.log('_banner:',_banners);
            if (userId && user) {
                _banners.forEach(function (_banner) {
                    var ok = true;
                    if (_banner.needId) {
                        _banner.link += '?userId=' + u._id + '&userName=' + encodeURIComponent(u.name);
                    }

                    if (_banner.minVer && (_banner.minVer > appVersion)) {
                        ok = false;
                    }
                    if (_banner.maxVer && (_banner.maxVer < appVersion)) {
                        ok = false;
                    }
                    if (_banner.needBroker && !user.doctorRef) {
                        ok = false;
                    }
                    if (ok) {
                        //_banner.link += "?userId=" + userId ;
                        //_banner.commercialLink += "?userId=" + userId ;
                        banners.push(_banner);
                    }
                });
            }
            //_banners = _banners;
            //console.log(banners)
            //判断ios审核
            // if(req.headers["user-agent"] && req.headers["user-agent"].indexOf("iOS")>=0 && appVersion == constants.nowAppVersion ){
            //   banners = [
            //       {
            //           "bannerImage": "http://7j1ztl.com1.z0.glb.clouddn.com/banner_family_doctor.png",
            //           "title": "专属医生",
            //           "img_url": "http://7j1ztl.com1.z0.glb.clouddn.com/banner_family_doctor.png",
            //           "link": "http://web.zlycare.com/marketing/specdoc",
            //           "minVer": "4.3.1",
            //           "maxVer": "",
            //           "ts_online": 1478512800000,
            //           "ts_interval": 1000
            //       }
            //   ]
            // }
            return apiHandler.OK(res, {
                data: banners,
                ts: Date.now()
            });
        }, function (err) {
            console.log("Err: " + err);
            return apiHandler.OK(res, {
                data: [],
                ts: Date.now()
            });
        });
    }, function (err) {
        console.log("Err: " + err);
        return apiHandler.OK(res, {
            data: [],
            ts: Date.now()
        });
    });
};

InfoController.prototype.getCdn = function (req, res) {
    var info = CommonInfoService.getCDN();

    apiHandler.OK(res, info);
};

InfoController.prototype.getZly400 = function (req, res) {
    var rs = CommonInfoService.get400();

    return apiHandler.OK(res, rs);
};

InfoController.prototype.getTimeStamp = function (req, res) {
    var rs = {
        "timestamp": Date.now()
    };

    return apiHandler.OK(res, rs);
};

InfoController.prototype.getPractice = function (req, res) {
    return apiHandler.OK(res, practice);
};

InfoController.prototype.serverInfo = function (req, res) {

    apiHandler.OK(res, {DrugAssistantPhones: constants.DrugAssistantPhones});
};
module.exports = exports = new InfoController();