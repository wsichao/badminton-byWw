var
    _ = require('underscore'),
    util = require('util'),
    commonUtil = require('../../lib/common-util'),
    apiHandler = require('../configs/ApiHandler'),
    ErrorHandler = require('../../lib/ErrorHandler'),
    configs = require('../configs/api'),
    serverConfigs = require('../configs/server'),
    constants = require('../configs/constants'),
    Activity = require('../configs/activity'),
    Q = require("q"),
    Promise = require('promise'),
    WXController = require('./WXController'),
    ZlycareController = require('./ZlycareController'),
    ClientAuth = require('../../lib/middleware/ClientAuthentication'),
    CustomerService = require('../services/CustomerService'),
    TransactionMysqlService = require('../services/TransactionMysqlService'),
    OrderService = require('../services/OrderService'),
    CONS = require('../services/OrderService').CONS,
    CallbackService = require('../services/CallbackService'),
    CouponService = require('../services/CouponService'),
    LoggerService = require('../services/LoggerService'),
    ChannelService = require('../services/ChannelService'),
    SuggestionService = require('../services/SuggestionService'),
    ValidateService = require('../services/ValidateService'),
    MomentService = require('../services/MomentService'),
    MessageService = require('../services/MessageService'),
    DoctorService = require('../services/DoctorService'),
    DoctorModel = require('../models/Doctor'),
    CustomerModel = require('../models/Customer'),
    CommonInfoService = require('../services/CommonInfoService'),
    JPushService = require('../services/JPushService'),
    MomentMsgService = require('../services/MomentMsgService'),
    ApplicationService = require('../services/ApplicationService'),
    SocialRelService = require('../services/SocialRelService'),
    ProductService = require('../services/ProductService'),
    PayService = require('../services/PayService'),
    CacheService = require('../services/CacheService'),
    MembershipService = require('../services/MembershipService'),
    ShopService = require('../services/ShopService'),
    pinyin = require("pinyin"),
    VersionService = require('../services/VersionService'),
    ServicePackageOrderService = require('../services/service_package/servicePackageOrderService');


var CustomerController = function () {
};
CustomerController.prototype.constructor = CustomerController;
/**
 * 获取用户的私人信息(CDN,400,账号信息等)
 * Usage:
 *
 */
CustomerController.prototype.getPrivateInfoById = function (req, res) {
    var identity = req.identity;
    if (!commonUtil.isUUID24bit(identity.userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var userId = identity.userId;
    var user;
    var option = {
        doctorFields: DoctorModel.frontEndFields,
        customerFields: CustomerModel.frontEndFields
    }
    CustomerService.getInfoByID(userId, option)
        .then(function (_user) {
          if (!_user) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
          }
          user = JSON.parse(JSON.stringify(_user));
          let user_center = Backend.service('user_center', 'handle_user_center');
          if (user.openId) {
            return user_center.user_info(user.openId);
          }
        })
        .then(function(user_center_res){
            let user_center_data = user_center_res && user_center_res.data || {};
            return ZlycareController.handleUserInfo(user,user_center_data);
        })
        .then(function (user) {

            //     // 系统信息
            //     user[CommonInfoService.CONS.PARAMS.CDN] = CommonInfoService.getCDN();
            //     user[CommonInfoService.CONS.PARAMS.ZLY400] = CommonInfoService.get400();
            //     user[CommonInfoService.CONS.PARAMS.DOC_CHAT_NUM_REG] = CommonInfoService.getDocChatNumRegex();
            //     user['hasPayPwd'] = _user.payPwd ? true : false;
            //     user['hasPayPassword'] = _user.payPassword ? true : false;
            //     console.log('支付密码',_user);
            //     delete user['payPwd'];
            //     delete user['payPassword'];
            //     user['hasPwd'] = _user.loginPassword ? true : false;
            //     delete user['loginPassword'];
            //     if (user.doctorRef && user.doctorRef._id) {
            //         var now = new Date();
            //         var doctorRef = user.doctorRef;
            //         var lastPriceChgAt = new Date(doctorRef.lastPriceChgAt);
            //         doctorRef.isPriceEdit = true;
            //         doctorRef.priceLevelList = [
            //             {
            //                 level: "零",
            //                 title: "免费"
            //             },
            //             {
            //                 level: "一",
            //                 title: "5分钟内8元，之后2元/分钟"
            //             },
            //             {
            //                 level: "二",
            //                 title: "5分钟内16元，之后4元/分钟"
            //             },
            //             {
            //                 level: "三",
            //                 title: "5分钟内40元，之后10元/分钟"
            //             },
            //             {
            //                 level: "四",
            //                 title: "5分钟内80元，之后18元/分钟"
            //             }
            //         ];
            //         doctorRef.occupation = doctorRef.occupation || "";
            //     }
            //     user.isOccupationSet = user.hospital ? true : false;
            //     //自动离线
            //     user.isAutoOffline = user.isAutoOffline || false;
            //     user.offlineBeginTime = user.offlineBeginTime || '22:00';
            //     user.offlineEndTime = user.offlineEndTime || '08:00';
            //     if (user.shopVenderApplyStatus == 2 || user.shopVenderApplyStatus == 5) {
            //         return ApplicationService.findLastShopApplication(userId)
            //     }
            //     //联系我们
            //     user.contactUs = constants.contactUs;
            //     //是否为认证商户
            //     user.isShopAuthorized = CustomerService.isShopAuthorized(user.shopVenderApplyStatus);
            //     user.shopName = user.shopName || '';
            //     user.shopAvatar = user.shopAvatar || '';
            // })
            // .then(function (_appl) {
            //     if (_appl && _appl[0].status == -1) {
            //         user.shopRefuseReason = _appl[0].reason || "";
            //     }
            //     user.shopTypeVersion = constants.shopTypeVersion;
            apiHandler.OK(res, user);
            // LoggerService.trace(LoggerService.getTraceDataByReq(req));
            ZlycareController.loginUpdateUserInfo(user);
            LoggerService.trace(LoggerService.getTraceDataByReq(req)); //和发送验证码的log一起用，不能删
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

/**
 * 通过id获取用户的基本信息
 * Usage:
 *  1. C端每次进入主界面更新;
 *  2. C端每次更新个人基本信息;
 */
CustomerController.prototype.getInfoById = function (req, res) {
    var userId = req.query.userId;
    var user;
    CustomerService.getInfoByID(userId)
        .then(function (_user) {
            if (!_user) {
                return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
            }
            user = JSON.parse(JSON.stringify(_user));
            user['hasPayPwd'] = _user.payPwd ? true : false;
            apiHandler.OK(res, user);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

CustomerController.prototype.getPublicInfoById = function (req, res) {
    console.log("this is web transfer")
    var userId = req.query.userId;
    var user;
    if (!commonUtil.isUUID24bit(userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    CustomerService.getPublicInfoById(userId)
        .then(function (_user) {
            if (!_user) {
                return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
            }
            user = JSON.parse(JSON.stringify(_user));
            user['hasPayPwd'] = _user.payPwd ? true : false;
            apiHandler.OK(res, user);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};
var getRecommendList = function (user, appUserDocId) {
    var customer = user;
    //var userDocId = user.doctorRef && user.doctorRef._id ? user.doctorRef._id : "";
    var appUserIsBroker = appUserDocId ? true : false;//用户是否为顾问

    var mapObj = {
        'bak': 'recmnd_fans',
        'ass': 'ass',
        'ad': 'ad'
    };
    var getRecommendInfo = function (doctorId, confItem) {
        var defer = Q.defer();
        if (confItem.isVisiable) {
            //获取首推
            DoctorService.getTopWeightRecommendByIdAndType(mapObj[confItem.item] || confItem.item, doctorId, 1).then(function (refs) {
                confItem.more.url += '?doctorId=' + doctorId;
                if (!refs || (refs && refs.length == 0) || !refs[0].toRef) {
                    confItem.title = confItem.title || '暂无';
                } else {
                    var r = refs[0];
                    confItem.title = r.toRef.realName;
                    confItem.disabled = false;
                    if (confItem.type == 'doctor') {
                        confItem.docChatNum = r.toRef.docChatNum;
                    }
                }

                if (confItem.item == mapObj['ad']) {
                    // 是否已存在关系
                    if (appUserIsBroker) {
                        DoctorService.isRelExists(doctorId, appUserDocId, "ad").then(function (_rel) {
                            confItem.more.isBroker = appUserIsBroker;
                            if (_rel) {
                                confItem.more.hint = constants.RECOMMEND_AD_HINT_MORE;
                                confItem.more.hintLink = constants.WEB_HOST + constants.RECOMMEND_AD_HINT_LINK + "?pay=more&paid=" + _rel.weight;
                            } else {
                                confItem.more.hint = constants.RECOMMEND_AD_HINT_DEF;
                                confItem.more.hintLink = constants.WEB_HOST + constants.RECOMMEND_AD_HINT_LINK + "?pay=init";
                            }
                            console.log()
                            defer.resolve(confItem);
                        })
                    } else {
                        confItem.more.isBroker = appUserIsBroker;
                        confItem.more.hint = constants.RECOMMEND_AD_HINT_DEF;
                        confItem.more.hintLink = constants.WEB_HOST + constants.RECOMMEND_AD_HINT_LINK + "?pay=init";
                        defer.resolve(confItem);
                    }
                } else {
                    defer.resolve(confItem);
                }
            });
        } else {
            defer.resolve();
        }
        return defer.promise;
    };
    var recommends = [
        constants.RECOMMEND_BAK,
        constants.RECOMMEND_ASS,
        constants.RECOMMEND_AD
    ];
    if (!customer.doctorRef || !customer.doctorRef._id) {
        return [];
    }
    var customerRef = customer.doctorRef;
    //console.log('recommendConf:', customerRef.recommendConf);
    if (!customerRef.recommendConf || customerRef.recommendConf.length == 0) {
        return [];
    }
    var qTasks = [];
    customerRef.recommendConf.forEach(function (confItem) {
        qTasks.push(getRecommendInfo(customerRef._id, confItem));//??
    });
    return Q.all(qTasks)
        .then(function (result) {
            console.log('result:', result);
            var recommends = [];
            console.log(111);
            result.forEach(function (d) {
                if (d) {
                    recommends.push(d);
                }
            })
            console.log(222);
            return recommends;
        });
};

var getPublicInfo = function (appUser, user, couponValue, needRecommendInfo) {
    var isShopReminded = false;
    var appUserId = appUser._id;
    var userId = user._id;
    var appUserDocId = (appUser && appUser.doctorRef && appUser.doctorRef._id) ? appUser.doctorRef._id : "";
    var needRecommendInfo = needRecommendInfo;
    return Promise.resolve()
        .then(function () {
            user = JSON.parse(JSON.stringify(user));
            // TODO: 是否还需要支持邀请功能? 否
            user.invited = true; //最近7天该用户是否被邀请过
            //if (!user.doctorRef) {
            //  if (!appUser.invitedUsers || appUser.invitedUsers.length == 0) {
            //    user.invited = false;
            //  } else {
            //    for (var i = 0; i < appUser.invitedUsers.length; i++) {
            //      var invitedUser = appUser.invitedUsers[i];
            //      if (invitedUser.userId == (user._id + '')) {
            //        if ((Date.now() - invitedUser.latestInvitedAt) > 7 * 24 * 60 * 60 * 1000) {
            //          user.invited = false;
            //        } else {
            //          user.invited = true;
            //        }
            //        break;
            //      } else {
            //        user.invited = false;
            //      }
            //    }
            //  }
            //}
            //是否已收藏
            var userDoctorRefId = user.doctorRef && user.doctorRef._id ? user.doctorRef._id + '' : '';
            user.isFavorite = appUser.favoriteDocs.indexOf(userDoctorRefId + '') > -1 ? true : false;
            //user['hasPayPwd'] = user.payPwd ? true : false; // TODO: 商家是否设置支付密码 DEL???
            user.isZaned = user.momentRef && user.momentRef.zanUsers && user.momentRef.zanUsers.indexOf(appUserId + '') > -1 ? true : false;
            if (user.momentRef) {
                user.momentRef.isZan = user.isZaned;
            }
            user.hongbaoTotalCount = user.momentRef && user.momentRef.hongbaoTotalCount ? user.momentRef.hongbaoTotalCount : 0;
            if (user.momentRef && user.momentRef._id) {// 查看次数
                MomentService.updateMomentInfo(user.momentRef._id, {$inc: {viewedCount: 1}});
            }
            if (user.momentRef && user.momentRef.recommendedUser) {// 动态中的被推荐人
                return CustomerService.getInfoByID(user.momentRef.recommendedUser, "name docChatNum _id shopName")
            }
        })
        .then(function (_recommendedUser) {
            if (_recommendedUser) {
                user.momentRef.recommendedUser = {};
                user.momentRef.recommendedUser.userName = _recommendedUser.shopName || _recommendedUser.name;
                user.momentRef.recommendedUser.docChatNum = _recommendedUser.docChatNum;
                user.momentRef.recommendedUser.userId = _recommendedUser._id;
            }
            //Begin-------- TODO: 跟产品确认: 是否还需要显示  推荐人\备选联系人|广告 , 根据前端传参数needRecommendInfo
            if (needRecommendInfo) {
                return getRecommendList(user, appUserDocId);
            }
        })
        .then(function (recommendConf) {
            if (needRecommendInfo) {
                user.recommendConf = recommendConf;
            }
            if (user.doctorRef && user.doctorRef.recommendConf) {
                delete user.doctorRef.recommendConf;
            }
            var relUserIds = [];
            relUserIds.push(user._id);
            if (user.momentRef) {
                relUserIds.push(user.momentRef.originalUser.userId);
                if (user.momentRef.recommendedUser) {
                    relUserIds.push(user.momentRef.recommendedUser.userId);
                }
            }
            return SocialRelService.getNoteNameByIds(appUserId, relUserIds)
        })
        .then(function (_nameList) {
            console.log(_nameList.length);
            var relNameList = _.indexBy(_nameList, "relUser");
            user.nickName = user.name;
            user.name = relNameList[user._id] && relNameList[user._id].noteInfo && relNameList[user._id].noteInfo.noteName || user.name;
            if (user.momentRef) {
                user.momentRef.originalUser.userName = relNameList[user.momentRef.originalUser.userId] && relNameList[user.momentRef.originalUser.userId].noteInfo && relNameList[user.momentRef.originalUser.userId].noteInfo.noteName
                    || user.momentRef.originalUser.userName;
                if (user.momentRef.recommendedUser) {
                    user.momentRef.recommendedUser.userName = relNameList[user.momentRef.recommendedUser.userId] && relNameList[user.momentRef.recommendedUser.userId].noteInfo && relNameList[user.momentRef.recommendedUser.userId].noteInfo.noteName
                        || user.momentRef.recommendedUser.userName;
                }
            }
            if (user.recommendConf) {
                var relUserDocChatNums = [];
                user.recommendConf.forEach(function (item) {
                    if (item.docChatNum) {
                        relUserDocChatNums.push(item.docChatNum);
                    }
                })
                return SocialRelService.getNoteNameByDocChatNums(appUser.docChatNum, relUserDocChatNums)
            }
        })
        .then(function (_nameList) {
            if (_nameList) {
                var relNameList = _.indexBy(_nameList, "relUserDocChatNum");
                user.recommendConf.forEach(function (item) {
                    if (relNameList[item.docChatNum]) {
                        item.title = relNameList[item.docChatNum] && relNameList[item.docChatNum].noteInfo && relNameList[item.docChatNum].noteInfo.noteName || item.title
                    }
                })
            }
            //End-------- TODO: 跟产品确认: 是否还需要显示  推荐人\备选联系人|广告

            /* //Begin-------- TODO: 跟产品确认 是否是买券商家 (专款买券)  否
             if (user.isCouponVender) {
             return ProductService.getProductsByUserId(userId);
             }
             })
             .then(function (_products) {
             if (_products) {
             user.products = _products;
             }
             //End-------- TODO:  跟产品确认 是否是买券商家 (专款买券)*/
        })
        .then(function () {
            console.log('user shop id:', appUser._id + '', user._id + '');
            var RemindService = Backend.service("1/city_buy", "remind_send_stamps");
            return RemindService.checkShops(appUser._id + '', [user._id + '']);
        })
        .then(function (_remind_res) {
            console.log('_remind_res:', _remind_res);
            isShopReminded = _remind_res && _remind_res[user._id + ''] || false;
            return ShopService.getShopByUserId(user._id + '');
        })
        .then(function (_shop) {
            var isOpShop = CustomerService.isOpShop(user.shopVenderApplyStatus, user.shopProp);
            if (isOpShop) {
                if (!_shop) {
                    ErrorHandler.getBusinessErrorByCode(8005);
                }
                //将用户运营商户的已领取数量与cps商户的领取数量加和
                var totalConsumedMemberSize = user.marketing.consumedMemberSize + _shop.consumedMemberSize
                var lowestCost = user.marketing && user.marketing.lowestCost || -1;
                user.marketing = JSON.parse(JSON.stringify(_shop));
                if (user.marketing) {
                    user.marketing.lowestCost = lowestCost;
                }
                console.log(totalConsumedMemberSize);
                user.marketing.consumedMemberSize = totalConsumedMemberSize;
            }
            //TODO:  isShopAuthorized vs isVender vs balance vs shopVenderApplyStatus
            user.isShopAuthorized = constants.shopAuthorizedStatus.indexOf(user.shopVenderApplyStatus) > -1 ? true : false;
            if (!user.isShopAuthorized) {
                return;
            }
            user.name = user.shopName || user.name || '';
            user.avatar = user.shopAvatar || user.avatar || '';
            user.position = '';
            user.doctorRef.position = '';
            user.hospital = user.shopType || '';
            user.doctorRef.hospital = user.shopType || '';
            user.department = user.shopSubType || '';
            user.doctorRef.department = user.shopSubType || '';
            //经纬度
            console.log('shopLocation:', user.shopLocation);
            user.shopLocationLon = user.shopLocation && user.shopLocation[0] || 0;
            user.shopLocationLat = user.shopLocation && user.shopLocation[1] || 0;
            //im信息
            user.im = user.im || {};
            user.im.userName = user.im.userName || '';
            var option = {
                fields: 'rmb unionCode description qrCode isConsumed lowestCost'
            };
            return CouponService.getVendersWithCoupon(appUserId, [userId], option);
        })
        .then(function (_coupons) {
            if (!user.isShopAuthorized) {
                return user;
            }
            var coupon = null;
            if (_coupons && _coupons[0]) {
                //已领取过该商家的代金券,直接返回代金券信息
                coupon = _coupons[0];
            }
            //console.log('coupon:', coupon);
            var userCoupon = {
                "rmb": coupon && coupon.rmb || 0, //金额
                "avatar": user.shopAvatar || user.avatar || constants.qrDefaultAvatar, //二维码中头像
                "qrUrl": coupon ? serverConfigs.webHOST + constants.qrToPath + '?qrCode=' + coupon.qrCode : '', //二维码被扫描跳转
                "qrDesc": constants.qrDesc, //二维码下的描述
                "unionCode": coupon && coupon.unionCode || '', //代金券唯一编号
                "desc": coupon && coupon.description || '', //代金券描述
            };
            //console.log('userCoupon:', userCoupon);

            var couponItem = {
                couponName: '代金券',
                couponValue: coupon && coupon.rmb ? coupon.rmb : 0,
                consumedMemberSize: user.marketing && user.marketing.consumedMemberSize || 0,
                remainMemberSize: user.marketing && user.marketing.remainMemberSize || 0,
                hasGotCoupon: coupon ? true : false,
                hasCouponUsed: coupon && coupon.isConsumed ? true : false,
                userCoupon: userCoupon,
                couponValidTimeDes: constants.couponValidTimeDes,
                isShopReminded: isShopReminded
            };
            //console.log('couponItem:', couponItem);
            //console.log(user.marketing);
            if (!coupon && user.marketing && (user.marketing.cps >= 1)) {
                // TODO: 方法开始的地方需要判断 >= 0
                //var maxCouponVal = Math.max(Math.round(constants.couponRateInCPS.max * user.marketing.cps * 10) / 10, constants.sysReward);
                var couponValRange = CouponService.getVenderRangeCouponVal(user.marketing.cps);

                console.log(couponValue, couponValRange);
                couponValue = Number(couponValue || 0);
                couponItem.couponValue = couponValue;
                var randomCouponVal = CouponService.getRandomCoupon(user.marketing.cps, false);
                if (!couponValue || couponValue < 0) {
                    couponValue = randomCouponVal;
                    couponItem.couponValue = randomCouponVal;
                }
                /*else{
                 if(couponValue > couponValRange.maxVal || couponValue < couponValRange.minVal){
                 throw ErrorHandler.getBusinessErrorByCode(2201);
                 }
                 }*/
                var lowestCost = coupon ? coupon.lowestCost : CustomerService.getLowestCost(user.marketing.lowestCost, user.marketing.cps, couponValue);
                couponItem.couponRule = '满' + lowestCost + '元可用';


            }
            console.log('couponItem:', couponItem);

            user.coupons = [couponItem];
        })
        .then(function () {
            //displayURL和location处理
            var service = Backend.service("1/city_buy", "moment_msg");
            var momentURL = user.momentURL;
            delete user.momentURL;
            user.displayURL = service.momentURL(user.currentMoment, momentURL || []);

            if (user.momentRef) {
                user.momentRef.displayURL = user.displayURL; //在moment中冗余
                console.log('user.momentRef.location:', user.momentRef.location);
                if (user.momentRef.location) {
                    user.momentRef.location = user.momentRef.location.reverse();
                }
            }
            return user;
        });
}
CustomerController.prototype.getPublicInfoById_new = function (req, res) {
    var identity = req.identity;// APP使用账户的身份
    var appUser = identity ? identity.user : {};
    var appUserId = (identity && identity.userId) ? identity.userId : '';
    var appUserDocId = (appUser && appUser.doctorRef && appUser.doctorRef._id) ? appUser.doctorRef._id : "";
    var userId = req.query.userId;// 被查询用户ID
    var couponValue = req.query.couponValue || 0;
    if (!commonUtil.isUUID24bit(appUserId) || !commonUtil.isUUID24bit(userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var needRecommendInfo = Number(req.query.needRecommendInfo || 0);
    var user;
    CustomerService.getPublicInfoById(userId)
        .then(function (_user) {
            if (!_user) {
                return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
            }
            return getPublicInfo(appUser, _user, couponValue, needRecommendInfo);
        })
        .then(function (_user) {
            apiHandler.OK(res, _user);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

var getNoteNameByIds = function (userId, relUserIds) {
    SocialRelService.getNoteNameByIds(userId, relUserIds)
        .then(function (_list) {
            var data = _.indexBy(_list, "_id");
            return data;
        })
};
CustomerController.prototype.getInfoByDocChatNum_new = function (req, res) {
    var identity = req.identity;// APP使用账户的身份
    var appUser = identity ? identity.user : {};
    var appUserId = (identity && identity.userId) ? identity.userId : '';
    var appUserDocId = (appUser && appUser.doctorRef && appUser.doctorRef._id) ? appUser.doctorRef._id : "";
    var docChatNum = req.query.docChatNum;
    var couponValue = req.query.couponValue || 0;
    if (!commonUtil.isUUID24bit(appUserId) || !docChatNum || !commonUtil.isExist(appUser)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var needRecommendInfo = Number(req.query.needRecommendInfo || 0);
    var user;
    console.log('needRecommendInfo:', needRecommendInfo);
    CustomerService.getPublicInfoByDocChatNum(docChatNum)
        .then(function (_user) {
            if (!_user) {
                //apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
                throw ErrorHandler.getBusinessErrorByCode(1503);
            }
            return getPublicInfo(appUser, _user, couponValue, needRecommendInfo);
        })
        .then(function (_user) {
            apiHandler.OK(res, _user);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};
CustomerController.prototype.getInfoByDocId_new = function (req, res) {
    var identity = req.identity;// APP使用账户的身份
    var appUser = identity ? identity.user : {};
    var appUserId = (identity && identity.userId) ? identity.userId : '';
    var appUserDocId = (appUser && appUser.doctorRef && appUser.doctorRef._id) ? appUser.doctorRef._id : "";
    var docId = req.query.docId;
    var couponValue = req.query.couponValue || 0;
    var needRecommendInfo = Number(req.query.needRecommendInfo || 0);
    if (!commonUtil.isUUID24bit(appUserId) || !commonUtil.isUUID24bit(docId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var user;
    CustomerService.getPublicInfoByDocId(docId)
        .then(function (_user) {
            if (!_user) {
                return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
            }
            return getPublicInfo(appUser, _user, couponValue, needRecommendInfo);
        })
        .then(function (_user) {
            apiHandler.OK(res, _user);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

CustomerController.prototype.getInfoByDocChatNum = function (req, res) {
    var docChatNum = req.query.docChatNum;
    var user = req.identity.user;
    CustomerService.getPublicInfoByDocChatNum(docChatNum)
        .then(function (u) {
            if (!u) {
                apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
                var reg = new RegExp("^8");
                if (!reg.test(docChatNum)) {
                    // 号码升级提示短信
                    CustomerService.isOldDocChatNumExists(docChatNum)
                        .then(function (_cus) {
                            if (_cus && user && user.phoneNum) {
                                commonUtil.sendSms("1691932",
                                    appUser.phoneNum,
                                    "#_docChatNum#=" + commonUtil.stringifyDocChatNum(_cus._docChatNum)
                                    + "&#docChatNum#=" + commonUtil.stringifyDocChatNum(_cus.docChatNum)
                                    + "&#docChatNum2#=" + commonUtil.stringifyDocChatNum(_cus.docChatNum), false);
                                LoggerService.trace(LoggerService.getTraceDataByReq(req));
                            }
                        })
                }
            } else {
                u = JSON.parse(JSON.stringify(u));
                u.isFavorite = false;
                var doctorRefId = u.doctorRef && u.doctorRef._id ? u.doctorRef._id + '' : '';
                u.isFavorite = doctorRefId && user.favoriteDocs && user.favoriteDocs.indexOf(doctorRefId) > -1 ? true : false;
                console.log('favoriteDocs:', doctorRefId, user.favoriteDocs);
                apiHandler.OK(res, u);
            }
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

CustomerController.prototype.getInfoByDocId = function (req, res) {
    var docId = req.query.docId;

    CustomerService.getPublicInfoByDocId(docId)
        .then(function (u) {
            if (!u) {
                apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
            } else {
                console.log(u);
                apiHandler.OK(res, u);
            }
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

CustomerController.prototype.getInfoByPhone = function (req, res) {
    var phone = req.query.phoneNum;

    CustomerService.getInfoByPhone(phone)
        .then(function (u) {
            if (!u) {
                apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
            } else {
                console.log(u);
                apiHandler.OK(res, u);
            }
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

CustomerController.prototype.updateBaseInfo = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['userId'],
        optional: ["name", "channelCode", "avatar", "sex", "profile", "mainPageTitle", 'canSearched', 'isMarketingClosed'
            , "selectRegion"]
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var user;
        var resUser;
        var id = data.userId;
        delete data.userId;
        if (_.keys(data).length == 0) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8001));
        }

        data.updatedAt = Date.now();
        var updateData = {};
        CustomerService.getInfoByID(id)
            .then(function (u) {
                user = u;
                if (data.channelCode)
                    return ChannelService.getInfoByChannelCode(data.channelCode);
                return true;
            })
            .then(function (c) {
                if (!c) {
                    throw ErrorHandler.getBusinessErrorByCode(1208);
                }


                if (user.channelCode) { //用户的channelCode设置过，永远不可改变（防止前端再次发送channelCode进行修改）
                    delete data.channelCode;
                } else if (!user.channelCode && data.channelCode) { //初次设置邀请码送优惠券
                    updateData.channelCode = data.channelCode;
                    //getCouponByChannelCode(user);
                }

                if (data.profile) {
                    updateData.profile = data.profile;
                }
                if (data.name) {
                    updateData.realName = data.name;
                }
                if (data.avatar) {
                    updateData.avatar = data.avatar;
                }
                if (data.sex) {
                    updateData.sex = data.sex;
                }
                if (user.doctorRef && Object.keys(updateData).length > 0) {
                    return DoctorService.updateBaseInfo(user.doctorRef._id, updateData);
                }

            })
            .then(function () {
              if((data.name || data.avatar) && user.openId){
                //修改信息同步到用户中心
                const update = {};
                if(data.name){
                  update.name = data.name;
                }
                if(data.avatar){
                  update.avatar = data.avatar;
                }
                var user_info_update = Backend.service('user_center', 'handle_user_center').user_info_update;
                user_info_update(user.openId, update)
                .then(function (_res) {
                  console.log(_res);
                })
                .catch(function(err){
                    console.log(err);
                })
              }
            })
            .then(function (v) {
                if (data.name) {
                    updateData.name = data.name;
                }
                if (data.mainPageTitle) {
                    updateData.mainPageTitle = data.mainPageTitle;
                }
                if (typeof data.canSearched == 'boolean') {
                    updateData.canSearched = data.canSearched;
                }
                if (typeof data.isMarketingClosed == 'boolean') {
                    updateData['marketing.isMarketingClosed'] = data.isMarketingClosed;
                }
                if (data.selectRegion) {
                    updateData.selectRegion = data.selectRegion
                }
                if (Object.keys(updateData).length > 0)
                    return CustomerService.updateBaseInfo(id, updateData);
            })
            .then(function (u) {
                //console.log(u);
                if (u) {
                    u = JSON.parse(JSON.stringify(u));
                    if (u.momentRef) {
                        console.log("this is moment");
                        delete u.momentRef;
                        console.log(u.momentRef);
                    }
                    resUser = u;
                } else {
                    resUser = user;
                }
            })
            .then(function () {
                apiHandler.OK(res, resUser);

                var zlucare_service = require('./../services/zlycareService');
                zlucare_service.updateUser(resUser._id, resUser.name).then(function () {
                })
            }, function (err) {
                console.log(err);
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

//下载页面领取优惠券
CustomerController.prototype.getCouponByPhone = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['authCode', 'name', 'phoneNum', 'docChatNum'],
        optional: ["channelCode"]
    };

    var deviceId = req.headers[ClientAuth.HEADER.DEVICE_MARK] || "";

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var user;

        ValidateService.validateByPhone(data.phoneNum, data.authCode)
            .then(function (v) {
                return CustomerService.validUser(data.phoneNum, data.name, deviceId, 'web');
            })
            .then(function (u) {
                if (!u) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                } else {
                    user = u;

                    if (!user.channelCode && data.channelCode)
                        return ChannelService.getInfoByChannelCode(data.channelCode);
                }
            })
            .then(function (c) {
                // FIXME: @yichen @liuyong  此处更新后的规则是什么?? 没有渠道号 获取 两张5元优惠券???
                if (c && !user.channelCode) {  //渠道号存在&用户没有输入过渠道号
                    return getCouponByChannelCode(user);  // 获得30元代金券
                } else {
                    return getTenRMBCoupon(user);  //获得10元代金券
                }
            })
            .then(function () {
                apiHandler.OK(res);
                LoggerService.trace(LoggerService.getTraceDataByReq(req)); //和发送验证码的log一起用，不能删
            }, function (err) {
                console.log(err);
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

//下载页面领取优惠券
CustomerController.prototype.getCouponByFriend = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['authCode', 'name', 'phoneNum', 'userId']
    };
    var deviceId = req.headers[ClientAuth.HEADER.DEVICE_MARK] || "";

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var inviter, invitee;
        CustomerService.getInfoByID(data.userId)
            .then(function (u) {
                if (!u) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                } else {
                    inviter = u;
                    return CustomerService.getInfoByPhone(data.phoneNum);
                }
            })
            .then(function (u) {
                if (u) {//不是新用户
                    throw ErrorHandler.getBusinessErrorByCode(1701);
                }
                return ValidateService.validateByPhone(data.phoneNum, data.authCode)
            })
            .then(function (v) {
                // TODO: add referrer 添加介绍人字段
                return CustomerService.validUser(data.phoneNum, data.name, deviceId, 'friendShare', inviter._id);
            })
            .then(function (c) {
                if (!c) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                }
                invitee = c;
                //获得优惠券
                getTenRMBShareCoupon(inviter, invitee);
                apiHandler.OK(res);
                LoggerService.trace(LoggerService.getTraceDataByReq(req));
            }, function (err) {
                console.log(err);
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

//双12领取优惠券
CustomerController.prototype.getCouponByDouble12 = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['authCode', 'phoneNum']
    };
    var deviceId = req.headers[ClientAuth.HEADER.DEVICE_MARK] || "";
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        CustomerService.getInfoByPhone(data.phoneNum)
            .then(function (u) {
                if (u) {
                    throw ErrorHandler.getBusinessErrorByCode(1202);
                } else {
                    return ValidateService.validateByPhone(data.phoneNum, data.authCode)
                }
            })
            .then(function (v) {
                return CustomerService.validUser(data.phoneNum, "", deviceId, 'double12');
            })
            .then(function (c) {
                if (!c) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                }
                getOneHundredRMBShareCoupon(c);
                commonUtil.sendSms("1637338", c.phoneNum,
                    "#money#=" + "100", true);
                apiHandler.OK(res);
                LoggerService.trace(LoggerService.getTraceDataByReq(req));
            }, function (err) {
                console.log(err);
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

//设置支付密码
CustomerController.prototype.setPayPwd = function (req, res) {
    var payload = req.body;
    var userId = req.identity && req.identity.userId;
    var version = req.identity.appVersion;
    var appUser = req.identity && req.identity.user ? req.identity.user : '';
    if (!commonUtil.isUUID24bit(userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var fields = {
        required: ['authCode', 'phoneNum', 'payPwd']
    };
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {

        ValidateService.validateByPhone(data.phoneNum, data.authCode)
            .then(function (v) {
                return CustomerService.setPayPWD(userId, data.payPwd);
            })
            .then(function (u) {
                    console.log(u);
                    apiHandler.OK(res);
                    LoggerService.trace(LoggerService.getTraceDataByReq(req)); //和发送验证码的log一起用，不能删
                },
                function (err) {
                    console.log(err);
                    apiHandler.handleErr(res, err);
                });

    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

CustomerController.prototype.getStatusDouble12 = function (req, res) {
    console.log("come in")
    var phoneNum = req.query.phoneNum;

    CouponService.getCouponByPhoneAndActivityNo(phoneNum, constants.COUPON_ACTIVITYNO_DOUBLE12)
        .then(function (u) {
            if (!u) {
                apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1602));
            } else {
                console.log(u);
                apiHandler.OK(res, u);
            }
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

CustomerController.prototype.getCalleePrice = function (req, res) {
    console.log("come in")
    var calleeId = req.query.calleeId;

    CustomerService.getInfoByID(calleeId)
        .then(function (u) {
            if (!u) {
                apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
            } else {
                if (u.doctorRef) {
                    apiHandler.OK(res, u.doctorRef.callPrice);
                } else {
                    console.log(222222)
                    var callPrice = {
                        "incomePerMin": 0,
                        "paymentPerMin": 0,
                        "initiateIncome": 0,
                        "initiatePayment": 0,
                        "doctorInitiateTime": 5,
                        "customerInitiateTime": 5
                    }
                    apiHandler.OK(res, callPrice);
                }

            }
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};


//双12 获得100元代金券
var getOneHundredRMBShareCoupon = function (user) {
    var coupon_user = {
        activityNO: constants.COUPON_ACTIVITYNO_DOUBLE12,
        title: '优惠券(双十二医生专用)',
        type: 4,
        subTitle: '',
        description: '',
        manual: '',
        rmb: constants.COUPON_ACTIVITYNO_DOUBLE12_RMB,
        rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_DOUBLE12_RMB,
        expiredAt: Date.now() + constants.COUPON_ACTIVITYNO_DOUBLE12_TIME,
        boundUserId: user._id,
        boundUserName: user.name,
        boundUserPhoneNum: user.phoneNum
    };

    //送代金券
    CouponService.createCoupon(coupon_user);
    //commonUtil.sendSms("1616174", user.phoneNum, "#money#=" +
    //constants.COUPON_ACTIVITYNO_DOUBLE12_RMB + "&#url#=" +
    //constants.customerPublicDownloadURL);
};
//通过短信验证关注医生
CustomerController.prototype.msgFollowDoc = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['authCode', 'name', 'phoneNum', 'docChatNum'],
        optional: ["channelCode"]
    };

    var deviceId = req.headers[ClientAuth.HEADER.DEVICE_MARK] || "";

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var user, doctor;

        ValidateService.validateByPhone(data.phoneNum, data.authCode)
            .then(function (v) {
                return CustomerService.validUser(data.phoneNum, data.name, deviceId, 'web');
            })
            .then(function (u) {
                if (!u) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                } else {
                    user = u;
                    return DoctorService.getAllInfoByDocChatNum(data.docChatNum);
                }
            })
            .then(function (d) {
                if (!d) {
                    throw ErrorHandler.getBusinessErrorByCode(1205);
                } else {
                    //console.log("contains:" + _.contains(user.favoriteDocs, "" + d._id));

                    doctor = d;

                    if (!_.contains(user.favoriteDocs, "" + doctor._id)) //医生未被收藏则收藏
                        return CustomerService.favoriteDoc(user._id, doctor._id);
                }
            })
            .then(function (c) {
                if (c) {
                    DoctorService.modifyFavoritedNum(doctor._id, 1); //修改收藏数
                    doctor.favoritedNum += 1;
                }

                if (!_.contains(user.collectedDocs, "" + doctor._id)) { //首次收藏发送短信
                    DoctorService.sendFavoritedSms(doctor, user);
                }

                if (!user.channelCode && data.channelCode)
                    return ChannelService.getInfoByChannelCode(data.channelCode);
            })
            .then(function (c) {
                if (c && !user.channelCode) {  //渠道号存在&用户没有输入过渠道号

                    getCouponByChannelCode(user);
                    CustomerService.updateBaseInfo(user._id, {"channelCode": data.channelCode});
                }
            })
            .then(function () {
                apiHandler.OK(res);
                LoggerService.trace(LoggerService.getTraceDataByReq(req)); //和发送验证码的log一起用，不能删
            }, function (err) {
                console.log(err);
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

//获得30元代金券
var getCouponByChannelCode = function (user) {
    //return CouponService.getCouponByPhoneAndActivityNo(user.phoneNum, constants.COUPON_ACTIVITYNO_FAVORITE)
    //  .then(function (c) {
    //    if (c) { //已领取过
    //      throw ErrorHandler.getBusinessErrorByCode(1601);
    //    } else {
    //      var coupon1 = {
    //        activityNO: constants.COUPON_ACTIVITYNO_FAVORITE,
    //        title: '代金券',
    //        subTitle: '',
    //        description: '',
    //        manual: '',
    //        rmb: constants.COUPON_ACTIVITYNO_FAVORITE_RMB_5,
    //        rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_FAVORITE_RMB_5,
    //        expiredAt: Date.now() + constants.COUPON_ACTIVITYNO_FAVORITE_TIME,
    //        boundUserId: user._id,
    //        boundUserName: user.name,
    //        boundUserPhoneNum: user.phoneNum
    //      };
    //
    //      var coupon2 = {
    //        activityNO: constants.COUPON_ACTIVITYNO_FAVORITE,
    //        type: 3,
    //        title: '代金券(种子医生专用)',
    //        subTitle: '每日前十单可使用',
    //        description: '',
    //        manual: '',
    //        rmb: constants.COUPON_ACTIVITYNO_FAVORITE_RMB_20,
    //        rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_FAVORITE_RMB_20,
    //        expiredAt: Date.now() + constants.COUPON_ACTIVITYNO_FAVORITE_TIME,
    //        boundUserId: user._id,
    //        boundUserName: user.name,
    //        boundUserPhoneNum: user.phoneNum
    //      };
    //
    //      //送代金券
    //      CouponService.createCoupon(coupon1);
    //      CouponService.createCoupon(coupon1);
    //      CouponService.createCoupon(coupon2);
    //
    //      commonUtil.sendSms("1616174", user.phoneNum, "#money#=" + constants.COUPON_ACTIVITYNO_FAVORITE_RMB + "&#url#=" + constants.customerPublicDownloadURL);
    //    }
    //  });
};

//获得10元代金券
var getTenRMBCoupon = function (user) {
    return CouponService.getCouponByPhoneAndActivityNo(user.phoneNum, constants.COUPON_ACTIVITYNO_NEWUSER)
        .then(function (c) {
            if (c) { //已领取过
                throw ErrorHandler.getBusinessErrorByCode(1601);
            } else {
                var coupon1 = {
                    activityNO: constants.COUPON_ACTIVITYNO_NEWUSER,
                    title: '代金券',
                    subTitle: '',
                    description: '',
                    manual: '',
                    rmb: constants.COUPON_ACTIVITYNO_NEWUSER_RMB_5,
                    rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_NEWUSER_RMB_5,
                    expiredAt: Date.now() + constants.COUPON_ACTIVITYNO_NEWUSER_TIME,
                    boundUserId: user._id,
                    boundUserName: user.name,
                    boundUserPhoneNum: user.phoneNum
                };

                //送代金券
                CouponService.createCoupon(coupon1);
                CouponService.createCoupon(coupon1);

                commonUtil.sendSms("1616174", user.phoneNum, "#money#=" + constants.COUPON_ACTIVITYNO_NEWUSER_RMB + "&#url#=" + constants.customerPublicDownloadURL);
            }
        });
};
//分享 获得10元代金券
var getTenRMBShareCoupon = function (inviter, invitee) {
    return CouponService.getCouponByPhoneAndActivityNo(invitee.phoneNum, constants.COUPON_ACTIVITYNO_SHARE)
        .then(function (c) {
            if (c) { //已领取过
                //重新定义错误码 !!
                throw ErrorHandler.getBusinessErrorByCode(1601);
            } else {
                var coupon_inviter = {
                    activityNO: constants.COUPON_ACTIVITYNO_SHARE,
                    title: '电话代金券',
                    subTitle: '',
                    description: '',
                    manual: '',
                    rmb: constants.COUPON_ACTIVITYNO_SHARE_RMB_2,
                    rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_SHARE_RMB_2,
                    expiredAt: Date.now() + constants.COUPON_ACTIVITYNO_SHARE_TIME,
                    boundUserId: inviter._id,
                    boundUserName: inviter.name,
                    boundUserPhoneNum: inviter.phoneNum
                };

                var coupon_invitee = {
                    activityNO: constants.COUPON_ACTIVITYNO_SHARE,
                    title: '电话代金券',
                    subTitle: '',
                    description: '',
                    manual: '',
                    rmb: constants.COUPON_ACTIVITYNO_SHARE_RMB_2,
                    rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_SHARE_RMB_2,
                    expiredAt: Date.now() + constants.COUPON_ACTIVITYNO_SHARE_TIME,
                    boundUserId: invitee._id,
                    boundUserName: invitee.name,
                    boundUserPhoneNum: invitee.phoneNum
                };

                //送代金券
                CouponService.createCoupon([coupon_inviter, coupon_invitee]);
                commonUtil.sendSms("1616174", inviter.phoneNum, "#money#=" + constants.COUPON_ACTIVITYNO_SHARE_RMB + "&#url#=" + constants.customerPublicDownloadURL);
                commonUtil.sendSms("1616174", invitee.phoneNum, "#money#=" + constants.COUPON_ACTIVITYNO_SHARE_RMB + "&#url#=" + constants.customerPublicDownloadURL);
            }
        });
};

//所有收藏的医生
CustomerController.prototype.getFavoriteDocs = function (req, res) {
    var userId = req.identity ? req.identity.userId : "";
    if (!commonUtil.isUUID24bit(userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE_2K, {pinyinName: 1});
    var user;
    var doctors = [];
    var favDocIds = [];
    CustomerService.getInfoByID(userId)
        .then(function (u) {

            if (!u) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            } else {
                user = u;
                favDocIds = _.filter(u.favoriteDocs || [], function (d) {
                    return commonUtil.isUUID24bit(d);
                });
                return DoctorService.getUsersByIDsCreatedAtASC(favDocIds, pageSlice);
            }
        })
        .then(function (docs) {
            doctors = _.indexBy(docs, '_id');
            return CustomerService.getUsersByDocIDsCreatedAtASC(favDocIds, pageSlice);
        })
        .then(function (data) {
            data = JSON.parse(JSON.stringify(data));
            for (var j = 0; j < data.length; j++) {
                if (!data[j] || !data[j].doctorRef) {
                    data[j].docChatNum = '';
                    continue;
                }
                var doctorRef = doctors[data[j].doctorRef + ''];
                if (!doctorRef || !doctorRef._id) {
                    delete data[j].doctorRef;
                    if (data[j].docChatNum) {
                        data[j].docChatNum = '';
                    }
                    continue;
                }
                doctorRef['callPriceDescription'] = DoctorService.callPriceDescription(doctorRef);
                doctorRef['commentNum'] = doctorRef.commentNum || 0;
                doctorRef['zanNum'] = doctorRef.zanNum || 0;
                doctorRef['profile'] = doctorRef.profile || '';
                doctorRef['favoriteNum'] = doctorRef.favoritedNum;
                data[j].doctorRef = doctorRef;
            }
            apiHandler.OK(res, data);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

CustomerController.prototype.favoriteDoc = function (req, res) {
    var payload = req.body;
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var fields = {
        required: ['docChatNum']
    };
    var doctor;

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        CustomerService.getInfoByDocChatNum(data.docChatNum)
            .then(function (d) {
                if (!d || !d.doctorRef || !d.doctorRef._id) {
                    throw ErrorHandler.getBusinessErrorByCode(1205);
                } else {
                    doctor = d.doctorRef;
                    if (user.favoriteDocs && user.favoriteDocs.length >= 2000) { //限制最多只能收藏2000个
                        throw ErrorHandler.getBusinessErrorByCode(2001);
                    }
                    if (!_.contains(user.favoriteDocs, "" + doctor._id)) {   //医生未被收藏则收藏
                        console.log("favorite user doctorRef id", doctor._id);
                        CustomerService.changeDocsPushState(user._id, [doctor._id], false);
                        return CustomerService.favoriteDoc(userId, doctor._id);
                    }
                    console.log("already favorite");
                }
            })
            .then(function (c) {
                if (c) {
                    DoctorService.modifyFavoritedNum(doctor._id, 1); //修改收藏数
                    doctor.favoritedNum += 1;
                }
                var hisFavs = user.collectedDocs || [];
                if (!_.contains(hisFavs, "" + doctor._id)) { //首次收藏
                    req.body[constants.PARAM_IS_1ST_FV] = true; // 标记首次收藏,log存储
                    var hisLen = hisFavs.length;
                    if (hisLen == 0 || (hisLen == 1 && hisFavs[0] == constants.DoctorId_00120)) {
                        // 首次收藏
                        req.body[constants.PARAM_IS_INVITER_FV] = true; // 标记首次收藏,log存储
                    }
                    DoctorService.sendFavoritedSms(doctor, user);
                }
            })
            .then(function () {
                apiHandler.OK(res);
                req.body.doctorId = doctor._id;
                req.body[constants.PARAM_CUSTOMER_PHONE] = user.phoneNum;
                req.body[constants.PARAM_DOCTOR_PHONE] = doctor.phoneNum;

                LoggerService.trace(LoggerService.getTraceDataByReq(req));
            }, function (err) {
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

CustomerController.prototype.favoriteDoc_new = function (req, res) {
    var payload = req.body;
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isUUID24bit(user.doctorRef && user.doctorRef._id || '') || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var fields = {
        required: ['docChatNum']
    };
    var favUser, doctor;

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        CustomerService.getInfoByDocChatNum(data.docChatNum)
            .then(function (d) {
                if (!d || !d.doctorRef || !d.doctorRef._id) {
                    throw ErrorHandler.getBusinessErrorByCode(1205);
                } else {
                    favUser = d;
                    doctor = d.doctorRef;
                    return SocialRelService.getFavoriteCountById(userId);
                }
            })
            .then(function (_count) {
                if (_count >= 2000) { //限制最多只能收藏2000个
                    throw ErrorHandler.getBusinessErrorByCode(2001);
                }
                return SocialRelService.getRelByUserId(userId, favUser._id);
            })
            .then(function (_rel) {
                if (!_rel) {
                    var relData = {
                        user: userId,
                        userDoctorRef: user.doctorRef._id,
                        userDocChatNum: user.docChatNum,
                        relUser: favUser._id,
                        relUserDoctorRef: favUser.doctorRef._id,
                        relUserDocChatNum: favUser.docChatNum,
                        isRelUserFavorite: true,
                        theTrueRelCreatedAt: Date.now()
                    }
                    SocialRelService.createRel(relData);
                } else {
                    if (!_rel.isRelUserFavorite) {
                        SocialRelService.updateRel({_id: _rel._id}, {
                            isRelUserFavorite: true,
                            isRelUserBlacked: false,
                            isRelUserBlocked: false,
                            theTrueRelCreatedAt: Date.now()
                        });
                    }
                    console.log("already favorite");
                }
                if (!_.contains(user.favoriteDocs, "" + doctor._id)) {   //医生未被收藏则收藏
                    console.log("favorite user doctorRef id", doctor._id);
                    CustomerService.changeDocsPushState(user._id, [doctor._id], false);
                    return CustomerService.favoriteDoc(userId, doctor._id);
                }
            })
            .then(function (c) {
                if (c) {
                    DoctorService.modifyFavoritedNum(doctor._id, 1); //修改收藏数
                    doctor.favoritedNum += 1;
                }
                var hisFavs = user.collectedDocs || [];
                if (!_.contains(hisFavs, "" + doctor._id)) { //首次收藏
                    req.body[constants.PARAM_IS_1ST_FV] = true; // 标记首次收藏,log存储
                    var hisLen = hisFavs.length;
                    if (hisLen == 0 || (hisLen == 1 && hisFavs[0] == constants.DoctorId_00120)) {
                        // 首次收藏
                        req.body[constants.PARAM_IS_INVITER_FV] = true; // 标记首次收藏,log存储
                    }
                    DoctorService.sendFavoritedSms(doctor, user);
                }
            })
            .then(function () {
                apiHandler.OK(res);
                req.body.doctorId = doctor._id;
                req.body[constants.PARAM_CUSTOMER_PHONE] = user.phoneNum;
                req.body[constants.PARAM_DOCTOR_PHONE] = doctor.phoneNum;

                LoggerService.trace(LoggerService.getTraceDataByReq(req));
            }, function (err) {
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

CustomerController.prototype.cancelFavoriteDoc = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var docChatNum = req.query.docChatNum;
    if (!commonUtil.isUUID24bit(userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }

    var user, doctor;
    CustomerService.getInfoByID(userId)
        .then(function (u) {
            if (!u) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            } else {
                user = u;
                return CustomerService.getInfoByDocChatNum(docChatNum);
            }
        })
        .then(function (d) {
            if (!d || !d.doctorRef || !d.doctorRef._id) {
                throw ErrorHandler.getBusinessErrorByCode(1205);
            } else {
                doctor = d.doctorRef;
                console.log("contains:" + _.contains(user.favoriteDocs, "" + doctor._id));

                if (_.contains(user.favoriteDocs, "" + doctor._id)) {//医生被收藏则取消收藏
                    SocialRelService.updateRelByCond({
                        user: userId,
                        relUser: d._id
                    }, {isRelUserFavorite: false});
                    CustomerService.changeDocsPushState(userId, [doctor._id], false);
                    return CustomerService.cancelFavoriteDoc(userId, doctor._id);
                }
            }
        })
        .then(function (c) {
            if (c && doctor.favoritedNum > 0)
                return DoctorService.modifyFavoritedNum(doctor._id, -1); //修改收藏数
        })
        .then(function () {
            apiHandler.OK(res);
            LoggerService.trace(LoggerService.getTraceDataByReq(req));
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

//批量收藏医生
CustomerController.prototype.favoriteDoctors = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['userId', 'docIds']
    };

    var favoriteDocs = new Array();
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        CustomerService.getInfoByID(data.userId)
            .then(function (u) {
                if (!u) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                } else {

                    for (var i = 0; i < data.docIds.length; i++) {
                        console.log("contains:" + _.contains(u.favoriteDocs, data.docIds[i]));

                        if (!_.contains(u.favoriteDocs, data.docIds[i]) && commonUtil.isUUID24bit(data.docIds[i])) //医生未被收藏则收藏
                            favoriteDocs.push(data.docIds[i]);
                    }

                    if (favoriteDocs.length > 0)
                        CustomerService.changeDocsPushState(data.userId, favoriteDocs, false);
                    return CustomerService.favoriteDocs(data.userId, favoriteDocs);
                }
            })
            .then(function (c) {
                if (c) {
                    return DoctorService.modifyListDoctorFavoritedNum(favoriteDocs, 1); //批量修改收藏数
                }
            })
            .then(function () {
                apiHandler.OK(res);
            }, function (err) {
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};


/**
 *
 * @param req
 * @param res
 */
CustomerController.prototype.callDoc = function (req, res) {
    var callBothType = '';
    var userId = req.identity ? req.identity.userId : "";
    if (!commonUtil.isUUID24bit(userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var payload = req.body;
    var fields = {
        required: ['calleeId', 'callWay'],
        optional: ['deviceId']
    };

    var caller, callee, orderId, accountAmount, coupon,
        callerRefId, calleeRefId, callerRef, calleeRef, calleeNoteName;
    var couponRMB = 0, maxTime = 0, maxMinute = 0;
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var callWay = data.callWay || 'call_both';
        data.userId = userId;
        var updateOrder;
        if (callWay == 'voip') {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1818));
        }
        ;
        CustomerService.getInfoByID(data.userId)
            .then(function (u) {
                if (!u) {
                    throw ErrorHandler.getBusinessErrorByCode(1503); //用户不存在
                } else {
                    caller = u;
                    if (callWay == 'voip' && (!u.accid || !u.callToken)) {
                        throw ErrorHandler.getBusinessErrorByCode(1807); //
                    }
                    return CustomerService.getAllInfoByID(data.calleeId); //查询被叫是否存在 TODO: 限制哪些字段
                }
            })
            .then(function (d) {
                callee = d;
                if (callee.blackList && callee.blackList.indexOf(data.userId + '') > -1) {
                    throw ErrorHandler.getBusinessErrorByCode(1813);
                }
                if (!callee) {
                    throw ErrorHandler.getBusinessErrorByCode(1205);//空号
                }
                //var isCalleeFrozen = callee.frozen ? true : false;
                if (callee.frozen) {
                    throw ErrorHandler.getBusinessErrorByCode(1209);//号码被冻结
                }
                console.log('callWay', callWay, callee.accid, callee.callToken);
                if (caller.phoneNum == callee.phoneNum) {
                    throw ErrorHandler.getBusinessErrorByCode(1812); //不可给自己拨打电话
                }
                var order = {};

                if (callWay == 'voip') {
                    order.callWay = 'voip';
                    order.callerAccid = caller.accid;
                    order.calleeAccid = callee.accid;
                }
                order.callerId = caller._id + '';
                order.callerRefId = caller.doctorRef && caller.doctorRef._id ? caller.doctorRef._id : '';
                order.callerName = caller.name;
                order.callerPhoneNum = caller.phoneNum;
                order.callerDocChatNum = caller.docChatNum || '';
                order.callerDeviceId = data.deviceId || '';
                order.callerSex = caller.sex || '';
                order.callerAvatar = caller.avatar;

                order.calleeId = callee._id + '';
                order.calleeRefId = callee.doctorRef && callee.doctorRef._id ? callee.doctorRef._id : '';
                order.calleeName = callee.name;
                order.calleePhoneNum = callee.phoneNum;
                order.calleeDocChatNum = callee.docChatNum || '';
                order.calleeSex = callee.sex || '';
                order.calleeAvatar = callee.avatar;

                callee.callPrice = (callee.doctorRef && callee.doctorRef.callPrice) ? callee.doctorRef.callPrice : constants.FREE_CALL_PRICE;
                order.callPrice = callee.callPrice;

                //order.isSeedDoctor = doctor.seedDoctor;
                //order.seedDoctorCouponUnlimited = doctor.seedDoctorCouponUnlimited;


                return OrderService.createOrder(order); //生成订单
            })
            .then(function (o) {
                calleeRefId = callee.doctorRef && callee.doctorRef._id ? callee.doctorRef._id : '';
                callerRefId = caller.doctorRef && caller.doctorRef._id ? caller.doctorRef._id : '';
                if (calleeRefId) {
                    DoctorService.addOrderNum(calleeRefId);
                }
                orderId = o._id;

                return TransactionMysqlService.getAccountByUserIdAndDoctorId(caller._id + '', callerRefId + '');//查询资金账户
            })
            .then(function (account) {
                console.log("account:" + JSON.stringify(account));
                accountAmount = account.amount;
                //有欠费订单
                if (accountAmount < 0) {
                    throw ErrorHandler.getBusinessErrorByCode(1402);
                }
                calleeRef = callee.doctorRef;
                callee.seedDoctor = calleeRef && calleeRef.seedDoctor ? true : false;
                callee.seedDoctorCouponUnlimited = calleeRef && calleeRef.seedDoctorCouponUnlimited || false;
                if (callee.seedDoctor && !callee.seedDoctorCouponUnlimited)
                    return OrderService.countC2DOrderUseSeedCoupon(callee._id);
                return {today: 0, all: 0};
            }).then(function (_count) {
            console.log("_count:" + JSON.stringify(_count));
            var isSeedCouponOK = calleeRef && calleeRef.seedDoctor ? true : false;
            if (_count.today >= constants.SeedDoctorCouponLimitPerDay || _count.all >= constants.SeedDoctorCouponLimitAll)
                isSeedCouponOK = false;

            var double12Doctor = calleeRef && calleeRef.double12Doctor ? true : false;
            //金额降序查询所有可用电话优惠券
            return CouponService.getRMBSortValidUsableAllPhoneCouponsByUerId(caller._id, isSeedCouponOK, double12Doctor, true);
        })
            .then(function (coupons) {
                //console.log("coupons:" + JSON.stringify(coupons));

                if (coupons && coupons[0]) {
                    coupon = coupons[0];
                    couponRMB = coupons[0].rmb;
                    console.log("coupon 0 :" + coupon);
                }

                //  return OrderService.getArrearPhoneOrder(caller._id, data.deviceId); //查询是否有欠费订单,包含双向回拨和voip
                //})
                //.then(function (order) {
                //  if (order) {
                //    throw ErrorHandler.getBusinessErrorByCode(1402);//有欠费订单
                //  }

                console.log("couponRMB:" + couponRMB);
                if ((accountAmount + couponRMB) < CustomerService.callMinimumPrice(callee)) {
                    var err = ErrorHandler.getBusinessErrorByCode(1305); //余额不足
                    //err.message += "\n" + callee.name + "的咨询费用为" + callee.callPrice.customerInitiateTime + "分钟内" + callee.callPrice.initiatePayment + "元，超出部分" + callee.callPrice.paymentPerMin + "元/分钟";
                    //if (callee.callPrice.discount < 1)
                    //err.message += "\n当前折扣：" + callee.callPrice.discount * 10 + "折";
                    throw err; //余额不足
                }
            })
            .then(function () {
                //如果被叫有附表,取附表的上下班状态;否则,无附表默认为上线状态
                callee.isOnline = calleeRef ? calleeRef.isOnline : true;
                //自动离线信息
                var isOfflineTime = CustomerService.isOfflineTime(callee.offlineBeginTime, callee.offlineEndTime);
                console.log('isOfflineTime:', isOfflineTime);
                if (!callee.isOnline || (callee.isAutoOffline && isOfflineTime))
                    throw ErrorHandler.getBusinessErrorByCode(1301); //医生不在线
                else {
                    if (callWay == 'voip' && (!callee.accid || !callee.callToken)) {
                        throw ErrorHandler.getBusinessErrorByCode(1808); //被叫需要更新到支持voip的版本
                    }

                    if ((callee.callPrice.initiatePayment + callee.callPrice.paymentPerMin) > 0)   //如果被叫收钱，通话中则锁订单；不收钱，不锁订单
                        return OrderService.getBusyPhoneOrder(caller._id, callee._id, orderId);
                }
            })
            .then(function (order) {
                if (order)
                    throw ErrorHandler.getBusinessErrorByCode(1302);//通话正忙

                maxTime = constants.callbackMaxCallTime;//免费电话最长通话1h
                var otherOptions = {};
                otherOptions.countDownTime = constants.callback1Min;

                if ((callee.callPrice.initiatePayment + callee.callPrice.paymentPerMin) > 0) {
                    maxTime = OrderService.getCustomerCanPayCallTime(accountAmount + couponRMB, callee.callPrice);
                    //if (accountAmount == 0) {
                    //  maxTime = constants.callback15MinCallTime;
                    //} else {
                    //  var tmpTime = OrderService.getCustomerCanPayCallTime(accountAmount + couponRMB, callee.callPrice);
                    //  console.log("tapTime：" + tmpTime);
                    //  maxTime = constants.callback30MinCallTime > tmpTime ? constants.callback30MinCallTime : tmpTime;
                    //}
                }
                console.log('maxTime:', maxTime);
                if (callWay == 'call_both') {
                    callBothType = CallbackService.getCallBothType(caller.callBothType || callee.callBothType || '', caller.phoneNum, callee.phoneNum);
                    if (!callBothType || callBothType == 'yuntongxun') {
                        return CallbackService.callback(caller.phoneNum, callee.phoneNum, maxTime, false, otherOptions); //双向回拨
                    } else {
                        maxMinute = Math.floor(maxTime / 60);
                        console.log('maxMinute:', maxMinute);
                        return CallbackService.callback_feiyu(caller.phoneNum, callee.phoneNum, maxMinute, orderId, false, {}); //feiyu双向回拨
                    }

                } else if (callWay == 'voip') {
                    return;
                }
            })
            .then(function (callback) {
                var updateData = {
                    callStatus: "busy",
                    maxTime: callBothType == 'feiyucloud' ? maxMinute * 60 : maxTime
                };
                if (callWay == 'call_both') {
                    if (!callBothType || callBothType == 'yuntongxun') {
                        console.log("callSid:" + callback.callSid);
                        if (!callback || !callback.callSid) {
                            throw ErrorHandler.getBusinessErrorByCode(1816);
                        }
                        updateData.channelId = callback.callSid;
                    } else {
                        callback = callback ? JSON.parse(callback) : null;
                        console.log('callback:', callback, typeof callback);
                        if (!callback || !callback.result || !callback.result.fyCallId) {
                            throw ErrorHandler.getBusinessErrorByCode(1816);
                        }
                        updateData.appId = callback.appId || '';
                        updateData.channelId = callback.result.fyCallId;
                        updateData.provider = 'feiyucloud';
                        updateData.callerShowNum = callback.showNumObj && callback.showNumObj.callerShowNum || '';
                        updateData.calleeShowNum = callback.showNumObj && callback.showNumObj.calleeShowNum || '';
                    }
                }
                return OrderService.updateOrderInfo(orderId, updateData); //设置callbackId
            })
            .then(function (o) {
                updateOrder = o;
                return SocialRelService.getNoteNameByIds(userId, [data.calleeId]);
            })
            .then(function (_calleeNoteName) {
                calleeNoteName = _calleeNoteName
                return SocialRelService.getNoteNameByIds(data.calleeId, [userId])
            })
            .then(function (_noteName) {
                data = {};
                if (callWay == 'call_both') {
                    data.msg = "请注意接听回拨电话" + constants.callbackPhone;
                    data.orderId = updateOrder._id;
                } else if (callWay == 'voip') {
                    data = {
                        callerAccid: caller.accid,
                        callerToken: caller.callToken,
                        callTime: maxTime,
                        calleeAccid: callee.accid,
                        callerName: _noteName[0] && _noteName[0].noteInfo && _noteName[0].noteInfo.noteName || caller.name || '',
                        calleeName: calleeNoteName[0] && calleeNoteName[0].noteInfo && calleeNoteName[0].noteInfo.noteName || callee.name || '',
                        calleeAvatar: callee.avatar || '',
                        calleeDocChatNum: callee.docChatNum,
                        calleeSex: callee.sex || '',
                        orderId: updateOrder._id
                    };
                    //成功发起voip通话提示
                    var callerUserName = caller.name + ((callerRefId && caller.docChatNum) ? '(' + commonUtil.stringifyDocChatNum(caller.docChatNum) + ')' : '');
                    commonUtil.sendSms("1697458", callee.phoneNum, "#user#=" + callerUserName);
                }
                apiHandler.OK(res, data);
            }, function (err) {
                console.log("err-" + err.code);
                apiHandler.handleErr(res, err);

                if (orderId != null)
                    OrderService.updateOrderInfo(orderId, {
                        callStatus: 'failed',
                        failedReason: err.code
                    });

                if (err.code == 1302 && calleeRefId)//纪录通话中拨号的患者，电话结束后短信通知
                    DoctorService.addBusyCallers(calleeRefId, caller.phoneNum);

                var sendPhone = (serverConfigs.env == 1) ? callee.phoneNum : constants.zly400Phone;
                if (err.code == 1808 && calleeRefId) //网络电话联系医生失败短信提示
                    commonUtil.sendSms("1640790", sendPhone, "#doctorName#=" + callee.name + "&#customerName#=" + caller.name);


                if (err.code == 1301 && calleeRefId) { //因医生未在线造成无法发起400回拨时，纪录到医生表中,并且短信通知医生
                    DoctorService.addOfflineCallers(calleeRefId, caller.phoneNum)
                        .then(function () {
                            callee.latestOnLineNotifyAt = calleeRef && calleeRef.latestOnLineNotifyAt || 0;
                            var latestNotify = callee.latestOnLineNotifyAt || 0;
                            var now = Date.now();
                            if ((now - latestNotify) > constants.TIME30M) { //短信间隔大于30分钟

                                commonUtil.sendSms("930341", sendPhone, "#customerName#=" + caller.name +
                                    "&#url#=" + constants.doctorPublicDownloadURL);

                                if ((callee.callPrice.initiatePayment + callee.callPrice.paymentPerMin) > 0) {
                                    commonUtil.sendSms("1616032", constants.notifyPhones, "#customerName#=" + caller.name +
                                        "&#doctorName#=" + callee.name +
                                        "&#docChatNum#=" + commonUtil.stringifyDocChatNum(callee.docChatNum));
                                }

                                DoctorService.updateBaseInfo(calleeRefId, {latestOnLineNotifyAt: now});
                            }
                        });
                }
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

CustomerController.prototype.webCall = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['phoneNum', 'name', 'doctorId', 'from', 'type'],
        optional: ['timestamp', 'secret', 'authCode']
    };

    var doctor, customer, callee, orderId;
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var callWay = 'call_both';
        var fromMap = _.indexBy(constants.WEBCALL_TYPE, 'from');
        var fromObj = fromMap[data.from];
        if (fromObj) {
            if (data.secret) {
                if (!commonUtil.isAllExist([data.timestamp, data.secret])) {
                    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
                }
                var secData = "";
                secData += data.from;
                secData += data.timestamp;
                secData += data.type;
                if (data.phoneNum) {
                    secData += data.phoneNum;
                }
                if (data.name) {
                    secData += data.name;
                }
                var cacuSecret = commonUtil.commonMD5(secData, fromObj.salt);
                console.log(cacuSecret);
                if (cacuSecret != data.secret) {
                    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
                }
            }
        } else {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        //认证通过
        ValidateService.validateByPhoneWebCall(data.phoneNum, data.authCode, data.secret)
            .then(function (v) {
                return CustomerService.validUser(data.phoneNum, data.name, null, "webCall", "", data.from);
            })
            .then(function (u) {
                if (!u) {
                    throw ErrorHandler.getBusinessErrorByCode(8007);
                }
                customer = u;
                return CustomerService.getAllInfoByDocId(data.doctorId)
            })
            .then(function (d) {
                if (!d) {
                    throw ErrorHandler.getBusinessErrorByCode(1503); //用户不存在
                } else {
                    callee = d;
                    doctor = d.doctorRef;
                    var order = {};
                    order.callerId = customer._id + '';
                    order.callerName = customer.name;
                    order.callerPhoneNum = customer.phoneNum;
                    order.callerDocChatNum = customer.docChatNum;
                    order.callerDeviceId = data.deviceId || '';
                    order.callerSex = customer.sex || '';
                    order.callerAvatar = customer.avatar;

                    order.calleeId = d._id + '';
                    order.calleeRefId = d.doctorRef && d.doctorRef._id ? d.doctorRef._id : '';
                    order.calleeName = d.name;
                    order.calleePhoneNum = d.phoneNum;
                    order.calleeDocChatNum = d.docChatNum;
                    order.calleeSex = d.sex || '';
                    order.calleeAvatar = d.avatar;

                    var freeCallPrice = {
                        customerInitiateTime: 5,
                        doctorInitiateTime: 5,
                        initiatePayment: 0,
                        initiateIncome: 0,
                        paymentPerMin: 0,
                        incomePerMin: 0,
                        discount: 1
                    };
                    doctor.callPrice = d.doctorRef && d.doctorRef.callPrice || freeCallPrice;
                    order.callPrice = doctor.callPrice;
                    order.from = data.from;
                    return OrderService.createOrder(order); //生成订单
                }
            })
            .then(function (o) {
                //????
                DoctorService.addOrderNum(doctor._id);

                orderId = o._id;
                //  return OrderService.getBusyPhoneOrder(customer._id, doctor._id, orderId); //查询是否正忙
                //})
                //.then(function (order) {
                //  if (order)
                //    throw ErrorHandler.getBusinessErrorByCode(1304);//通话正忙
                //  if(callWay == 'call_both'){

                return CallbackService.callback(customer.phoneNum, callee.phoneNum, constants.callbackMaxCallTime, false); //双向回拨
                //}
            })
            .then(function (callback) {
                var updateData = {
                    callStatus: "busy"
                };
                if (callWay == 'call_both') {
                    console.log("callSid:" + callback.callSid);
                    updateData.channelId = callback.callSid;
                }
                return OrderService.updateOrderInfo(orderId, updateData); //设置callbackId
            })
            .then(function (o) {
                data = {};
                if (callWay == 'call_both') {
                    data.msg = "请注意接听回拨电话" + constants.callbackPhone;
                }
                apiHandler.OK(res, data);
            }, function (err) {
                console.log("err-" + err.code);
                apiHandler.handleErr(res, err);
                //if (err.code == 1808) {//
                //  //TODO: 患者端app版本低,短信通知患者端升级版本
                //  apiHandler.handleErr(res, err);
                //}
                if (orderId != null) {
                    OrderService.updateOrderInfo(orderId, {
                        callStatus: 'failed',
                        failedReason: err.code
                    }); //更新订单
                }

            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};


CustomerController.prototype.bindJPush = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['userId', "jPushId"]
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        if (!data.jPushId || data.jPushId.length < 1) {
            return apiHandler.OK(res, {});
        }
        CustomerService.getInfoByID(data.userId)
            .then(function (u) {
                if (!u) {
                    throw ErrorHandler.getBusinessErrorByCode(1503); //用户不存在
                } else {
                    return CustomerService.bindJPush(data.userId, data.jPushId); //绑定极光id
                }
            })
            .then(function (u) {
                    //console.log(u);
                    var moment_service = Backend.service('1/moment', 'moment');
                    moment_service
                        .sendUnreadReminding(data.userId).then(function () {
                        apiHandler.OK(res, u);
                    });
                },
                function (err) {
                    console.log(err);
                    apiHandler.handleErr(res, err);
                });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

CustomerController.prototype.getAllCouponById = function (req, res) {
    var userId = req.query.userId;
    if (!userId)
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));

    CustomerService.getInfoByID(userId)
        .then(function (u) {
            if (!u) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            } else {
                return CouponService.getAllCouponByUerId(userId);
            }
        })
        .then(function (data) {
            apiHandler.OK(res, data);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

CustomerController.prototype.getValidTransferCouponsById = function (req, res) {
    var userId = req.identity ? req.identity.userId : "";
    var user = req.identity ? req.identity.user : null;
    var coupons = [];

    CouponService.getTransferCouponByUserId(userId)
        .then(function (_coupons) {
            _coupons = JSON.parse(JSON.stringify(_coupons));
            coupons = _coupons;
            var venderIds = [];
            _coupons.forEach(function (_coupon) {
                if (_coupon.type == 8 && _coupon.boundVenderId) { //如果为返利代金券
                    venderIds.push(_coupon.boundVenderId);
                }
            });
            return CustomerService.getInfoByIDs(venderIds, {fields: 'avatar'});
        })
        .then(function (_venders) {
            var idAvatarMap = _.indexBy(_venders, '_id');
            coupons.forEach(function (_coupon) {
                if (_coupon.type == 8) { //如果为返利代金券
                    var qrCoupon = { //type = 8,代金券含有二维码信息
                        "rmb": _coupon.rmb, //金额
                        "avatar": idAvatarMap[_coupon.boundVenderId] && idAvatarMap[_coupon.boundVenderId].avatar || '', //二维码中头像
                        "qrUrl": serverConfigs.webHOST + constants.qrToPath + '?qrCode=' + _coupon.qrCode, //二维码被扫描跳转
                        "qrDesc": constants.qrDesc, //二维码下的描述
                        "unionCode": _coupon.unionCode || '', //代金券唯一编号
                        "desc": _coupon.description || '', //代金券描述
                    }
                    _coupon.qrCoupon = qrCoupon;
                }
            });
            apiHandler.OK(res, coupons);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};


CustomerController.prototype.getValidCouponsById = function (req, res) {
    var userId = req.query.userId;
    if (!userId)
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    var user;
    var coupons = [];
    CustomerService.getInfoByID(userId)
        .then(function (u) {
            if (!u) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            } else {
                user = u;
                return CouponService.getRMBDESCValidAllCouponsByUerId(userId);
            }
        })
        .then(function (_coupons) {
            _coupons = JSON.parse(JSON.stringify(_coupons));
            coupons = _coupons;
            var venderIds = [];
            _coupons.forEach(function (_coupon) {
                if (_coupon.type == 8 && _coupon.boundVenderId) { //如果为返利代金券
                    venderIds.push(_coupon.boundVenderId);
                }
            });
            return CustomerService.getInfoByIDs(venderIds, {fields: 'avatar'});
        })
        .then(function (_venders) {
            var idAvatarMap = _.indexBy(_venders, '_id');
            coupons.forEach(function (_coupon) {
                if ([8, 9].indexOf(_coupon.type) > -1) { //代金券含有二维码信息
                    var qrCoupon = { //代金券含有二维码信息
                        "rmb": _coupon.rmb, //金额
                        "avatar": idAvatarMap[_coupon.boundVenderId] && idAvatarMap[_coupon.boundVenderId].avatar || constants.qrDefaultAvatar || '', //二维码中头像
                        "qrUrl": serverConfigs.webHOST + constants.qrToPath + '?qrCode=' + _coupon.qrCode, //二维码被扫描跳转
                        "qrDesc": constants.qrDesc, //二维码下的描述
                        "unionCode": _coupon.unionCode || '', //代金券唯一编号
                        "desc": _coupon.description || '', //代金券描述
                    }
                    _coupon.qrCoupon = qrCoupon;
                }
                _coupon.type = _coupon.type == 9 ? 8 : _coupon.type; //TODO:REMOVED, 前端type=8时才能生成二维码
            });
            apiHandler.OK(res, coupons);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};
/**
 * 获得最大面额的优惠券，但由于包含活动券(活动券使用有时间段限制)，所以当前时间不一定能用
 * @param req
 * @param res
 * @returns {*}
 */
CustomerController.prototype.getMaxValidPhoneCouponById = function (req, res) {
    var userId = req.query.userId;
    if (!userId)
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));

    CustomerService.getInfoByID(userId)
        .then(function (u) {
            if (!u) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            } else {
                return CouponService.getRMBDESCValidAllPhoneCouponsByUerId(userId);
            }
        })
        .then(function (data) {
            apiHandler.OK(res, data[0]);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

//患者微信充值
CustomerController.prototype.WXRecharge = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['userId', 'money']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        if (data.money <= 0)
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1206));

        CustomerService.getInfoByID(data.userId)
            .then(function (u) {
                if (!u) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                } else {
                    var d = {
                        money: data.money,
                        tradeNo: Date.now() % 1000 + "-" + data.userId + "-" + commonUtil.getRandomNum(100, 999), // 订单号：时间戳+用户id+随即数
                        body: '充值'
                    };

                    return WXController.WXPay(req, d);
                }
            })
            .then(function (r) {
                apiHandler.OK(res, r);
            }, function (err) {
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

CustomerController.prototype.receiveSuggestion = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['content'],
        optional: []
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var userId = req.headers[constants.HEADER_USER_ID] || "";

        CustomerService.getInfoByID(userId)
            .then(function (u) {
                if (!u) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                } else {
                    var suggestion = {
                        userId: u._id,
                        name: u.name,
                        phoneNum: u.phoneNum,
                        content: data.content//反馈信息 
                    };

                    return SuggestionService.createSuggestion(suggestion);
                }
            })
            .then(function () {
                apiHandler.OK(res);
            }, function (err) {
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};


CustomerController.prototype.getAuthCodeForTheNew = function (req, res) {
    var phone = req.query.phoneNum;
    CustomerService.getInfoByPhone(phone)
        .then(function (u) {
            if (!u) {//新用户,则发送验证码
                ValidateService.sendValidate(phone, '')
                    .then(function (ac) {
                        apiHandler.OK(res);
                    }, function (err) {
                        apiHandler.handleErr(res, err);
                    });
            } else {
                apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1701));
            }
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

CustomerController.prototype.getFriendShare = function (req, res) {
    var userId = req.query.userId, activityNO = constants.COUPON_ACTIVITYNO_SHARE;
    // 用户身份认证
    CustomerService.getInfoByID(userId)
        .then(function (u) {
            if (!u) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            }
            var shareInfo = {
                userId: userId,
                userName: u.name,
                couponValue: constants.COUPON_ACTIVITYNO_SHARE_RMB
            };
            apiHandler.OK(res, shareInfo);
        }, function (err) {
            console.log(err);
            apiHandler.handleErr(res, err);
        });
}

// 用户查看医生的推荐列表（备用联系人、服务助理、推广合作、等）
CustomerController.prototype.getDocRecommendList = function (req, res) {
    var identity = req.identity;// 访问用户身份
    var user = identity ? identity.user : {};
    var customerId = req.query.userId; // 被访问者的身份
    var userId = identity ? identity.userId : "";
    //console.log("identity: " + util.inspect(identity));
    if (!commonUtil.isUUID24bit(customerId) || !commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user) || !commonUtil.isExist(user.phoneNum)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var userDocChatNum = user.docChatNum || '';
    var userDocId = user.doctorRef && user.doctorRef._id ? user.doctorRef._id : "";
    var userIsBroker = userDocId ? true : false;//用户是否为顾问

    var mapObj = {
        'bak': 'recmnd_fans',
        'ass': 'ass',
        'ad': 'ad'
    };
    var getRecommendInfo = function (doctorId, confItem) {
        var defer = Q.defer();
        if (confItem.isVisiable) {
            //获取首推
            DoctorService.getTopWeightRecommendByIdAndType(mapObj[confItem.item] || confItem.item, doctorId, 1).then(function (refs) {
                confItem.more.url += '?doctorId=' + doctorId;
                if (!refs || (refs && refs.length == 0)) {
                    confItem.title = confItem.title || '暂无';
                } else {
                    var r = refs[0];
                    confItem.title = r.toRef.realName;
                    confItem.disabled = false;
                    if (confItem.type == 'doctor') {
                        confItem.docChatNum = r.toRef.docChatNum;
                    }
                }

                if (confItem.item == mapObj['ad']) {
                    // 是否已存在关系
                    if (userIsBroker) {
                        DoctorService.isRelExists(doctorId, userDocId, "ad").then(function (_rel) {
                            confItem.more.isBroker = userIsBroker;
                            if (_rel) {
                                confItem.more.hint = constants.RECOMMEND_AD_HINT_MORE;
                                confItem.more.hintLink = constants.WEB_HOST + constants.RECOMMEND_AD_HINT_LINK + "?pay=more&paid=" + _rel.weight;
                            } else {
                                confItem.more.hint = constants.RECOMMEND_AD_HINT_DEF;
                                confItem.more.hintLink = constants.WEB_HOST + constants.RECOMMEND_AD_HINT_LINK + "?pay=init";
                            }
                            defer.resolve(confItem);
                        })
                    } else {
                        confItem.more.isBroker = userIsBroker;
                        confItem.more.hint = constants.RECOMMEND_AD_HINT_DEF;
                        confItem.more.hintLink = constants.WEB_HOST + constants.RECOMMEND_AD_HINT_LINK + "?pay=init";
                        defer.resolve(confItem);
                    }
                } else {
                    defer.resolve(confItem);
                }
            });
        } else {
            defer.resolve();
        }
        return defer.promise;
    };
    var recommends = [
        constants.RECOMMEND_BAK,
        constants.RECOMMEND_ASS,
        constants.RECOMMEND_AD
    ];
    //TODO 1. 查询医生的身份信息,并判断合法性,获取该医生推荐配置
    CustomerService.getInfoByID(customerId, {
        customerFields: 'doctorRef',
        doctorFields: 'recommendConf'
    })
        .then(function (customer) {
            if (!customer) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            }
            if (!customer.doctorRef || !customer.doctorRef._id) {
                return [];
            }
            var customerRef = customer.doctorRef;
            console.log('recommendConf:', customerRef.recommendConf);
            if (!customerRef.recommendConf || customerRef.recommendConf.length == 0) {
                return [];
            }
            var qTasks = [];
            customerRef.recommendConf.forEach(function (confItem) {
                qTasks.push(getRecommendInfo(customerRef._id, confItem));//??
            });
            return Q.all(qTasks);
        })
        .then(function (result) {
            console.log('result:', result);
            var recommends = [];

            result.forEach(function (d) {
                if (d) {
                    recommends.push(d);
                }
            })
            apiHandler.OK(res, recommends);
        }, function (err) {
            console.log(err);
            apiHandler.handleErr(res, err);
        });
};

// 用户查看医生的推荐列表（备用联系人、服务助理、推广合作、等）
CustomerController.prototype.getDocRecommendListBak = function (req, res) {
    var identity = req.identity;// 访问用户身份
    var doctorId = req.query.doctorId; // 被访问医生的身份
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE_1K, {
        weight: -1,
        createdAt: 1
    });
    if (!commonUtil.isUUID24bit(doctorId) || !commonUtil.isUUID24bit(identity.userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var condition = {
        type: 'recmnd_fans',
        fromId: doctorId + ''
    };
    var user;
    var doctorRefIds = [];
    CustomerService.getInfoByID(identity.userId)
        .then(function (u) {
            if (!u) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            } else {
                user = u;
                return DoctorService.getDocRecommendListBak(doctorId, pageSlice);
            }
        })
        .then(function (baks) {
            for (var i = baks.length - 1; i > -1; i--) {
                if (baks[i] && baks[i].toRef) {
                    doctorRefIds.unshift(baks[i].toRef);
                }
            }
            var option = {
                doctorFields: DoctorModel.frontEndFields,
                customerFields: CustomerModel.frontEndFields
            }
            return CustomerService.getPubicInfoByDocIDs(doctorRefIds, option);
        })
        .then(function (rArray) {
            if (!rArray || (rArray && rArray.length == 0)) {
                return apiHandler.OK(res, []);
            }
            var data = JSON.parse(JSON.stringify(rArray));
            data = _.map(data, function (dataItem) {
                dataItem.docRef = dataItem.doctorRef._id;
                return dataItem;
            });
            data = _.indexBy(data, 'docRef');
            //console.log('data:', data);
            var resData = [];
            for (var j = 0; j < doctorRefIds.length; j++) {
                var item = data[doctorRefIds[j] + ''];
                if (!item) {
                    continue;
                }
                delete item.docRef;
                var doctorRef = item.doctorRef;
                doctorRef.callPriceDescription = DoctorService.callPriceDescription(doctorRef);
                doctorRef.commentNum = doctorRef.commentNum || 0;
                doctorRef.zanNum = doctorRef.zanNum || 0;
                item.doctorRef = doctorRef;
                resData.push(item);
            }
            apiHandler.OK(res, resData);
        }, function (err) {
            console.log(err);
            apiHandler.handleErr(res, err);
        });
};
// 用户查看医生的推荐列表（备用联系人、服务助理、推广合作、等）
CustomerController.prototype.getDocRecommendListBak_new = function (req, res) {
    var identity = req.identity;// 访问用户身份
    var doctorId = req.query.doctorId; // 被访问医生的身份
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE_1K, {
        weight: -1,
        createdAt: 1
    });
    if (!commonUtil.isUUID24bit(doctorId) || !commonUtil.isUUID24bit(identity.userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var condition = {
        type: 'recmnd_fans',
        fromId: doctorId + ''
    };
    var user;
    var resData = [];
    var doctorRefIds = [];
    CustomerService.getInfoByID(identity.userId)
        .then(function (u) {
            if (!u) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            } else {
                user = u;
                return DoctorService.getDocRecommendListBak(doctorId, pageSlice);
            }
        })
        .then(function (baks) {
            for (var i = baks.length - 1; i > -1; i--) {
                if (baks[i] && baks[i].toRef) {
                    doctorRefIds.unshift(baks[i].toRef);
                }
            }
            return CustomerService.getPubicInfoByDocIDs_new(doctorRefIds);
        })
        .then(function (rArray) {
            if (!rArray || (rArray && rArray.length == 0)) {
                return apiHandler.OK(res, []);
            }
            var data = JSON.parse(JSON.stringify(rArray));
            data = _.map(data, function (dataItem) {
                dataItem.docRef = dataItem.doctorRef._id;
                return dataItem;
            });
            data = _.indexBy(data, 'docRef');
            //console.log('data:', data);

            for (var j = 0; j < doctorRefIds.length; j++) {
                var item = data[doctorRefIds[j] + ''];
                if (!item) {
                    continue;
                }
                delete item.docRef;
                delete item.doctorRef;
                resData.push(item);
            }
            var relUserIds = [];
            resData.forEach(function (item) {
                relUserIds.push(item._id);
            });
            return SocialRelService.getNoteNameByIds(user._id, relUserIds)
        })
        .then(function (_nameList) {
            console.log(_nameList.length);
            var relNameList = _.indexBy(_nameList, "relUser");
            resData.forEach(function (item) {
                if (relNameList[item._id]) {
                    item.name = relNameList[item._id] && relNameList[item._id].noteInfo && relNameList[item._id].noteInfo.noteName || item.name;
                }
            })
            apiHandler.OK(res, resData);
        }, function (err) {
            console.log(err);
            apiHandler.handleErr(res, err);
        });
};


// 用户查看医生的推荐列表（备用联系人、服务助理、推广合作、等）
CustomerController.prototype.getDocRecommendListAss = function (req, res) {
    var identity = req.identity;// 访问用户身份
    var doctorId = req.query.doctorId; // 被访问医生的身份
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE_1K, {
        weight: -1,
        createdAt: 1
    });
    if (!commonUtil.isUUID24bit(doctorId) || !commonUtil.isUUID24bit(identity.userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var condition = {
        type: 'ass',
        fromId: doctorId + ''
    };
    var user;
    var doctorRefIds = [];
    CustomerService.getInfoByID(identity.userId)
        .then(function (u) {
            if (!u) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            } else {
                user = u;
                return DoctorService.getDocRecommendListAss(doctorId, pageSlice);
            }
        })
        .then(function (baks) {
            //console.log(baks);
            for (var i = baks.length - 1; i > -1; i--) {
                if (baks[i] && baks[i].toRef) {
                    doctorRefIds.unshift(baks[i].toRef);
                }
            }
            var option = {
                doctorFields: DoctorModel.frontEndFields,
                customerFields: CustomerModel.frontEndFields
            }
            //console.log(doctorRefIds);
            return CustomerService.getPubicInfoByDocIDs(doctorRefIds, option);
        })
        .then(function (rArray) {
            if (!rArray || (rArray && rArray.length == 0)) {
                return apiHandler.OK(res, []);
            }
            var data = JSON.parse(JSON.stringify(rArray));
            data = _.map(data, function (dataItem) {
                dataItem.docRef = dataItem.doctorRef._id;
                return dataItem;
            });
            data = _.indexBy(data, 'docRef');
            //console.log('data:', data);
            var resData = [];
            for (var j = 0; j < doctorRefIds.length; j++) {
                var item = data[doctorRefIds[j] + ''];
                if (!item) {
                    continue;
                }
                delete item.docRef;
                var doctorRef = item.doctorRef;
                doctorRef.callPriceDescription = DoctorService.callPriceDescription(doctorRef);
                doctorRef.commentNum = doctorRef.commentNum || 0;
                doctorRef.zanNum = doctorRef.zanNum || 0;
                item.doctorRef = doctorRef;
                resData.push(item);
            }
            apiHandler.OK(res, resData);
        }, function (err) {
            console.log(err);
            apiHandler.handleErr(res, err);
        });
};

// 用户查看医生的推荐列表（备用联系人、服务助理、推广合作、等）
CustomerController.prototype.getDocRecommendListAss_new = function (req, res) {
    var identity = req.identity;// 访问用户身份
    var doctorId = req.query.doctorId; // 被访问医生的身份
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE_1K, {
        weight: -1,
        createdAt: 1
    });
    if (!commonUtil.isUUID24bit(doctorId) || !commonUtil.isUUID24bit(identity.userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var condition = {
        type: 'ass',
        fromId: doctorId + ''
    };
    var user;
    var doctorRefIds = [];
    var resData = [];
    CustomerService.getInfoByID(identity.userId)
        .then(function (u) {
            if (!u) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            } else {
                user = u;
                return DoctorService.getDocRecommendListAss(doctorId, pageSlice);
            }
        })
        .then(function (baks) {
            for (var i = baks.length - 1; i > -1; i--) {
                if (baks[i] && baks[i].toRef) {
                    doctorRefIds.unshift(baks[i].toRef);
                }
            }
            return CustomerService.getPubicInfoByDocIDs_new(doctorRefIds);
        })
        .then(function (rArray) {
            if (!rArray || (rArray && rArray.length == 0)) {
                return apiHandler.OK(res, []);
            }
            var data = JSON.parse(JSON.stringify(rArray));
            data = _.map(data, function (dataItem) {
                dataItem.docRef = dataItem.doctorRef._id;
                return dataItem;
            });
            data = _.indexBy(data, 'docRef');

            for (var j = 0; j < doctorRefIds.length; j++) {
                var item = data[doctorRefIds[j] + ''];
                if (!item) {
                    continue;
                }
                delete item.docRef;
                delete item.doctorRef;
                resData.push(item);
            }
            var relUserIds = [];
            resData.forEach(function (item) {
                relUserIds.push(item._id);
            });
            return SocialRelService.getNoteNameByIds(user._id, relUserIds)
        })
        .then(function (_nameList) {
            console.log(_nameList.length);
            var relNameList = _.indexBy(_nameList, "relUser");
            resData.forEach(function (item) {
                if (relNameList[item._id]) {
                    item.name = relNameList[item._id] && relNameList[item._id].noteInfo && relNameList[item._id].noteInfo.noteName || item.name;
                }
            })
            apiHandler.OK(res, resData);
        }, function (err) {
            console.log(err);
            apiHandler.handleErr(res, err);
        });
};
// 用户查看医生的推荐列表（备用联系人、服务助理、推广合作、等）
CustomerController.prototype.getDocRecommendListAd = function (req, res) {
    var identity = req.identity;// 访问用户身份
    var doctorId = req.query.doctorId; // 被访问医生的身份
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE_1K, {
        weight: -1,
        createdAt: 1
    });
    if (!commonUtil.isUUID24bit(doctorId) || !commonUtil.isUUID24bit(identity.userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var condition = {
        type: 'ad',
        fromId: doctorId + ''
    };
    var user;
    var doctorRefIds = [];
    CustomerService.getInfoByID(identity.userId)
        .then(function (u) {
            if (!u) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            } else {
                user = u;
                return DoctorService.getDocRecommendListAd(doctorId, pageSlice);
            }
        })
        .then(function (baks) {
            for (var i = baks.length - 1; i > -1; i--) {
                if (baks[i] && baks[i].toRef) {
                    doctorRefIds.unshift(baks[i].toRef);
                }
            }
            var option = {
                doctorFields: DoctorModel.frontEndFields,
                customerFields: CustomerModel.frontEndFields
            }
            console.log('doctorRefIds:', doctorRefIds, doctorRefIds.length);
            return CustomerService.getPubicInfoByDocIDs(doctorRefIds, option);
        })
        .then(function (rArray) {
            if (!rArray || (rArray && rArray.length == 0)) {
                return apiHandler.OK(res, []);
            }
            var data = JSON.parse(JSON.stringify(rArray));

            data = _.map(data, function (dataItem) {
                dataItem.docRef = dataItem.doctorRef._id;
                return dataItem;
            });
            console.log('data:', data.length);
            data = _.indexBy(data, 'docRef');
            var resData = [];
            for (var j = 0; j < doctorRefIds.length; j++) {
                var item = data[doctorRefIds[j] + ''];
                if (!item) {
                    continue;
                }
                delete item.docRef;
                var doctorRef = item.doctorRef;
                doctorRef.callPriceDescription = DoctorService.callPriceDescription(doctorRef);
                doctorRef.commentNum = doctorRef.commentNum || 0;
                doctorRef.zanNum = doctorRef.zanNum || 0;
                item.doctorRef = doctorRef;
                resData.push(item);
            }
            apiHandler.OK(res, resData);
        }, function (err) {
            console.log(err);
            apiHandler.handleErr(res, err);
        });
};

// 用户查看医生的推荐列表（备用联系人、服务助理、推广合作、等）
CustomerController.prototype.getDocRecommendListAd_new = function (req, res) {
    var identity = req.identity;// 访问用户身份
    var doctorId = req.query.doctorId; // 被访问医生的身份
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE_2K, {
        weight: -1,
        createdAt: 1
    });
    if (!commonUtil.isUUID24bit(doctorId) || !commonUtil.isUUID24bit(identity.userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var condition = {
        type: 'ad',
        fromId: doctorId + ''
    };
    var user;
    var doctorRefIds = [];
    var resData = [];
    CustomerService.getInfoByID(identity.userId)
        .then(function (u) {
            if (!u) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            } else {
                user = u;
                return DoctorService.getDocRecommendListAd(doctorId, pageSlice);
            }
        })
        .then(function (baks) {
            for (var i = baks.length - 1; i > -1; i--) {
                if (baks[i] && baks[i].toRef) {
                    doctorRefIds.unshift(baks[i].toRef);
                }
            }
            return CustomerService.getPubicInfoByDocIDs_new(doctorRefIds);
        })
        .then(function (rArray) {
            if (!rArray || (rArray && rArray.length == 0)) {
                return apiHandler.OK(res, []);
            }
            var data = JSON.parse(JSON.stringify(rArray));
            data = _.map(data, function (dataItem) {
                dataItem.docRef = dataItem.doctorRef._id;
                return dataItem;
            });
            data = _.indexBy(data, 'docRef');
            //console.log('data:', data);

            for (var j = 0; j < doctorRefIds.length; j++) {
                var item = data[doctorRefIds[j] + ''];
                if (!item) {
                    continue;
                }
                delete item.docRef;
                delete item.doctorRef;
                resData.push(item);
            }
            var relUserIds = [];
            resData.forEach(function (item) {
                relUserIds.push(item._id);
            });
            return SocialRelService.getNoteNameByIds(user._id, relUserIds)
        })
        .then(function (_nameList) {
            console.log(_nameList.length);
            var relNameList = _.indexBy(_nameList, "relUser");
            resData.forEach(function (item) {
                if (relNameList[item._id]) {
                    item.name = relNameList[item._id].noteInfo.noteName || item.name;
                }
            })
            apiHandler.OK(res, resData);
        }, function (err) {
            console.log(err);
            apiHandler.handleErr(res, err);
        });
};

// 用户查看医生的推荐列表（备用联系人、服务助理、推广合作、等）
CustomerController.prototype.getDocRecommendListType_new = function (req, res) {
    var identity = req.identity;// 访问用户身份
    var doctorId = req.query.doctorId; // 被访问医生的身份
    var type = req.params.type || 'recmnd_fans';
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE_1K, {
        weight: -1,
        createdAt: 1
    });
    if (!commonUtil.isUUID24bit(doctorId) || !commonUtil.isUUID24bit(identity.userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var user;
    var doctorRefIds = [];
    CustomerService.getInfoByID(identity.userId)
        .then(function (u) {
            if (!u) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            } else {
                user = u;
                return DoctorService.getDocRecommendListType(doctorId, type, pageSlice);
            }
        })
        .then(function (baks) {
            for (var i = baks.length - 1; i > -1; i--) {
                if (baks[i] && baks[i].toRef) {
                    doctorRefIds.unshift(baks[i].toRef);
                }
            }
            return CustomerService.getPubicInfoByDocIDs_new(doctorRefIds);
        })
        .then(function (rArray) {
            if (!rArray || (rArray && rArray.length == 0)) {
                return apiHandler.OK(res, []);
            }
            var data = JSON.parse(JSON.stringify(rArray));
            data = _.map(data, function (dataItem) {
                dataItem.docRef = dataItem.doctorRef._id;
                return dataItem;
            });
            data = _.indexBy(data, 'docRef');
            //console.log('data:', data);
            var resData = [];
            for (var j = 0; j < doctorRefIds.length; j++) {
                var item = data[doctorRefIds[j] + ''];
                if (!item) {
                    continue;
                }
                delete item.docRef;
                delete item.doctorRef;
                resData.push(item);
            }
            apiHandler.OK(res, resData);
        }, function (err) {
            console.log(err);
            apiHandler.handleErr(res, err);
        });
};

// 用户查看医生的推荐列表（备用联系人、服务助理、推广合作、等）
CustomerController.prototype.getDocRecommendListType = function (req, res) {
    var identity = req.identity;// 访问用户身份
    var doctorId = req.query.doctorId; // 被访问医生的身份
    var type = req.params.type || 'recmnd_fans';
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE_1K, {
        weight: -1,
        createdAt: 1
    });
    if (!commonUtil.isUUID24bit(doctorId) || !commonUtil.isUUID24bit(identity.userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var user;
    var doctorRefIds = [];
    CustomerService.getInfoByID(identity.userId)
        .then(function (u) {
            if (!u) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            } else {
                user = u;
                return DoctorService.getDocRecommendListType(doctorId, type, pageSlice);
            }
        })
        .then(function (baks) {
            for (var i = baks.length - 1; i > -1; i--) {
                if (baks[i] && baks[i].toRef) {
                    doctorRefIds.unshift(baks[i].toRef);
                }
            }
            var option = {
                doctorFields: DoctorModel.frontEndFields,
                customerFields: CustomerModel.frontEndFields
            }
            console.log('doctorRefIds:', doctorRefIds, doctorRefIds.length);
            return CustomerService.getPubicInfoByDocIDs(doctorRefIds, option);
        })
        .then(function (rArray) {
            if (!rArray || (rArray && rArray.length == 0)) {
                return apiHandler.OK(res, []);
            }
            var data = JSON.parse(JSON.stringify(rArray));

            data = _.map(data, function (dataItem) {
                dataItem.docRef = dataItem.doctorRef._id;
                return dataItem;
            });
            console.log('data:', data.length);
            data = _.indexBy(data, 'docRef');
            var resData = [];
            for (var j = 0; j < doctorRefIds.length; j++) {
                var item = data[doctorRefIds[j] + ''];
                if (!item) {
                    continue;
                }
                delete item.docRef;
                var doctorRef = item.doctorRef;
                doctorRef.callPriceDescription = DoctorService.callPriceDescription(doctorRef);
                doctorRef.commentNum = doctorRef.commentNum || 0;
                doctorRef.zanNum = doctorRef.zanNum || 0;
                item.doctorRef = doctorRef;
                resData.push(item);
            }
            apiHandler.OK(res, resData);
        }, function (err) {
            console.log(err);
            apiHandler.handleErr(res, err);
        });
};

//更改用户的屏蔽推送医生的列表 关注或者取消关注时,应更改改列表
CustomerController.prototype.changeDocPushState = function (req, res) {
    var identity = req.identity;// 访问用户身份
    if (!commonUtil.isUUID24bit(identity.userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var userId = identity.userId;
    var payload = req.body;
    var fields = {
        required: ['blockUserId', 'isBlocked']
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        CustomerService.getInfoByID(userId)
            .then(function (u) {
                if (!u) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                } else {
                    var isBlocked = (u.blockDocs && u.blockDocs.indexOf(data.blockUserId + '') > -1) ? true : false;
                    if (data.isBlocked === isBlocked) {
                        return;
                    }
                    SocialRelService.updateRelByCond({
                        user: userId,
                        relUser: data.blockUserId
                    }, {$set: {isRelUserBlocked: data.isBlocked}});
                    return CustomerService.changeDocsPushState(userId, [data.blockUserId], data.isBlocked);
                }
            })
            .then(function () {
                apiHandler.OK(res, {});
                LoggerService.trace(LoggerService.getTraceDataByReq(req));
            }, function (err) {
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);

};

//更改用户的黑名单
CustomerController.prototype.changeBlackList = function (req, res) {
    var identity = req.identity;// 访问用户身份
    if (!commonUtil.isUUID24bit(identity.userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var userId = identity.userId;
    var payload = req.body;
    var fields = {
        required: ['blackUserId', 'isBlack']
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var user = null;
    var onSuccess = function (handler, data) {
        console.log("come in");
        CustomerService.getInfoByID(userId)
            .then(function (u) {
                if (!u) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                } else {
                    user = u;
                    var isBlack = (u.blackList && u.blackList.indexOf(data.blackUserId + '') > -1) ? true : false;
                    if (data.isBlack === isBlack) {
                        return;
                    }
                    SocialRelService.updateRelByCond({
                        user: userId,
                        relUser: data.blackUserId
                    }, {$set: {isRelUserBlacked: data.isBlack}});
                    SocialRelService.updateRelByCond({
                        user: data.blackUserId,
                        relUser: userId
                    }, {$set: {isUserBlacked: data.isBlack}});
                    return CustomerService.changeBlackList(userId, [data.blackUserId], data.isBlack);
                }
            })
            .then(function () {
                return CustomerService.getMainInfoByID(data.blackUserId, {fields: 'im'});
            })
            .then(function (_blackUser) {
                //环信拉黑
                if (data.isBlack) {
                    if (user.im && user.im.userName && _blackUser && _blackUser.im && _blackUser.im.userName) {
                        var service_emchat = Backend.service('common', 'EmchatService');
                        return service_emchat.addUserForBlacklist(user.im.userName, [_blackUser.im.userName]);
                    } else {
                        console.log('user user or black_user  im userName not exists');
                    }
                } else {
                    if (user.im && user.im.userName && _blackUser && _blackUser.im && _blackUser.im.userName) {
                        var service_emchat = Backend.service('common', 'EmchatService');
                        return service_emchat.deleteUserFromBlacklist(user.im.userName, _blackUser.im.userName);
                    } else {
                        console.log('user or black_user im userName not exists');
                    }
                }

            })
            .then(function (_res) {
                if (_res) {
                    _res = JSON.parse(_res);
                    console.log(_res.error ? 'im black or remove_black fail!' : 'im black or remove_black success!');
                }
            })
            .then(function () {
                apiHandler.OK(res, {});
                LoggerService.trace(LoggerService.getTraceDataByReq(req));
            }, function (err) {
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);

};

CustomerController.prototype.inviteToApply = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['userId', 'invitedUserId']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        console.log("come in");
        var user;
        var now = new Date();
        CustomerService.getInfoByID(data.userId)
            .then(function (d) {
                if (!d) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                } else {
                    user = d;
                    return CustomerService.getInfoByID(data.invitedUserId);
                }
            })
            .then(function (c) {
                if (!c) {
                    apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
                } else {
                    var invitedUser;
                    if (user['invitedUsers'] && user['invitedUsers'].length > 0)
                        for (var i in user['invitedUsers'])
                            if (c._id == user['invitedUsers'][i].userId) {
                                invitedUser = user['invitedUsers'][i];
                                break;
                            }

                    if (invitedUser) {
                        if (now - invitedUser.latestInvitedAt < 604800000) {
                            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1527));
                        } else {
                            commonUtil.sendSms("1670644", c.phoneNum, "#name#=" + user.name, true);
                            return CustomerService.inviteToApplyAgain(user._id, c._id);
                        }
                    } else {
                        commonUtil.sendSms("1670644", c.phoneNum, "#name#=" + user.name, true);
                        return CustomerService.inviteToApply(user._id, c._id);
                    }
                }
            })
            .then(function () {
                apiHandler.OK(res);
                LoggerService.trace(LoggerService.getTraceDataByReq(req));
            }, function (err) {
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

CustomerController.prototype.sidAuth = function (req, res) {
    var identity = req.identity;// 访问用户身份
    var userId = identity.userId;
    var payload = req.body;
    if (!commonUtil.isUUID24bit(identity.userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    if (!commonUtil.validateSid(payload.sid)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1517));
    }
    var fields = {
        required: ['sid', 'sidName']
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        CustomerService.getInfoByID(userId)
            .then(function (u) {
                if (!u) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                } else {
                    if (u.sid && u.sidName) {
                        throw ErrorHandler.getBusinessErrorByCode(1526);
                    }
                    var updatedData = {
                        sid: data.sid,
                        sidName: data.sidName
                    }
                    return CustomerService.updateBaseInfo(userId, updatedData);
                }
            })
            .then(function () {
                var resData = {
                    withdrawalsMax: constants.withdrawalsMax, //最大提现额度
                    withdrawalsMin: constants.withdrawalsMin//最小提现额度
                }
                apiHandler.OK(res, resData);
                LoggerService.trace(LoggerService.getTraceDataByReq(req));
            }, function (err) {
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
}


CustomerController.prototype.allFavoriteCustomer = function (req, res) {
    var userId = req.identity ? req.identity.userId : "";
    if (!commonUtil.isUUID24bit(userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var page = req.query.pageNum;
    var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {createdAt: 1});
    var doctor, customers;
    CustomerService.getPublicInfoById(userId)
        .then(function (u) {
            if (!u) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            }
            doctor = u.doctorRef;
            if (!doctor) {
                return [];
            } else {
                return CustomerService.getAllFavoriteUserByDocIdSortPinYin(doctor._id, pageSlice)
            }
        })
        //.then(function (c) {
        //  customers = JSON.parse(JSON.stringify(c));
        //
        //  var ids = [];
        //  for (var i = 0; i < customers.length; i++) {
        //    customers[i].orderNum = 0;
        //    ids[i] = customers[i]._id + "";
        //  }
        //
        //  return OrderService.favoriteDoctorCustomerPhoneOrderNum(doctor._id + "", ids);
        //})
        //.then(function (o) {
        //  //console.log("--->" + util.inspect(o));
        //
        //  for (var i = 0; i < o.length; i++)
        //    for (var j = 0; j < customers.length; j++)
        //      if ((customers[j]._id == o[i]._id)) {
        //        customers[j].orderNum = o[i].count;
        //        break;
        //      }
        //})
        .then(function (fans) {
            for (var j = 0; j < fans.length; j++) {
                var doctorRef = fans[j].doctorRef;
                if (!doctorRef) {
                    continue;
                } else if (!doctorRef._id || doctorRef.isDeleted) {
                    delete fans[j].doctorRef;
                    if (fans[j].docChatNum) {
                        fans[j].docChatNum = '';
                    }
                    continue;
                }
                doctorRef['callPriceDescription'] = DoctorService.callPriceDescription(doctorRef);
                doctorRef['commentNum'] = doctorRef.commentNum || 0;
                doctorRef['zanNum'] = doctorRef.zanNum || 0;
                doctorRef['profile'] = doctorRef.profile || '';
                doctorRef['favoriteNum'] = doctorRef.favoritedNum;
            }
            apiHandler.OK(res, fans);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};


CustomerController.prototype.infoToOtherUser = function (req, res) {
    var userId = req.query.userId;
    var otherUserId = req.query.otherUserId;
    var user, otherUser, relation;
    var resData = {};
    resData.favourite = false;
    resData.block = false;
    resData.blackList = false;
    resData.isEnableSendMsg = true;
    CustomerService.getInfoByID(userId)
        .then(function (u) {
            if (!u) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            } else {
                user = u;
            }
            return CustomerService.getInfoByID(otherUserId)
        })
        .then(function (f) {
            //console.log(f)
            if (!f) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            }
            otherUser = f;
            return SocialRelService.findRelByRelIds(userId, otherUserId)
        })
        .then(function (_rel) {
            resData.noteInfo = {}
            if (_rel) {
                resData.noteInfo = _rel.noteInfo;
            }
            if (otherUser.doctorRef) {
                for (var i = 0; i < (user.favoriteDocs ? user.favoriteDocs.length : 0); i++) {
                    if (user.favoriteDocs[i] == (otherUser.doctorRef._id + '')) {
                        resData.favourite = true;
                    }
                }
            }

            for (var i = 0; i < (user.blockDocs ? user.blockDocs.length : 0); i++) {
                if (user.blockDocs[i] == otherUserId) {
                    resData.block = true;
                }
            }
            for (var i = 0; i < (user.blackList ? user.blackList.length : 0); i++) {
                if (user.blackList[i] == otherUserId) {
                    resData.blackList = true;
                }
            }
            for (var i = 0; i < (otherUser.blackList ? otherUser.blackList.length : 0); i++) {
                if (otherUser.blackList[i] == userId) {
                    resData.isEnableSendMsg = false;
                }
            }
            for (var i = 0; i < (user.userNotes ? user.userNotes.length : 0); i++) {
                if ((user.userNotes[i].customerId + '') == otherUserId) {
                    resData.note = user.userNotes[i].note;
                }
            }
        })
        .then(function () {
            apiHandler.OK(res, resData);
            LoggerService.trace(LoggerService.getTraceDataByReq(req)); //和发送验证码的log一起用，不能删
        }, function (err) {
            console.log(err);
            apiHandler.handleErr(res, err);
        });
}
/**
 * 该用户最近7天有没有邀请过
 * @param req
 * @param res
 */
CustomerController.prototype.isThisUserInvited = function (req, res) {
    console.log("come in");
    var userId = req.query.userId;
    var invitedUserId = req.query.invitedUserId;
    var user;
    var resData = {};
    resData.invited = true;
    CustomerService.getInfoByID(userId)
        .then(function (u) {
            if (!u) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            } else {
                user = u;
            }
            if (user.invitedUsers) {
                if (user.invitedUsers.length == 0) {
                    console.log(111111111111111);
                    resData.invited = false;
                } else {
                    for (var i = 0; i < user.invitedUsers.length; i++) {
                        if (user.invitedUsers[i].userId == invitedUserId) {
                            console.log(44444444444);
                            var now = Date.now();
                            if (now - user.invitedUsers[i].latestInvitedAt > 604800000) {
                                console.log(22222222222222);
                                resData.invited = false;
                            }
                            break;
                        } else if (i == (user.invitedUsers.length - 1)) {
                            console.log(3333333333333);
                            resData.invited = false;
                        }
                    }
                }
            } else {
                resData.invited = false;
            }
        })
        .then(function () {
            apiHandler.OK(res, resData);
            LoggerService.trace(LoggerService.getTraceDataByReq(req)); //和发送验证码的log一起用，不能删
        }, function (err) {
            console.log(err);
            apiHandler.handleErr(res, err);
        });
};

CustomerController.prototype.searchAll = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    var keyword = req.query.keyword || '';
    var doctorRefId = user.doctorRef && user.doctorRef._id ? user.doctorRef._id : ''
    // 不允许空查询
    if (!keyword || !commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var result = {
        keyword: keyword
    }
    var appVersion = req.identity.appVersion || '';
    var qTasks = null;
    console.log('appVersion', appVersion, appVersion > '4.5.0');
    if (appVersion > '4.5.0') {
        var qTasks = [
            CustomerService.getFavorites451(userId, user.favoriteDocs, keyword)
                .then(function (myFavoriteList) {
                    result.myFavoriteList = myFavoriteList;
                    return;
                }),
            //CustomerService.getFans_new(user, keyword)
            //  .then(function (myFansList) {
            //    result.myFansList = myFansList;
            //    return;
            //  }),
            CustomerService.getSearch451(userId, keyword)
                .then(function (otherList) {
                    result.otherList = otherList;
                    return;
                })
        ]
    } else {
        qTasks = [
            CustomerService.getFavorites451(userId, user.favoriteDocs, keyword)
                .then(function (myFavoriteList) {
                    result.myFavoriteList = myFavoriteList;
                    return;
                }),
            CustomerService.getFans451(user, keyword)
                .then(function (myFansList) {
                    result.myFansList = myFansList;
                    return;
                }),
            CustomerService.getSearch451(userId, keyword)
                .then(function (otherList) {
                    result.otherList = otherList;
                    return;
                })
        ]
    }

    Q.all(qTasks)
        .then(function () {
            apiHandler.OK(res, result);
            LoggerService.trace(LoggerService.getTraceDataByReq(req));
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};
var toPinYin = function (oriStr) {
    "use strict";
    var arr = pinyin(oriStr, {
        style: pinyin.STYLE_NORMAL
    });
    var arr2 = _.flatten(arr, true);

    var str = arr2.reduce(function (prev, cur) {
        "use strict";
        if (typeof cur !== 'string' || cur.length < 1)
            return prev;
        cur = cur.charAt(0).toUpperCase() + cur.substr(1);
        return prev + cur;
    }, '');

    return str;
};
CustomerController.prototype.getFavorites = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    var keyword = req.query.keyword || '';
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE_2K, {createdAt: -1});

    var type = req.query.type;
    var mock = req.query.mock;
    var result = [
        {
            _id: '5819ed2593740e996bf3f824',
            avatar: '',
            sex: '男',
            name: '刘贞波', //名字
            pinyinName: 'LiuZhenBo', //拼音名字
            docChatNum: '808050087', //热线号
            currentMoment: '日本高田因缺陷气囊陷入破产 中国买家砸100亿接盘 https://finance.sina.com.cn/chanjing/gsnews/2017-06-26/doc-ifyhmtrw3985644.shtml', //最新动态
            profile: ''//简介
        }
    ]
    if (mock) {

        return apiHandler.OK(res, result);
    }


    var favDocIds = _.filter(user.favoriteDocs || [], function (d) {
        return commonUtil.isUUID24bit(d);
    });
    var items;
    CustomerService.getFavorites(favDocIds, keyword, pageSlice, type)
        .then(function (result) {
            items = result.items;
            items = JSON.parse(JSON.stringify(items));
            var relUserIds = [];
            items.forEach(function (item) {
                relUserIds.push(item._id);
            });
            return SocialRelService.getNoteNameByIds(userId, relUserIds)
        })
        .then(function (_nameList) {
            console.log(_nameList.length);
            var relNameList = _.indexBy(_nameList, "relUser");
            items.forEach(function (item) {
                if (relNameList[item._id]) {
                    item.name = relNameList[item._id] && relNameList[item._id].noteInfo && relNameList[item._id].noteInfo.noteName || item.name

                    //店铺显示店铺信息
                    if (constants.shopAuthorizedStatus.indexOf(item.shopVenderApplyStatus || '') > -1) {
                        //如果店铺审核通过, 显示店铺信息
                        item.name = item.shopName || item.name;
                        item.avatar = item.shopAvatar || item.avatar || '';
                    }
                    item.pinyinName = toPinYin(item.name);
                }
                item.hasPic = false;
                if (item.momentType == 'pic') {
                    item.hasPic = true;
                }
                delete item.momentType;
            })
            apiHandler.OK(res, items);
        });
};

CustomerController.prototype.searchFavorites = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    var keyword = req.query.keyword || '';
    // 不允许空查询
    if (!keyword || !commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE, {createdAt: -1});
    CustomerService.getFavorites451(userId, user.favoriteDocs, keyword, pageSlice)
        .then(function (result) {
            apiHandler.OK(res, result);
            LoggerService.trace(LoggerService.getTraceDataByReq(req));
        });
};

CustomerController.prototype.searchFans = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    var keyword = req.query.keyword || '';
    var doctorRefId = user.doctorRef && user.doctorRef._id ? user.doctorRef._id : ''
    // 不允许空查询
    if (!keyword || !commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    console.log('doctorRefId:', doctorRefId);
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE, {
        theTrueRelCreatedAt: -1,
        createdAt: -1
    });
    CustomerService.getFans451(user, keyword, pageSlice)
        .then(function (result) {
            apiHandler.OK(res, result);
            LoggerService.trace(LoggerService.getTraceDataByReq(req));
        });
};

CustomerController.prototype.delMomentMessage = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ["momentId"]
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var userId = req.identity ? req.identity.userId : '';
        var user = req.identity && req.identity.user ? req.identity.user : null;
        if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        MomentMsgService.delOneMomentMsg(userId, data.momentId)
            .then(function () {
                apiHandler.OK(res, {});
            }, function (err) {
                apiHandler.handleErr(res, err);
            })

    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);

};

CustomerController.prototype.delCallsRecord = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ["orderId"]
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var userId = req.identity ? req.identity.userId : '';
        var user = req.identity && req.identity.user ? req.identity.user : null;
        if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        OrderService.getOrderByID(data.orderId)
            .then(function (_order) {
                if ((_order.callerId + "") == userId) {
                    return OrderService.updatePhoneOrderInfo(data.orderId, {isDeletedByCaller: true})
                } else if ((_order.calleeId + "") == userId) {
                    return OrderService.updatePhoneOrderInfo(data.orderId, {isDeletedByCallee: true})
                } else {
                    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
                }
            })
            .then(function (_order) {
                if (_order) {
                    apiHandler.OK(res, {});
                } else {
                    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8007));
                }
            }, function (err) {
                apiHandler.handleErr(res, err);
            })

    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);

};

CustomerController.prototype.autoOffline = function (req, res) {
    var payload = req.body;
    var fields = {
        optional: ["isAutoOffline", "type", "time"]
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var userId = req.identity ? req.identity.userId : '';
        var user = req.identity && req.identity.user ? req.identity.user : null;
        if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        if (!data.isAutoOffline && !data.type && !data.time && data.isAutoOffline != false) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        if ((data.type && !data.time) || (!data.type && data.time)) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        var updateData = {};
        if (data.isAutoOffline != undefined) {
            updateData.isAutoOffline = data.isAutoOffline;
        }
        if (data.type == "offline") {
            if (user.offlineEndTime == data.time) {
                return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1533));
            }
            updateData.offlineBeginTime = data.time;
        } else if (data.type == "online") {
            if (user.offlineBeginTime == data.time) {
                return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1533));
            }
            updateData.offlineEndTime = data.time;
        }
        CustomerService.updateUserById(userId, updateData)
            .then(function (_user) {
                if (_user) {
                    apiHandler.OK(res, {});
                }
            }, function (err) {
                apiHandler.handleErr(res, err);
            })

    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);

};

CustomerController.prototype.getDiscountCoupon = function (req, res) {
    var userId = req.query.userId || '';
    var user;
    CustomerService.getInfoByID(userId)
        .then(function (_user) {
            if (!_user) {
                return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
            }
            user = _user;
            return CouponService.getDiscountCouponByBoundUserId(userId)
        })
        .then(function (_coupon) {
            console.log(11111111111111);
            console.log(_coupon);
            if (_coupon) {
                return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1603));
            } else {
                var validAt = commonUtil.setValidAtSomeDate(24);
                var coupon_new = {
                    activityNO: constants.COUPON_ACTIVITYNO_DISCOUNT_5,
                    type: '7',
                    title: constants.COUPON_ACTIVITYNO_DISCOUNT_TITLE_5,
                    subTitle: constants.COUPON_ACTIVITYNO_DISCOUNT_SUBTITLE_5,
                    description: '',
                    manual: '',
                    rmb: constants.COUPON_ACTIVITYNO_DISCOUNT_RMB_5,
                    rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_DISCOUNT_RMB_5,
                    expiredAt: commonUtil.setExpiredAtSomeDate(24),
                    validAt: validAt,
                    boundUserId: userId,
                    boundUserPhoneNum: user.phoneNum,
                    discount: constants.COUPON_ACTIVITYNO_DISCOUNTVAL_5,
                    deductedRMB: constants.COUPON_ACTIVITYNO_DISCOUNT_RMB_5,
                    higherThreshold: constants.COUPON_ACTIVITYNO_DISCOUNT_RMB_5

                };
                console.log('coupon:', coupon_new);
                return CouponService.createCoupon(coupon_new);
            }
        })
        .then(function (coupon) {
            console.log(11111);
            console.log(coupon)
            if (coupon) {
                apiHandler.OK(res, {});
            }
        }, function (err) {
            apiHandler.handleErr(res, err);
        })

};

CustomerController.prototype.getFans = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var keyword = req.query.keyword || '';
    var doctorRefId = user.doctorRef && user.doctorRef._id ? user.doctorRef._id : ''
    console.log('doctorRefId:', doctorRefId);
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE, {createdAt: -1});
    CustomerService.getFans(doctorRefId, keyword, pageSlice)
        .then(function (result) {
            apiHandler.OK(res, result.items);
        });
};

CustomerController.prototype.getFansNew = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var keyword = req.query.keyword || '';
    var items, result;
    var doctorRefId = user.doctorRef && user.doctorRef._id ? user.doctorRef._id : ''
    console.log('doctorRefId:', doctorRefId);
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE, {createdAt: -1});
    CustomerService.getFans(doctorRefId, keyword, pageSlice)
        .then(function (_result) {
            result = _result
            items = result.items;
            var relUserIds = [];
            items.forEach(function (item) {
                relUserIds.push(item._id);
            });
            return SocialRelService.getNoteNameByIds(userId, relUserIds)
        })
        .then(function (_nameList) {
            console.log(_nameList.length);
            var relNameList = _.indexBy(_nameList, "relUser");
            items.forEach(function (item) {
                if (relNameList[item._id]) {
                    item.name = relNameList[item._id] && relNameList[item._id].noteInfo && relNameList[item._id].noteInfo.noteName || item.name;
                }
            })
            result.items = items;
            apiHandler.OK(res, result);
        });
};

CustomerController.prototype.getFans_421 = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var doctorRefId = user.doctorRef && user.doctorRef._id ? user.doctorRef._id : '';
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE, {
        theTrueRelCreatedAt: -1,
        _id: -1
    });
    var result = {
        count: 0,
        items: []
    };
    var userIds = [], relMap = {}, users = [];
    SocialRelService.getFansCountByUserId(userId)
        .then(function (_count) {
            console.log("_count:", _count);
            result.count = _count || 0;
            return SocialRelService.getFansByUserId(userId, 'user notedName', pageSlice);
        })
        .then(function (_rels) {
            if (!_rels || _rels.length == 0) {
                return [];
            }
            userIds = _.map(_rels, function (_rel) {
                return _rel.user;
            });
            relMap = _.indexBy(_rels, 'user');
            return CustomerService.getInfoByIDs(userIds, {fields: CustomerModel.listFields});
        })
        .then(function (_users) {
            _users = JSON.parse(JSON.stringify(_users));
            var _userMap = _.indexBy(_users, '_id');
            var invalidCount = 0;
            userIds.map(function (userId) {
                if (!_userMap[userId + ''] || !relMap[userId + '']) {
                    console.log('not found user:', userId);
                    invalidCount++;
                    return;
                }

                _userMap[userId + '']['name'] = (relMap[userId + ''] && relMap[userId + ''].notedName) || _userMap[userId + ''].name;
                //店铺显示店铺信息
                var item = _userMap[userId + ''];
                if (constants.shopAuthorizedStatus.indexOf(item.shopVenderApplyStatus || '') > -1) {
                    //如果店铺审核通过, 显示店铺信息
                    item.name = item.shopName || item.name;
                    item.avatar = item.shopAvatar || item.avatar || '';
                }

                users.push(item);
            });
            result.items = users;
            result.count -= invalidCount;
            apiHandler.OK(res, result);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

CustomerController.prototype.searchOthers = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    var keyword = req.query.keyword || '';
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }

    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE, {createdAt: -1});
    CustomerService.getSearch451(userId, keyword, pageSlice)
        .then(function (result) {
            apiHandler.OK(res, result);
            LoggerService.trace(LoggerService.getTraceDataByReq(req));
        });
};

CustomerController.prototype.getMessages = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE_1K, {updatedAt: -1});
    var resData = {};
    var items = [];
    MessageService.countNotReadMessages(userId)
        .then(function (_count) {
            resData.totalCount = _count;
            console.log('resData:', resData);
            var type = req.query.type || 'sys';
            var updateData = {
                hasNewMessage: false,
                'msgReadStatus.all': false
            }
            updateData['msgReadStatus.' + type] = false;
            Q.all([
                //MessageService.getNewestMessageByType(userId, 'hongbao_record'),
                MessageService.getMessages(userId, [], pageSlice, req.query.type),
                CustomerService.updateBaseInfo(userId, updateData)
            ])
                .then(function (result) {
                    //console.log('result:', result);
                    if (result[0] && result[0].length > 0) {
                        Array.prototype.push.apply(items, result[0]);
                    }
                    var relUserIds = [];
                    items.forEach(function (item) {
                        if (item.messageFrom) {
                            relUserIds.push(item.messageFrom._id);
                        }
                    });
                    return SocialRelService.getNoteNameByIds(userId, relUserIds)
                })
                .then(function (_nameList) {
                    if (_nameList.length) {
                        var relNameList = _.indexBy(_nameList, "relUser");
                        console.log(relNameList);
                        items.forEach(function (item) {
                            if (item.messageFrom) {
                                if (relNameList[item.messageFrom._id]) {
                                    console.log(relNameList[item.messageFrom._id]._id);
                                    item.messageFrom.name = relNameList[item.messageFrom._id] && relNameList[item.messageFrom._id].noteInfo && relNameList[item.messageFrom._id].noteInfo.noteName || item.messageFrom.name
                                }
                            }
                        })
                    }
                    //console.log(items);
                    //console.log('items1:',items);
                    if (req.query.type == 'personal') {
                        items.forEach(function (item) {
                            if (item.messageFrom) {
                                item.title = item.messageFrom.name + "的留言";
                                item.link_title = item.messageFrom.name + "的留言";
                            }
                        })
                    }
                    if (req.query.type == 'sys') {
                        items.forEach(function (item) {
                            if (item.type == "hongbao_record") {
                                if (item.messageFrom) {
                                    item.title = item.messageFrom.name + item.title.substring(item.title.indexOf("领取了"));
                                    item.link_title = item.messageFrom.name + item.title.substring(item.title.indexOf("领取了"));
                                }
                            }
                        })
                    }
                    resData.items = items;
                    apiHandler.OK(res, resData);
                }, function (err) {
                    apiHandler.handleErr(res, err);
                });
        });
};

CustomerController.prototype.sharePromotion = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    if (user.membership && user.membership.isShareRewardReceived) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1604));
    }
    var now = new Date();
    var expiredAt = new Date(commonUtil.getDateMidnight(now.setDate(now.getDate() + 7))).getTime() - 1;
    Promise.resolve()
        .then(function () {
            return CustomerService.hasTheDeviceGot(user.deviceId, userId + '', -1, '', '4.5.0')
        })
        .then(function (_deviceRes) {
            if (_deviceRes) {
                throw ErrorHandler.getBusinessErrorByCode(2115);
            }
            var coupon_new = {
                activityNO: constants.COUPON_ACTIVITYNO_CASH_SHARE_5,
                type: 9,
                title: constants.COUPON_ACTIVITYNO_CASH_SHARE_TITLE_5,
                subTitle: constants.COUPON_ACTIVITYNO_CASH_SHARE_SUBTITLE_5,
                description: constants.COUPON_ACTIVITYNO_CASH_SHARE_SUBTITLE_5,
                manual: '',
                rmb: constants.COUPON_ACTIVITYNO_CASH_SHARE_RMB_5,
                deductedRMB: constants.COUPON_ACTIVITYNO_CASH_SHARE_RMB_5,
                rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_CASH_SHARE_RMB_5,
                expiredAt: expiredAt,
                boundUserId: userId,
                boundUserPhoneNum: user.phoneNum,
                orderId: ''
            };

            console.log('coupon:', coupon_new);
            return CouponService.createUnionCodeCoupon(coupon_new)
        })
        .then(function (_coupon) {
            var updateData = {
                $inc: {
                    "membership.balance": constants.MEMBERSHIP_ACTIVITYNO_CASH_SHARE_5
                },
                $set: {
                    "membership.isShareRewardReceived": true
                }
            };
            return CustomerService.updateUserById(userId, updateData);
        })
        .then(function () {
            apiHandler.OK(res, {});
        }, function (err) {
            apiHandler.handleErr(res, err);
        })

};
/**
 * 领取6＋7两张代金券
 *  1. 验证
 *  2. 生成coupon
 *  3. 会员信息更新
 * @param req
 * @param res
 */
CustomerController.prototype.getCouponConsumedMembership = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    if (user.membership && user.membership.isTriDayRewardReceived) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1604));
    }
    var toConsume = constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_6 + constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_7;
    if (!user.membership || !user.membership.balance ||
        (user.membership && user.membership.balance && user.membership.balance < toConsume)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(2109));
    }
    var now = Date.now();
    if (now > constants.COUPON_ACTIVITYNO_CASH_3DAY_EXPIREDAT_6)
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1600));
    Promise.resolve()
        .then(function () {
            return CustomerService.hasTheDeviceGot(
                user.deviceId,
                userId + '', '', '',
                '4.5.0',
                constants.COUPON_ACTIVITYNO_CASH_3DAY_6);
        })
        .then(function (_deviceRes) {
            if (_deviceRes) {
                throw ErrorHandler.getBusinessErrorByCode(2115);
            }
            var coupon_new1 = {// 6元
                activityNO: constants.COUPON_ACTIVITYNO_CASH_3DAY_6,
                type: 9,
                title: constants.COUPON_ACTIVITYNO_CASH_3DAY_TITLE_6,
                subTitle: constants.COUPON_ACTIVITYNO_CASH_3DAY_SUBTITLE_6,
                description: constants.COUPON_ACTIVITYNO_CASH_3DAY_SUBTITLE_6,
                manual: '',
                rmb: constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_6,
                deductedRMB: constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_6,
                rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_6,
                expiredAt: constants.COUPON_ACTIVITYNO_CASH_3DAY_EXPIREDAT_6,
                validAt: constants.COUPON_ACTIVITYNO_CASH_3DAY_VALIDAT_6,
                boundUserId: userId,
                boundUserPhoneNum: user.phoneNum,
                orderId: ''
            };

            var coupon_new2 = {//7元
                activityNO: constants.COUPON_ACTIVITYNO_CASH_3DAY_7,
                type: 9,
                title: constants.COUPON_ACTIVITYNO_CASH_3DAY_TITLE_7,
                subTitle: constants.COUPON_ACTIVITYNO_CASH_3DAY_SUBTITLE_7,
                description: constants.COUPON_ACTIVITYNO_CASH_3DAY_SUBTITLE_7,
                manual: '',
                rmb: constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_7,
                deductedRMB: constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_7,
                rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_7,
                expiredAt: constants.COUPON_ACTIVITYNO_CASH_3DAY_EXPIREDAT_7,
                validAt: constants.COUPON_ACTIVITYNO_CASH_3DAY_VALIDAT_7,
                boundUserId: userId,
                boundUserPhoneNum: user.phoneNum,
                orderId: ''
            };
            var conpons = [coupon_new1, coupon_new2];
            console.log('coupon:', conpons);
            // todo: 1. 不支持生成coupon数组，单独封装
            // todo: 2. coupon中的unioncode生成规则，需要改动
            return CouponService.createUnionCodeCoupons(conpons);
        })
        .then(function (_coupon) {
            var reDuceMembership;// 实际需要耗费的会员权益
            if (now > constants.COUPON_ACTIVITYNO_CASH_3DAY_EXPIREDAT_10) {
                reDuceMembership = constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_6;
            } else {
                reDuceMembership = constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_6 + constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_7;
            }
            var updateData = {
                $inc: {
                    "membership.balance": -reDuceMembership
                },
                $set: {
                    "membership.isTriDayRewardReceived": true
                }
            };
            // 判断当前要更新的用户 依然是合法的 ｛membership.balance >= reDuceMembership｝
            return CustomerService.updateBasicInfoByCond({
                _id: userId,
                'membership.balance': {$gte: reDuceMembership}
            }, updateData);
        })
        .then(function () {
            apiHandler.OK(res, {});
        }, function (err) {
            apiHandler.handleErr(res, err);
        })

};

CustomerController.prototype.getCouponConsumedMembershipByShare = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    if (user.membership && user.membership.isTriDayShareRewardReceived) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1604));
    }
    if (!user.membership || !user.membership.balance ||
        (user.membership && user.membership.balance && user.membership.balance < constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_8)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(2109));
    }
    Promise.resolve()
        .then(function () {
            return CustomerService.hasTheDeviceGot(user.deviceId, userId + '', '', '', '4.5.0', constants.COUPON_ACTIVITYNO_CASH_3DAY_8)
        })
        .then(function (_deviceRes) {
            if (_deviceRes) {
                throw ErrorHandler.getBusinessErrorByCode(2115);
            }
            var coupon_new = {
                activityNO: constants.COUPON_ACTIVITYNO_CASH_3DAY_8,
                type: 9,
                title: constants.COUPON_ACTIVITYNO_CASH_3DAY_TITLE_8,
                subTitle: constants.COUPON_ACTIVITYNO_CASH_3DAY_SUBTITLE_8,
                description: constants.COUPON_ACTIVITYNO_CASH_3DAY_SUBTITLE_8,
                manual: '',
                rmb: constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_8,
                deductedRMB: constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_8,
                rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_8,
                expiredAt: constants.COUPON_ACTIVITYNO_CASH_3DAY_EXPIREDAT_8,
                validAt: constants.COUPON_ACTIVITYNO_CASH_3DAY_VALIDAT_8,
                boundUserId: userId,
                boundUserPhoneNum: user.phoneNum,
                orderId: ''
            };

            console.log('coupon:', coupon_new);
            return CouponService.createUnionCodeCoupon(coupon_new)
        })
        .then(function (_coupon) {
            var updateData = {
                $inc: {
                    "membership.balance": -constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_8
                },
                $set: {
                    "membership.isTriDayShareRewardReceived": true
                }
            };
            return CustomerService.updateBasicInfoByCond({
                _id: userId,
                'membership.balance': {$gte: constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_8}
            }, updateData);
        })
        .then(function () {
            apiHandler.OK(res, {});
        }, function (err) {
            apiHandler.handleErr(res, err);
        })

};

CustomerController.prototype.sharePromotionByAuthCode = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['authCode', 'phoneNum']
    };
    var user;
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var now = new Date();
        var expiredAt = new Date(commonUtil.getDateMidnight(now.setDate(now.getDate() + 7))).getTime() - 1;
        ValidateService.validateByPhone(data.phoneNum, data.authCode)
            .then(function (v) {
                return CustomerService.validUser(data.phoneNum, null, null, "sharePromotion");
            })
            .then(function (u) {
                user = u;
                if (user.membership && user.membership.isShareRewardReceived) {
                    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1604));
                }

                var coupon_new = {
                    activityNO: constants.COUPON_ACTIVITYNO_CASH_SHARE_5,
                    type: 9,
                    title: constants.COUPON_ACTIVITYNO_CASH_SHARE_TITLE_5,
                    subTitle: constants.COUPON_ACTIVITYNO_CASH_SHARE_SUBTITLE_5,
                    description: constants.COUPON_ACTIVITYNO_CASH_SHARE_SUBTITLE_5,
                    manual: '',
                    rmb: constants.COUPON_ACTIVITYNO_CASH_SHARE_RMB_5,
                    deductedRMB: constants.COUPON_ACTIVITYNO_CASH_SHARE_RMB_5,
                    rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_CASH_SHARE_RMB_5,
                    expiredAt: expiredAt,
                    boundUserId: user._id,
                    boundUserPhoneNum: user.phoneNum,
                    orderId: ''
                };
                console.log('coupon:', coupon_new);
                return CouponService.createUnionCodeCoupon(coupon_new)
            })
            .then(function (_coupon) {
                var updateData = {
                    $inc: {
                        "membership.balance": constants.MEMBERSHIP_ACTIVITYNO_DISCOUNT_SHARE_5
                    },
                    $set: {
                        "membership.isTriDayShareRewardReceived": true
                    }
                };
                return CustomerService.updateUserById(user._id, updateData);
            })
            .then(function () {
                    apiHandler.OK(res);
                    LoggerService.trace(LoggerService.getTraceDataByReq(req)); //和发送验证码的log一起用，不能删
                },
                function (err) {
                    console.log(err);
                    apiHandler.handleErr(res, err);
                });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
}

CustomerController.prototype.shopApply = function (req, res) {
    var payload = req.body;
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var fields = {
        required: ['shopCity', 'shopName', 'shopAddress', 'shopType', 'shopPhoneNum', 'shopAvatar', 'shopLicense', 'shopSubType'],
        optional: ['shopAddressMapLon', 'shopAddressMapLat']
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        if (data.shopName.length > 20) {
            apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1534));
            return;
        }
        var phoneFixed = commonUtil.isValidFixedPhone(data.shopPhoneNum),//座机号,带中划线
            phoneMobile = commonUtil.isValidPhone(data.shopPhoneNum);
        if (!phoneMobile && !phoneFixed) {
            apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1203));
            return;
        }
        var application_new = data;

        application_new.type = 17;
        application_new.applicantId = userId;
        application_new.applicantRef = user.doctorRef._id;
        application_new.applicantName = user.name;
        application_new.applicantPhone = user.phoneNum;
        application_new.applicantDocChatNum = user.docChatNum;

        ApplicationService.createApplication(application_new)
            .then(function (_appl) {
                var updateUser = {
                    shopVenderApplyStatus: 1
                }
                if (user && user.shopVenderApplyStatus >= 3) {
                    updateUser.shopVenderApplyStatus = 4
                }
                return CustomerService.updateUserById(userId, updateUser)
            })
            .then(function (_user) {
                    if (!_user) {
                        throw ErrorHandler.getBusinessErrorByCode(8005);
                    }
                    apiHandler.OK(res);
                },
                function (err) {
                    console.log(err);
                    apiHandler.handleErr(res, err);
                })
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
}
CustomerController.prototype.getCouponConsumedMembershipByShareOut = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['authCode', 'phoneNum']
    };
    var user;
    var onFailure = function (handler, type) {
        handler(res, type);
    };

    var onSuccess = function (handler, data) {
        // API 限流
        if (CacheService.isUserAPIUseOverLimit(data.phoneNum, "get3DayCouponStep3")) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8003));
        } else {
            CacheService.addOrUpdUserApiLimit(data.phoneNum, "get3DayCouponStep3");
        }
        var toConsume = (constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_6 + constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_7 + constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_8);
        ValidateService.validateByPhone(data.phoneNum, data.authCode)
            .then(function (v) {
                return CustomerService.validUser(data.phoneNum, null, null, "share3Day");
            })
            .then(function (u) {
                user = u;
                if (user.membership && (user.membership.isTriDayRewardReceived || user.membership.isTriDayShareRewardReceived)) {
                    // return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1604));
                    throw ErrorHandler.getBusinessErrorByCode(1604);
                }
                if (!user.membership || !user.membership.balance ||
                    (user.membership && user.membership.balance && user.membership.balance < toConsume)) {
                    throw ErrorHandler.getBusinessErrorByCode(2109);
                }
                var coupon_new1 = {
                    activityNO: constants.COUPON_ACTIVITYNO_CASH_3DAY_6,
                    type: 9,
                    title: constants.COUPON_ACTIVITYNO_CASH_3DAY_TITLE_6,
                    subTitle: constants.COUPON_ACTIVITYNO_CASH_3DAY_SUBTITLE_6,
                    description: constants.COUPON_ACTIVITYNO_CASH_3DAY_SUBTITLE_6,
                    manual: '',
                    rmb: constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_6,
                    deductedRMB: constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_6,
                    rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_6,
                    expiredAt: constants.COUPON_ACTIVITYNO_CASH_3DAY_EXPIREDAT_6,
                    validAt: constants.COUPON_ACTIVITYNO_CASH_3DAY_VALIDAT_6,
                    boundUserId: user._id,
                    boundUserPhoneNum: user.phoneNum,
                    orderId: ''
                };
                var coupon_new2 = {
                    activityNO: constants.COUPON_ACTIVITYNO_CASH_3DAY_7,
                    type: 9,
                    title: constants.COUPON_ACTIVITYNO_CASH_3DAY_TITLE_7,
                    subTitle: constants.COUPON_ACTIVITYNO_CASH_3DAY_SUBTITLE_7,
                    description: constants.COUPON_ACTIVITYNO_CASH_3DAY_SUBTITLE_7,
                    manual: '',
                    rmb: constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_7,
                    deductedRMB: constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_7,
                    rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_7,
                    expiredAt: constants.COUPON_ACTIVITYNO_CASH_3DAY_EXPIREDAT_7,
                    validAt: constants.COUPON_ACTIVITYNO_CASH_3DAY_VALIDAT_7,
                    boundUserId: user._id,
                    boundUserPhoneNum: user.phoneNum,
                    orderId: ''
                };
                var coupon_new3 = {
                    activityNO: constants.COUPON_ACTIVITYNO_CASH_3DAY_8,
                    type: 9,
                    title: constants.COUPON_ACTIVITYNO_CASH_3DAY_TITLE_8,
                    subTitle: constants.COUPON_ACTIVITYNO_CASH_3DAY_SUBTITLE_8,
                    description: constants.COUPON_ACTIVITYNO_CASH_3DAY_SUBTITLE_8,
                    manual: '',
                    rmb: constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_8,
                    deductedRMB: constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_8,
                    rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_CASH_3DAY_RMB_8,
                    expiredAt: constants.COUPON_ACTIVITYNO_CASH_3DAY_EXPIREDAT_8,
                    validAt: constants.COUPON_ACTIVITYNO_CASH_3DAY_VALIDAT_8,
                    boundUserId: user._id,
                    boundUserPhoneNum: user.phoneNum,
                    orderId: ''
                };
                var coupon_news = [coupon_new1, coupon_new2, coupon_new3];
                console.log('coupon:', coupon_news);
                return CouponService.createUnionCodeCoupons(coupon_news);
            })
            .then(function (_coupon) {
                var updateData = {
                    $inc: {
                        "membership.balance": -toConsume
                    },
                    $set: {
                        "membership.isTriDayShareRewardReceived": true,
                        "membership.isTriDayRewardReceived": true
                    }
                };
                return CustomerService.updateBasicInfoByCond({
                    _id: user._id,
                    'membership.balance': {$gte: toConsume}
                }, updateData);
            })
            .then(function () {
                    apiHandler.OK(res);
                    LoggerService.trace(LoggerService.getTraceDataByReq(req)); //和发送验证码的log一起用，不能删
                },
                function (err) {
                    console.log(err);
                    apiHandler.handleErr(res, err);
                });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
}

CustomerController.prototype.markMessageRead = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['messageId'],
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var userId = req.identity ? req.identity.userId : '';
        var user = req.identity && req.identity.user ? req.identity.user : null;
        if (!commonUtil.isUUID24bit(userId) || !commonUtil.isUUID24bit(data.messageId) || !commonUtil.isExist(user)) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        var cond = {
            userId: userId,
            _id: data.messageId
        }
        var update = {
            isViewed: true
        }
        MessageService.updateMessage(cond, update)
            .then(function (_message) {
                if (!_message) {
                    throw ErrorHandler.getBusinessErrorByCode(2100);
                }
            })
            .then(function () {
                apiHandler.OK(res);

            }, function (err) {
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
}

CustomerController.prototype.getTransaction = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    var orderId = req.query.orderId || '';
    var type = req.query.type;
    //var trxType = req.query.trxType || '';
    //if (trxType == 'hongbao_refund') {
    //    trxType = 'hongbaoRefund';
    //}
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isUUID24bit(orderId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    Promise.resolve()
      .then(function(){
        if(req.query.type && req.query.type == 7){
          return ServicePackageOrderService.findOrder(orderId)
        }
      })
      .then(function(order){
          var sql_type;
          if(order){
            orderId = order.orderId;
            if(order.orderStatus == 700){
              sql_type = 'income'
            }
          }
        var sqls = TransactionMysqlService.genGetOrderAllInfoTransaction(userId, orderId,sql_type);
        return TransactionMysqlService.execSqls(sqls)
      })
        .then(function (_res) { // 更新订单状态
            if (!_res || _res.length < 1) {
                return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(2100));
            }
            apiHandler.OK(res, _res[0]);
        });
}

CustomerController.prototype.initUserInfo = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['password', "name", "sex"],
        optional: ['channelCode']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var userId = req.identity ? req.identity.userId : '';
        var user = req.identity && req.identity.user ? req.identity.user : null;
        if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        data.loginPassword = commonUtil.genJuliyeMD5(data.password);
        var userInfo;
        CustomerService.updateBaseInfo(userId, data)
            .then(function (u) {
                userInfo = JSON.parse(JSON.stringify(u));
                return CustomerService.inviteReward(userId);
            })
            .then(function(){
              let user_center_service = Backend.service('user_center','handle_user_center');
              return  user_center_service.must_init(userInfo);
            })
            .then(function () {
                  userInfo.hasPwd = true;
                  delete userInfo.password;
                  delete userInfo.loginPassword;
                apiHandler.OK(res, userInfo);

                var zlucare_service = require('./../services/zlycareService');
                zlucare_service.updateUser(userInfo._id, userInfo.name).then(function () {
                })

            }, function (err) {
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
}

CustomerController.prototype.setPwdByAuthCode = function (req, res) {
  var payload = req.body;
  var fields = {
    required: ['phoneNum', "authCode", "password"]
  };

  var onFailure = function (handler, type) {
    handler(res, type);
  };
  var onSuccess = function (handler, data) {
    data.password = commonUtil.genJuliyeMD5(data.password);
    var reset_password = Backend.service('user_center', 'handle_user_center').reset_password;
    return reset_password(data.phoneNum, data.authCode, '',
      data.password)
    .then(function (_res) {
      if (_res) {
        if (_res.errno === 0) {
          return CustomerService.updateBaseInfoByPhoneNum(data.phoneNum, {"loginPassword": data.password})
          .then(function (u) {
            if (!u) {
              throw ErrorHandler.getBusinessErrorByCode(8005);
            } else {
              apiHandler.OK(res, {});
            }
          }, function (err) {
            apiHandler.handleErr(res, err);
          })
        } else if (_res.errno === 2001) {
          throw ErrorHandler.getBusinessErrorByCode(1502);
        } else {
          throw ErrorHandler.getBusinessErrorByCode(9000);
        }
      }
    })
    .catch(function (err) {
      apiHandler.handleErr(res, err);
    })

  };

  commonUtil.validate(payload, fields, onSuccess, onFailure);
}

CustomerController.prototype.setPwdByOldPwd = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ["password"],
        optional: ['oldPassword']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var userId = req.identity ? req.identity.userId : '';
        var user = req.identity && req.identity.user ? req.identity.user : null;
        if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        data.password = commonUtil.genJuliyeMD5(data.password);
      if(user.phoneNum){
        var user_center = Backend.service('user_center', 'handle_user_center');
        Promise.resolve()
        .then(function(){
            if(user.loginPassword){
              return user_center.reset_password(user.phoneNum, '',
                commonUtil.genJuliyeMD5(data.oldPassword), data.password);
            }else{
              return user_center.init_user_without_pwd(user,data.password);
            }
        })
        .then(function (_res) { 
          if (_res) {
            if (_res.errno === 0) {
              return CustomerService.updateBaseInfo(userId, {"loginPassword": data.password})
              .then(function (u) {
                apiHandler.OK(res, {});
              })
            } else if (_res.errno === 2000) {
              throw ErrorHandler.getBusinessErrorByCode(1814);
            } else {
              throw ErrorHandler.getBusinessErrorByCode(9000);
            }
          }
        }, function (err) {
          throw ErrorHandler.getBusinessErrorByCode(9000);
        })
        .catch(function (err) {
          apiHandler.handleErr(res, err);
        })
      }else{
        if (user.loginPassword && !data.oldPassword) {
          return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        } else if (user.loginPassword && data.oldPassword) {
          if (user.loginPassword != commonUtil.genJuliyeMD5(data.oldPassword)) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1814));
          } else {
            CustomerService.updateBaseInfo(userId, {"loginPassword": data.password})
            .then(function (u) {
              apiHandler.OK(res, {});
            }, function (err) {
              apiHandler.handleErr(res, err);
            })
          }
        } else if (!user.loginPassword) {
          CustomerService.updateBaseInfo(userId, {"loginPassword": data.password})
          .then(function (u) {
            apiHandler.OK(res, {});
          }, function (err) {
            apiHandler.handleErr(res, err);
          })
        }
      }


    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
}

CustomerController.prototype.businessCardApply = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['receiveArea', 'receiveAddress', 'receiveName', 'receivePhone']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var userId = req.identity ? req.identity.userId : '';
        var user = req.identity && req.identity.user ? req.identity.user : null;
        if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        data.type = 16;
        data.applicantId = userId;
        data.applicantName = user.name;
        data.applicantPhone = user.phoneNum;
        data.applicantDocChatNum = user.docChatNum;
        ApplicationService.createApplication(data)
            .then(function () {
                apiHandler.OK(res, {});
            }, function (err) {
                apiHandler.handleErr(res, err);
            });

    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

CustomerController.prototype.setCallPrice = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ["initiateIncome", "incomePerMin", "canLackMoney"],
        optional: ["lackedMoney"]
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var userId = req.identity ? req.identity.userId : '';
        var user = req.identity && req.identity.user ? req.identity.user : null;
        if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        data.initiatePayment = Math.round(data.initiateIncome * 1.25);
        data.paymentPerMin = Math.round(data.incomePerMin * 1.25);
        if (data.canLackMoney && !data.lackedMoney) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        data.doctorInitiateTime = 5;
        data.customerInitiateTime = 5;
        data.lackedMoney = Number(data.lackedMoney || 0);
        data.initiateIncome = Number(data.initiateIncome);
        data.incomePerMin = Number(data.incomePerMin);
        data.discount = 1;
        if (user && user.doctorRef && user.doctorRef.callPrice) {
            data.discount = user.doctorRef.callPrice.discount || 1;
        }
        var saveData = {
            callPrice: data
        }
        DoctorService.updateBaseInfo(user.doctorRef._id, saveData)
            .then(function () {
                apiHandler.OK(res, {});
                LoggerService.trace(LoggerService.getTraceDataByReq(req));
            }, function (err) {
                apiHandler.handleErr(res, err);
            });

    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

CustomerController.prototype.setCostPerSale = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ["cps"]
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var userId = req.identity ? req.identity.userId : '';
        var user = req.identity && req.identity.user ? req.identity.user : null;
        if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        if (data.cps < 1 || typeof data.cps != "number") {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1212));
        }
        if (user.marketing && user.marketing.cpsUpdatedAt && isTwoTimeSameDay(user.marketing.cpsUpdatedAt, Date.now()) && user.marketing.cps != 0) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1213));
        }

        var updateData = {};
        updateData["marketing.cps"] = data.cps;
        updateData["marketing.cpsUpdatedAt"] = Date.now();
        if (user.marketing && user.marketing.remainBalance) {
            var balance = user.marketing.remainBalance || 0;
            updateData["marketing.remainMemberSize"] = Math.floor(balance / data.cps)
        }
        CustomerService.updateUserById(userId, {$set: updateData})
            .then(function (_user) {
                if (_user) {
                    apiHandler.OK(res, {});
                }
                LoggerService.trace(LoggerService.getTraceDataByReq(req));
            }, function (err) {
                apiHandler.handleErr(res, err);
            });

    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

var isTwoTimeSameDay = function (time1, time2) {
    var Date1 = new Date(time1);
    var Date2 = new Date(time2);
    if (Date1.getFullYear() == Date2.getFullYear() && Date1.getMonth() == Date2.getMonth() && Date1.getDate() == Date2.getDate()) {
        return true
    } else {
        return false
    }
};

CustomerController.prototype.createMessage = function (req, res) {
    var payload = req.body;
    var id = req.identity && req.identity.userId;
    var version = req.identity.appVersion;
    var appUser = req.identity && req.identity.user ? req.identity.user : '';

    var fields = {
        required: ["type", 'messageTo', 'content'],
        optional: ['pics', 'orderId', 'subType', 'toMessageId']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        if (!commonUtil.isUUID24bit(id) || !commonUtil.isExist(appUser) || !commonUtil.isUUID24bit(data.messageTo)) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        var pushId, messageToUser;
        CustomerService.getInfoByID(data.messageTo)
            .then(function (u) {
                if (!u) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                }
                messageToUser = u;
                pushId = u.pushId;
                if (data.subType == 'pay') { // 提醒支付留言
                    if (data.type != 'personal' || !data.orderId) {
                        throw ErrorHandler.getBusinessErrorByCode(8005);
                    }
                    return OrderService.getOrderByID(data.orderId);
                }
            })
            .then(function (_order) {
                if (data.subType == 'pay') {
                    if (!_order || _order.calleeId != (appUser._id + '')) {
                        throw ErrorHandler.getBusinessErrorByCode(8005);
                    }
                    if (!_order.willIncome) {
                        //TODO:
                    }
                    var dateNum = 1000 * 60 * 60 * 24;
                    if (Math.floor(_order.remindToPayAt / dateNum) == Math.floor(Date.now() / dateNum)) {
                        throw ErrorHandler.getBusinessErrorByCode(1815);//今天已提醒了
                    }
                    OrderService.updateOrderInfo(data.orderId, {remindToPayAt: Date.now()});
                    data.content = '您好，您于' + commonUtil.genCommonDate(_order.createdAt) + '向我发起过付费咨询，但仍有部分款项尚未结清，请进入“我的钱包”，充值以完成支付。祝您生活愉快～'
                }

                var msgData = {};
                msgData.userId = data.messageTo;
                msgData.type = data.type;
                msgData.title = appUser.name + "的留言";
                msgData.content = data.content;
                msgData.link_title = appUser.name + "的留言";
                msgData.messageFrom = id;
                msgData.messageTo = data.messageTo;
                if (data.pics) {
                    msgData.pics = data.pics;
                }
                if (data.toMessageId) {
                    msgData.toMessageId = data.toMessageId;
                }
                if (!messageToUser.latestLoginVersion || messageToUser.latestLoginVersion <= '4.0.5') {
                    //设置leaveMsgUsers []
                    if (!messageToUser.leaveMsgUsers || (messageToUser.leaveMsgUsers && messageToUser.leaveMsgUsers.indexOf(id) < 0)) { //第一次留言,发送短信
                        commonUtil.sendSms(1706236, messageToUser.phoneNum, "#name#=" + appUser.name);
                    }
                } else {
                    var notificationExtras = {
                        type: 3,//type: 1,为收藏推送, 2,消息中心
                        contentType: 'personal'
                    };
                    var messageNotification = appUser.name + '给你留言了：' + data.content;
                    if (messageNotification.length > 30) {
                        messageNotification = messageNotification.substring(0, 29) + "...";
                    }
                    JPushService.pushNotification(pushId, messageNotification, '', notificationExtras);
                    var extras = {
                        type: 1,//有新消息
                        contentType: 'personal' //moment-动态, personal-个人留言, sys-系统通知
                    };
                    JPushService.pushMessage(pushId, data.content, '', extras);
                }

                CustomerService.updateBaseInfo(messageToUser._id, {
                    $addToSet: {leaveMsgUsers: (id + '')},
                    'msgReadStatus.personal': true,
                    'msgReadStatus.all': true
                });
                return MessageService.createMessage(msgData);
            })
            .then(function () {
                apiHandler.OK(res, {});
            }, function (err) {
                apiHandler.handleErr(res, err);
            })


    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);

}

CustomerController.prototype.setNote = function (req, res) {
    var payload = req.body;
    var id = req.identity && req.identity.userId;
    var version = req.identity.appVersion;
    var appUser = req.identity && req.identity.user ? req.identity.user : '';

    var fields = {
        required: ["userId", 'noteName'],
        optional: ['desc', 'pics']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        if (!commonUtil.isUUID24bit(id) || !commonUtil.isExist(appUser) || !commonUtil.isUUID24bit(data.userId)) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        var noteUser;
        CustomerService.getInfoByID(data.userId)
            .then(function (u) {
                if (!u) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                }
                noteUser = u;
                return SocialRelService.findRelByRelIds(id, data.userId)
            })
            .then(function (_rel) {
                var relData = {
                    user: id,
                    userDoctorRef: appUser.doctorRef._id,
                    userDocChatNum: appUser.docChatNum,
                    relUser: data.userId,
                    relUserDoctorRef: noteUser.doctorRef._id,
                    relUserDocChatNum: noteUser.docChatNum,
                    noteInfo: {
                        noteName: data.noteName,
                        desc: data.desc || "",
                        pics: data.pics || []
                    }
                };
                if (!_rel) {
                    return SocialRelService.createRel(relData);
                } else {
                    return SocialRelService.updateRel(_rel._id, relData)
                }
            })
            .then(function (_relation) {

                if (!_relation) {
                    throw ErrorHandler.getBusinessErrorByCode(8007);
                }
                return SocialRelService.findRelByRelIds(data.userId, id);
            })
            .then(function (_rel) {
                var relData = {
                    user: noteUser._id,
                    userDoctorRef: noteUser.doctorRef._id,
                    userDocChatNum: noteUser.docChatNum,
                    relUser: appUser._id,
                    relUserDoctorRef: appUser.doctorRef._id,
                    relUserDocChatNum: appUser.docChatNum,
                    notedName: data.noteName
                };
                if (!_rel) {
                    SocialRelService.createRel(relData);
                } else {
                    SocialRelService.updateRel(_rel._id, {$set: {notedName: data.noteName}});
                }
                apiHandler.OK(res, {});
            }, function (err) {
                apiHandler.handleErr(res, err);
            })


    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);

}


CustomerController.prototype.getMsgReadStatus = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    CustomerService.updateBaseInfo(userId, {'msgReadStatus.all': false});
    apiHandler.OK(res, user.msgReadStatus);
}

CustomerController.prototype.momentMessage = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    if (req.query.to_user_id && req.query.to_user_id != '')
        userId = req.query.to_user_id;
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE, {msgCreatedAt: -1});
    //1.查询动态消息
    //2.内部分页( bookmark )
    //3.关联查询动态消息中的数据
    var items = [], momentIds = [], moments = [], momentUserIds = [], momentUsers = [], momentMsg, resItems = [];
    MomentMsgService.getMomentMsgById(userId)
        .then(function (_momentMsg) {
            if (!_momentMsg) {
                return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
            }
            momentMsg = _momentMsg;
            var momentList = _momentMsg.momentList || [];
            // 通过momentUser 过滤 是不是当前用户发的动态 [ 过滤当前属性可能有问题 ]
            //if (req.query.to_user_id && req.query.to_user_id != ''){
            //  momentList = _.filter(momentList,item => {
            //    if(item.momentUser == userId && !item.originalMomentId) return true;
            //    return false;
            //  } );
            //}
            //console.log(momentList)

            var bookmark = Number(req.query.bookmark || 0);
            for (var i = (momentList.length - 1 - pageSlice.skip); i >= 0; i--) {
                if (momentList[i].isDeleted == false) {
                    if (pageSlice.skip <= 0) {
                        items.push(momentList[i]);
                    } else if (momentList[i].msgCreatedAt < bookmark) {
                        items.push(momentList[i])
                    }
                    if (items.length >= pageSlice.limit) {
                        break;
                    }
                }
            }
            items = JSON.parse(JSON.stringify(items));


            items.forEach(function (item) {
                if (item.moment && momentIds.indexOf(item.moment + '') < 0) {
                    momentIds.push(item.moment + '');
                }
                if (momentUserIds.indexOf(item.momentUser + '') < 0) {
                    if (item.momentUser) {
                        momentUserIds.push(item.momentUser + '');
                    }
                }
                if (item.originalUser && item.originalUser.userId && momentUserIds.indexOf(item.originalUser.userId + '') < 0) {
                    momentUserIds.push(item.originalUser.userId + '');
                }
            })
            momentIds = _.uniq(momentIds);
            momentUserIds = _.uniq(momentUserIds);
            return MomentService.getMomentByIds(momentIds, {fields: ''});
        })
        .then(function (_moments) {
            moments = JSON.parse(JSON.stringify(_moments));
            return CustomerService.getInfoByIDs(momentUserIds, {fields: 'name avatar docChatNum sex shopVenderApplyStatus shopName shopAvatar'});
        })
        .then(function (_momentUsers) {
            console.log("_momentsUsers length" + _momentUsers.length)
            momentUsers = JSON.parse(JSON.stringify(_momentUsers));
            moments = _.indexBy(moments, '_id');
            momentUsers = _.indexBy(momentUsers, '_id');


            items.forEach(function (item) {
                if (moments[item.moment + ''] && momentUsers[item.momentUser + '']) {
                    item.moment = moments[item.moment + ''];
                    item.momentUser = momentUsers[item.momentUser + ''];
                    if (item.moment && item.momentUser) {
                        //console.log('', item.momentUser);
                        if (CustomerService.isShopAuthorized(item.momentUser.shopVenderApplyStatus)) {
                            item.momentUser.name = item.momentUser.shopName || item.momentUser.name || '';
                            item.momentUser.avatar = item.momentUser.shopAvatar || item.momentUser.avatar || '';
                        }
                        resItems.push(item);
                    }
                }
            })
            console.log("resItems" + resItems.length);
            resItems = JSON.parse(JSON.stringify(resItems));
            for (var i = 0; i < resItems.length; i++) {
                if (resItems[i] && resItems[i].moment && resItems[i].moment.recommendedUser) {
                    var _recommendedUser = resItems[i].moment.recommendedUser;
                    resItems[i].moment.recommendedUser.userName = _recommendedUser.name;
                    if (CustomerService.isShopAuthorized(_recommendedUser.shopVenderApplyStatus)) {
                        resItems[i].moment.recommendedUser.userName = _recommendedUser.shopName || _recommendedUser.name || '';
                    }
                    resItems[i].moment.recommendedUser.userId = resItems[i].moment.recommendedUser._id;
                    delete resItems[i].moment.recommendedUser.name;
                    delete resItems[i].moment.recommendedUser._id;
                }
                resItems[i].momentUser.userId = resItems[i].momentUser._id;
                delete resItems[i].momentUser._id;
            }
            momentMsg = JSON.parse(JSON.stringify(momentMsg));
            var relUserIds = [];
            resItems.forEach(function (item) {
                relUserIds.push(item.momentUser.userId);
                relUserIds.push(item.moment.originalUser.userId);
                if (item.moment.recommendedUser) {
                    relUserIds.push(item.moment.recommendedUser.userId);
                }
            });

            return SocialRelService.getNoteNameByIds(userId, relUserIds)
        })
        .then(function (_nameList) {
            var relNameList = _.indexBy(_nameList, "relUser");

            resItems.forEach(function (item) {
                if (relNameList[item.momentUser.userId] && !CustomerService.isShopAuthorized(item.momentUser.shopVenderApplyStatus)) {
                    item.momentUser.name = relNameList[item.momentUser.userId] && relNameList[item.momentUser.userId].noteInfo && relNameList[item.momentUser.userId].noteInfo.noteName || item.momentUser.name;
                }
                if (relNameList[item.moment.originalUser.userId]) {
                    item.moment.originalUser.userName = relNameList[item.moment.originalUser.userId] && relNameList[item.moment.originalUser.userId].noteInfo && relNameList[item.moment.originalUser.userId].noteInfo.noteName || item.moment.originalUser.userName
                }
                var _originalUserId = item.moment.originalUser.userId;
                var _originalUser = momentUsers[_originalUserId];
                if (_originalUserId && _originalUser && CustomerService.isShopAuthorized(_originalUser.shopVenderApplyStatus)) {
                    //console.log('_originalUser',_originalUser);
                    item.moment.originalUser.userName = _originalUser.shopName || _originalUser.name || '';
                }
                if (item.moment.recommendedUser) {
                    if (relNameList[item.moment.recommendedUser.userId] && !CustomerService.isShopAuthorized(item.moment.recommendedUser.shopVenderApplyStatus)) {
                        item.moment.recommendedUser.userName = relNameList[item.moment.recommendedUser.userId] && relNameList[item.moment.recommendedUser.userId].noteInfo && relNameList[item.moment.recommendedUser.userId].noteInfo.noteName || item.moment.recommendedUser.userName
                    }
                }
            })
            momentMsg.items = resItems;
            delete  momentMsg.momentList;
            if (req.query.pageNum == 0 || !req.query.pageNum) {
                if (items.length) {
                    momentMsg.bookmark = items[items.length - 1].msgCreatedAt;
                }
            } else {
                momentMsg.bookmark = req.query.bookmark
            }
            CustomerService.updateBaseInfo(userId, {
                'msgReadStatus.moment': false,
                'msgReadStatus.all': false
            });

            var moment_msg_service = Backend.service("1/city_buy", "moment_msg");
            //
            momentMsg.items.forEach(function (item) {
                /*var momentURL = item.momentURL || '';
                 delete item.momentURL;*/
                var momentURL = item.moment && item.moment.momentURL;
                delete item.moment.momentURL;
                item.moment.displayURL = moment_msg_service.momentURL(item.moment.displayContent, momentURL || []);
                if (item.moment.location && item.moment.location.length > 0) item.moment.location = item.moment.location.reverse();
                // 检查用户是否点赞该动态
                item.moment.isZan = _.contains(item.moment.zanUsers, userId);
            })
            return momentMsg;
        })
        .then(function (result) {
            apiHandler.OK(res, result);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

CustomerController.prototype.getMessage = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    var msgId = req.query.msgId || '';
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user) || !commonUtil.isUUID24bit(msgId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }

    MessageService.getMessageById(msgId)
        .then(function (_msg) {
            if (!_msg || ((_msg.userId + '') != userId)) {
                return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
            }
            apiHandler.OK(res, _msg);
            var type = _msg.type;
            if (['hongbao_record', 'hongbao_refund'].indexOf(type) > -1) {
                type = 'sys';
            }
            var updateData = {
                hasNewMessage: false,
                'msgReadStatus.all': false
            };
            updateData['msgReadStatus.' + type] = false;
            CustomerService.updateBaseInfo(userId, updateData);
            MessageService.updateMessage({_id: msgId}, {isViewed: true});
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};


CustomerController.prototype.getMembershipInfo = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    MembershipService.getUserMembershipInfo(userId)
        .then(function (_info) {
            var resData = _info;
            resData.membershipVals = constants.membershipVals;
            apiHandler.OK(res, resData);
        }, function (err) {
            apiHandler.handleErr(res, err);
        })
};

CustomerController.prototype.getMarketingInfo = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var resData;
    CustomerService.getInfoByID(userId, "marketing")
        .then(function (_user) {
            resData = _user.marketing || {};
            if (resData.cps) {
                resData.isCPSCreated = true;
            } else {
                resData.isCPSCreated = false;
            }
            resData.balance = Math.round(resData.balance * 100) / 100;
            resData.remainBalance = Math.round(resData.remainBalance * 100) / 100;

            apiHandler.OK(res, resData);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

CustomerController.prototype.shopInfo = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var resData;
    CustomerService.getInfoByID(userId, {customerFields: "shopCity shopName shopAddress shopAddressMapLon shopAddressMapLat shopType shopPhoneNum shopAvatar shopLicense shopVenderApplyStatus shopSubType"})
        .then(function (_user) {
            resData = _user;
            if (_user.shopVenderApplyStatus && (_user.shopVenderApplyStatus == 2 || _user.shopVenderApplyStatus == 5)) {
                return ApplicationService.findLastShopApplication(userId)
            }
        })
        .then(function (_appl) {
            if (_appl) {
                resData = _appl[0]
            }
            apiHandler.OK(res, resData);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

CustomerController.prototype.allShopType = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var resData = constants.allShopType;
    apiHandler.OK(res, resData);

};

CustomerController.prototype.membershipList = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var cardType = req.query.cardType || 'city_buy';

    var nowTS = Date.now();
    var todayBeginTS = new Date(commonUtil.getDateMidnight(nowTS)).getTime();
    var memberships;
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, configs.pageSizeBig, {expiredAt: -1});

    MembershipService.getValidMembershipList(userId, cardType, pageSlice)
        .then(function (_memberships) {
            _memberships = JSON.parse(JSON.stringify(_memberships));
            _memberships.forEach(function (item) {
                if ((todayBeginTS + constants.membershipExpiringTS) > item.expiredAt || 0) {
                    item.willExpire = true;
                } else {
                    item.willExpire = false;
                }
            });
            memberships = _memberships
            return MembershipService.getmembershipCount(userId)
        })
        .then(function (_count) {
            var result = {}
            result.historyCount = _count;
            result.items = memberships;
            apiHandler.OK(res, result);
        }, function (err) {
            apiHandler.handleErr(res, err);
        })

};

CustomerController.prototype.getMyMessages = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var items;
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE_1K, {updatedAt: -1});
    var resData = {};

    MessageService.getMyMessages(userId, pageSlice)
        .then(function (result) {
            items = JSON.parse(JSON.stringify(result))
            var relUserIds = [];
            items.forEach(function (item) {
                if (item.messageTo) {
                    relUserIds.push(item.messageTo._id);
                }
            });
            return SocialRelService.getNoteNameByIds(userId, relUserIds)
        })
        .then(function (_nameList) {
            var relNameList = _.indexBy(_nameList, "relUser");
            items.forEach(function (item) {
                if (relNameList[item.messageTo._id]) {
                    item.messageTo.name = relNameList[item.messageTo._id] && relNameList[item.messageTo._id].noteInfo && relNameList[item.messageTo._id].noteInfo.noteName || item.messageTo.name
                }
            })
            items.forEach(function (item) {
                if (item.messageTo)
                    item.title = "给" + item.messageTo.name + "的留言";
                item.link_title = "给" + item.messageTo.name + "的留言";
            })
            var resData = {
                items: items
            }
            apiHandler.OK(res, resData);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};
//web获取余额和最佳优惠券信息
CustomerController.prototype.getBestCoupon = function (req, res) {
    console.log("come in");
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    var price = req.query.price;
    var type = req.query.type; //normal product购买产品
    var couponId = req.query.couponId;

    var venderUserId = req.query.venderUserId;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var resData = {};
    var doctorId = user.doctorRef._id + "";
    resData.actualPayPrice = price || 0;
    var now = Date.now();
    OrderService.getLatestTransferOrderByCustomerId(type == "product" ? userId : null, now - constants.TIME_7_DAY)
        .then(function (count) {
            //一个星期只能买一次
            if (count > 0) {
                throw ErrorHandler.getBusinessErrorByCode(1531);
            }
            return TransactionMysqlService.getAccountByUserIdAndDoctorId(userId + '', doctorId)
        })
        .then(function (_account) {
            _account.amount = Math.floor(_account.amount * 100) / 100;
            resData = _account;
            if (venderUserId && commonUtil.isUUID24bit(venderUserId)) {
                return CustomerService.getInfoByID(venderUserId);
            }
        })
        .then(function (_vender) {
            if (!_vender) {
                throw ErrorHandler.getBusinessErrorByCode(8005);
            }
            if (!_vender.isVender && couponId) {
                throw ErrorHandler.getBusinessErrorByCode(2113);
            }
            // if(_vender && _vender.isVender){
            //   return CouponService.getTransferCouponByUserId(userId)
            // }
            if (couponId) {
                return CouponService.getCouponById(couponId)
            }
        })
        .then(function (_coupon) {
            if (_coupon) {
                if (_coupon.type == 5) {
                    resData.couponTitle = "代金券抵扣: ¥" + _coupon.rmb.toFixed(2);
                } else if (_coupon.type == 6) {
                    resData.couponTitle = "代金券抵扣: ¥" + _coupon.rmb.toFixed(2);
                } else if (_coupon.type == 7) {
                    resData.couponTitle = "代金券抵扣: ¥" + _coupon.rmb.toFixed(2);
                }
                resData.couponId = _coupon._id;
                if (_coupon.type == 7) {
                    resData.couponRMB = (price * (1 - _coupon.discount)) < _coupon.higherThreshold ? Math.round(price * (1 - _coupon.discount) * 100) / 100 : _coupon.higherThreshold;
                } else {
                    resData.couponRMB = _coupon.rmb;
                }
                resData.actualPayPrice = (price - resData.couponRMB) > 0.01 ? price - resData.couponRMB : 0;
            }
            // var bestCoupon;
            // bestCoupon = getBestCoupon(_coupons,price);
            // if(bestCoupon){
            //   console.log("+++++")
            //   console.log(bestCoupon.type)
            //   resData.couponId = bestCoupon._id;
            //   if(bestCoupon.type == 7){
            //     resData.couponRMB = (price * ( 1 - bestCoupon.discount)) < bestCoupon.higherThreshold ? Math.round(price * ( 1 - bestCoupon.discount)*100)/100 : bestCoupon.higherThreshold ;
            //   }else{
            //     resData.couponRMB = bestCoupon.rmb;
            //   }
            //   resData.actualPayPrice = (price - resData.couponRMB)>0.01 ? price - resData.couponRMB : 0 ;
            //   if(bestCoupon.type == 5){
            //     resData.couponTitle = "代金券抵扣: ¥" + resData.couponRMB.toFixed(2);
            //   }else if(bestCoupon.type == 6){
            //     resData.couponTitle = "特惠券抵扣: ¥" + resData.couponRMB.toFixed(2);
            //   }else if(bestCoupon.type == 7){
            //     resData.couponTitle = "折扣券抵扣: ¥" + resData.couponRMB.toFixed(2);
            //   }
            // }
            apiHandler.OK(res, resData);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

var getBestCoupon = function (coupons, price) {
    var bestCoupon;
    if (coupons && coupons.length > 0) {
        for (var i = 0; i < coupons.length; i++) {
            if (coupons[i].type == 7) {
                console.log(1111)
                return coupons[i];
            }
        }
        for (var i = 0; i < coupons.length; i++) {
            if (coupons[i].type == 6) {
                console.log(2222)
                return coupons[i];
            }
        }
        var left;
        var right;
        for (var i = 0; i < coupons.length; i++) {
            if (coupons[i].rmb <= price) {
                left = coupons[i];
            }
            if (coupons[i].rmb >= price) {
                right = coupons[i];
                break;
            }
        }
        ;
        if (left && right) {
            var rightDValue = Math.abs(right.rmb - price);
            var leftDValue = Math.abs(left.rmb - price);

            if (rightDValue <= leftDValue) {
                bestCoupon = right;
            } else {
                bestCoupon = left;
            }
        } else if (left && !right) {
            bestCoupon = left;
        } else if (!left && right) {
            bestCoupon = right;
        }
        console.log(bestCoupon);
        return bestCoupon;
    } else {
        return;
    }
};


CustomerController.prototype.deleteMessage = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    var msgId = req.query.msgId || '';
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user) || !commonUtil.isUUID24bit(msgId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    MessageService.getMessageById(msgId)
        .then(function (_msg) {
            if (!_msg || ((_msg.userId + '') != userId)) {
                return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
            }
            return MessageService.delMessageById(msgId);
        })
        .then(function () {
            apiHandler.OK(res);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
}

CustomerController.prototype.getCallPrice = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    var msgId = req.query.msgId || '';
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var option = {
        customerFields: 'doctorRef',
        doctorFields: 'callPrice'
    }
    CustomerService.getInfoByID(userId, option)
        .then(function (_user) {
            if (!_user || !_user.doctorRef || _user.doctorRef.isDeleted || !_user.doctorRef.callPrice) {
                return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
            }
            var resData = {
                callPrice: _user.doctorRef.callPrice
            }
            resData.priceLevelList = [ //定价模型列表
                {
                    level: "零",
                    title: "免费",
                    extra: ""
                },
                {
                    level: "一",
                    title: "5分钟内8元，之后2元/分钟",
                    extra: "允许最多欠费30元"
                },
                {
                    level: "二",
                    title: "5分钟内16元，之后4元/分钟",
                    extra: "允许最多欠费60元"
                },
                {
                    level: "三",
                    title: "5分钟内40元，之后10元/分钟",
                    extra: "允许最多欠费150元"
                },
                {
                    level: "四",
                    title: "5分钟内80元，之后18元/分钟",
                    extra: "允许最多欠费270元"
                },
                {
                    level: "五",
                    title: "5分钟内8元，之后2元/分钟",
                    extra: ""
                },
                {
                    level: "六",
                    title: "5分钟内16元，之后4元/分钟",
                    extra: ""
                },
                {
                    level: "七",
                    title: "5分钟内40元，之后10元/分钟",
                    extra: ""
                },
                {
                    level: "八",
                    title: "5分钟内80元，之后18元/分钟",
                    extra: ""
                }
            ]
            apiHandler.OK(res, resData);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

CustomerController.prototype.getPartInfoByPhoneNum = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    var phoneNum = req.query.phoneNum || '';
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var phoneFixed = commonUtil.isValidFixedPhone(phoneNum),//座机号,带中划线
        phoneMobile = commonUtil.isValidPhone(phoneNum);
    console.log('phone:', phoneNum, phoneFixed, phoneMobile);
    if (!phoneMobile && !phoneFixed) {
        apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8007));
        return;
    }
    var phoneType = phoneFixed ? 'fixed' : 'mobile';
    CustomerService.getInfoByPhone(phoneNum, "docChatNum")
        .then(function (_user) {
            if (!_user) {
                return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
            }

            apiHandler.OK(res, _user);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

CustomerController.prototype.getMarketingRegions = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    //获取用户身份为商户的所在地区
    CustomerService.getVenderRegions()
        .then(function (_regions) {
            var regions = _.map(_regions, function (_region) {
                return {
                    city: _region,
                    regionPinyin: toPinYin(_region)
                }
            });
            apiHandler.OK(res, {items: regions});
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
}
/**
 * 根据地区和类型获取商家列表信息
 * @param req
 * @param res
 */
CustomerController.prototype.getMarketingVenders = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    var version = req.identity.appVersion;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE, {
        'marketing.cps': -1,
        'marketing.checkinNum': -1
    });
    pageSlice.pageNum = parseInt(req.query.pageNum || 0);
    var region = req.query.region || '';
    var shopType = Number(req.query.shopType || 0); // 0-全城购 1-朱李叶健康
    var keyword = req.query.keyword || '';
    var lon = req.query.lon || 0;//todo:如果没有获取到log,默认值给多少?
    var lat = req.query.lat || 0;
    var resData = {
        hasMembershipBalance: false,
        //membershipBalance: user.membership && user.membership.balance || 0
    }
    var venders = [];
    var options = {
        version: version,
        shopType: shopType,
        keyword: keyword,
        pageSlice: pageSlice,
        lon: lon,
        lat: lat
    };
    console.log('options:', options);
    MembershipService.getUserMembershipInfo(userId)
        .then(function (_info) {
            if (_info && _info.balance > 0) {
                resData.hasMembershipBalance = true;
            }
            return CustomerService.getVendersFromRegion(region, options);
        })
        .then(function (_venders) {
            venders = JSON.parse(JSON.stringify(_venders));
            var _venderIds = _venders.map(function (_vender) {
                return _vender._id;
            });
            //已获取过优惠券的商家
            return CouponService.getVendersWithCoupon(userId, _venderIds, {fields: 'isConsumed boundVenderId rmb qrCode unionCode description lowestCost'});
        })
        .then(function (_coupons) {
            //console.log(_coupons);
            var _venderIds = [], _venderCouponMap = {};
            _venderIds = _.map(_coupons, function (_coupon) {
                return _coupon.boundVenderId + '';
            });
            _venderCouponMap = _.indexBy(_coupons, 'boundVenderId');
            //console.log(venders, _venderIds);
            venders.forEach(function (vender, index) {
                vender.name = constants.shopAuthorizedStatus.indexOf(vender.shopVenderApplyStatus) > -1 ? (vender.shopName || vender.name) : vender.name;
                vender.avatar = constants.shopAuthorizedStatus.indexOf(vender.shopVenderApplyStatus) > -1 ? (vender.shopAvatar || vender.avatar) : vender.avatar;
                var coupon = _venderCouponMap[vender._id + ''];
                var hasGotCoupon = _venderIds.indexOf(vender._id + '') > -1 ? true : false;//判断该用户有没有领取过这些商家的代金券
                var marketing = vender.marketing;
                delete vender.marketing;
                //console.log('marketing:',marketing);
                var randomCouponVal = CouponService.getRandomCoupon(marketing.cps, false);
                var lowestCost = hasGotCoupon ? coupon.lowestCost : CustomerService.getLowestCost(marketing.lowestCost, marketing.cps, randomCouponVal);
                vender.couponValue = hasGotCoupon ? 0 : randomCouponVal;//计算每家商铺产生的随机代金券金额
                vender.couponRule = '满' + lowestCost + '元可用';
                vender.subTitle = hasGotCoupon ? '代金券' + (coupon.rmb || 0) + '元' : '最低奖励' + vender.couponValue + '元';
                vender.couponName = '代金券';
                vender.hasCoupon = marketing && marketing.remainMemberSize > 0 ? true : false;
                vender.hasRebate = marketing && marketing.remainMemberSize > 0 ? true : false;
                vender.remainMemberSize = marketing && marketing.remainMemberSize || 0;
                vender.hasGotCoupon = hasGotCoupon;
                vender.hasCouponUsed = coupon && coupon.isConsumed ? true : false;
                vender.couponValidTimeDes = '自领取起两日';
                console.log(coupon);
                vender.userCoupon = {
                    "rmb": coupon ? (coupon.rmb || 0) : 0, //金额
                    "avatar": coupon ? (vender.avatar || '') : '', //二维码中头像
                    "qrUrl": coupon ? (serverConfigs.webHOST + constants.qrToPath + '?qrCode=' + coupon.qrCode) : '', //二维码被扫描跳转
                    "qrDesc": coupon ? constants.qrDesc : '', //二维码下的描述
                    "unionCode": coupon ? (coupon.unionCode || '') : '', //代金券唯一编号
                    "desc": coupon ? (coupon.description || '') : '' //代金券描述
                };
                delete marketing;
                //console.log('randomCouponVal:', randomCouponVal);
            });
            resData.items = venders;
            //console.log(venders.length);
            apiHandler.OK(res, resData);
            delete resData;
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
}
/**
 * 领取返现代金券
 * 1.判断该用户是否已领取过该商家的代金券
 ****今日是否领过
 ****以前是否领过,但未使用,且未过期
 * 2.判断该用户是否还有会员额度,remainBalance - 代金券金额
 * 3.判断商家是否还有可领取的代金券,并且代金券减一;且remainBalance-cps
 * 4.生成代金券
 ****记录领取时该商家是否为前三名
 ****生成代金券唯一编码
 ****生成二维码编码
 ****记录当时cps
 * 5.商家扣除一部分预定金额,成功时remainBalance-cps,consumedMemberSize+1
 * 6.商家,代金券减一,生成代金券失败,商家代金券加一;且remainBalance+cps
 * 7.用户,失败remainBalance + 代金券金额
 * @param req
 * @param res
 */
CustomerController.prototype.getMarketingCoupon = function (req, res) {
    var payload = req.body;
    var userId = req.identity && req.identity.userId;
    var appUser = req.identity && req.identity.user ? req.identity.user : '';

    var fields = {
        required: ["venderId", 'couponValue']
    };
    var couponId = commonUtil.getNewObjectId();
    var consumedMembershipOptions = {
        couponId: couponId
    }
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        data.couponValue = Number(data.couponValue || 0);
        if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(appUser) || !commonUtil.isUUID24bit(data.venderId) || data.couponValue < 0) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        var pushObj = {
            usedName: appUser.name
        };
        var vender = null, resCoupon = null;
        var isOpShop = false;
        //, hasBookVender = false, hasBookSelf = false;
        var fields = 'phoneNum marketing city avatar name docChatNum pushId shopName shopAvatar shopVenderApplyStatus shopProp';
        CustomerService.getMainInfoByID(data.venderId, {fields: fields})
            .then(function (_vender) {
                if (!_vender) {
                    throw ErrorHandler.getBusinessErrorByCode(8005);
                }
                if ((userId + '') == (_vender._id + '')) {
                    throw ErrorHandler.getBusinessErrorByCode(2117);
                }
                vender = JSON.parse(JSON.stringify(_vender));
                consumedMembershipOptions.shopId = vender._id + '';
                pushObj.pushId = vender.pushId;
                var option = {
                    fields: 'rmb unionCode description qrCode'
                };
                return CouponService.getVendersWithCoupon(userId, [data.venderId], option)
            })
            .then(function (_coupons) {
                if (_coupons && _coupons[0]) {
                    //已领取过该商家的代金券,直接返回代金券信息
                    var coupon = _coupons[0];
                    resCoupon = {
                        "rmb": coupon.rmb, //金额
                        "avatar": vender.avatar || '', //二维码中头像
                        "qrUrl": serverConfigs.webHOST + constants.qrToPath + '?qrCode=' + coupon.qrCode, //二维码被扫描跳转
                        "qrDesc": constants.qrDesc, //二维码下的描述
                        "unionCode": coupon.unionCode || '', //代金券唯一编号
                        "desc": coupon.description || '' //代金券描述
                    };
                    //if(coupon.createdAt > (Date.now() - 30 * 1000)){
                    //  throw new Error('coupon has existed');
                    //}
                    throw new Error('coupon has existed');
                }
                return MembershipService.getUserMembershipInfo(userId);
            })
            .then(function (_userMembershipInfo) {
                if (_userMembershipInfo.balance < data.couponValue) {
                    throw ErrorHandler.getBusinessErrorByCode(2105);
                }
                if (CustomerService.isOpShop(vender.shopVenderApplyStatus, vender.shopProp)) {
                    isOpShop = true;
                    return ShopService.getShopByUserId(vender._id + '');//todo: ShopService
                }
            })
            .then(function (_shopInfo) {
                if (_shopInfo) {
                    vender.marketing = _shopInfo;
                } else if (isOpShop) {
                    throw ErrorHandler.getBusinessErrorByCode(8005);
                }
                if (!vender.marketing || !vender.marketing.cps || vender.marketing.cps < 1) {
                    console.log('vender.marketing error 8005');
                    throw ErrorHandler.getBusinessErrorByCode(2106);
                }
                if (vender.marketing && vender.marketing.isMarketingClosed) {
                    throw ErrorHandler.getBusinessErrorByCode(2114);
                }

                //同一个设备号判断
                return CustomerService.hasTheDeviceGot(appUser.deviceId, appUser._id + '', 8, vender._id, req.identity && req.identity.appVersion || '');
            })
            .then(function (_hasTheDeviceGot) {
                if (_hasTheDeviceGot) {
                    throw ErrorHandler.getBusinessErrorByCode(2115);
                }
                //var maxCouponVal = Math.max(Math.round(constants.couponRateInCPS.max * vender.marketing.cps * 10) / 10, constants.sysReward);
                var couponValRange = CouponService.getVenderRangeCouponVal(vender.marketing.cps);
                console.log(data.couponValue, couponValRange);

                if (data.couponValue > couponValRange.maxVal || data.couponValue < couponValRange.minVal) {
                    throw ErrorHandler.getBusinessErrorByCode(2201);
                }
                //console.log(vender.marketing);
                return CustomerService.bookVenderCoupon(data.venderId, vender.marketing.cps, isOpShop);
            })
            .then(function (_resInfo) {
                if (!_resInfo) {
                    throw ErrorHandler.getBusinessErrorByCode(2106);
                }
                if (!isOpShop && _resInfo.marketing && _resInfo.marketing.remainMemberSize && _resInfo.marketing.remainMemberSize == 3) {
                    commonUtil.sendSms(1757692, vender.phoneNum);
                }
                //return CustomerService.buyVenderCoupon(userId, Number(data.couponValue));

                return MembershipService.consumedMembership(userId, data.couponValue, consumedMembershipOptions);
            })
            .then(function (_res) {
                if (!_res || !_res.isConsumedSuccess) {
                    throw ErrorHandler.getBusinessErrorByCode(2109);
                }
                var nowTS = Date.now();
                var now = new Date();
                var expiredAt = new Date(commonUtil.getDateMidnight(now.setDate(now.getDate() + 2))).getTime() - 1;
                //console.log(new Date(expiredAt));
                var venderName = constants.shopAuthorizedStatus.indexOf(vender.shopVenderApplyStatus) > -1 ? (vender.shopName || vender.name) : vender.name;

                venderName = venderName ? (venderName.length > 8 ? venderName.substr(0, 8) + '...' : venderName) : '特定商家';
                //console.log(venderName);
                var lowestCost = CustomerService.getLowestCost(vender.marketing.lowestCost, vender.marketing.cps, data.couponValue);
                var coupon_new = {
                    activityNO: constants.COUPON_ACTIVITYNO_REBATE,
                    type: 8,
                    title: constants.COUPON_ACTIVITYNO_REBATE_TITLE,
                    subTitle: '仅用于向' + venderName + '付款',
                    //description: '可用于' + venderName + '(热线号: ' + commonUtil.stringifyDocChatNum(vender.docChatNum) + ')',
                    description: '可用于' + venderName + (lowestCost ? ',消费满' + lowestCost + '元可用' : ''),
                    manual: '',
                    rmb: Number(data.couponValue),
                    deductedRMB: Number(data.couponValue),
                    rmbDescription: '¥' + data.couponValue,
                    expiredAt: expiredAt,
                    boundUserId: userId,
                    boundUserPhoneNum: appUser.phoneNum,
                    orderId: '',
                    boundVenderId: vender._id,
                    cps: vender.marketing.cps,
                    memberships: _res && _res.memberships || [],
                    shopProp: vender.shopProp || 0, //商户运营类型,0-默认值,1-运营商户
                    lowestCost: lowestCost
                };
                console.log(coupon_new);
                return CouponService.createUnionCodeCoupon(coupon_new, couponId);
            })
            .then(function (_coupon) {
                //CustomerService.pushMarketingMsg(vender._id, pushObj);
                var shopAvatar = vender.avatar || '';
                if (CustomerService.isShopAuthorized(vender.shopVenderApplyStatus)) {
                    shopAvatar = vender.shopAvatar || shopAvatar;
                }
                var coupon = {
                    "rmb": _coupon.rmb, //金额
                    "avatar": shopAvatar, //二维码中头像
                    "qrUrl": serverConfigs.webHOST + constants.qrToPath + '?qrCode=' + _coupon.qrCode, //二维码被扫描跳转
                    "qrDesc": constants.qrDesc, //二维码下的描述
                    "unionCode": _coupon.unionCode || '', //代金券唯一编号
                    "desc": _coupon.description || '' //代金券描述
                };
                return apiHandler.OK(res, coupon);
            }, function (err) {
                if (resCoupon) {
                    return apiHandler.OK(res, resCoupon);
                }
                apiHandler.handleErr(res, err);
            });

    };
    commonUtil.validate(payload, fields, onSuccess, onFailure);
}
/**
 *
 * @param req
 * @param res
 */
CustomerController.prototype.getCouponInfo = function (req, res) {
    var couponId = req.query.couponId || '';
    var qrCode = req.query.qrCode || '';
    var unionCode = req.query.unionCode || '';
    var venderId = req.query.venderId || '';
    if (!couponId && !qrCode && !unionCode || !venderId) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var cond = {};
    if (couponId) {
        if (!commonUtil.isUUID24bit(couponId)) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        cond._id = couponId;
    } else if (unionCode) {
        cond.unionCode = unionCode;
    } else if (qrCode) {
        cond.qrCode = qrCode;
    }
    var coupon = null, resCoupon = null, isTheVender, vender = null;
    CouponService.getCouponInfo(cond)
        .then(function (_coupon) {
            if (!_coupon) {
                throw ErrorHandler.getBusinessErrorByCode(2111);
            }
            coupon = _coupon;
            return CustomerService.getMainInfoByID(venderId, {fields: 'marketing isVender shopVenderApplyStatus shopName name'});
        })
        .then(function (_vender) {
            if (!_vender) {
                throw ErrorHandler.getBusinessErrorByCode(8005);
            }
            vender = _vender;
            // 需要验证qrCode？
            // if (qrCode) {
            //   var genCode = commonUtil.genJuliyeMD5(coupon.boundUserId + _vender._id + coupon._id + coupon.unionCode, false);
            //   console.log(qrCode, genCode);
            //   if(genCode != qrCode){
            //     throw ErrorHandler.getBusinessErrorByCode(8005);
            //   }
            // }
            isTheVender = (coupon.boundVenderId == (_vender._id + '') || (coupon.type == 9 && vender.isVender)) ? true : false;
            if (coupon.type == 8) {
                return CustomerService.getMainInfoByID(coupon.boundVenderId, {fields: 'avatar name shopName shopAvatar shopVenderApplyStatus'});
            }
        })
        .then(function (_boundVender) {
            var shopName = '', shopAvatar = '';
            if (coupon.type == 8) {
                if (!_boundVender) {
                    throw ErrorHandler.getBusinessErrorByCode(8005);
                }
                shopName = _boundVender.name || '';
                shopAvatar = _boundVender.avatar || constants.qrDefaultAvatar || '';
                if (CustomerService.isShopAuthorized(_boundVender.shopVenderApplyStatus)) {
                    shopName = _boundVender.shopName || shopName;
                    shopAvatar = _boundVender.shopAvatar || shopAvatar;
                }
            } else {
                shopName = '通用代金券';
                shopAvatar = constants.qrDefaultAvatar;
            }

            resCoupon = {
                "_id": coupon._id, //代金券id
                "title": coupon.title || '', //代金券标题
                "subTitle": coupon.subTitle || '', //代金券副标题
                "rmb": coupon.rmb || 0, //金额
                "rmbDescription": coupon.rmbDescription || '', //面值描述
                "expiredAt": coupon.expiredAt, //过期时间
                "validAt": coupon.validAt, //有效时间
                "isTheVender": isTheVender, //是否为指定商户代金券
                "unionCode": coupon.unionCode, //唯一编码
                "desc": coupon.description, //代金券描述
                "venderTip": coupon.lowestCost ? '请确认用户消费满' + coupon.lowestCost + '元' : '', //代金券描述
                "avatar": shopAvatar,
                "shopName": shopName, //店铺名称
            }
            if (type == 8 && (!vender.marketing || !vender.marketing.balance || vender.marketing.balance < (coupon.cps || 0))) {
                resCoupon.errObj = ErrorHandler.getBusinessErrorByCode(2108);
                throw ErrorHandler.getBusinessErrorByCode(2108);
            }
            if (coupon.isConsumed && isTheVender) {
                resCoupon.errObj = ErrorHandler.getBusinessErrorByCode(2107);
                throw ErrorHandler.getBusinessErrorByCode(2107);
            }

            return;
        })
        .then(function () {
            apiHandler.OK(res, resCoupon);
        }, function (err) {
            if (resCoupon) {
                return apiHandler.OK(res, resCoupon);
            }
            apiHandler.handleErr(res, err);
        });
}
/**
 * 1.商家收取coupon.type = 8 的返现券
 * 从商家推广账户中扣减1个CPS金额（当时记录)
 * 向商家钱包账户中增加券的抵扣金额（0.4~0.6个CPS随机），即代金券金额
 * 从用户权益额度中扣减券的抵扣金额及奖励金金额（两项总和0.5~1.5CPS随机）
 * 向用户钱包账户中增加奖励金金额（金额(3)减去金额(2)的差额）
 * 券标示为已使用
 * 2.商家收取coupon.type = 9的通用券,商家不消耗推广额度,用户不消耗会员额度
 * 3.核销成功后返回基本信息: 收款人; 给用户发透传;
 * @param req
 * @param res
 */
CustomerController.prototype.checkinCoupon = function (req, res) {
    //TODO 接口需要加认证!! No Auth Request
    var payload = req.body;
    var fields = {
        required: ["couponId", 'venderId'],
        optional: ['checkinType']
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var pushObj = {};
    var onSuccess = function (handler, data) {
        var now = Date.now();
        var couponId = data.couponId || '';
        var venderId = data.venderId || '';
        if (!commonUtil.isUUID24bit(couponId) || !commonUtil.isUUID24bit(venderId)) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        var vender = null;
        var coupon = null;
        var trx = {
            venderIncome: 0,
            customerIncome: 0,
            platformIncome: 0
        };
        var isCouponConsumed = false;
        var totalVal = 0, reward = 0, newOrder = null, newTrxIds = [];
        var sysReward = 0;
        var customer = null;
        var memberships = [];
        var orderId = commonUtil.getNewObjectId();
        var consumedMembershipOptions = {
            hasRebate: false, //是否为返现
            orderId: orderId
        }
        var fields = 'marketing doctorRef name docChatNum phoneNum pushId sex avatar isVender shopVenderApplyStatus shopName shopAvatar shopProp';
        Promise.resolve()
            .then(function () {
                return CacheService.isVenderCheckinExistsLocal(venderId);
            })
            .then(function (_cache) {
                if (_cache) {//请求过于频繁
                    throw ErrorHandler.getBusinessErrorByCode(8003);
                } else {
                    CacheService.addOrUpdVenderCheckinExistsLocal(venderId);
                }
                return CustomerService.getMainInfoByID(venderId, {fields: fields});
            })
            .then(function (_vender) {
                //if(!_vender || !_vender.marketing || !_vender.marketing.balance){
                if (!_vender) {
                    throw ErrorHandler.getBusinessErrorByCode(8005);
                }
                //if(data.checkinType == 'unionCode'){
                //  throw ErrorHandler.getBusinessErrorByCode(2200);
                //}
                vender = JSON.parse(JSON.stringify(_vender));
                var fields = "_id type rmb cps boundUserId boundVenderId isConsumed expiredAt validAt unionCode shopProp";
                return CouponService.getCouponInfoById(couponId, {fields: fields});
            })
            .then(function (_coupon) {
                if (!_coupon) {
                    throw ErrorHandler.getBusinessErrorByCode(8005);
                }
                coupon = _coupon;
                //查询运营商户信息,
                return ShopService.getShopByUserId(vender._id + '');
            })
            .then(function (_shopInfo) {
                if (vender.shopProp == 1 && !_shopInfo) {
                    throw ErrorHandler.getBusinessErrorByCode(8005);
                }
                if (coupon.shopProp == 1 && !_shopInfo) {
                    throw ErrorHandler.getBusinessErrorByCode(2112);
                }
                //判断代金券是否运营商户代金券,是则不返现
                if (coupon.type == 8) {
                    if (!coupon.cps || coupon.cps < 1 || !coupon.boundUserId || !coupon.boundVenderId) {
                        throw ErrorHandler.getBusinessErrorByCode(8002);
                    }
                    //if (vender.marketing && isNaN(vender.marketing.balance)) {
                    //  throw ErrorHandler.getBusinessErrorByCode(8002);
                    //}
                    if (coupon.boundVenderId != venderId) {
                        throw ErrorHandler.getBusinessErrorByCode(2112);
                    }
                    if (coupon.shopProp == 1) {
                        vender.marketing = _shopInfo;
                    }
                    if (!vender.marketing || !vender.marketing.balance || coupon.cps > vender.marketing.balance) {
                        throw ErrorHandler.getBusinessErrorByCode(2108);
                    }
                } else if (coupon.type == 9) {
                    if (coupon.shopProp == 1 && vender.shopProp != 1) {
                        throw ErrorHandler.getBusinessErrorByCode(2112);
                    }
                    if (vender.shopProp == 1) {
                        vender.marketing = _shopInfo;
                    }
                    //该商家正处于推广状态且可领取代金券数大于0,才能收取通用券
                    console.log('5', vender.marketing, !CustomerService.canCheckInCommonCoupon(vender.shopProp, vender.marketing));
                    if (!CustomerService.canCheckInCommonCoupon(vender.shopProp, vender.marketing)) {
                        throw ErrorHandler.getBusinessErrorByCode(2112);
                    }
                    //isVender = true,才能收取通用券
                    //shopProp = 1 活动券，必须是活动商户才能收券
                    if (!vender.isVender) {
                        throw ErrorHandler.getBusinessErrorByCode(2112);
                    }
                }
                if (coupon.isConsumed) {
                    throw ErrorHandler.getBusinessErrorByCode(2107);
                }
                console.log(coupon.validAt, now);
                if (coupon.validAt && (coupon.validAt > now)) {
                    throw ErrorHandler.getBusinessErrorByCode(2118);
                }
                if (coupon.expiredAt < now) {
                    throw ErrorHandler.getBusinessErrorByCode(2110);
                }
                if (coupon.type == 9 && coupon.shopProp != 1) {
                    return CouponService.getUsedCommonCouponToday(coupon.boundUserId);
                }
            })
            .then(function (_usedCoupon) {
                if (_usedCoupon) {//今天已使用过通用券
                    throw ErrorHandler.getBusinessErrorByCode(2119);
                }
                var updates = {
                    $set: {
                        isConsumed: true,
                        updatedAt: now,
                        consumedAt: now,
                        boundVenderId: vender._id + ''
                    }
                };
                return CouponService.updateCoupon(coupon._id, updates);
            })
            .then(function () {
                isCouponConsumed = true;
                if (coupon.type == 8) {
                    //运营商户与普通商户的扣款方式不同
                    return CustomerService.venderConsumedBalance(vender._id + '', coupon.cps, coupon.shopProp);
                } else {
                    return vender;
                }
            })
            .then(function (_vender) {
                if (coupon.type == 8) {
                    if (!_vender) throw ErrorHandler.getBusinessErrorByCode(2108);
                    //商家收券,shopCheckinNum++;
                    return CustomerService.updateBasicInfoByCond({_id: vender._id}, {$inc: {shopCheckinNum: 1}});
                }
            })
            .then(function () {
                //6.24活动,4天内购买3单有机会获得624,名额有限,抢完为止,不消耗会员额度
                return OrderService.getActivityReward624(coupon.boundUserId, orderId);
            })
            .then(function (_sysReward) {
                if (_sysReward) {
                    return _sysReward;
                }
                //6.24活动,每日首单,获取奖励金,名额有限,抢完为止,不消耗会员额度
                return OrderService.getActivityReward(coupon.boundUserId, orderId);
            })
            .then(function (_sysReward) {
                sysReward = _sysReward || 0;
                trx.venderIncome = coupon.rmb;
                pushObj.payVal = coupon.rmb;
                if (coupon.type == 8 && coupon.shopProp != 1 && !sysReward) {
                    totalVal = CouponService.getRandomTotalVal(coupon.cps);
                    reward = Math.max(Math.round((totalVal * 10 - coupon.rmb * 10) * constants.couponRebateRate) / 10, 0);
                    console.log('reward:', reward);
                    reward = Math.min(reward, constants.sysMaxReward);
                    console.log('reward:', reward);

                    if (reward > 0) {
                        return MembershipService.getUserMembershipInfo(coupon.boundUserId);
                    }
                }
            })
            .then(function (_resInfo) {
                console.log(_resInfo);
                if (!sysReward) {
                    if (!_resInfo || (_resInfo.balance < reward)) {//用户余额不足
                        reward = 0;
                    } else {
                        consumedMembershipOptions.hasRebate = true;
                        consumedMembershipOptions.shopId = vender._id + '';
                        return MembershipService.consumedMembership(coupon.boundUserId, reward, consumedMembershipOptions);
                    }
                }

            })
            .then(function (_res) {
                if (!_res || !_res.isConsumedSuccess) {
                    reward = 0;
                }
                reward = sysReward || reward;
                memberships = _res && _res.memberships || [];
                console.log(reward)
                trx.customerIncome = reward;
                trx.platformIncome = reward > 0 ? -reward : 0;
                console.log(coupon.cps, coupon.rmb, totalVal, reward, trx);
                var fields = 'name nickname phoneNum docChatNum pushId doctorRef favoriteDocs avatar latestLoginVersion';
                return CustomerService.getMainInfoByID(coupon.boundUserId, {fields: fields});
            })
            .then(function (_customer) {
                var user = _customer;
                pushObj.pushId = _customer.pushId;
                customer = _customer;
                var d = vender;
                //生成订单
                var order = {};
                order._id = orderId;
                order.price = coupon.rmb;
                order.couponDeductedRMB = coupon.rmb;
                order.customerId = user._id + "";
                order.customerName = user.name || user.nickname || "";
                order.customerPhoneNum = user.phoneNum;
                order.customerDocChatNum = user.docChatNum;
                order.doctorId = d.doctorRef;
                order.doctorMainId = d._id;
                order.doctorRealName = d.name;
                order.doctorDocChatNum = d.docChatNum;
                order.doctorPhoneNum = d.phoneNum;
                order.doctorPushId = d.pushId;
                order.doctorSex = d.sex;
                order.doctorAvatar = d.avatar;
                order.payType = CONS.PAY_TYPES.SYS_PAY;
                order.createdAt = now;
                //todo: 测试用
                //order.createdAt = getDateBeginTS(new Date(activity_test_day)) + 2 * 60 * 1000;
                order.updatedAt = now;
                order.payStatus = CONS.PAY_STATUS.PAID;
                order.transferType = 'checkin';
                order.customerReward = trx.customerIncome;
                order.venderIncome = trx.venderIncome;
                order.couponId = data.couponId;
                order.checkinType = data.checkinType || 'qrScan';
                order.memberships = memberships;
                order.shopProp = coupon.shopProp || 0;
                //console.log('order:', order);
                return OrderService.createPaidTransferOrder(order);
            })
            .then(function (_order) {
                newOrder = _order;
                //交易明细处理
                var sqls = TransactionMysqlService.genVenderCheckInSqls(
                    _order.customerId + '',
                    _order.doctorMainId + '',
                    _order.payType,
                    trx,
                    '返现',
                    '收券',
                    '',
                    _order._id + "",
                    "转账;");
                return TransactionMysqlService.execSqls(sqls);
            })
            .then(function (_trxs) {
                //console.log('_trxs:', _trxs);
                //if(_trxs.constructor != Array){
                //  _trxs = [_trxs];
                //}
                //_trxs.forEach(function (_trx) {
                //  if(_trx.insertId){
                //    newTrxIds.push(_trx.insertId);
                //  }
                //});
                //console.log(newTrxIds);
                if (pushObj.rewardVal) {
                    pushObj.orderId = (newOrder._id + '') || '';
                }
            })
            .then(function () {
                var resData = {
                    price: newOrder.price,
                    payerName: customer.name || '',
                    payerAvatar: customer.avatar || '',
                    productName: newOrder.productName || '这是一个商品'
                };
                console.log('商品信息', resData);
                apiHandler.OK(res, resData);

                var appVersion = customer.latestLoginVersion || '';
                if (appVersion <= '4.5.0') {
                    //用户有返现发送短信,TODO: 新版REMOVED
                    if (trx.customerIncome) {
                        commonUtil.sendSms(1752162, customer.phoneNum,
                            "#name#=" + vender.name + "&#money#=" + trx.customerIncome, true);
                    }
                }
                var shopName = constants.shopAuthorizedStatus.indexOf(vender.shopVenderApplyStatus) > -1 ? vender.shopName || vender.name || '' : vender.name || '';
                var shopAvatar = constants.shopAuthorizedStatus.indexOf(vender.shopVenderApplyStatus) > -1 ? vender.shopAvatar || vender.avatar || '' : vender.avatar || '';
                var extras = {
                    type: 1,
                    contentType: 'checkin_success', //商家收券成功
                    contentObj: { //
                        orderId: newOrder._id + '', //订单号
                        price: 0, //订单金额
                        productName: newOrder.productName,

                        //商家收券成功,透传给用户的信息
                        payment: newOrder.price, //支付金额
                        shopName: shopName, //收款人姓名
                        shopAvatar: shopAvatar, //收款人头像
                        customerReward: newOrder.customerReward || 0, //返现额度
                        unionCode: coupon.unionCode || ''
                    }
                };
                console.log('extras:', extras);
                JPushService.pushMessage(customer.pushId, '', '', extras);
                //CustomerService.pushCouponRewardMsg(customer._id, pushObj);

                //若有返现,则生成会员额度消耗明细
                if (trx.customerIncome > 0) {
                    var TradeService = Backend.service('1/membership', 'membership_trade');
                    var _options = {
                        memberships: memberships,
                        couponId: options.couponId || '',
                        shopId: options.shopId || ''
                    }
                    console.log('_options:', _options);
                    TradeService.genMembershipTrade(userId, 'coupon',
                        commonUtil.getNumsPlusResult([originalCost, -cost], 10), options);
                }
                //建立粉丝关系
                CustomerService.buildRel(customer, vender);
            }, function (err) {
                //if(isCouponConsumed){
                //  CouponService.updateCoupon(coupon._id, {$set: {isConsumed: false}});
                //}
                //if(trx.venderIncome){
                //  CustomerService.updateBaseInfo(venderId, {$inc: {'marketing.balance': coupon.cps, 'marketing.checkinNum': -1}});
                //}
                //if(trx.customerIncome){
                //  CustomerService.updateBaseInfo(coupon.boundUserId, {$inc: {'membership.balance': reward, 'membership.cost': -reward}});
                //}
                //if(newOrder){
                //  OrderService.updateTransferOrderInfo({_id: newOrder._id}, {$set: {isDeleted: false, payStatus: CONS.PAY_STATUS.TO_PAY}});
                //}
                //if(newTrxIds.length > 0){
                //  var delSqls = TransactionMysqlService.genRemoveDelSomeTransactions(newTrxIds, '收券失败回滚');
                //  TransactionMysqlService.execSqls(delSqls);
                //}
                console.log('收券失败:', err);
                apiHandler.handleErr(res, err);

            });
    };
    commonUtil.validate(payload, fields, onSuccess, onFailure);
};
CustomerController.prototype.getHistoryCoupons = function (req, res) {
    var userId = req.identity && req.identity.userId;
    var user = req.identity && req.identity.user ? req.identity.user : '';
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE, {createdAt: -1});
    var coupons = [];
    CouponService.getHistoryCoupons(userId, pageSlice)
        .then(function (_coupons) {
            _coupons = JSON.parse(JSON.stringify(_coupons));
            coupons = _coupons;
            var venderIds = [];
            _coupons.forEach(function (_coupon) {
                //console.log(_coupon);
                if (_coupon.type == 8 && _coupon.boundVenderId) { //如果为返利代金券
                    venderIds.push(_coupon.boundVenderId);
                }
            });
            return CustomerService.getInfoByIDs(venderIds, {fields: 'avatar'});
        })
        .then(function (_venders) {
            var idAvatarMap = _.indexBy(_venders, '_id');
            coupons.forEach(function (_coupon) {
                //console.log(_coupon);
                //if(_coupon.type == 8){ //如果为返利代金券
                //  var qrCoupon= { //type = 8,代金券含有二维码信息
                //    "rmb": _coupon.rmb, //金额
                //    "avatar": idAvatarMap[_coupon.boundVenderId] && idAvatarMap[_coupon.boundVenderId].avatar || '', //二维码中头像
                //    "qrUrl": serverConfigs.webHOST + constants.qrToPath + '?qrCode=' + _coupon.qrCode, //二维码被扫描跳转
                //    "qrDesc": '到店出示', //二维码下的描述
                //    "unionCode": _coupon.unionCode || '', //代金券唯一编号
                //    "desc": _coupon.description || '', //代金券描述
                //  }
                //  _coupon.qrCoupon = qrCoupon;
                //}
                _coupon.type = _coupon.type == 9 ? 8 : _coupon.type; //TODO:REMOVED, 前端type=8时才能生成二维码
            });
            apiHandler.OK(res, coupons);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
}

CustomerController.prototype.setLowestCost = function (req, res) {
    //return apiHandler.OK(res);

    var payload = req.body;
    var appUserId = req.identity && req.identity.userId;
    var appUser = req.identity && req.identity.user ? req.identity.user : '';

    var fields = {
        required: ["lowestCost"],
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        data.lowestCost = data.lowestCost;
        //console.log(typeof data.lowestCost, isNaN(data.lowestCost));
        if (!commonUtil.isUUID24bit(appUserId) || !commonUtil.isExist(appUser) || isNaN(data.lowestCost) || data.lowestCost < 0) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        var cond = {
            _id: appUserId,
            isDeleted: false
        }
        var update = {
            'marketing.lowestCost': data.lowestCost
        }
        CustomerService.updateBasicInfoByCond(cond, update)
            .then(function (_customer) {
                console.log('new lowestCost:', _customer.marketing && _customer.marketing.lowestCost);
                return apiHandler.OK(res);
            }, function (err) {
                apiHandler.handleErr(res, err);
            });
    };
    commonUtil.validate(payload, fields, onSuccess, onFailure);
}

CustomerController.prototype.getAllChooseShopTypes = function (req, res) {
    //var userId = req.identity ? req.identity.userId : '';
    //var user = req.identity && req.identity.user ? req.identity.user : null;
    //if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user) ) {
    //  return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    //}
    var shopTypeVersion = parseInt(req.query.shopTypeVersion) || 0;
    if (shopTypeVersion == constants.shopTypeVersion) {
        return apiHandler.OK(res);
    }
    var serviceType = req.query.serviceType || 'all';
    var resData = {
        shopTypeVersion: constants.shopTypeVersion,
        items: []
    };

    var items = JSON.parse(JSON.stringify(constants.allShopType));
    items.forEach(function (_item) {
        _item.subType.unshift('全部' + _item.name);
    })
    items.unshift({
        name: '全部分类',
        subType: []
    });
    console.log('serviceType:', serviceType);
    if (serviceType != 'all') {
        items.pop(); //去掉医疗
    }
    resData.items = items;
    apiHandler.OK(res, resData);
}

CustomerController.prototype.membership = function (req, res) {
    console.log("come in");
    var userId = req.identity.userId;
    var version = req.identity.appVersion;
    var user = req.identity.user;
    var resData = {};
    var cardType = req.query.cardType || 'city_buy';
    MembershipService.getUserMembershipInfo(userId, cardType)
        .then(function (_info) {
            console.log('_info', _info);
            resData = JSON.parse(JSON.stringify(_info));
            var membershipVals = [];
            constants.membershipVals.forEach(function (item) {
                if (item.type == cardType) {
                    var _item = {};
                    _.extend(_item, item);

                    //是否是第一次购买
                    _item.isNew = false;
                    //if (!user.hasBoughtSenior) {
                    //    _item.isNew = true;
                    //}

                    if (cardType == 'zlycare') {
                        _item.cost = constants.SENIOR_COST;
                    }
                    membershipVals.push(_item);
                }
            });
            resData.membershipVals = membershipVals;


            return VersionService.findVersion({name: "v" + version})
        })
        .then(function (_version) {
            resData.balance = Math.round(resData.balance * 100) / 100;
            resData.userId = userId;
            resData.isVersionPass = (_version.length > 0);
            return TransactionMysqlService.getAccountByUserIdAndDoctorId(userId + '', user.doctorRef._id + '');
        })
        .then(function (_account) {
            _account.amount = Math.floor(_account.amount * 100) / 100;
            resData.amount = _account.amount;

            apiHandler.OK(res, resData);
            //res.render("./member-recharge/newMemberRecharge", {data: resData});
        }, function (err) {
            apiHandler.handleErr(res, err);
        })
}

CustomerController.prototype.moment_history = function (req, res) {
    var userId = req.identity.userId;
    var to_user_id = req.query.to_user_id;
    var bookmark = req.query.bookmark;
    var list = [];
    //var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE,{"createdAt":-1});
    CustomerService.getInfoByID(to_user_id)
        .then(function (u) {
            if (!u) {
                throw ErrorHandler.getBusinessErrorByCode(8005);
            } else {
                user = u;
                return MomentService.getMomentListByUserIdandBookmark(to_user_id, bookmark);
            }
        })
        .then(function (_list) {
            _list = _list || [];
            _list = JSON.parse(JSON.stringify(_list));

            _list.forEach(function (d) {
                d.displayContent = d.displayContent ? d.displayContent.replace(new RegExp("\"", "gm"), "`") : "";
                d.originalContent = d.originalContent ? d.originalContent.replace(new RegExp("\"", "gm"), "`") : "";
                d.displayContent = d.displayContent ? d.displayContent.replace(new RegExp("\'", "gm"), "`") : "";
                d.originalContent = d.originalContent ? d.originalContent.replace(new RegExp("\'", "gm"), "`") : "";
                d.displayContent = d.displayContent ? d.displayContent.replace(new RegExp("\\u[0-9]{4}", "gm"), "`") : "";
                d.originalContent = d.originalContent ? d.originalContent.replace(new RegExp("\\u[0-9]{4}", "gm"), "`") : "";
                list.push(d);
            });

            var relUserIds = [];
            list.forEach(function (item) {
                relUserIds.push(item.originalUser.userId);
                if (item.recommendedUser) {
                    item.recommendedUser.userName = item.recommendedUser.shopName || item.recommendedUser.name;
                    item.recommendedUser.userId = item.recommendedUser._id;
                    relUserIds.push(item.recommendedUser.userId);
                }
            });
            return SocialRelService.getNoteNameByIds(to_user_id, relUserIds)
        })
        .then(function (_nameList) {
            console.log(_nameList.length);
            var relNameList = _.indexBy(_nameList, "relUser");
            list.forEach(function (item) {
                if (relNameList[item.originalUser.userId]) {
                    item.originalUser.userName = relNameList[item.originalUser.userId] && relNameList[item.originalUser.userId].noteInfo && relNameList[item.originalUser.userId].noteInfo.noteName || item.originalUser.userName
                }
                if (item.recommendedUser) {
                    if (relNameList[item.recommendedUser.userId]) {
                        item.recommendedUser.userName = relNameList[item.recommendedUser.userId] && relNameList[item.recommendedUser.userId].noteInfo && relNameList[item.recommendedUser.userId].noteInfo.noteName || item.recommendedUser.userName
                    }
                }
            })
            var moment_msg_service = Backend.service("1/city_buy", "moment_msg");
            //console.log("moment list: " + data);
            var resData = {
                userId: to_user_id,
                items: [],
                bookmark: list.length && list[(list.length - 1)].createdAt || bookmark
            }
            list.forEach(function (item) {
                var momentURL = item.momentURL;
                delete item.momentURL;
                item.displayURL = moment_msg_service.momentURL(item.displayContent, momentURL || []);
                //console.log(to_user_id);
                item.isZan = _.contains(item.zanUsers, userId);
                if (item.location) {
                    item.location = item.location.reverse();
                }
                if (!item.recommendedUser) {
                    delete item.recommendedUser
                }
                var momentUser = {
                    name: user.name,
                    avatar: user.avatar,
                    userId: user._id,
                    sex: user.sex,
                    docChatNum: user.docChatNum
                }
                if (user.shopVenderApplyStatus && user.shopVenderApplyStatus > 2) {
                    momentUser.name = user.shopName;
                    momentUser.avatar = user.shopAvatar;
                }
                var resItem = {
                    moment: item,
                    momentUser: momentUser,
                    msgCreatedAt: item.createdAt
                }
                resData.items.push(resItem);
            })
            console.log(list.length)
            apiHandler.OK(res, resData);
        }, function (err) {
            console.log('err', err);
            apiHandler.handleErr(res, err);
        })
};


// 获取用户所在地附近可领取返利代金券的商家
CustomerController.prototype.getCoordinateVenders = function (req, res) {
    var payload = req.query;
    var appUserId = req.identity && req.identity.userId;
    var appUser = req.identity && req.identity.user ? req.identity.user : '';
    var coordinate = payload.coordinate; // 坐标 1.0,1.0 (纬,经)
    var scope = payload.scope; // 范围 单位(米) <= 0 忽略该参数
    var maxSize = payload.maxSize; // 最大返回数据量
    if (!commonUtil.isUUID24bit(appUserId) || !commonUtil.isExist(appUser)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        CustomerService.getCoordinateVenders(coordinate, scope, maxSize).then(function (_customer) {
            return apiHandler.OK(res, _customer);
        })
    };
    var fields = {
        required: ["coordinate"],
        required: ["scope"]
    };
    commonUtil.validate(payload, fields, onSuccess, onFailure);
}


/**
 * 根据地区和类型获取商家列表信息
 * @param req
 * @param res
 */
CustomerController.prototype.getMarketingCityVenders = function (req, res) {
    console.log('coordinate', req.query.coordinate);

    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    var version = req.identity.appVersion;
    var coordinate = req.query.coordinate || '';
    var lat = coordinate ? Number(coordinate.split(',')[0]) : 0; //纬度
    var lon = coordinate ? Number(coordinate.split(',')[1]) : 0; //经度
    var scope = Number(req.query.scope) || 0;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user) || (coordinate && (!lon || !lat))) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE, {
        'marketing.cps': -1,
        'marketing.checkinNum': -1
    });
    pageSlice.pageNum = parseInt(req.query.pageNum || 0);
    var region = req.query.region || '';
    var shopType = req.query.shopType || '';
    if (region == '全国') {
        region = '';
    }
    if (shopType == '全部分类') {
        shopType = '';
    }

    var shopSubType = req.query.shopSubType || '';
    var shopSubTypeReg = /^全部.+/;
    if (shopSubTypeReg.test(shopSubType)) {
        shopSubType = '';
    }
    var sortBy = req.query.sortBy || '';
    var keyword = req.query.keyword || '';
    var serviceType = req.query.serviceType || ''; //all | zlycare | buying
    var resData = {
        hasMembershipBalance: false,
        //membershipBalance: user.membership && user.membership.balance || 0
    }
    var venders = [];
    var options = {
        version: version,
        shopType: shopType,
        shopSubType: shopSubType,
        sortBy: sortBy,
        keyword: keyword,
        pageSlice: pageSlice,
        lon: lon,
        lat: lat,
        scope: scope,
        serviceType: serviceType,
        userId: userId
    };
    console.log('options:', options);
    MembershipService.getUserMembershipInfo(userId)
        .then(function (_info) {
            if (_info && _info.balance > 0) {
                resData.hasMembershipBalance = true;
            }
            return CustomerService.getCityVendersFromRegion(region, options);
        })
        .then(function (_venders) {
            venders = JSON.parse(JSON.stringify(_venders));
            var _venderIds = _venders.map(function (_vender) {
                return _vender._id;
            });
            //已获取过优惠券的商家
            return CouponService.getVendersWithCoupon(userId, _venderIds, {fields: 'isConsumed boundVenderId rmb qrCode unionCode description'});
        })
        .then(function (_coupons) {
            //console.log(_coupons);
            var _venderIds = [], _venderCouponMap = {};
            _venderIds = _.map(_coupons, function (_coupon) {
                return _coupon.boundVenderId + '';
            });
            _venderCouponMap = _.indexBy(_coupons, 'boundVenderId');
            //console.log(venders, _venderIds);
            venders.forEach(function (vender, index) {
                vender.name = constants.shopAuthorizedStatus.indexOf(vender.shopVenderApplyStatus) > -1 ? (vender.shopName || vender.name) : vender.name;
                vender.avatar = constants.shopAuthorizedStatus.indexOf(vender.shopVenderApplyStatus) > -1 ? (vender.shopAvatar || vender.avatar) : vender.avatar;
                var coupon = _venderCouponMap[vender._id + ''];
                var hasGotCoupon = _venderIds.indexOf(vender._id + '') > -1 ? true : false;//判断该用户有没有领取过这些商家的代金券
                var marketing = vender.marketing;
                delete vender.marketing;
                //console.log('marketing:',marketing);
                var randomCouponVal = CouponService.getRandomCoupon(marketing.cps, false);
                var lowestCost = hasGotCoupon ? 0 : CustomerService.getLowestCost(marketing.lowestCost, marketing.cps, randomCouponVal);
                vender.couponValue = hasGotCoupon ? 0 : randomCouponVal;//计算每家商铺产生的随机代金券金额
                vender.couponRule = '满' + lowestCost + '元可用';
                vender.subTitle = hasGotCoupon ? '代金券' + (coupon.rmb || 0) + '元' : '最低奖励' + vender.couponValue + '元';
                vender.couponName = '代金券';
                vender.hasCoupon = marketing && marketing.remainMemberSize > 0 ? true : false;
                vender.hasRebate = marketing && marketing.remainMemberSize > 0 ? true : false;
                vender.remainMemberSize = marketing && marketing.remainMemberSize || 0;
                vender.hasGotCoupon = hasGotCoupon;
                vender.hasCouponUsed = coupon && coupon.isConsumed ? true : false;
                vender.couponValidTimeDes = '自领取起两日';
                //console.log(coupon);
                vender.userCoupon = {
                    "rmb": coupon ? (coupon.rmb || 0) : 0, //金额
                    "avatar": coupon ? (vender.avatar || '') : '', //二维码中头像
                    "qrUrl": coupon ? (serverConfigs.webHOST + constants.qrToPath + '?qrCode=' + coupon.qrCode) : '', //二维码被扫描跳转
                    "qrDesc": coupon ? constants.qrDesc : '', //二维码下的描述
                    "unionCode": coupon ? (coupon.unionCode || '') : '', //代金券唯一编号
                    "desc": coupon ? (coupon.description || '') : '' //代金券描述
                };
                delete marketing;
                //console.log('randomCouponVal:', randomCouponVal);
            });
            resData.items = venders;
            //console.log(venders.length);
            apiHandler.OK(res, resData);
            delete resData;
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};


CustomerController.prototype.synLoginTime = function (req, res) {
    // apiHandler.OK(res);
    CustomerService.synLoginTime()
        .then(function (_info) {

            apiHandler.OK(res, _info);
        }, function (err) {
            apiHandler.handleErr(res, err);
        })
};


CustomerController.prototype.synNormalValue = function (req, res) {
    apiHandler.OK(res);
    MembershipService.synNormalValue();
};
module.exports = exports = new CustomerController();
