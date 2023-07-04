/**
 * Created by guoyichen on 2017/1/3.
 */
var
    constants = require('../configs/constants'),
    util = require("../../lib/common-util"),
    DoctorService =  require("../services/DoctorService"),
    OrderService =  require("../services/OrderService"),
    CustomerService = require("../services/CustomerService"),
    MomentService = require("../services/MomentService"),
    ErrorHandler = require('../../lib/ErrorHandler'),
    HongbaoService = require('../services/HongbaoService'),
    TransactionMysqlService = require('../services/TransactionMysqlService'),
    _ = require('underscore'),
    commonUtil = require('../../lib/common-util'),
    apiHandler = require('../configs/ApiHandler'),
    SocialRelService = require('../services/SocialRelService'),
    VersionService = require('../services/VersionService'),
    MembershipService = require('../services/MembershipService'),
    CouponService = require('../services/CouponService');

var OpenPageController = function () {
};
/**
 *
 * @param req
 * @param res
 */
OpenPageController.prototype.momentsHistoryInit = function (req, res) {
    var userId = req.identity.userId || req.query.userId;//测试用query。userid
    console.log(JSON.stringify(userId));
    var errPage = function(res, err){
        //res.render("./adviser/403.html",{err: err})
        res.render("./dynamic/dynamic_default",{data: JSON.stringify(userId)})
    };
    var user;

    var list = [];
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE,{"createdAt":-1});
    CustomerService.getInfoByID(userId)
        .then(function(u){
            if(!u){
                userID='';
                res.render("./dynamic/dynamic_default",{data: userId})
                //errPage(res,"id有误");

            }else{
                user = u;
                return MomentService.getMomentListByUserId(userId,pageSlice);
            }
        })
        .then(function(_list){
          _list = _list || [];
          _list = JSON.parse(JSON.stringify(_list));

          _list.forEach(function(d){
              d.displayContent = d.displayContent ? d.displayContent.replace(new RegExp("\"", "gm"), "`") : "";
              d.originalContent = d.originalContent ? d.originalContent.replace(new RegExp("\"", "gm"), "`") : "";
              list.push(d);
          });

            var relUserIds = [];
            list.forEach(function (item) {
                relUserIds.push(item.originalUser.userId);
                if(item.recommendedUser){
                    relUserIds.push(item.recommendedUser.userId);
                }
            });
            return SocialRelService.getNoteNameByIds(userId, relUserIds)
        })
        .then(function(_nameList){
            console.log(_nameList.length);
            var relNameList = _.indexBy(_nameList , "relUser");
            list.forEach(function(item){
                if(relNameList[item.originalUser.userId]){
                    item.originalUser.userName = relNameList[item.originalUser.userId] && relNameList[item.originalUser.userId].noteInfo && relNameList[item.originalUser.userId].noteInfo.noteName || item.originalUser.userName
                }
                if(item.recommendedUser){
                    if(relNameList[item.recommendedUser.userId]){
                        item.recommendedUser.userName = relNameList[item.recommendedUser.userId] && relNameList[item.recommendedUser.userId].noteInfo && relNameList[item.recommendedUser.userId].noteInfo.noteName || item.recommendedUser.userName
                    }
                }
            })

            //console.log("moment list: " + data);
            var resData = {
                userId : userId,
                data : list
            }
            resData = JSON.stringify(resData)
            resData = resData.replace(new RegExp("\'", "gm"), "`");
            resData = resData.replace(new RegExp("\\u[0-9]{4}", "gm"), "");

          if(req.query.type && req.query.type == 'notPage'){
              console.log(list.length)
              apiHandler.OK(res, resData);
          }  else{
              res.render("./dynamic/historical_dynamic", {data: resData})
          };
        },function(err){
            console.log('err', err);
            apiHandler.handleErr(res, err);
        })
};

OpenPageController.prototype.getRedPacketInfo = function (req, res) {
    //console.log("come in")
    var userId = req.identity.userId || req.query.userId;//测试用userid
    var hongbaoId = req.query.hongbaoId;
    var errPage = function(res, err){
        res.render("./adviser/403.html",{err: err})
    };
    var user;
    HongbaoService.getInfoById(hongbaoId)
        .then(function(h) {
            hongbao = h;
            return CustomerService.getInfoByID(h.user);
        })
        .then(function(_user){
            user = _user;
            var sqls = "select userId,cash,createdAt from transaction_details where innerTradeNo = '"+
                hongbao.order +"' and type = 'income' and subType = 'hongbao' and userId <> '1005' ORDER BY cash DESC" +
                " limit 1000 ";  //TODO 分页优化
            //console.log(sqls);
            return TransactionMysqlService.execSqls(sqls)
        })
        .then(function(list){
            transList = JSON.parse(JSON.stringify(list));
            var userIdList = [];
            for(var i =0 ;i<list.length;i++){
                userIdList.push(list[i].userId);
            }
            return CustomerService.getInfoByIDsSelfFlied(userIdList,"name");
        })
        .then(function(nameList){
            nameList = JSON.parse(JSON.stringify(nameList));
            for(var i=0;i<transList.length;i++){
                transList[i].name = (_.findWhere(nameList,{"_id":transList[i].userId})).name || "";
            }
            var data = {};
            data.name = user.name;
            data.avatar = user.avatar;
            data.sex = user.sex;
            data.hongbao = hongbao;
            if(user.shopVenderApplyStatus && user.shopVenderApplyStatus > 2){
              data.name = user.shopName;
              data.avatar = user.shopAvatar;
            }
            if(Date.now() > hongbao.expiredAt){
                data.hongbaoStatus = "timeUp";
            }else if(hongbao.totalCount <= hongbao.usedCount){
                data.hongbaoStatus = "usedUp";
            }
            for(var i = 0 ;i<transList.length;i++){
                if(transList[i].userId == userId){
                    data.hongbaoStatus = "catchUp";
                    data.cash = transList[i].cash ;
                    break;
                }
            }
            data.list = transList;
            res.render("./red_packet/records", {data: JSON.stringify(data)});

        });
};

OpenPageController.prototype.myHongbaoInfo = function (req, res) {
    var userId = req.identity.userId || req.query.userId;//测试用userid
    var hongbaoId = req.query.hongbaoId;
    var errPage = function(res, err){
        res.render("./adviser/403.html",{err: err})
    };
    var user,transList,hongbao;
    var userIdList = [];
    CustomerService.getInfoByID(userId)
        .then(function(u){
            if(!u){
                errPage(res,"userId有误");
            }else{
                user = u;
                return HongbaoService.getInfoAndMomentById(hongbaoId);
            }
        })
        .then(function(h){
            if(!h){
                errPage(res,"红包id有误");
            }else{
                hongbao = h;
                var sqls = "select userId,cash,createdAt from transaction_details where innerTradeNo = '"+
                    h.order +"' and type = 'income' and subType = 'hongbao' and userId <> '1005' ORDER BY createdAt DESC" +
                    " limit 1000 "; //TODO 分页优化
                return TransactionMysqlService.execSqls(sqls)
            }
        })
        .then(function(list){
            transList = JSON.parse(JSON.stringify(list));
            for(var i =0 ;i<list.length;i++){
                userIdList.push(list[i].userId);
            }
            return CustomerService.getInfoByIDsSelfFlied(userIdList,"name");
        })
        .then(function(nameList) {
            nameList = JSON.parse(JSON.stringify(nameList));
            for (var i = 0; i < transList.length; i++) {
                transList[i].name = (_.findWhere(nameList, {"_id": transList[i].userId})).name || "";
            }
            return SocialRelService.getNoteNameByIds(userId,userIdList);
        })
        .then(function(_nameList){
            var relNameList = _.indexBy(_nameList , "relUser");
            transList.forEach(function(item){
                if(relNameList[item.userId]){
                    item.name = relNameList[item.userId] && relNameList[item.userId].noteInfo
                        && relNameList[item.userId].noteInfo.noteName || item.name;
                }
            })
            var data = {};
            data.list = transList;
            if(hongbao.moment){
                data.moment = hongbao.moment.originalContent;
                data.moment = data.moment? data.moment.replace(new RegExp("\"", "gm"), "`") : "";
            }
            data.hongbaoTotalCount = hongbao.totalCount;
            data.hongbaoUsedCount = hongbao.usedCount;
            data.hongbaoTotalValue = hongbao.totalValue;
            hongbao.usedValue = Math.floor((hongbao.usedValue)*100)/100;
            data.hongbaoUsedValue = hongbao.usedValue;
            data.hongbaoStatus = "catchUp";
            if(hongbao.totalCount <= hongbao.usedCount){
                data.hongbaoStatus = "usedUp";
            }
            if(Date.now() > hongbao.expiredAt){
                data.hongbaoStatus = "timeUp";
            }
            data = JSON.stringify(data);
            data = data.replace(new RegExp("\'", "gm"), "`");
            res.render("./red_packet/give_packet", {data: data});


        })
};

OpenPageController.prototype.receivedCoupon = function (req, res) {
    console.log("come in");
    var resData = {}
    resData.userId = req.identity.userId || req.query.userId;//测试用userid
    resData.token = req.identity.sessionToken || req.query.token;//测试用userid
    resData.qrCode = req.query.qrCode;
    resData.code = req.query.code;
    resData.zlycareCode = req.query.zlycareCode;
    resData = JSON.stringify(resData);
    res.render("./business_coupon/received_coupon", {data: resData});
};

OpenPageController.prototype.getDiscountCoupon = function (req, res) {
    console.log("come in");
    var resData = {}
    resData.userId = req.identity.userId || req.query.userId;//测试用userid
    //resData.token = req.identity.token || req.query.token;//测试用userid
    console.log(resData);
    resData = JSON.stringify(resData);
    res.render("./get_coupon/getCoupon", {data: resData});
};

OpenPageController.prototype.profileInfoPresent = function (req, res) {
    console.log("come in");
    var userId = req.identity.userId || req.query.userId;//测试用userid
    var user = req.identity.user || null;
    var token = req.identity.sessionToken || req.query.token || "";
    if(!user){
        CustomerService.getInfoByID(userId,{customerFields:"province city occupation hospital department position"})
            .then(function(_user){
                user = _user;
                console.log(user);
                user = JSON.stringify(user);
                res.render("./apply_doctor/adviserPresent", {data: user});
            })
    }else{
        var resData = {
          province : user.province,
          city : user.city,
          occupation : user.occupation,
          hospital : user.hospital,
          department : user.department,
          position : user.position,
          token : token,
          _id : userId
        };
        resData = JSON.stringify(resData);
        console.log(resData);
        res.render("./apply_doctor/adviserPresent", {data: resData});
    }

};


OpenPageController.prototype.memberRecharge = function (req, res) {
    console.log("come in");
    var userId = req.identity.userId || req.query.userId;//测试用userid
    var token = req.identity.sessionToken || req.query.token;
    var version  = req.identity.appVersion;
    var client = req.headers["user-agent"] && (req.headers["user-agent"].indexOf("iOS") >=0 || req.headers["user-agent"].indexOf("iPhone") >=0) ? "ios" : "android" ;
    var user;
    var resData = {};
    var from = req.query.from || "other";
    MembershipService.getUserMembershipInfo(userId)
        .then(function(_info) {
          resData = _info;
          var membershipVals = [];
          constants.membershipVals.forEach(function(item){
            if(item.type == 'city_buy'){
              membershipVals.push(item);
            }
          })
          resData.membershipVals = membershipVals;
          return VersionService.findVersion({name: "v" + version})
        })
        .then(function(_version){
          resData.balance = Math.round(resData.balance * 100)/100;
          resData.userId = userId;
          resData.token = token;
          resData.version = version;
          resData.client = client;
          resData.isVersionPass = (_version.length > 0);
          resData.from  = from;
          resData = JSON.stringify(resData);
          console.log(resData);
          res.render("./member-recharge/newMemberRecharge", {data: resData});
        }, function (err) {
          apiHandler.handleErr(res, err);
        })
};
OpenPageController.prototype.activity24 = function (req, res) {
    console.log("come in active24");
    var userId = req.identity.userId || req.query.userId;//测试用userid
    var token = req.identity.sessionToken || req.query.token;
    var resData = {};
    resData.userId = userId;
    resData.token = token;
    resData = JSON.stringify(resData);
    res.render("./activity/activity24", {data: resData});
};

OpenPageController.prototype.springOuting = function (req, res) {
    console.log("come in springOuting");
    console.log("come in");
    var userId = req.identity.userId || req.query.userId;//测试用userid
    var token = req.identity.sessionToken || req.query.token;
  // var version  = '4.4.1'//req.identity.appVersion;
    var version  = req.identity.appVersion || req.query.version;
    console.log(version)
    var client = req.headers["user-agent"] && (req.headers["user-agent"].indexOf("iOS") >=0 || req.headers["user-agent"].indexOf("iPhone") >=0) ? "ios" : "android" || req.query.client;

    //var client = 'ios'//req.headers["user-agent"] && (req.headers["user-agent"].indexOf("iOS") >=0 || req.headers["user-agent"].indexOf("iPhone") >=0) ? "ios" : "android" ;
    VersionService.findVersion({name: "v" + version})
        .then(function(_version){
            var resData = {};
            resData.userId = userId;
            resData.token = token;
            resData.version = version;
            resData.client = client;
            console.log(_version.length);
            resData.isVersionPass = _version.length > 0 ? true : false;
            resData = JSON.stringify(resData);
            res.render("./activity/spring_outing", {data: resData});
        });

};


OpenPageController.prototype.threeDays = function (req, res) {
    console.log("come in threeDays");
    var userId = req.identity.userId || req.query.userId;//测试用userid
    var token = req.identity.sessionToken || req.query.token;
    var resData = {};
    resData.userId = userId;
    resData.token = token;
    CustomerService.getInfoByID(userId,{customerFields:"membership"})
        .then(function(_user){
            resData.membership = _user.membership;
            resData = JSON.stringify(resData);
            console.log(resData);
            res.render("./activity/threeDays", {data: resData});
        })

};

OpenPageController.prototype.mayActivity = function (req, res) {
    console.log("come in mayActivity");
    var userId = req.identity.userId || req.query.userId;//测试用userid
    var token = req.identity.sessionToken || req.query.token;
    var client = req.headers["user-agent"] && (req.headers["user-agent"].indexOf("iOS") >=0 || req.headers["user-agent"].indexOf("iPhone") >=0) ? "ios" : "android" ;
    var version  = req.identity.appVersion || req.query.version;
    var resData = {};
    resData.userId = userId;
    resData.token = token;
    MembershipService.getUserMembershipInfo(userId)
        .then(function(_info) {
           // resData = _info;
           // resData.membershipVals = constants.membershipVals;
            return VersionService.findVersion({name: "v" + version})
        })
        .then(function(_version) {
            resData.client = client;
            resData.isVersionPass = (_version.length > 0);
            var cond = {
                isDeleted : false,
                activityNO : constants.COUPON_ACTIVITYNO_CASH_0524_7,
                boundUserId : userId
            };
            return CouponService.getCouponByCond(cond);
        })
        .then(function(_coupon){
            if(_coupon){
                resData.hasCoupon=true;
            }else{
                resData.hasCoupon=false;
            }
            resData = JSON.stringify(resData);
            console.log(resData);
            res.render("./activity/mayActivity", {data: resData});
        }, function (err) {
            apiHandler.handleErr(res, err);
        })
};

OpenPageController.prototype.keepAlive0526 = function (req, res) {
  var userId = req.identity.userId || req.query.userId;//测试用userid
  var token = req.identity.sessionToken || req.query.token;
  var client = req.headers["user-agent"] && (req.headers["user-agent"].indexOf("iOS") >=0 || req.headers["user-agent"].indexOf("iPhone") >=0) ? "ios" : "android" ;
  var version  = req.identity.appVersion || req.query.version;
  var resData = {};
  resData.userId = userId;
  resData.token = token;
  VersionService.findVersion({name: "v" + version})
    .then(function(_version) {
      resData.client = client;
      resData.isVersionPass = (_version.length > 0);
      var cond = {
        isDeleted : false,
        activityNO : constants.COUPON_ACTIVITYNO_CASH_0526_5,
        boundUserId : userId
      };
      return CouponService.getCouponByCond(cond);
    })
    .then(function(_coupon){
      if(_coupon){
        resData.hasCoupon=true;
      }else{
        resData.hasCoupon=false;
      }
      resData = JSON.stringify(resData);
      console.log(resData);
      res.render("./activity/mayActivityKeepAlive", {data: resData});
    }, function (err) {
      apiHandler.handleErr(res, err);
    })
};

module.exports = exports = new OpenPageController();
