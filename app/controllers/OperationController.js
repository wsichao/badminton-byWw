var
    _ = require('underscore'),
    util = require('util'),
    commonUtil = require('../../lib/common-util'),
    apiHandler = require('../configs/ApiHandler'),
    ErrorHandler = require('../../lib/ErrorHandler'),
    configs = require('../configs/api'),
    constants = require('../configs/constants'),
    fs = require('fs'),
    Q = require("q"),
    Promise = require('promise'),
    async = require('async'),
//Activity = require('../configs/activity'),
    OpAdmin = require('../configs/opUsers.json'),
//ValidateService = require('../services/ValidateService'),
    CustomerService = require('../services/CustomerService'),
    ProductService = require('../services/ProductService'),
    ChannelService = require('../services/ChannelService'),
    OrderService = require('../services/OrderService'),
    Order = OrderService.CONS,
    LoggerService = require('../services/LoggerService'),
    CouponService = require('../services/CouponService'),
    StatisticsService = require('../services/StatisticsService'),
    TransactionMysqlService = require('../services/TransactionMysqlService'),
    DoctorService = require('../services/DoctorService'),
    Customer = require('../models/Customer'),
    Membership = require('../models/Membership'),
    Doctor = require('../models/Doctor'),
    Log = require('../models/Log'),
    Coupon = require('../models/Coupon'),
    Orders = require('../models/Order').CommonOrder,
    Moment = require('../models/Moment'),
    Message = require('../models/Message'),
    ApplicationService = require('../services/ApplicationService'),
    UniqueCodeService = require('../services/UniqueCodeService'),
    UniqueCodeTitle = require('../models/UniqueCode').Title,
    VersionService = require('../services/VersionService'),
    ShopService = require('../services/ShopService'),
    NotificationService = require('../services/NotificationService'),
    MessageCenterService = require('../services/MessageCenterService'),
    JPushService = require('../services/JPushService'),
    TagCodeService = require('../services/TagCodeService'),
    FactoryService = require('../services/FactoryService'),
    FactoryRechargeService = require('../services/FactoryRechargeService'),
    DrugService = require('../services/DrugService'),
    ReimburseService = require('../services/ReimburseService'),
    FactoryDrugRelService = require('../services/FactoryDrugRelService'),
    serverConfigs = require('../configs/server'),
    Area = require('../models/Area'),
    ZlycareController = require('./ZlycareController');
var that;
var SuggestionService = require('../services/SuggestionService');

var OperationController = function () {
    that = this;
};
OperationController.prototype.constructor = OperationController;

OperationController.prototype.login = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['username', 'password']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        for (var i = 0; i < OpAdmin.users.length; i++)
            if (data.username == OpAdmin.users[i].username && data.password == OpAdmin.users[i].password) {
                apiHandler.OK(res, OpAdmin.users[i]);
                return;
            }

        apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1505));
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

OperationController.prototype.brokerStatistics = function (req, res) {
    var page = req.query.pageNum || 0;
    var key = req.query.key,
        conditions = {};
    var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {updatedAt: -1});

    var docIds = [];
    var doctors, totalOrderObj = {}, todayOrderObj = {}, incomeObj = {}, amountObj = {}, pObj = {}, dObj = {},
        downObj = {}, queryNumObj = {}, favoriteObj = {}, shareObj = {};
    key && (conditions.$or = [{realName: key}, {phoneNum: key}, {docChatNum: key}]);
    DoctorService.doctorSts(conditions, pageSlice)//获得所有医生
        .then(function (d) {
            doctors = JSON.parse(JSON.stringify(d));
            //console.log(doctors.length);

            if (doctors.length == 0)
                return;

            for (var i = 0; i < doctors.length; i++) {
                docIds[i] = doctors[i]._id + "";
            }
            return OrderService.brokerStics(docIds, new Date(commonUtil.getDateMidnight(Date.now())).getTime());
        })
        .then(function (o) {
            if (doctors.length == 0)
                return;

            for (var i = 0; i < o.length; i++) {
                todayOrderObj[o[i]._id] = o[i];
            }
            return OrderService.brokerStics(docIds);
        })
        .then(function (o) {
            if (doctors.length === 0)
                return;
            for (var i = 0; i < o.length; i++) {
                totalOrderObj[o[i]._id] = o[i];
            }
            return TransactionMysqlService.getIncomeByUserIds(docIds);//获得所有医生总收入
        })
        .then(function (income) {
            if (doctors.length == 0)
                return;
            for (var i = 0; i < income.length; i++) {
                incomeObj[income[i].userId] = income[i];
            }
            return TransactionMysqlService.getAmountByUserIds(docIds); //获得所有医生余额
        })
        .then(function (amount) {
            if (doctors.length == 0)
                return;
            for (var i = 0; i < amount.length; i++) {
                amountObj[amount[i].userId] = amount[i];
            }
            //return TransactionMysqlService.getPlatformIncomeByUserIds(docIds); //获得所有医生平台补贴
        })
        .then(function (p) {
            if (doctors.length == 0)
                return;
            //for (var i = 0; i < p.length; i++) {
            //  pObj[p[i].userId] = p[i];
            //}
            return LoggerService.getTodayScannedNumAllDoctor();//所有医生今日被扫码数
        })
        .then(function (d) {
            if (doctors.length == 0)
                return;
            for (var i = 0; i < d.length; i++) {
                dObj[d[i]._id] = d[i];
            }
            return LoggerService.getTodayDownloadNumAllDoctor(); //所有医生今日患者下载次数
        })
        .then(function (d) {
            if (doctors.length == 0)
                return;

            for (var i = 0; i < d.length; i++) {
                downObj[d[i]._id] = d[i];
            }
            return LoggerService.getTodayQueryNumAllDoctor(); //所有医生今日查询数
        })
        .then(function (d) {
            if (doctors.length == 0)
                return;

            for (var i = 0; i < d.length; i++) {
                queryNumObj[d[i]._id] = d[i];
            }
            return LoggerService.getTodayFavoritedNumAllDoctor(); //所有医生今日被收藏次数
        })
        .then(function (d) {
            if (doctors.length == 0)
                return;
            for (var i = 0; i < d.length; i++) {
                favoriteObj[d[i]._id] = d[i];
            }
            return LoggerService.getTodaySharedNumAllDoctor(); //所有医生今日被分享次数
        })
        .then(function (d) {
            if (doctors.length == 0)
                return;
            for (var i = 0; i < d.length; i++) {
                shareObj[d[i]._id] = d[i];
            }
        })
        .then(function () {
            var id, docChatNum;
            for (var i = 0; i < doctors.length; i++) {
                id = doctors[i]._id;
                docChatNum = doctors[i].docChatNum;
                shareObj[id] && (doctors[i].todaySharedNum = shareObj[id].count);
                favoriteObj[docChatNum] && (doctors[i].todayFavoritedNum = favoriteObj[docChatNum].count);
                queryNumObj[docChatNum] && (doctors[i].todayQueryNum = queryNumObj[docChatNum].count);
                downObj[docChatNum] && (doctors[i].todayDownloadNum = downObj[docChatNum].count);
                dObj[docChatNum] && (doctors[i].todayScannedNum = dObj[docChatNum].count);
                pObj[id] && (doctors[i].platformIncome = pObj[id].cash);
                amountObj[id] && (doctors[i].amount = amountObj[id].cash);
                incomeObj[id] && (doctors[i].income = incomeObj[id].cash);
                todayOrderObj[id] && (doctors[i].todayOrderNum = todayOrderObj[id].count);
                totalOrderObj[id] && (doctors[i].totalOrderNum = totalOrderObj[id].count);
            }
            apiHandler.OK(res, doctors);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};
OperationController.prototype.customerStatistics = function (req, res) {
    var page = req.query.pageNum || 0;
    var user = req.query.user || ''
        , charge = req.query.charge || ''
        , channel = req.query.channel
        , conditions = {
        $and: [
            {$or: [{"source": 'docChat'}, {"source": 'webFavorite'}, {"usedApp": 'docChat'}]}
        ],
        'isDeleted': false
    };
    var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {createdAt: -1});

    var customers, channelObj = {}, rechargeObj = {}, payObj = {};
    var channelQuery = {}, userIds = [];
    channel && (channelQuery.$or = [{code: channel}, {'manager.name': channel}]);
    charge && (channelQuery['superior.name'] = charge);
    var p;
    if (channel || charge)
        p = ChannelService.distinctChannel('code', channelQuery);
    else
        p = Promise.resolve();

    p.then(function (codes) {

        user && (conditions.$and.push({$or: [{phoneNum: user}, {name: user}]}));
        codes && codes.length > 0 && (conditions.channelCode = {$in: codes});
        return CustomerService.customerSts(conditions, pageSlice);
    })
        .then(function (c) {
            customers = JSON.parse(JSON.stringify(c));
            console.log(customers.length);

            if (customers.length == 0)
                return;
            var channelsCodes = [];
            for (var i = 0; i < customers.length; i++) {
                userIds.push(customers[i]._id);
                customers[i].favoriteDoctorName = '';
                customers[i].channelCode && channelsCodes.indexOf(customers[i].channelCode) < 0 && (channelsCodes.push(customers[i].channelCode));
            }
            var promise = [
                ChannelService.findAll({code: {$in: channelsCodes}, isDeleted: false}),
                TransactionMysqlService.getAllRechargeUser(0, 1000)
            ];
            return Promise.all(promise);
        })
        .then(function (rs) {
            var recharges = rs[1] ? rs[1] : [],
                channels = rs[0] ? rs[0] : [];
            if (customers.length == 0)
                return;
            for (var k = 0; k < channels.length; k++) {
                channelObj[channels[k].code] = channels[k];
            }
            for (var j = 0; j < recharges.length; j++) {
                rechargeObj[recharges[j].userId] = recharges[j];
            }
            return TransactionMysqlService.getAllPaymentUser(); //所有支出患者
        })
        .then(function (pays) {
            if (customers.length == 0)
                return;

            for (var i = 0; i < pays.length; i++) {
                payObj[pays[i].userId] = pays[i];
            }

            var docIds = [];
            for (var i = 0; i < customers.length; i++) {
                docIds = _.union(docIds, customers[i].favoriteDocs);
                docIds = _.union(docIds, customers[i].collectedDocs);
            }

            return DoctorService.getUsersByIDs(docIds); //医生基本信息
        })
        .then(function (d) {
            if (customers.length == 0)
                return;

            //console.log("doctors:" + util.inspect(d));

            if (d)
                for (var j = 0; j < d.length; j++) {
                    for (var i = 0; i < customers.length; i++) {
                        if (_.contains(customers[i].favoriteDocs, "" + d[j]._id) || _.contains(customers[i].collectedDocs, "" + d[j]._id)) {
                            customers[i].favoriteDoctorName += d[j].realName + ",";  // 患者收藏医生的姓名
                        }
                    }
                }
            return OrderService.customerStics(userIds);
        })
        .then(function (order) {
            var orderObj = {};
            for (var i = 0; i < order.length; i++) {
                orderObj[order[i]._id] = order[i];
            }
            for (var i = 0; i < customers.length; i++) {
                rechargeObj[customers[i]._id] ? customers[i].recharge = rechargeObj[customers[i]._id].recharge : customers[i].recharge = 0;
                channelObj[customers[i].channelCode] ? customers[i].channel = channelObj[customers[i].channelCode] : customers[i].channel = {};
                payObj[customers[i]._id] ? customers[i].payment = payObj[customers[i]._id].payment : customers[i].payment = 0;
                orderObj[customers[i]._id] && (customers[i].orderNum = orderObj[customers[i]._id].count);
            }
            apiHandler.OK(res, customers);
        }, function (err) {
            apiHandler.handleErr(res, err)
        });
};
OperationController.prototype.getAllDoctorStatistics = function (req, res) {
    var page = req.query.pageNum || 0;
    var key = req.query.key,
        conditions = {};
    var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {updatedAt: -1});

    var docIds = [];
    var doctors;
    key && (conditions.$or = [{realName: key}, {phoneNum: key}, {docChatNum: key}]);
    DoctorService.doctorSts(conditions, pageSlice)//获得所有医生
        .then(function (d) {
            doctors = JSON.parse(JSON.stringify(d));
            //console.log(doctors.length);

            if (doctors.length == 0)
                return;

            for (var i = 0; i < doctors.length; i++) {
                docIds[i] = doctors[i]._id + "";
            }

            return OrderService.getSpecialTimePhoneOrderNumByDoctorIds(docIds, new Date(commonUtil.getDateMidnight(Date.now())).getTime(),
                new Date(commonUtil.getDateMidnight(Date.now() + constants.TIME_1_DAY)).getTime());//获得所有医生今日电话数
        })
        .then(function (o) {
            if (doctors.length == 0)
                return;

            //console.log("orders:" + JSON.stringify(o));

            if (o)
                for (var j = 0; j < o.length; j++) {
                    for (var i = 0; i < doctors.length; i++) {
                        if (doctors[i]._id == o[j]._id) {
                            doctors[i].todayOrderNum = o[j].count;
                            break;
                        }
                    }
                }

            return TransactionMysqlService.getIncomeByUserIds(docIds);//获得所有医生总收入
        })
        .then(function (income) {
            if (doctors.length == 0)
                return;

            console.log("income:" + util.inspect(income));

            if (income)
                for (var j = 0; j < income.length; j++) {
                    for (var i = 0; i < doctors.length; i++) {
                        if (doctors[i]._id == income[j].userId) {
                            doctors[i].income = income[j].cash;
                            break;
                        }
                    }
                }

            return TransactionMysqlService.getAmountByUserIds(docIds); //获得所有医生余额
        })
        .then(function (amount) {
            if (doctors.length == 0)
                return;

            console.log("amount:" + util.inspect(amount));

            if (amount)
                for (var j = 0; j < amount.length; j++) {
                    for (var i = 0; i < doctors.length; i++) {
                        if (doctors[i]._id == amount[j].userId) {
                            doctors[i].amount = amount[j].cash;
                            break;
                        }
                    }
                }

            //console.log("doctors:" + doctors);
            //return TransactionMysqlService.getPlatformIncomeByUserIds(docIds); //获得所有医生平台补贴
        })
        .then(function (p) {
            if (doctors.length == 0)
                return;

            //console.log("platformIncome:" + util.inspect(p));
            //if (p)
            //  for (var j = 0; j < p.length; j++) {
            //    for (var i = 0; i < doctors.length; i++) {
            //      if (doctors[i]._id == p[j].userId) {
            //        doctors[i].platformIncome = p[j].cash;
            //        break;
            //      }
            //    }
            //  }

            return LoggerService.getTodayScannedNumAllDoctor();//所有医生今日被扫码数
        })
        .then(function (d) {
            if (doctors.length == 0)
                return;

            console.log("todayScannedNum:" + util.inspect(d));
            if (d)
                for (var j = 0; j < d.length; j++) {
                    for (var i = 0; i < doctors.length; i++) {
                        if (doctors[i].docChatNum == d[j]._id) {
                            doctors[i].todayScannedNum = d[j].count;
                            break;
                        }
                    }
                }

            return LoggerService.getTodayDownloadNumAllDoctor(); //所有医生今日患者下载次数
        })
        .then(function (d) {
            if (doctors.length == 0)
                return;

            console.log("todayDownloadNum:" + util.inspect(d));
            if (d)
                for (var j = 0; j < d.length; j++) {
                    for (var i = 0; i < doctors.length; i++) {
                        if (doctors[i].docChatNum == d[j]._id) {
                            doctors[i].todayDownloadNum = d[j].count;
                            break;
                        }
                    }
                }

            return LoggerService.getTodayQueryNumAllDoctor(); //所有医生今日查询数
        })
        .then(function (d) {
            if (doctors.length == 0)
                return;

            console.log("todayQueryNum:" + util.inspect(d));
            if (d)
                for (var j = 0; j < d.length; j++) {
                    for (var i = 0; i < doctors.length; i++) {
                        if (doctors[i].docChatNum == d[j]._id) {
                            doctors[i].todayQueryNum = d[j].count;
                            break;
                        }
                    }
                }

            return LoggerService.getTodayFavoritedNumAllDoctor(); //所有医生今日被收藏次数
        })
        .then(function (d) {
            if (doctors.length == 0)
                return;

            console.log("todayFavoritedNum:" + util.inspect(d));
            if (d)
                for (var j = 0; j < d.length; j++) {
                    for (var i = 0; i < doctors.length; i++) {
                        if (doctors[i].docChatNum == d[j]._id) {
                            doctors[i].todayFavoritedNum = d[j].count;
                            break;
                        }
                    }
                }

            return LoggerService.getTodaySharedNumAllDoctor(); //所有医生今日被分享次数
        })
        .then(function (d) {
            if (doctors.length == 0)
                return;

            console.log("todaySharedNum:" + util.inspect(d));
            if (d)
                for (var j = 0; j < d.length; j++) {
                    for (var i = 0; i < doctors.length; i++) {
                        if (doctors[i]._id == d[j]._id) {
                            doctors[i].todaySharedNum = d[j].count;
                            break;
                        }
                    }
                }
        })
        .then(function () {
            apiHandler.OK(res, doctors);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

OperationController.prototype.getAllCustomerStatistics = function (req, res) {
    var page = req.query.pageNum || 0;
    var user = req.query.user || ''
        , charge = req.query.charge || ''
        , channel = req.query.channel
        , conditions = {
        $and: [
            {$or: [{"source": 'docChat'}, {"source": 'webFavorite'}, {"usedApp": 'docChat'}]}
        ],
        'isDeleted': false
    };
    var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {createdAt: -1});

    var customers, channelObj = {}, rechargeObj = {}, payObj = {};
    var channelQuery = {};
    channel && (channelQuery.$or = [{code: channel}, {'manager.name': channel}]);
    charge && (channelQuery['superior.name'] = charge);
    var p1 = ChannelService.distinctChannel('code', channelQuery);
    Promise.all(p1)
        .then(function (codes) {

            user && (conditions.$and.push({$or: [{phoneNum: user}, {name: user}]}));
            codes && codes.length > 0 && (conditions.channelCode = {$in: codes});
            return CustomerService.customerSts(conditions, pageSlice);
        })
        .then(function (c) {
            customers = JSON.parse(JSON.stringify(c));
            console.log(customers.length);

            if (customers.length == 0)
                return;
            var channelsCodes = [];
            for (var i = 0; i < customers.length; i++) {
                customers[i].favoriteDoctorName = '';
                customers[i].channelCode && channelsCodes.indexOf(customers[i].channelCode) < 0 && (channelsCodes.push(customers[i].channelCode));
            }
            var promise = [
                ChannelService.findAll({code: {$in: channelsCodes}, isDeleted: false})
                //TransactionMysqlService.getAllRechargeUser(0, 1000)
            ];
            return Promise.all(promise);
        })
        .then(function (rs) {
            var recharges = rs[1] ? rs[1] : [],
                channels = rs[0] ? rs[0] : [];
            if (customers.length == 0)
                return;
            for (var k = 0; k < channels.length; k++) {
                channelObj[channels[k].code] = channels[k];
            }
            for (var j = 0; j < recharges.length; j++) {
                rechargeObj[recharges[j].userId] = recharges[j];
            }
            return TransactionMysqlService.getAllPaymentUser(); //所有支出患者
        })
        .then(function (pays) {
            if (customers.length == 0)
                return;

            for (var i = 0; i < pays.length; i++) {
                payObj[pays[i].userId] = pays[i];
            }

            var docIds = [];
            for (var i = 0; i < customers.length; i++) {
                docIds = _.union(docIds, customers[i].favoriteDocs);
                docIds = _.union(docIds, customers[i].collectedDocs);
            }

            return DoctorService.getUsersByIDs(docIds); //医生基本信息
        })
        .then(function (d) {
            if (customers.length == 0)
                return;

            //console.log("doctors:" + util.inspect(d));

            if (d)
                for (var j = 0; j < d.length; j++) {
                    for (var i = 0; i < customers.length; i++) {
                        if (_.contains(customers[i].favoriteDocs, "" + d[j]._id) || _.contains(customers[i].collectedDocs, "" + d[j]._id)) {
                            customers[i].favoriteDoctorName += d[j].realName + ",";  // 患者收藏医生的姓名
                        }
                    }
                }
        })
        .then(function () {
            for (var i = 0; i < customers.length; i++) {
                rechargeObj[customers[i]._id] ? customers[i].recharge = rechargeObj[customers[i]._id].recharge : customers[i].recharge = 0;
                channelObj[customers[i].channelCode] ? customers[i].channel = channelObj[customers[i].channelCode] : customers[i].channel = {};
                payObj[customers[i]._id] ? customers[i].payment = payObj[customers[i]._id].payment : customers[i].payment = 0;
            }
            apiHandler.OK(res, customers);
        })
        .catch(function (err) {
            apiHandler.handleErr(res, err)
        });
};

OperationController.prototype.getAllRechargeCustomerStatistics = function (req, res) {
    var size = parseInt(req.query.pageSize);
    var num = parseInt(req.query.pageNum);

    var from = 0;
    var pageSize = constants.DEFAULT_PAGE_SIZE;
    if ((typeof(size) === 'number') && size > 0)
        pageSize = size;
    if ((typeof(num) === 'number') && num > 0)
        from = num * pageSize;

    var accounts, ids = [];
    TransactionMysqlService.getAllRechargeUser(from, pageSize) //所有充值患者
        .then(function (c) {
            accounts = JSON.parse(JSON.stringify(c));
            console.log("accounts:" + util.inspect(accounts));

            if (accounts.length == 0)
                return;

            for (var i = 0; i < accounts.length; i++) {
                ids[i] = accounts[i].userId + "";
            }

            return TransactionMysqlService.getPaymentByUserIds(ids); //患者支出汇总
        })
        .then(function (pays) {
            if (accounts.length == 0)
                return;

            console.log("pays:" + util.inspect(pays));

            if (pays)
                for (var j = 0; j < pays.length; j++) {
                    for (var i = 0; i < accounts.length; i++) {
                        if (accounts[i].userId == pays[j].userId) {
                            accounts[i].payment = pays[j].payment;
                            break;
                        }
                    }
                }

            return CustomerService.getInfoByIDs(ids); //患者基本信息
        })
        .then(function (c) {
            if (accounts.length == 0)
                return;

            console.log("customers:" + util.inspect(c));

            if (c)
                for (var j = 0; j < c.length; j++) {
                    for (var i = 0; i < accounts.length; i++) {
                        if (accounts[i].userId == c[j]._id) {
                            accounts[i].name = c[j].name;
                            accounts[i].phoneNum = c[j].phoneNum;
                            break;
                        }
                    }
                }
        })
        .then(function () {
            //console.log("accounts:" + accounts);
            apiHandler.OK(res, accounts);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

OperationController.prototype.getAllPhoneOrders = function (req, res) {
    var page = req.query.pageNum || 0;
    var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {updatedAt: -1});

    OrderService.getAllPhoneOrders(pageSlice)
        .then(function (orders) {
            //console.log(orders);
            apiHandler.OK(res, orders);
        }, function (err) {
            apiHandler.handleErr(res, err);
        })
};

OperationController.prototype.phoneOrders = function (req, res) {
    commonUtil.reqFilter(req, res, {optional: ['phone', 'userPhone', 'type']}, function (data) {
        var page = req.query.pageNum || 0;
        var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {updatedAt: -1});
        var conditions = {"source": "docChat", "type": "phone", "isDeleted": false};
        data.userPhone && (conditions.$or = [{customerPhoneNum: data.userPhone}, {customerDocChatNum: data.userPhone},
            {callerDocChatNum: data.userPhone}, {callerPhoneNum: data.userPhone}]);
        data.phone && (conditions.$or = [{doctorDocChatNum: data.phone}, {doctorPhoneNum: data.phone},
            {calleeDocChatNum: data.phone}, {calleePhoneNum: data.phone}]);
        (data.type == 'toPay' || data.type == 'paid') && (conditions.payStatus = data.type);
        (data.type == 'paid' || data.type == 'all') && (conditions.time = {$gt: 0});
        data.type == 'all' && (conditions.callStatus = 'over');
        return OrderService.orders(conditions, pageSlice);
    });
};
OperationController.prototype.getAllValidPhoneOrders = function (req, res) {
    var page = req.query.pageNum || 0;
    var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {updatedAt: -1});

    OrderService.getAllValidPhoneOrders(pageSlice)
        .then(function (orders) {
            //console.log(orders);
            apiHandler.OK(res, orders);
        }, function (err) {
            apiHandler.handleErr(res, err);
        })
};

OperationController.prototype.getAllDoctorApply = function (req, res) {
    var page = req.query.pageNum || 0;
    var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {updatedAt: -1});

    DoctorService.getAllDotorApply(pageSlice)
        .then(function (doctors) {
            //console.log(doctors);
            apiHandler.OK(res, doctors);
        }, function (err) {
            apiHandler.handleErr(res, err);
        })
};

OperationController.prototype.getAllWithdrawApply = function (req, res) {
    var page = req.query.pageNum || 0;
    var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {updatedAt: -1});

    DoctorService.getAllWithdrawApply(pageSlice)
        .then(function (apply) {
            //console.log(apply);
            apiHandler.OK(res, apply);
        }, function (err) {
            apiHandler.handleErr(res, err);
        })
};
/*
 ** _id, 为副账号ID
 ** 如果
 */
OperationController.prototype.updateBroker = function (req, res) {
    commonUtil.reqFilter(req, res, {
        required: ['_id', 'update', 'docChatNum']
    }, function (data) {
        console.log(data.update);
        return DoctorService.getInfoByDocChatNum(data.docChatNum)
            .then(function (user) {
                user = (user ? user.toObject() : null);
                if (user && user._id.toString() != data._id)
                    throw ErrorHandler.getBusinessErrorByCode(1508);
                //主副表需要同步的字段
                var fields = ['realName', 'phoneNum', 'docChatNum', 'sex', 'profile',
                        'avatar', 'occupation', 'hospital', 'department'],
                    customerUpdateData = {};
                Object.keys(data.update).forEach(function (field) {
                    if (fields.indexOf(field) > -1) {
                        if (field == 'realName') {
                            customerUpdateData.name = data.update[field];
                        } else {
                            customerUpdateData[field] = data.update[field];
                        }
                    }
                })
                return CustomerService.updateBaseInfoByDocId(data._id, customerUpdateData);
            })
            .then(function (c) {
                if (!c)
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                return DoctorService.updateBaseInfo(data._id, data.update);
            })
    });
};

OperationController.prototype.brokerModifyApplicationStatus = function (req, res) {
    commonUtil.reqFilter(req, res, {
        required: ['_id', 'status', 'reason']
    }, function (data) {
        var application;
        return ApplicationService.updateStatus(data._id, data.status, data.reason)
            .then(function (a) {
                var update = {};
                update.updatedAt = Date.now();
                if (data.status == 0) {
                    update.province = a.province;
                    update.city = a.city;
                    update.hospital = a.hospital;
                    update.department = a.department;
                    update.position = a.position;
                    update.profileModifyAppStatus = data.status;
                } else if (data.status == -1) {
                    update.profileModifyAppStatus = data.status;
                }
                application = a
                return DoctorService.updateBaseInfo(a.applicantId, update)
            })
            .then(function (b) {
                if (data.status == 0) {
                    commonUtil.sendSms("1632954", application.applicantPhone,
                        "#doctor#=" + application.applicantName)
                } else if (data.status == -1) {
                    commonUtil.sendSms("1632968", application.applicantPhone,
                        "#doctor#=" + application.applicantName +
                        "&#reason#=" + data.reason)
                }
            })
            .then(function () {
                apiHandler.OK(res);
            }, function (err) {
                apiHandler.handleErr(res, err);
            });
    });
};

OperationController.prototype.delBroker = function (req, res) {
    commonUtil.reqFilter(req, res, {
        required: ['_id']
    }, function (data) {
        return CustomerService.updateBaseInfoByDocId(data._id, {isDeleted: true})
            .then(function (c) {
                if (!c) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                }
                return DoctorService.updateBaseInfo(data._id, {isDeleted: true});
            })
    });
};

OperationController.prototype.brokers = function (req, res) {
    commonUtil.reqFilter(req, res, {
        optional: ['name', 'hospital', 'department', 'position']
    }, function (data) {
        var conditions = {}
            , page = req.query.pageNum || 0
            ,
            pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {createdAt: -1});
        data.name && (conditions.$or = [{name: data.name}, {phoneNum: data.name}, {docChatNum: data.name}]);
        //data.managerName && (conditions.managerName = data.managerName);
        data.hospital && (conditions.hospital = new RegExp(data.hospital, 'i'));
        data.department && (conditions.department = new RegExp(data.department, 'i'));
        data.position && (conditions.position = new RegExp(data.position, 'i'));
        return CustomerService.query(conditions, pageSlice);
    });
};

OperationController.prototype.getBrokerModifyApplicationList = function (req, res) {
    console.log("come in")
    commonUtil.reqFilter(req, res, {
        optional: ['hospital', 'department', 'position', 'name', 'phoneNum', 'docChatNum']
    }, function (data) {
        var conditions = {
                type: 15
            }
            , page = req.query.pageNum || 0
            ,
            pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {createdAt: -1});
        data.name && (conditions.$or = [{realName: data.name}, {phoneNum: data.name}, {docChatNum: data.name}]);
        data.hospital && (conditions.hospital = new RegExp(data.hospital, 'i'));
        data.department && (conditions.department = new RegExp(data.department, 'i'));
        data.position && (conditions.position = new RegExp(data.position, 'i'));
        data.phoneNum && (conditions.phoneNum = new RegExp(data.phoneNum, 'i'));
        data.docChatNum && (conditions.docChatNum = new RegExp(data.docChatNum, 'i'));
        return ApplicationService.query(conditions, pageSlice, "", {population: 'applicantRef'})
    });
};

OperationController.prototype.bidList = function (req, res) {
    console.log("come in bid")
    commonUtil.reqFilter(req, res, {}, function (data) {
        var conditions = {
            source: 'docChat',
            isDeleted: false,
            type: 'ad',
            payStatus: 'paid'
        };

        var page = req.query.pageNum || 0;
        var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {createdAt: -1});
        return OrderService.getBidList(conditions, pageSlice);
    });
};

OperationController.prototype.paymentList = function (req, res) {
    console.log("come in payment")
    commonUtil.reqFilter(req, res, {}, function (data) {
        var conditions = {
            source: 'docChat',
            isDeleted: false,
            type: 'tf',
            payStatus: 'paid'
        };

        var page = req.query.pageNum || 0;
        var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {createdAt: -1});
        //return OrderService.getBidList(conditions, pageSlice);
        return OrderService.getTransferList(conditions, pageSlice);
    });
};

/**
 * 收藏过指定医生的患者列表
 * @param req
 * @param res
 */
OperationController.prototype.favorites = function (req, res) {
    var doctorId = req.query.doctorId;
    //var page = req.query.pageNum || 0;
    //var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {updatedAt: -1});

    CustomerService.getAllFavoritedUserByDocId(doctorId)
        .then(function (c) {
            //console.log(c);
            apiHandler.OK(res, c);
        }, function (err) {
            apiHandler.handleErr(res, err);
        })
};

OperationController.prototype.sendSmsToAllArrearCustomer = function (req, res) {
    OrderService.getAllArrearPhoneOrder()
        .then(function (orders) {
            if (orders)
                for (var i = 0; i < orders.length; i++) {
                    console.log("arrearOrder:" + util.inspect(orders[i]));

                    commonUtil.sendSms("1014203", orders[i].customerPhoneNum,
                        "#doctorName#=" + orders[i].doctorRealName +
                        "&#phone#=" + constants.zly400 +
                        "&#url#=" + constants.customerPublicDownloadURL + "/?docChatNum" + encodeURIComponent("=") + orders[i].doctorDocChatNum);
                }

            apiHandler.OK(res);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

OperationController.prototype.sendSmsToArrearCustomer = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['customerPhone', 'doctorName', 'doctorDocChatNum']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        commonUtil.sendSms("1014203", data.customerPhone,
            "#doctorName#=" + data.doctorName +
            "&#phone#=" + constants.zly400 +
            "&#url#=" + constants.customerPublicDownloadURL + "/?docChatNum" + encodeURIComponent("=") + data.doctorDocChatNum);

        apiHandler.OK(res);
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

OperationController.prototype.addDoctor = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['applyStatus', 'phoneNum', 'docChatNum', 'realName', 'sex', 'callPrice', 'hospital', 'department'],
        optional: ['occupation', 'position', 'message2Customer', 'city', 'province', 'managerName', 'hospitalId', 'departmentId', 'password']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        console.log("addDoctor:" + JSON.stringify(data));

        DoctorService.getInfoByDocChatNum(data.docChatNum)
            .then(function (u) {
                if (u) {
                    throw ErrorHandler.getBusinessErrorByCode(1508);
                } else {
                    return DoctorService.getInfoByPhone(data.phoneNum);
                }
            })
            .then(function (u) {
                if (u) {
                    throw ErrorHandler.getBusinessErrorByCode(1509);
                } else {
                    return CustomerService.getInfoByDocChatNum(data.docChatNum);
                }
            })
            .then(function (c) {
                if (c) {
                    throw ErrorHandler.getBusinessErrorByCode(1509);
                } else {
                    return CustomerService.getInfoByPhone(data.docChatNum);
                }
            })
            .then(function (u) {
                if (u) {
                    throw ErrorHandler.getBusinessErrorByCode(1509);
                }
            })
            .then(function () {
                data.avatar = 'avatar_' + data.docChatNum + '.jpg';
                data.password = 'e10adc3949ba59abbe56e057f20f883e'; //默认密码：123456
                data.callPrice.discount = 1;
                return DoctorService.createDoctor(data);
            })
            .then(function (d) {
                if (!d) {
                    throw ErrorHandler.getBusinessErrorByCode(1201);
                }
                //主副表需要同步的字段
                var fields = ['realName', 'phoneNum', 'docChatNum', 'sex', 'profile',
                        'avatar', 'occupation', 'hospital', 'department'],
                    newCustomer = {};
                newCustomer.doctorRef = d._id;
                Object.keys(data).forEach(function (field) {
                    if (fields.indexOf(field) > -1) {
                        if (field == 'realName') {
                            newCustomer.name = data[field];
                        } else {
                            newCustomer[field] = data[field];
                        }
                    }
                })
                CustomerService.createCustomer(newCustomer);
                apiHandler.OK(res);
            }, function (err) {
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

//申请成为医生处理
OperationController.prototype.applyHandle = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['doctorId', 'handle', 'systag']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var applyUser;

        DoctorService.getDotorApplyById(data.doctorId)
            .then(function (u) {
                if (!u)
                    throw ErrorHandler.getBusinessErrorByCode(1503);

                applyUser = u;
                if (data.handle == 'agreed') { //同意添加
                    return DoctorService.getInfoByPhone(u.phoneNum); //判断是否已经添加了改医生

                } else {  //refused 拒绝
                    DoctorService.modifyApplyStatus(data.doctorId, 'refused');
                }
            })
            .then(function (u) {
                    if (data.handle == 'agreed') {
                        if (u) {  //用户已经通过成为医生
                            DoctorService.modifyApplyStatus(data.doctorId, 'repeated');
                        } else {

                            var startNum = '801';
                            var randNum = 6;
                            var min = 1;
                            //if (data.systag == 'doctor') {
                            //  startNum = '1';
                            //  randNum = 4;
                            //  min = 1000;
                            //}

                            DoctorService.genDoctorChatNum(startNum, randNum, min)
                                .then(function (docChatNum) {
                                    console.log("applyHandle docChatNum:" + docChatNum);
                                    var smsTmpId = "1593424"; //"1536484"
                                    var randomPwd = "" + commonUtil.getRandomNum(100000, 999999);
                                    var updateData = {
                                        'applyStatus': 'done',
                                        'docChatNum': docChatNum,
                                        'systag': data.systag,
                                        // @20161009-改为生成随机6位数字做初始化密码
                                        // 'password': 'e10adc3949ba59abbe56e057f20f883e', //初始密码123456
                                        'password': commonUtil.commonMD5(randomPwd),
                                        'avatar': 'avatar_' + docChatNum + '.jpg',
                                        'updatedAt': Date.now()
                                    };

                                    DoctorService.updateBaseInfo(data.doctorId, updateData);

                                    commonUtil.sendSms(smsTmpId, applyUser.phoneNum,
                                        "#docName#=" + applyUser.realName +
                                        "&#pwd#=" + randomPwd +
                                        "&#url#=" + constants.doctorPublicDownloadURL);
                                });
                        }
                    }

                    apiHandler.OK(res);
                },
                function (err) {
                    console.log(err);
                    apiHandler.handleErr(res, err);
                });

    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

var randomDocChatNum = function (starNum) { //TODO 现在12开头
    var random = commonUtil.getRandomNum(1, 999);
    //console.log("random:" + random);
    return starNum + ((random < 10) ? ('00' + random) : ((random < 100) ? '0' + random : random));
};

/**
 * 输入手机号关注医生获取优惠券
 * @param req
 * @param res
 */
//OperationController.prototype.getPhoneCoupon = function (req, res) {
//  var phoneNum = req.query.phoneNum;
//  var docChatNum = req.query.docChatNum || '00120';
//
//  var user;
//  if (phoneNum)
//    CustomerService.validUser(phoneNum, '', 'webFavorite')
//      .then(function (u) { //查询是否送过优惠券
//        user = u;
//        return CouponService.getCouponByPhoneAndActivityNo(phoneNum, constants.COUPON_ACTIVITYNO_FAVORITE);
//      })
//      .then(function (c) {
//        if (c) { //已领取过
//          throw ErrorHandler.getBusinessErrorByCode(1601);
//        } else {
//          var coupon1 = {
//            activityNO: constants.COUPON_ACTIVITYNO_FAVORITE,
//            title: '代金券',
//            subTitle: '',
//            description: '',
//            manual: '',
//            rmb: constants.COUPON_ACTIVITYNO_FAVORITE_RMB_20,
//            rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_FAVORITE_RMB_20,
//            expiredAt: Date.now() + constants.COUPON_ACTIVITYNO_FAVORITE_TIME,
//            boundUserId: user._id,
//            boundUserPhoneNum: user.phoneNum
//          };
//          var coupon2 = {
//            activityNO: constants.COUPON_ACTIVITYNO_FAVORITE,
//            title: '代金券',
//            subTitle: '',
//            description: '',
//            manual: '',
//            rmb: constants.COUPON_ACTIVITYNO_FAVORITE_RMB_10,
//            rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_FAVORITE_RMB_10,
//            expiredAt: Date.now() + constants.COUPON_ACTIVITYNO_FAVORITE_TIME,
//            boundUserId: user._id,
//            boundUserPhoneNum: user.phoneNum
//          };
//
//          //送两张优惠券
//          CouponService.createCoupon(coupon1);
//          CouponService.createCoupon(coupon2);
//        }
//      })
//      .then(function () {
//        return DoctorService.getInfoByDocChatNum(docChatNum);
//      })
//      .then(function (d) {
//        if (d)
//          return CustomerService.collectedDoc(user._id, d._id); //纪录患者关注了哪个医生
//      })
//      .then(function () {
//        commonUtil.sendSms("1125115", phoneNum, "#money#=" + constants.COUPON_ACTIVITYNO_FAVORITE_RMB + "&#phone#=" + constants.zly400);
//        apiHandler.OK(res);
//      }, function (err) {
//        apiHandler.handleErr(res, err);
//      });
//};


/**
 * 从boss给用户充值
 * @param req
 * @param res
 */
OperationController.prototype.bossRecharge = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['phoneNum', 'cash', 'outerTradeNo']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var hasDebts = false;
        var user, doctorId;

        //先查账户，如果amount为负，则需要充值成功后amount变成正后修改对应的订单
        CustomerService.validUser(data.phoneNum, '', '', 'web')
            .then(function (u) {
                user = u;
                doctorId = user.doctorRef && user.doctorRef._id ? user.doctorRef._id : '';
                return TransactionMysqlService.getAccountByUserIdAndDoctorId(user._id + "", doctorId + '');
            })
            .then(function (account) {
                hasDebts = account.amount < 0;

                //return TransactionMysqlService.getTransactionByOuterTradeNo(outerTradeNo); //查询是否重复充值
            })
            .then(function (t) {
                //if (t.length <= 0) { //没有重复充值
                //
                //  if (user.channelCode) {  //给渠道分账
                //    ChannelService.getInfoByChannelCode(user.channelCode)
                //      .then(function (c) {
                //        console.log("channel---->" + c);
                //        if (c) {
                //          TransactionMysqlService.channelRechargeReward(c.manager._id, cash * 0.1, outerTradeNo, innerTradeNo);
                //        }
                //      }
                //    );
                //  }
                //
                //  return TransactionMysqlService.recharge(userId, cash, outerTradeNo, innerTradeNo, subType);
                //}

                var innerTradeNo = commonUtil.getRandomNum(100, 999) + user._id + commonUtil.getRandomNum(100, 999);

                return TransactionMysqlService.recharge(user._id + "", doctorId + '', data.cash, data.outerTradeNo, innerTradeNo, TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_RECHARGE_BOSS);
            })
            .then(function (account) {
                    apiHandler.OK(res);

                    if (account && hasDebts && (account.amount >= 0)) {
                        OrderService.updateAllPhoneOrderToPaid(user._id + "");
                    }

                }, function (err) {
                    apiHandler.handleErr(res, err);
                }
            );
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};


/**
 * 给无法升级ios用户送券
 * @param req
 * @param res
 */
OperationController.prototype.iosPhoneCoupon = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['phoneNums']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        CustomerService.getInfoByPhones(data.phoneNums)
            .then(function (c) {
                if (c) {
                    for (var j = 0; j < c.length; j++) {
                        var coupon = {
                            activityNO: constants.COUPON_ACTIVITYNO_FAVORITE,
                            title: '代金券',
                            subTitle: '',
                            description: '',
                            manual: '',
                            rmb: constants.COUPON_ACTIVITYNO_FAVORITE_RMB_20,
                            rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_FAVORITE_RMB_20,
                            expiredAt: Date.now() + constants.COUPON_ACTIVITYNO_FAVORITE_TIME,
                            boundUserId: c[j]._id,
                            boundUserPhoneNum: c[j].phoneNum
                        };

                        CouponService.createCoupon(coupon); //送优惠券
                        commonUtil.sendSms("1217097", c[j].phoneNum, "#url#=" + constants.customerPublicDownloadURL);
                    }
                }

                apiHandler.OK(res);
            }, function (err) {
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

/**
 * 促单送优惠券
 * @param req
 * @param res
 */
OperationController.prototype.getPromotePhoneCoupon = function (req, res) {
    var phoneNum = req.query.phoneNum;
    var money = req.query.money;

    var user;
    if (phoneNum)
        CustomerService.validUser(phoneNum, '', '', 'web')
            .then(function (u) {
                user = u;
                return CouponService.getCouponByPhoneAndActivityNo(phoneNum, constants.COUPON_ACTIVITYNO_PROMOTE); //查询是否送过优惠券
            })
            .then(function (c) {
                if (c) { //已领取过
                    throw ErrorHandler.getBusinessErrorByCode(1601);
                } else {
                    var coupon = {
                        activityNO: constants.COUPON_ACTIVITYNO_PROMOTE,
                        title: '代金券',
                        subTitle: '',
                        description: '',
                        manual: '',
                        rmb: money,
                        rmbDescription: '¥' + money,
                        expiredAt: Date.now() + constants.COUPON_ACTIVITYNO_PROMOTE_TIME,
                        boundUserId: user._id,
                        boundUserPhoneNum: user.phoneNum
                    };

                    return CouponService.createCoupon(coupon); //送优惠券
                }
            })
            .then(function () {
                commonUtil.sendSms("1616174", phoneNum, "#money#=" + money + "&#url#=" + constants.customerPublicDownloadURL);
                apiHandler.OK(res);
            }, function (err) {
                apiHandler.handleErr(res, err);
            });
};

OperationController.prototype.createStatistics = function (req, res) {
    var statisticsLength = 129;

    for (var i = 1; i <= statisticsLength; i++) {
        var dateFormat = new Date(Date.now() - i * constants.TIME_1_DAY).format("yyyy-MM-dd 23:59:59");
        var expiryDate = new Date(dateFormat).getTime();

        that.createExpiryDateIndicatorStatistics(expiryDate);
    }

    apiHandler.OK(res);
};

OperationController.prototype.getIndicatorStatistics = function (req, res) {
    var page = req.query.pageNum || 0;
    var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {infoTime: -1});

    StatisticsService.getAllStatistics(pageSlice)
        .then(function (s) {
            apiHandler.OK(res, s);
        }, function (err) {
            apiHandler.handleErr(res, err);
        })
};

OperationController.prototype.getIndicatorStatisticsCSV = function (req, res) {
    var head = '时间' + "," + "累计患者数" + "," + "累计医生数" + "," + "累计成单医生数" + "," + "累计订单数" + "," + "累计成单数" + "," + "累计成单数(除120)" + "," + "患者累计充值" + "," + "患者模型支出" + "," + "患者实际支出" + "," + "医生模型收入" + "," + "医生实际收入";

    var fileName = 'indicator_' + new Date(Date.now()).format("YYYY-MM-dd") + '.csv'
    var file = './public/data/' + fileName;
    var resFileUrl = 'https://pro.mtxhcare.com/data/' + fileName;

    console.log(file + "-->" + fs.existsSync(file));
    if (fs.existsSync(file)) {
        apiHandler.OK(res, {fileUrl: resFileUrl});
        return;
    }

    fs.appendFileSync(file, head + '\n', 'utf-8');

    StatisticsService.getAllStatistics({sort: {infoTime: -1}})
        .then(function (statistics) {
            var length = statistics.length;
            console.log("Length: " + length);

            var j = 0;
            var innerTimer = setInterval(function () {
                (function (j) {
                    if (j >= length) {
                        console.log("Game over...");
                        clearInterval(innerTimer);

                        apiHandler.OK(res, {fileUrl: resFileUrl});
                        return;
                    }

                    var s = statistics[j];

                    var line = new Date(s.infoTime).format("YYYY-MM-dd") + "," +
                        (s.customerNum || "") + "," +
                        (s.doctorNum || "") + "," +
                        (s.connectedDoctorNum || "") + "," +
                        (s.orderNum || "") + "," +
                        (s.connectedOrderNum || "") + "," +
                        (s.Non120ConnectedOrderNum || "") + "," +
                        (s.rechargeSum || "") + "," +
                        (s.customerModelPay || "") + "," +
                        (s.customerRealityPay || "") + "," +
                        (s.doctorModelIncome || "") + "," +
                        (s.doctorRealityIncome || "");

                    fs.appendFileSync(file, line + '\n', 'utf-8');
                })(j++)
            }, 10);
        });
};

OperationController.prototype.yesterdayIndicatorStatistics = function (req, res) {
    var dateFormat = new Date(Date.now() - constants.TIME_1_DAY).format("yyyy-MM-dd 23:59:59");
    var expiryDate = new Date(dateFormat).getTime();

    that.createExpiryDateIndicatorStatistics(expiryDate)
        .then(function (s) {
                //console.log(s);
                apiHandler.OK(res);
            },
            function (err) {
                apiHandler.handleErr(res, err);
            });
};

OperationController.prototype.todayIndicatorStatistics = function (req, res) {
    var dateFormat = new Date(Date.now()).format("yyyy-MM-dd 00:00:00");
    var today = new Date(dateFormat).getTime();

    var customerNum, doctorNum, connectedOrderNum, NonEmployeeConnectedOrderNum, rechargeSum, docIncome;

    CustomerService.getGTDateCustomerNum(today) //患者数
        .then(function (n) {
            customerNum = n;
            return DoctorService.getGTDateDoctorNum(today);//医生数
        })
        .then(function (n) {
            doctorNum = n;
            return OrderService.getGTDateValidPhoneOrders(today);//订单数
        })
        .then(function (o) {
            connectedOrderNum = o.length;
            return TransactionMysqlService.getGTDateTransactionsSum(TransactionMysqlService.CONS.TRANSACTION_TYPE_RECHARGE, today);//充值金额
        })
        .then(function (t) {
            rechargeSum = t[0].cash;

            return TransactionMysqlService.getGTDateTransactionsSum(TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_INCOME_DC, today);//充值金额
        })
        .then(function (t) {
                docIncome = t[0].cash;

                var responseData = {
                    "customerNum": customerNum,
                    "doctorNum": doctorNum,
                    "connectedOrderNum": connectedOrderNum,
                    "rechargeSum": rechargeSum,
                    "docIncome": docIncome
                };

                apiHandler.OK(res, responseData);
            },
            function (err) {
                apiHandler.handleErr(res, err);
            });
};
/**
 * 创建截止到expiryDate的指标累计数据
 * expiryDate对应的日期时间为yyyy-MM-dd 23:59:59格式
 * @param expiryDate
 * @returns {Promise|*}
 */
OperationController.prototype.createExpiryDateIndicatorStatistics = function (expiryDate) {
    var customerNum, doctorNum, orderNum, connectedOrderNum,
        rechargeSum, customerRealityPay, doctorRealityIncome, tfSum, adSum;

    return CustomerService.getExpiryDateCustomerNum(expiryDate) //患者数
        .then(function (n) {
            customerNum = n;
            return DoctorService.getExpiryDateDoctorNum(expiryDate);//医生数
        })
        .then(function (n) {
            doctorNum = n;
            return OrderService.getExpiryDatePhoneOrderNum(expiryDate);//订单数
        })
        .then(function (n) {
            orderNum = n;
            return OrderService.getExpiryDateValidPhoneOrders(expiryDate);//成单数
        })
        .then(function (n) {
            connectedOrderNum = n;

            return TransactionMysqlService.getExpiryDateTransactionsSum(TransactionMysqlService.CONS.TRANSACTION_TYPE_RECHARGE, expiryDate);//充值金额
        })
        .then(function (t) {
            rechargeSum = t[0].cash;
            return TransactionMysqlService.getExpiryDateTransactionsSum(TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_PAY_DC, expiryDate);//患者实际支出(患者支出－优惠券)
        })
        .then(function (t) {
            customerRealityPay = -t[0].cash;
            return TransactionMysqlService.getExpiryDateTransactionsSum(TransactionMysqlService.CONS.TRANSACTION_SUBTYPE_INCOME_DC, expiryDate);//医生实际收入
        })
        .then(function (t) {
            doctorRealityIncome = t[0].cash;

            return OrderService.getExpiryDateTFSum(expiryDate);
        })
        .then(function (s) {
            tfSum = s[0].sum;
            return OrderService.getExpiryDateADSum(expiryDate);
        })
        .then(function (s) {
            adSum = s[0].sum;
        })
        .then(function () {
            var s = {
                infoTime: expiryDate,
                customerNum: customerNum,
                doctorNum: doctorNum,
                orderNum: orderNum,
                connectedOrderNum: connectedOrderNum,
                rechargeSum: rechargeSum,
                customerRealityPay: customerRealityPay,
                doctorRealityIncome: doctorRealityIncome,
                tfSum: tfSum,
                adSum: adSum
            };

            return StatisticsService.createStatistics(s);
        })
};


OperationController.prototype.setPinyinName = function (req, res) {
    CustomerService.getAllCustomer()//获得所有患者
        .then(function (c) {
            console.log(c.length);

            for (var i = 0; i < c.length; i++)
                if (c[i].name)
                    CustomerService.updateBaseInfo(c[i]._id, {"name": c[i].name});

            apiHandler.OK(res);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

//OperationController.prototype.sendSMS = function (req, res) {
//  var payload = req.body;
//  var fields = {
//    required: ['phoneNums']
//  };
//
//  var onFailure = function (handler, type) {
//    handler(res, type);
//  };
//  var onSuccess = function (handler, data) {
//    var phones = "";
//    for (var i = 0; i < data.phoneNums.length; i++) {
//      phones += data.phoneNums[i] + ",";
//    }
//
//    commonUtil.sendSms("1254371", phones, "#url#=" + constants.doctorPublicDownloadURL, true);
//    apiHandler.OK(res);
//  };
//
//  commonUtil.validate(payload, fields, onSuccess, onFailure);
//};

OperationController.prototype.sendSMS = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['phone', 'orderNo', 'title']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {

        commonUtil.sendSms("1354421", data.phone, "#orderNo#=" + data.orderNo + "&#title#=" + data.title);
        apiHandler.OK(res);

    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

//修补Collected不包含favoriteDocs字段数据的问题
OperationController.prototype.patchCollectedColumn = function (req, res) {
    CustomerService.getAllCustomer()
        .then(function (customers) {
            console.log("customer number:" + customers.length);

            for (var i = 0; i < customers.length; i++) {
                if (customers[i].favoriteDocs && customers[i].favoriteDocs.length > 0)
                    CustomerService.addDocsToCollectedDocs(customers[i]._id, customers[i].favoriteDocs);
            }

            apiHandler.OK(res);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

//查询医生分组信息
OperationController.prototype.getDocGrpList = function (req, res) {
    var page = commonUtil.getCurrentPageSlice(req, 0, 20, {createdAt: -1});
    DoctorService.getDocGrpList("_id memo description docChatList createdAt", page)
        .then(function (grpList) {

            apiHandler.OK(res, grpList);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

//修改医生分组信息
OperationController.prototype.updateDocGrpList = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['docChatList', 'description', 'memo'],
        optional: ['_id']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        if (data._id) {
            DoctorService.updateDocGrp(data)
                .then(function (u) {
                        console.log(u);
                        apiHandler.OK(res);
                    },
                    function (err) {
                        console.log(err);
                        apiHandler.handleErr(res, err);
                    });
        } else {
            DoctorService.insertDocGrp(data)
                .then(function (u) {
                        console.log(u);
                        apiHandler.OK(res);
                    },
                    function (err) {
                        console.log(err);
                        apiHandler.handleErr(res, err);
                    });
        }


    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

OperationController.prototype.sendSMSToAllDoctor = function (req, res) {
    DoctorService.getAllDoctorAllInfo()//获得医生
        .then(function (c) {
            console.log(c.length);

            var phones = "";
            for (var i = 1; i <= c.length; i++) {
                phones += c[i - 1].phoneNum + ",";
                if (i % 10 == 0 || i == c.length) {
                    console.log("phone:" + phones);
                    commonUtil.sendSms("1225957", phones, "#url#=" + constants.doctorPublicDownloadURL);

                    phones = "";
                }
            }

            //commonUtil.sendSms("1225957", 18810562253, "#url#=" + constants.doctorPublicDownloadURL);
            apiHandler.OK(res);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

OperationController.prototype.sendSMS1ToAllCustomer = function (req, res) {
    CustomerService.getAllCustomer()//获得所有患者
        .then(function (c) {
            console.log(c.length);

            var phones = "";
            for (var i = 1; i <= c.length; i++) {
                if (c[i - 1].phoneNum)
                    phones += c[i - 1].phoneNum + ",";

                if (i % 10 == 0 || i == c.length) {
                    console.log("phone:" + phones);
                    commonUtil.sendSms("1225985", phones, "#money#=" + 100 + "&#url#=" + constants.customerPublicDownloadURL, true);
                    phones = "";
                }
            }

            //commonUtil.sendSms("1225985", 18810562253, "#money#=" + 100 + "&#url#=" + constants.customerPublicDownloadURL, true);
            apiHandler.OK(res);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

OperationController.prototype.sendSMS2ToAllCustomer = function (req, res) {
    CustomerService.getAllCustomer()//获得所有患者
        .then(function (c) {
            console.log(c.length);

            var phones = "";
            for (var i = 1; i <= c.length; i++) {
                if (c[i - 1].phoneNum)
                    phones += c[i - 1].phoneNum + ",";

                if (i % 10 == 0 || i == c.length) {
                    console.log("phone:" + phones);
                    commonUtil.sendSms("1225975", phones, "#url#=" + constants.customerPublicDownloadURL);

                    phones = "";
                }
            }

            //commonUtil.sendSms("1225975", 18810562253, "#url#=" + constants.customerPublicDownloadURL);
            apiHandler.OK(res);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

OperationController.prototype.sendSMS3ToAllCustomer = function (req, res) {
    CustomerService.getAllCustomer()//获得所有患者
        .then(function (c) {
            console.log(c.length);

            var phones = "";
            for (var i = 1; i <= c.length; i++) {
                if (c[i - 1].phoneNum)
                    phones += c[i - 1].phoneNum + ",";

                if (i % 10 == 0 || i == c.length) {
                    console.log("phone:" + phones);
                    commonUtil.sendSms("1225987", phones, "#url#=" + constants.customerPublicDownloadURL, true);
                    phones = "";
                }
            }

            //commonUtil.sendSms("1225987", 18810562253, "#url#=" + constants.customerPublicDownloadURL, true);
            apiHandler.OK(res);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};


OperationController.prototype.addDoctorSexToOrder = function (req, res) {
    var doctors;
    DoctorService.getAllDoctorInfo()
        .then(function (d) {
            doctors = d;
            console.log(doctors.length);

            if (doctors.length == 0)
                return;

            return OrderService.getAllPhoneOrders();
        })
        .then(function (o) {
            if (doctors.length == 0) {
                apiHandler.OK(res);
                return;
            }

            console.log(o.length);

            for (var i = 0; i < o.length; i++) {
                for (var j = 0; j < doctors.length; j++) {
                    if (o[i].doctorId == doctors[j]._id) {
                        OrderService.updateOrderInfo(o[i]._id, {doctorSex: doctors[j].sex});
                        break;
                    }
                }
            }

            apiHandler.OK(res);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

OperationController.prototype.doctorValidPhoneOrderNumAndCustomers = function (req, res) {
    var result;

    OrderService.doctorValidPhoneOrderNumAndCustomers()
        .then(function (o) {
            result = JSON.parse(JSON.stringify(o));
            //console.log(result);
            //console.log(result.length);

            var customers = [];
            var btn;

            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].customer.length; j++) {

                    btn = false;
                    for (var k = 0; k < customers.length; k++) {
                        if (result[i].customer[j] === customers[k].name) {
                            customers[k].count += 1;
                            btn = true;
                            break;
                        }
                    }

                    if (!btn) {
                        customers.push({name: result[i].customer[j], count: 1});
                    }

                    if (j == (result[i].customer.length - 1)) {
                        result[i].customerNum = customers.length;
                        result[i].customer = customers;
                        customers = [];
                    }

                }
            }
        })
        .then(function () {
            apiHandler.OK(res, result);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

/**
 * 获取所有评论列表
 */
OperationController.prototype.getCommentList = function (req, res) {
    var page = commonUtil.getCurrentPageSlice(req, 0, 20, {createdAt: -1});
    OrderService.findAllCommentList(page).then(function (_orders) {
        if (!_orders || _orders.length <= 0)
            _orders = [];
        return apiHandler.OK(res, _orders);

    }, function (err) {
        return apiHandler.handleErr(res, err);
    })
};

OperationController.prototype.cardApply = function (req, res) {
    var page = commonUtil.getCurrentPageSlice(req, 0, 20, {createdAt: -1});
    ApplicationService.list({type: 16}, page).then(function (_orders) {
        if (!_orders || _orders.length <= 0)
            _orders = [];
        return apiHandler.OK(res, _orders);
    }, function (err) {
        return apiHandler.handleErr(res, err);
    })
};

OperationController.prototype.shopApply = function (req, res) {
    var page = commonUtil.getCurrentPageSlice(req, 0, 20, {createdAt: -1});
    var orders
    ApplicationService.list({type: 17}, page).then(function (_orders) {
        if (!_orders || _orders.length <= 0)
            _orders = [];
        orders = JSON.parse(JSON.stringify(_orders));
        var userIds = [];
        _orders.forEach(function (item) {
            userIds.push(item.applicantId);
        })
        return CustomerService.getInfoByIDs(userIds, {fields: "docChatNum"})
    })
        .then(function (_users) {
            _users = _.indexBy(_users, "_id");
            orders.forEach(function (item) {
                if (_users[item.applicantId]) {
                    item.docChatNum = _users[item.applicantId].docChatNum
                }
            })
            return apiHandler.OK(res, orders);
        }, function (err) {
            return apiHandler.handleErr(res, err);
        })
};

/**
 * 评论订单
 */
OperationController.prototype.checkComment = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['check', 'orderId']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        if (!commonUtil.isUUID24bit(data.orderId))
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        OrderService.checkComment(data.orderId, data.check)
            .then(function (_order) {
                apiHandler.OK(res);
            }, function (err) {
                apiHandler.handleErr(res, err);
            })
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};
/**
 * 统计并 更新/新增 备用联系人关系
 *
 * 规则定义2016-12-01:
 * 每日统计一次(0点),统计用户前一天内（自然日, 会受统计时间影响）C2D的通话(D->A)记录, 统计每次通话记录后的前5次首次收藏D, 新建/更新 A-D关系;
 * 另一种理解思路: 用户每天内的首次收藏记录 通过 当天的通话(时间) 来分组, 取各组内的前5次收藏 计算关系
 *
 * 规则定义2016-11-14:
 * 每日统计两次(0点和12点), 统计用户首次关注D前的一次电话(打给A), 新建/更新 A-D关系(备用联系人)
 * 如果用户关注前没有C2D的通话(D->A),则对关系无影响
 *
 * Bug记录:
 *
 * @2016-12-02
 * Bug影响: 引起D和A的关系有重复统计并新增;
 * 修复方案: 标识删除昨日新增的关系记录; 调整统计时间重新跑脚本 并且 只对新增的关系进行操作;
 * 修复脚本:
 * db.relations.update(
 *    {createdAt: {$gt: 1480521600000}, type: "recmnd_fans"},
 *    {$set: {isDeleted: true, memo: "清空20161201Bug数据"}},
 *    {multi: true})
 * db.statistics.update(
 *    {type: "last_rel_upd"},
 *    {$set: {updatedAt: 1480521600000}})
 *
 * 1480521600000 ~ 1480609501987
 * 手工修改脚本 查询并更新
 *
 *
 */
OperationController.prototype.countTodayFansReferrer = function (req, res) {
    if (req.query && req.query.logic == "20161114") {
        _BizLogic20161114(req, res);
    } else {
        _BizLogic20161201(req, res);
    }
};
var _BizLogic20161114 = function (req, res) {
    // Step 1. 获取上次更新~至今的所有首次关注Log信息
    LoggerService.getTodayDoc1stFans()
        .then(function (_logs) {
            var logs = JSON.parse(JSON.stringify(_logs));
            console.log("GetLogOK: " + logs.length);
            //END OF RESPONSE; Quick Response
            res.status(200).end();
            //Asyncronize execs
            var nums = _.pluck(logs, "docChatNum");
            console.log("1. Begin nums : " + nums);
            // 根据专家医生的医疗号查询基本信息, 批量获取fromIds
            DoctorService.getDoctorListByDcNum(nums)
                .then(function (_docs) {

                    var docs = JSON.parse(JSON.stringify(_docs));
                    var execs = [];// 待执行promise
                    var chgs = [];// 待更新数据
                    var updates = [];
                    // Get chgs,
                    logs.forEach(function (d) {

                        var doc = _.find(docs, function (_d) {
                            return _d.docChatNum == d.docChatNum;
                        });
                        var chg = {}
                        if (doc) {
                            var cond = {
                                customerId: d.userId,
                                doctorId: {$ne: doc._id},// 不应该统计自己打给自己的用户推荐 @20161115
                                type: "phone",
                                direction: "C2D",
                                time: {$gt: 0},
                                createdAt: {$lt: d.createdAt},
                                isDeleted: false
                            };
                            chg.fromId = doc._id;
                            execs.push(
                                OrderService.commonFindOne(cond)//批量获取 toIds;
                                    .then(function (_order) {
                                        try {
                                            if (_order) {
                                                console.log("order...")
                                                chg.toId = _order.doctorId;
                                                var index = _.findIndex(chgs, chg);
                                                if (index >= 0) {
                                                    console.log("multi....")
                                                    chgs[index].weight += 1;
                                                    chgs[index].fansId.push(cond.customerId);
                                                    console.log("multi....end")
                                                } else {
                                                    console.log("single....")
                                                    chg.weight = 1;
                                                    chg.fansId = [cond.customerId];
                                                    chgs.push(chg);
                                                    console.log("single....end")
                                                }
                                                console.log("order...end")
                                            }
                                        } catch (e) {
                                            console.log("exception : " + e);
                                        }
                                    }));
                        } else console.log("Doc not found Error!!!" + d.docChatNum);
                    });
                    console.log("end of logs foreach")
                    // Bath exec
                    console.log("execs count: " + execs.length)
                    Promise.all(execs).then(function () {
                        console.log("2. Begin updates " + chgs.length);
                        chgs.forEach(function (d) {
                            updates.push(DoctorService.getDocRelByIds("recmnd_fans", d.fromId, d.toId)
                                .then(function (_rel) {
                                    if (_rel) {
                                        console.log("update rel");
                                        return DoctorService.addRelWeight(_rel._id, d.weight, d.fansId);
                                    } else {
                                        console.log("add rel");
                                        return DoctorService.createRel({
                                            fromId: d.fromId,
                                            fromRef: commonUtil.getObjectIdByStr(d.fromId),
                                            toId: d.toId,
                                            toRef: commonUtil.getObjectIdByStr(d.toId),
                                            fansId: d.fansId,
                                            weight: d.weight
                                        });
                                    }
                                }))
                        })
                        console.log("Begin exec updates: " + updates.length);
                        Promise.all(updates).then(function () {
                            console.log("Finally End");
                        }, function (err) {
                            console.log("Finally Err: " + err);
                        })
                    }, function (err) {
                        console.log("Err: " + err);
                    })
                }, function (err) {
                    console.log("Inner error!!! " + err);
                })

        }, function (err) {
            console.log("GetLogErr: " + err);
            //END OF RESPONSE
            res.status(200).end();
        });
};
var _BizLogic20161201 = function (req, res) {
    console.log("Step 1. Find Latest Log; 获取上次更新~至今的所有首次关注Log信息");

    // 上一次更新时间:  1484065501074
    // 2016-1-4  1483459200000,1483545600000
    // 2016-1-5  1483545600000,1483632000000
    // 2016-1-6  1483632000000,1483718400000
    // 2016-1-7  1483718400000,1483804800000
    // 2016-1-8  1483804800000,1483891200000
    // 2016-1-9  1483891200000,1483977600000
    // 2016-1-10 1483977600000,1484064000000
    LoggerService.getTodayDoc1stFans()
        .then(function (_data) {
            var _logs = _data.logs;
            var logs = JSON.parse(JSON.stringify(_logs));
            var lastUpd = _data.lastUpd;
            console.log("End Step 1. Got 1stFav Logs: " + logs.length);
            //END OF RESPONSE; Quick Response
            res.status(200).end();
            //Asyncronize Execs
            var nums = _.pluck(logs, "docChatNum");
            // FIXME: 优化方案  批量查询C的今日订单 和 被关注医生信息, 按C.id 和 Order.createdAt来聚合分组
            console.log("Step 2. Find doctor info : " + nums + "; 根据专家医生的医疗号查询基本信息, 批量获取fromIds");
            DoctorService.getDoctorListByDcNum(nums)
                .then(function (_docs) {
                    _docs = _docs || [];
                    console.log("End Step 2. Got doc : " + _docs.length);
                    var docs = JSON.parse(JSON.stringify(_docs));
                    var execs = [];// 待执行promise
                    var chgs = [];// 待更新数据
                    var updates = [];
                    console.log("Step 3. Start Log process Loop; 遍历Log,");
                    logs.forEach(function (_log) {

                        var doc = _.find(docs, function (_d) {
                            return _d.docChatNum == _log.docChatNum;
                        });
                        var chg = {};
                        if (doc) {
                            var cond = {
                                //customerId: _log.userId,
                                //doctorId: {$ne: doc._id},// 不应该统计自己打给自己的用户推荐 @20161115
                                //direction: "C2D",
                                callerId: _log.userId || _log.newUserId, // 主叫方
                                calleeRefId: {$exists: true, $ne: doc._id}, // 被叫方，必须是医生
                                type: "phone",
                                time: {$gt: 0},
                                createdAt: {$lt: _log.createdAt, $gt: lastUpd},//统计需为自然日
                                isDeleted: false
                            };
                            chg.fromId = doc._id;
                            execs.push(
                                OrderService.commonFindOne(cond, "calleeRefId")
                                    .then(function (_order) {
                                        try {
                                            if (_order) {
                                                console.log("order...begin");
                                                chg.toId = _order.calleeRefId;//_order.doctorId;
                                                chg.orderId = _order._id + "";
                                                chg.logTime = _log.createdAt;
                                                chg.weight = 1;
                                                chg.fansId = cond.callerId;//customerId;
                                                if (_order.calleeRefId)
                                                    chgs.push(chg);
                                                console.log("order...end");
                                            }
                                        } catch (e) {
                                            console.log("exception : " + e);
                                        }
                                    }));
                        } else console.log("Doc not found Error!!!" + _log.docChatNum);
                    });
                    console.log("End Step 3. Start Log process Loop;");
                    // Bath exec
                    console.log("execs count: " + execs.length)
                    Promise.all(execs).then(function () {
                        console.log("2. Begin updates " + chgs.length);
                        var limitChgs = [];
                        chgs.forEach(function (_chg) {
                            var limit = {
                                fromId: _chg.fromId,
                                toId: _chg.toId
                            };
                            var filter = _.filter(chgs, function (d) {
                                return d.orderId == _chg.orderId && d.logTime < _chg.logTime;
                            })
                            if (filter && filter.length < 5) {
                                //var index = limitChgs.indexOf(limit);
                                var index = _.findIndex(limitChgs, limit);
                                if (index < 0) {
                                    limit.weight = 1;
                                    limit.fansId = [_chg.fansId];
                                    limitChgs.push(limit);
                                } else {
                                    limitChgs[index].weight += 1;
                                    limitChgs[index].fansId.push(_chg.fansId);
                                }
                            } else {
                                console.log("Not top 5: " + _chg);
                            }
                        });

                        console.log("LimitLogs: " + limitChgs.length);
                        //console.log("LimitLogs: " + util.inspect(limitChgs));

                        limitChgs.forEach(function (_chg) {
                            updates.push(
                                DoctorService.getDocRelByIds("recmnd_fans", _chg.fromId, _chg.toId)
                                    .then(function (_rel) {
                                        if (_rel) {
                                            //console.log("update rel : " + _chg.fansId + " : " + _rel._id + " : " + _chg.weight);
                                            console.log("update rel : " + util.inspect(_chg));
                                            return DoctorService.addRelWeight(_rel._id, _chg.weight, _chg.fansId);
                                        } else {
                                            //console.log("add rel");
                                            //console.log("add rel : " + _chg.fansId + " : " + _chg.fromId + " : " + _chg.toId + " : " + _chg.weight);
                                            console.log("add rel : " + util.inspect(_chg));
                                            return DoctorService.createRel({
                                                fromId: _chg.fromId,
                                                fromRef: commonUtil.getObjectIdByStr(_chg.fromId),
                                                toId: _chg.toId,
                                                toRef: commonUtil.getObjectIdByStr(_chg.toId),
                                                fansId: _chg.fansId,
                                                weight: _chg.weight
                                            });
                                        }
                                    }))
                        })
                        console.log("Begin exec updates: " + updates.length);
                        Promise.all(updates).then(function () {
                            console.log("Finally End");
                        }, function (err) {
                            console.log("Finally Err: " + err);
                        })
                    }, function (err) {
                        console.log("Err: " + err);
                    })
                }, function (err) {
                    console.log("Inner error!!! " + err);
                })

        }, function (err) {
            console.log("Outer Err: " + err);
            //END OF RESPONSE
            res.status(200).end();
        });
};
/**
 *
 * 新逻辑
 * 查询新用户A第一个被收藏账户B,相当于B是平台上第一个收藏A的
 * 满足上述条件,建立备用联系人关系, A的左下角显示B
 *  1. 查询新开通顾问账户的用户
 *  2. 查询收藏日志,找到新用户第一个被收藏的记录
 *  3. 建立关系,并且权重直接设置为1000,相当于首推
 *
 *
 * 老逻辑
 * 新（顾问）用户的首次关注是这个用户的首席推荐人
 * 1. 查询最近开通热线号用户的主副账户信息
 * 2. 查询该用户首次主动关注的账户
 * 3. 尝试新建/更新关系
 *
 * @param req
 * @param res
 */
OperationController.prototype.countTodayFansInviter = function (req, res) {
    var Log = require('../models/Log');
    var Customer = require('../models/Customer');
    var now = Date.now();
    var latestFrom = now - constants.TIME7D;//constants.TIME_1_DAY;//
    // 默认每次查询最近24小时内开通的主副账户信息
    CustomerService.getLatestVerifiedAccount(latestFrom, now)
        .then(function (_customers) {
            _customers = _customers || [];
            var len = _customers.length, currentIndex = 0;
            console.log("Account length " + len);
            res.status(200).end();
            async.whilst(
                function () {
                    return currentIndex < len;
                },
                function (callback) {
                    var fromId, toId;
                    console.log("Index " + currentIndex);
                    var cus = _customers[currentIndex++];
                    var logCond = {
                        httpMethod: 'PUT',
                        httpUri: '/1/customer/favoriteDoc'
                    }
                    logCond["httpReqPayload." + constants.PARAM_IS_1ST_FV] = true;
                    logCond["httpReqPayload.doctorId"] = cus.doctorRef;
                    Log.findOne(logCond).sort({createdAt: 1}).limit(1).exec()
                        .then(function (_log) {
                            if (!_log) {
                                throw new Error();
                            }
                            return Customer.findOne({isDeleted: false, _id: _log.userId}, '_id doctorRef').exec();
                        })
                        .then(function (_user) {
                            if (!_user) {
                                throw new Error();
                            }
                            fromId = cus.doctorRef, toId = _user.doctorRef;
                            console.log('info:', fromId, toId);
                            return DoctorService.getDocRelByIds("recmnd_fans", fromId, toId);
                        })
                        .then(function (_rel) {
                            if (_rel) {
                                throw new Error();
                            }
                            console.log('new:');
                            DoctorService.createRel({
                                fromId: fromId,
                                fromRef: commonUtil.getObjectIdByStr(fromId),
                                toId: toId,
                                toRef: commonUtil.getObjectIdByStr(toId),
                                fansId: ["首次关注-介绍人"],
                                weight: 1000
                            });
                            callback();
                        }, function (err) {
                            callback();
                        });
                },
                function (err, result) {
                    console.log('all has completed: ' + err);
                }
            );

        })
};
/**
 * 每晚统计并奖励D下面的 Top1 A;
 * 奖励以D购买A的广告位的形式;
 *
 * @param req
 * @param res
 */
OperationController.prototype.getTopFansAndReward = function (req, res) {
    /**
     * 1. 查询所有可能有分账的订单
     * db.orders.find({type:  "ad", isDeleted: false, createdAt: {'$gte': 1480867200000, '$lt': 1480953600000}, payStatus: "paid", price: {$gt: 0}})
     * db.orders.find({type:  "phone",isDeleted: false, createdAt: {'$gte': 1480867200000, '$lt': 1480953600000}, payStatus: "paid", doctorIncome: {$gt: 0}})
     **/
    var now = Date.now();
    var lastUpd;
    var revenue = [];// 医生昨日的收入汇总

    Statistic.findOne({
        type: Statistic.CONS.TYPE.LAST_REL_UPD
    }).then(function (_stat) {
        // 处理上一笔订单
        lastUpd = _stat.updatedAt;
        var adConds = {
            type: Order.TYPE.AD,
            source: Order.SOURCE.DOC_CHAT,
            payStatus: "paid",
            price: {$gt: 0},
            createdAt: {'$gte': lastUpd, '$lt': now},
            isDeleted: false
        };
        return OrderService.commonFindOrders(Order.TYPE.AD, adConds);
    }).then(function (_ads) {
        //
        if (_ads && _ads.length > 0) {
            _ads.forEach(function (_ad) {
                var index = _.findIndex(revenue, {id: _ad.doctorId});
                if (index < 0) {
                    revenue.push({
                        id: _ad.doctorId,
                        ad: _ad.price,
                        phone: 0
                    });
                } else {
                    revenue[index]["ad"] += _ad.price;
                }
            })
        }
        var phoneConds = {
            type: Order.TYPE.PHONE,
            source: Order.SOURCE.DOC_CHAT,
            payStatus: "paid",
            doctorIncome: {$gt: 0},
            createdAt: {'$gte': lastUpd, '$lt': now},
            isDeleted: false
        };
        return OrderService.commonFindOrders(Order.TYPE.PHONE, phoneConds);
    }).then(function (_phones) {
        if (_phones && _phones.length > 0) {
            _phones.forEach(function (_phone) {
                var index = _.findIndex(revenue, {id: _phone.doctorId});
                if (index < 0) {
                    revenue.push({
                        id: _phone.doctorId,
                        ad: 0,
                        phone: _phone.doctorIncome
                    });
                } else {
                    revenue[index]["phone"] += _ad.doctorIncome;
                }
            })
        }
        console.log("Revenue : " + util.inspect(revenue));
        /**
         * 2. 根据订单来查询对应医生的Top A, 并根据订单计算奖励金额
         * db.relations.aggregate([
         *  { '$match':
     *      {
     *          fromId: {$in: ["57e0c650eab186870f897a2d", "58188aa6cd8ec3f602020244", "57c4b90a9e496c1638100030"]},
     *          type: 'recmnd_fans',
     *          source: 'docChat'
     *       }
     *  },
         *  {'$sort':
     *      {
     *          fromId: -1,
     *          weight: -1
     *      }
     *  },
         *  { "$group":
     *      {
     *          "_id": "$fromId",
     *          "toId": {$first: "$toId"}
     *      }
     *  },
         *  ])
         **/
        return DoctorService.getTopWeightRelByFromIdsAndType("recmnd_fans", _.pluck(revenue, "id"));
    }).then(function (_topas) {
        console.log("Topas : " + util.inspect(_topas));
        // 3. 以广告收入的形式奖励A, 并建立特殊关系(弱广告关系relation.type==_ad,排序优先级低)
        if (_topas && _topas.length > 0) {
            _topas.forEach(function (_topa) {
                _topa.toId
            });
        }


    })

};

OperationController.prototype.doctor2customer = function (req, res) {
    var Doctor = require('../models/Doctor');
    var Customer = require('../models/Customer');
    //var async = require('async');
    //同步: sex userNotes  profile realName->name docChatNum->  pinyinName isOnline->
    //new: blackList

    //主账号信息初始化
    var docCond = {
        source: 'docChat',
        isDeleted: false,
        applyStatus: 'done',
        createdAt: {$gt: 1483963961407, $lt: 1484146895127}
        // 合并稳定前，每日跑数据 @2017-1-11 1483963961407-1484146895127
        // 合并稳定前，每日跑数据 @2017-1-9 1483890517783-1483963961407
        // 合并稳定前，每日跑数据 @2017-1-8 1483785021096-1483890517783
        // 合并稳定前，每日跑数据 @2017-1-5 1483545600000-1483785021096
        // 合并稳定前，每日跑数据 @2017-1-4 1483459200000
        // from: 'ops_d2c_20161221',
    };
    var count, newCount = 0, updateCount = 0;
    var currentIndex = 0;
    Doctor.find(docCond, 'phoneNum docChatNum sex realName avatar profile pinyinName customerNote').sort({createdAt: -1}).exec()
        .then(function (doctors) {
            count = doctors.length;
            console.log('count:', count);
            res.send('begining.....');
            async.whilst(
                function () {
                    return currentIndex < doctors.length;
                },
                function (callback) {
                    var doctor = doctors[currentIndex];
                    currentIndex++;
                    var customerCond = {
                        isDeleted: false,
                        phoneNum: doctor.phoneNum
                    };
                    Customer.findOne(customerCond, 'phoneNum docChatNum sex name avatar profile pinyinName').exec(function (err, customer) {
                        if (!customer) {
                            var newCustomer = {
                                source: 'docChat',
                                phoneNum: doctor.phoneNum,
                                docChatNum: doctor.docChatNum,
                                sex: doctor.sex,
                                name: doctor.realName || '',
                                avatar: doctor.avatar || '',
                                doctorRef: doctor._id,
                                profile: doctor.profile || '',
                                pinyinName: doctor.pinyinName || '',
                                from: "ops_d2c_20170104",
                                favoriteDocs: [constants.DoctorId_00120],
                                collectedDocs: [constants.DoctorId_00120]
                            };
                            if (doctor.customerNote) {
                                newCustomer.userNotes = doctor.customerNote;
                            }
                            console.log('newCustomer:', newCustomer);
                            newCount++;
                            CustomerService.createCustomer(newCustomer);
                            return callback();
                        }
                        console.log('old customer sex', customer.sex);
                        var updateData = {
                            docChatNum: doctor.docChatNum,
                            name: doctor.realName || customer.name || '',
                            //name: customer.name || '',
                            sex: doctor.sex || customer.sex || '',
                            doctorRef: doctor._id,
                            avatar: doctor.avatar || customer.avatar || '',
                            profile: doctor.profile || '',
                            userNotes: doctor.userNotes || []
                        };
                        if (doctor.customerNote) {
                            updateData.userNotes = doctor.customerNote;
                        }
                        console.log('updateData:', updateData);
                        updateCount++;
                        CustomerService.updateBaseInfo({_id: customer._id}, updateData);
                        callback();
                    });
                },

                function (err, result) {
                    console.log('all has completed:', '总' + count, '新建' + newCount, '更新' + updateCount);
                }
            )
        });
};

OperationController.prototype.userNameToPinyin = function (req, res) {
    var Doctor = require('../models/Doctor');
    var Customer = require('../models/Customer');
    // var async = require('async');
    //同步: sex userNotes  profile realName->name docChatNum->  pinyinName
    //new: blackList

    //主账号信息初始化
    var customerCon = {
        isDeleted: false,
        name: {$nin: ['', null]},
        doctorRef: {$exists: false},
        //'pinyinName': {$in: ['',null]}
    }
    Customer.find(customerCon).count(function (err, allCount) {
        res.send('beginning.....');
        var perPage = 500, page = 1, totalPage = Math.ceil(allCount / perPage);
        var updatedCount = 0, existCount = 0;
        async.whilst(
            function () {
                return page <= totalPage;
            },
            function (pageCB) {
                var count = 0;
                var baseCount = (page - 1) * perPage;
                Customer.find(customerCon, 'name pinyinName').sort({createdAt: -1}).skip((page - 1) * perPage).limit(perPage).exec(function (err, customers) {
                    console.log('customers.length:', customers.length);
                    async.whilst(
                        function () {
                            return count < customers.length;
                        },
                        function (callback) {
                            var customer = customers[count];
                            console.log('old pinyinName:', customer.pinyinName);
                            if (customer.pinyinName) {
                                console.log('already:', customer.pinyinName);
                                console.log('current count:', baseCount + count);
                                count++;
                                existCount++;
                                return callback();
                            }
                            CustomerService.updateBaseInfo(customer._id, {name: customer.name})
                                .then(function (u) {
                                    console.log('new pinyinName:', u.pinyinName);
                                    console.log('current count:', baseCount + count);
                                    count++;
                                    updatedCount++;
                                    callback();
                                })
                        },
                        function (err, result) {
                            page++;
                            pageCB();
                        }
                    )
                })

            },
            function (err, lastRes) {
                console.log('allCount:', '总' + allCount, '更新' + updatedCount, '已存在' + existCount);
                console.log('all has completed');
            }
        );

    });
};

OperationController.prototype.d2c_occupation = function (req, res) {
    var Doctor = require('../models/Doctor');
    var Customer = require('../models/Customer');
    // var async = require('async');
    //主账号信息初始化
    var customerCon = {
        isDeleted: false,
        doctorRef: {$exists: true}
    }
    Customer.count(customerCon, function (err, allCount) {
        console.log(err, allCount);
        res.send('beginning.....共' + allCount);
        var perPage = 1000, page = 1, totalPage = Math.ceil(allCount / perPage);
        var updatedCount = 0, existCount = 0, nullCount = 0;
        async.whilst(
            function () {
                return page <= totalPage;
            },
            function (pageCB) {
                var count = 0;
                var baseCount = (page - 1) * perPage;
                Customer.find(customerCon, 'doctorRef hospital department position')
                    .populate('doctorRef', 'occupation hospital department position')
                    .sort({createdAt: -1}).skip((page - 1) * perPage).limit(perPage).exec(function (err, customers) {
                    console.log('customers.length:', customers.length);
                    async.whilst(
                        function () {
                            return count < customers.length;
                        },
                        function (callback) {
                            var customer = customers[count];
                            if (customer.occupation && customer.hospital && customer.department && customer.position) {
                                console.log('already:');
                                console.log('current count:', baseCount + count);
                                count++;
                                existCount++;
                                return callback();
                            }
                            var occupation = customer.doctorRef && customer.doctorRef.occupation ? customer.doctorRef.occupation : '';
                            var hospital = customer.doctorRef && customer.doctorRef.hospital ? customer.doctorRef.hospital : '';
                            var department = customer.doctorRef && customer.doctorRef.department ? customer.doctorRef.department : '';
                            var position = customer.doctorRef && customer.doctorRef.position ? customer.doctorRef.position : '';
                            console.log('old field:', occupation, hospital, department, position);
                            if (customer.doctorRef && !occupation && !hospital && !department && !position) {
                                console.log('current count:', baseCount + count);
                                count++;
                                nullCount++;
                                return callback();
                            }
                            var update = {};
                            //if(!customer.occupation && occupation){
                            //  update.occupation = occupation;
                            //}
                            //if(!customer.hospital && hospital){
                            //  update.hospital = hospital;
                            //}
                            //if(!customer.department && department){
                            //  update.department = department;
                            //}
                            //if(!customer.position && position){
                            //  update.position = position;
                            //}
                            if (occupation) {
                                update.occupation = occupation;
                            }
                            if (hospital) {
                                update.hospital = hospital;
                            }
                            if (department) {
                                update.department = department;
                            }
                            if (position) {
                                update.position = position;
                            }
                            console.log('new update:', update);
                            CustomerService.updateBaseInfo(customer._id, update)
                                .then(function (u) {
                                    console.log('current count:', baseCount + count);
                                    count++;
                                    updatedCount++;
                                    callback();
                                })
                        },
                        function (err, result) {
                            page++;
                            pageCB();
                        }
                    )
                })

            },
            function (err, lastRes) {
                console.log('allCount:', '总' + allCount, '更新' + updatedCount, '已存在' + existCount, ' 不存在' + nullCount);
                console.log('all has completed');
            }
        );

    });
};


OperationController.prototype.d2c_city = function (req, res) {
    var Doctor = require('../models/Doctor');
    var Customer = require('../models/Customer');
    // var async = require('async');
    //主账号信息初始化
    var customerCon = {
        isDeleted: false,
        doctorRef: {$exists: true}
    }
    Customer.count(customerCon, function (err, allCount) {
        console.log(err, allCount);
        res.send('beginning.....共' + allCount);
        var perPage = 1000, page = 1, totalPage = Math.ceil(allCount / perPage);
        var updatedCount = 0, existCount = 0, nullCount = 0;
        async.whilst(
            function () {
                return page <= totalPage;
            },
            function (pageCB) {
                var count = 0;
                var baseCount = (page - 1) * perPage;
                Customer.find(customerCon, 'doctorRef province city')
                    .populate('doctorRef', 'province city')
                    .sort({createdAt: -1}).skip((page - 1) * perPage).limit(perPage).exec(function (err, customers) {
                    console.log('customers.length:', customers.length);
                    async.whilst(
                        function () {
                            return count < customers.length;
                        },
                        function (callback) {
                            var customer = customers[count];
                            if (customer.province && customer.city) {
                                console.log('already:');
                                console.log('current count:', baseCount + count);
                                count++;
                                existCount++;
                                return callback();
                            }
                            var province = customer.doctorRef && customer.doctorRef.province ? customer.doctorRef.province : '';
                            var city = customer.doctorRef && customer.doctorRef.city ? customer.doctorRef.city : '';
                            console.log('old field:', province, city);
                            if (customer.doctorRef && !province && !city) {
                                console.log('current count:', baseCount + count);
                                count++;
                                nullCount++;
                                return callback();
                            }
                            var update = {
                                province: province,
                                city: city,
                            };
                            console.log('new update:', update);
                            CustomerService.updateBaseInfo(customer._id, update)
                                .then(function (u) {
                                    console.log('current count:', baseCount + count);
                                    count++;
                                    updatedCount++;
                                    callback();
                                })

                        },
                        function (err, result) {
                            page++;
                            pageCB();
                        }
                    )
                })

            },
            function (err, lastRes) {
                console.log('allCount:', '总' + allCount, '更新' + updatedCount, '已存在' + existCount, ' 不存在' + nullCount);
                console.log('all has completed');
            }
        );

    });
};

OperationController.prototype.d2c_password = function (req, res) {
    var Doctor = require('../models/Doctor');
    var Customer = require('../models/Customer');
    // var async = require('async');
    //主账号信息初始化
    var customerCon = {
        isDeleted: false,
        doctorRef: {$exists: true}
    }
    Customer.count(customerCon, function (err, allCount) {
        console.log(err, allCount);
        res.send('beginning.....共' + allCount);
        var perPage = 1000, page = 1, totalPage = Math.ceil(allCount / perPage);
        var updatedCount = 0, existCount = 0, nullCount = 0;
        async.whilst(
            function () {
                return page <= totalPage;
            },
            function (pageCB) {
                var count = 0;
                var baseCount = (page - 1) * perPage;
                Customer.find(customerCon, 'loginPassword doctorRef')
                    .populate('doctorRef', 'password')
                    .sort({createdAt: -1}).skip((page - 1) * perPage).limit(perPage).exec(function (err, customers) {
                    console.log('customers.length:', customers.length);
                    async.whilst(
                        function () {
                            return count < customers.length;
                        },
                        function (callback) {
                            var customer = customers[count];
                            if (customer.loginPassword) {
                                console.log('already:', customer.loginPassword);
                                console.log('current count:', baseCount + count);
                                count++;
                                existCount++;
                                return callback();
                            }
                            var password = customer.doctorRef && customer.doctorRef.password;
                            console.log('old password:', password);
                            if (customer.doctorRef && !password) {
                                console.log('password null');
                                console.log('current count:', baseCount + count);
                                count++;
                                nullCount++;
                                return callback();
                            }
                            password = commonUtil.genJuliyeMD5(password);

                            CustomerService.updateBaseInfo(customer._id, {loginPassword: password})
                                .then(function (u) {
                                    console.log('new password:', u.loginPassword);
                                    console.log('current count:', baseCount + count);
                                    count++;
                                    updatedCount++;
                                    callback();
                                })
                        },
                        function (err, result) {
                            page++;
                            pageCB();
                        }
                    )
                })

            },
            function (err, lastRes) {
                console.log('allCount:', '总' + allCount, '更新' + updatedCount, '已存在' + existCount, ' 不存在' + nullCount);
                console.log('all has completed');
            }
        );

    });
};

OperationController.prototype.setUserMomentMsg = function (req, res) {
    var Doctor = require('../models/Doctor');
    var Customer = require('../models/Customer');
    var MomentMsg = require('../models/MomentMsg');
    // var async = require('async');
    //主账号信息初始化
    var customerCon = {
        isDeleted: false
    }
    Customer.count(customerCon, function (err, allCount) {
        console.log(err, allCount);
        res.send('beginning.....共' + allCount);
        var perPage = 1000, page = 1, totalPage = Math.ceil(allCount / perPage);
        var updatedCount = 0, existCount = 0, nullCount = 0;
        async.whilst(
            function () {
                return page <= totalPage;
            },
            function (pageCB) {
                var count = 0;
                var baseCount = (page - 1) * perPage;
                Customer.find(customerCon, '_id')
                    .sort({createdAt: -1}).skip((page - 1) * perPage).limit(perPage).exec(function (err, customers) {
                    console.log('customers.length:', customers.length);
                    async.whilst(
                        function () {
                            return count < customers.length;
                        },
                        function (callback) {
                            var customer = customers[count++];
                            MomentMsg.findOne({userId: customer._id}, '_id').exec()
                                .then(function (_momentMsg) {
                                    if (!_momentMsg) {
                                        updatedCount++;
                                        console.log('update count:', updatedCount);
                                        MomentMsg.create({userId: customer._id});
                                    } else {
                                        existCount++;
                                        console.log('exist count:', existCount);
                                    }
                                    callback();
                                })
                        },
                        function (err, result) {
                            page++;
                            pageCB();
                        }
                    )
                })

            },
            function (err, lastRes) {
                console.log('allCount:', '总' + allCount, '更新' + updatedCount, '已存在' + existCount);
                console.log('all has completed');
            }
        );

    });
};

/**
 * 每晚统计D的发展人operator;
 * (先统计每个D的介绍人introducer)
 *
 * @param req
 * @param res
 */
OperationController.prototype.setIntroducer = function (req, res) {

    console.log("step1:开始添加D的介绍人");
    console.log("step1.1:开始查找2017年2月27日之后所有没有介绍人的D");

    var _relations = [];

    return DoctorService.getAllDoctorHasNoIntroducer().then(function (_ds) {
        console.log("D数量:" + _ds.length);
        var _dIds = _.pluck(_ds, "_id");
        console.log("step1.2:开始查找上述D的主账户")
        return DoctorService.fetchDoctorUsers(_dIds)
    }).then(function (dUsers) {
        // return LoggerService.getUsersFans(_uIds)
        // return LoggerService.getDsFans(_dIds)

        var _firstLogs = _.reduce(dUsers, function (memo, dUser) {
            if (dUser) {

                var d_id = dUser.doctorRef.toString()
                var collectedDocs = dUser.collectedDocs
                if (collectedDocs instanceof Array && collectedDocs.length > 0) {
                    if (collectedDocs[0] != constants.DoctorId_00120) {
                        memo[d_id] = collectedDocs[0]
                    } else if (collectedDocs.length > 1) {
                        memo[d_id] = collectedDocs[1]
                    }
                }
            }
            return memo
        }, {})

        // console.log("所有收藏数据数量" + _logs.length)
        //
        // console.log("step1.3:开始计算最先被收藏的有效logs")
        //取出最先被收藏的数据
        // var _firstLogs = {};
        // _logs.forEach(function (_log) {
        //   var dId = _log.httpReqPayload.doctorId;
        //   var fansPhoneNum = _log.httpReqPayload.customerPhone;
        //   console.log(_log + "------" + dId + "------" + fansPhoneNum)
        //   if (!_firstLogs[dId] && fansPhoneNum) {
        //     _firstLogs[dId] = fansPhoneNum;
        //   }
        // })
        // console.log("有效logs:" + JSON.stringify(_firstLogs));

        console.log("step1.4:开始计算转换成功的dId与fansId关系");
        var exec_getRelations = [];
        for (var d_id in _firstLogs) {
            if (d_id) {
                (function (dId) {
                    exec_getRelations.push(
                        DoctorService.getSelectedInfoById(_firstLogs[d_id], "_id realName").then(function (_fans) {
                            if (_fans) {
                                _relations.push({
                                    'dId': dId,
                                    'fansId': _fans._id,
                                    'fansName': _fans.realName
                                })
                            }
                        }));

                }(d_id))
            }
        }
        return Promise.all(exec_getRelations)

    }).then(function () {
        console.log("关系数量:" + JSON.stringify(_relations));

        console.log("step1.5:开始更新D的介绍人信息");
        var exec_updateIntroducers = [];
        _relations.forEach(function (_relation) {
            console.log("关系:" + JSON.stringify(_relation));
            exec_updateIntroducers.push(
                DoctorService.updateIntroducer(_relation.dId, _relation.fansId, _relation.fansName).then(function () {
                    console.log("update success");
                }, function (err) {
                    console.log("update Err: ", err);
                })
            )
        })

        return Promise.all(exec_updateIntroducers).then(function () {
            console.log("step1.5:更新D的介绍人信息完毕");
            setOperator();
        })
    }, function (e) {
        console.log(e);
    })

};

var setOperator = function () {
    console.log("step2.1: 开始统计D的发展人信息");
    return DoctorService.getAllDoctorHasNoOperator().then(function (ds) {
        console.log("step2.1完成,d数量: ", ds.length);
        var exec_updates = [];
        ds.forEach(function (d) {
            exec_updates.push(
                DoctorService.getAllInfoByID(d.introducerId).then(function (_doc) {
                    if (_doc) {
                        if (_doc.operatorId) {
                            DoctorService.updateOperator(d._id, _doc.operatorId, _doc.operatorName).then(function () {
                                console.log("update operator success");
                            }, function (err) {
                                console.log("update operator err");
                            })
                        }
                    }
                }, function (err) {
                    console.log("find introducer ERR: ", err);
                })
            );
        })

        console.log("step2.2: 开始更新D的发展人信息");
        return Promise.all(exec_updates).then(function () {
            console.log("step2.2完成");
        })
    }, function (e) {
        console.log(e);
    })
};

OperationController.prototype.oldToNewOrder = function (req, res) {
    var Customer = require('../models/Customer');
    var Order = require('../models/Order');
    //var async = require('async');

    //主账号信息初始化
    var orderCon = {
        callerId: {$exists: false},
        calleeId: {$exists: false},
        createdAt: {$gt: 1483963961407, $lt: 1484146895127},
        // 合并稳定前，每日跑数据 @2017-1-11 1483963961407-1484146895127
        // 合并稳定前，每日跑数据 @2017-1-9 1483890517783-1483963961407
        // 合并稳定前，每日跑数据 @2017-1-8 1483785021096-1483890517783
        // 合并稳定前，每日跑数据 @2017-1-5 1483545600000-1483785021096
        // 合并稳定前，每日跑数据 @2017-1-4 1483459200000
        isDeleted: false,
        type: 'phone'
    };
    var fields = 'callerId calleeId' +
        ' customerId customerName customerPhoneNum customerDocChatNum customerDeviceId customerAvatar customerPayment' +
        ' doctorId doctorRealName doctorPhoneNum doctorDocChatNum doctorSex doctorAvatar doctorIncome callbackId direction';
    Order.PhoneOrder.count(orderCon, function (err, allCount) {
        res.send('beginning.....');
        var perPage = 1000, page = 1, totalPage = Math.ceil(allCount / perPage);
        totalPage = 1; //一次只跑一页
        console.log('allCount: ', allCount);
        var updatedCount = 0, existCount = 0, errCount = 0;
        async.whilst(
            function () {
                return page <= totalPage;
            },
            function (pageCB) {
                var count = 0;
                var baseCount = (page - 1) * perPage;
                Order.PhoneOrder.find(orderCon, fields).sort({createdAt: -1}).skip((page - 1) * perPage).limit(perPage).lean().exec(function (err, orders) {
                    console.log('customers.length:', orders.length);
                    async.whilst(
                        function () {
                            return count < orders.length;
                        },
                        function (callback) {
                            var order = orders[count];
                            var direction = order.direction;
                            if (order.callerId && order.calleeId) {
                                console.log('already:', order.callerId, order.calleeId);
                                existCount++;
                                console.log('current count:', baseCount + count);
                                count++;
                                return callback();
                            }
                            console.log('old order:', order._id);
                            var caller, callee;
                            Customer.findOne({_id: order.customerId}, 'doctorRef').exec()
                                .then(function (c) {
                                    if (!c) {
                                        console.log('not found by customerId:' + order.customerId);
                                        throw new Error('not found');
                                    }
                                    caller = c;
                                    return Customer.findOne({doctorRef: order.doctorId}, 'doctorRef').exec();
                                })
                                .then(function (c) {
                                    if (!c) {
                                        console.log('not found by doctorRef:' + order.doctorId);
                                        console.log('err:', err);
                                        count++;
                                        errCount++;
                                        return callback();
                                    }
                                    callee = c;
                                    var newOrder = {
                                        //c
                                        callerId: order.customerId,
                                        callerRefId: caller.doctorRef || '',
                                        callerName: order.customerName || '',
                                        callerPhoneNum: order.customerPhoneNum || '',
                                        callerDocChatNum: order.customerDocChatNum || '',
                                        callerDeviceId: order.customerDeviceId || '',
                                        callerSex: '',
                                        callerAvatar: order.customerAvatar || '',
                                        callerPayment: order.customerPayment || 0,
                                        //d
                                        calleeId: callee._id,
                                        calleeRefId: order.doctorId,
                                        calleeName: order.doctorRealName || '',
                                        calleePhoneNum: order.doctorPhoneNum || '',
                                        calleeDocChatNum: order.doctorDocChatNum || '',
                                        calleeSex: order.doctorSex || '',
                                        calleeAvatar: order.doctorAvatar || '',
                                        calleeIncome: order.doctorIncome || 0,
                                        callWay: 'call_both',
                                        channelId: order.callbackId || '',
                                    }
                                    if (direction == 'D2C') {
                                        newOrder = {
                                            //c
                                            calleeId: order.customerId,
                                            calleeRefId: callee.doctorRef || '',
                                            calleeName: order.customerName || '',
                                            calleePhoneNum: order.customerPhoneNum || '',
                                            calleeDocChatNum: order.customerDocChatNum || '',
                                            calleeDeviceId: order.customerDeviceId || '',
                                            calleeSex: '',
                                            calleeAvatar: order.customerAvatar || '',
                                            calleePayment: 0,
                                            //d
                                            callerId: callee._id,
                                            callerRefId: order.doctorId,
                                            callerName: order.doctorRealName || '',
                                            callerPhoneNum: order.doctorPhoneNum || '',
                                            callerDocChatNum: order.doctorDocChatNum || '',
                                            callerSex: order.doctorSex || '',
                                            callerAvatar: order.doctorAvatar || '',
                                            callerIncome: 0,
                                            callWay: 'call_both',
                                            channelId: order.callbackId || '',
                                        }
                                    }
                                    //var otherFields = ['callPrice', 'callStatus', 'time', 'byetype' , 'recordurl', 'begincalltime',
                                    //  'ringingbegintime', 'ringingendtime', 'failedReason', 'source', 'type', 'payType', 'payStatus',
                                    //  'prepareId', 'couponId', 'couponType', 'couponDeductedRMB', 'isCommentHint', 'isCommented',
                                    //  'comment', 'createdAt', 'isDeleted'];
                                    //otherFields.forEach(function(key){
                                    //  if(exceptFields.indexOf(key) > -1){
                                    //    return;
                                    //  }
                                    //  newOrder[key] = order[key];
                                    //})
                                    Order.NewPhoneOrder.update({_id: order._id}, newOrder, {new: true}).exec()
                                        .then(function (u) {
                                            console.log('new order orderNo:', u.orderNo);
                                            console.log('current count:', baseCount + count);
                                            updatedCount++;
                                            count++;
                                            callback();
                                        })
                                }, function (err) {
                                    console.log('err:', err);
                                    count++;
                                    errCount++;
                                    callback();
                                })
                        },
                        function (err, result) {
                            page++;
                            pageCB();
                        }
                    );
                })

            },
            function (err, lastRes) {
                console.log('allCount:', '总' + allCount, '更新' + updatedCount, '已存在' + existCount, '错误' + errCount);
                console.log('all has completed');
            }
        );

    });
}

/**
 * 处理提款申请
 * Logic:
 *  1.
 *
 * @param req
 * @param res
 */
OperationController.prototype.handleWithdrawal = function (req, res) {
    console.log('handleWithdrawal.....');
    var id = req.params.uuid;
    var payload = req.body;
    var fields = {
        required: ['status'],
        optional: ['reason', 'txnId', 'phone']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var appl, userId, messageRef, applica;
    var onSuccess = function (handler, data) {
        var now = Date.now();
        if (data.status == 2 || data.status == -2) {
            data.opReviewdAt = now;
        } else if (data.status == 3 || data.status == -3) {
            data.financialReviewdAt = now;
        }

        ApplicationService.updateWithdrawal(id, data.status, data.reason, data.txnId, data.opReviewdAt, data.financialReviewdAt)
            .then(function (_appl) {

                if (!_appl) {
                    throw ErrorHandler.getBusinessErrorByCode(8006);
                }
                appl = JSON.parse(JSON.stringify(_appl));
                console.log('更新后的信息', appl);
                console.log('更新后的信息', appl.applicantId);
                userId = appl.applicantId;
                messageRef = appl._id;
                console.log('用户ID', userId);
                if (data.status < 0) {//拒绝   -2 || -3
                    return TransactionMysqlService.rollbackWithdraw(appl._id + "");
                } else if (data.status == 3) {//提款完毕
                    return TransactionMysqlService.confirmWithdraw(appl._id + "", data.txnId || '');
                }
            })
            .then(function (_applica) {
                applica = _applica;
                // return apiHandler.OK(res, applica);


                if (data.status == 3 || data.status == -3 || data.status == -2) {
                    return CustomerService.getAllInfoByID(userId);
                } else {
                    return null;
                }

            })
            .then(function (_userInfo) {
                console.log('用户信息', _userInfo);
                if (_userInfo) {
                    _userInfo = JSON.parse(JSON.stringify(_userInfo));
                    var message = {type: "6", messageRef: messageRef};

                    console.log('用户手机号码', _userInfo.phoneNum, appl.cash);
                    var phoneNum = _userInfo.phoneNum, money = returnFloat(appl.cash);

                    if (data.status == 3) {
                        message.title = '您的提现已通过审核，' + money + '元已到帐，前往"我的钱包"查看详情';
                        message.content = '提现通过审核';
                        message.subType = 1;

                        commonUtil.sendSms('2115806', phoneNum,
                            "#money#=" + money);

                    } else if ((data.status == -3) || (data.status == -2)) {
                        message.title = '您的提现未通过审核，' + money + '元已返还至您的钱包，前往查看详情';
                        message.content = '未通过原因:' + data.reason;
                        message.subType = 2;

                        commonUtil.sendSms('2115816', phoneNum,
                            "#content#=" + message.content);

                    }

                    var notificationExtras = {
                        type: 4,//推送按照type
                        contentType: 'notificationCenter',//透传按照contentType
                        notificationBody: {
                            type: "6",//type:1-消息通知   2-文章推送 3-商品推送 4-搜索推送  （1-商品类  2-文章类） 5-药品补贴  6-提现进度通知
                            title: message.title,//标题
                            content: message.content,//提现处理内容
                        }
                    };
                    console.log('推送信息');
                    pushToUser(_userInfo.pushId, message, notificationExtras);
                    MessageCenterService.addMessageCenterToUser([_userInfo._id], message, '', message.messageRef);

                }

                return apiHandler.OK(res, applica);

            }, function (err) {
                return apiHandler.SYS_DB_ERROR(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

OperationController.prototype.handleShopApply = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['id', 'status'],
        optional: ['reason']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var appl;
        ApplicationService.updateStatus(data.id, data.status, data.reason)
            .then(function (_appl) {
                if (!_appl) {
                    throw ErrorHandler.getBusinessErrorByCode(8006);
                }
                appl = _appl;
                return CustomerService.getInfoByID(appl.applicantId)
            })
            .then(function (_user) {
                var updateData = {};
                if (data.status < 0) {//拒绝
                    //data.phone && commonUtil.sendSms('1587284', data.phone, '#content#=' + (data.reason || '') + '&#url#=' + constants.customerPublicDownloadURL);
                    if (_user.shopVenderApplyStatus == 1) {
                        updateData.shopVenderApplyStatus = 2
                    } else if (_user.shopVenderApplyStatus == 4) {
                        updateData.shopVenderApplyStatus = 5
                    } else {
                        throw ErrorHandler.getBusinessErrorByCode(8006);
                    }
                } else if (data.status > 0) {//审核通过
                    updateData = {
                        "shopCity": appl.shopCity,//店铺城市
                        "shopName": appl.shopName,//店铺名称
                        "shopAddress": appl.shopAddress,//店铺地址
                        "shopType": appl.shopType,//店铺类型
                        "shopPhoneNum": appl.shopPhoneNum,//店铺电话号码
                        "shopAvatar": appl.shopAvatar,//商家头像
                        "shopLicense": appl.shopLicense, //商家营业执照
                        "shopSubType": appl.shopSubType, //商家子类型
                        shopVenderApplyStatus: 3,
                        isVender: true
                    }
                    if (appl.shopAddressMapLon && appl.shopAddressMapLat) {
                        updateData.shopAddressMapLon = appl.shopAddressMapLon;
                        updateData.shopAddressMapLat = appl.shopAddressMapLat;
                        updateData.shopLocation = [appl.shopAddressMapLon, appl.shopAddressMapLat]
                    }
                }
                console.log(updateData)
                return CustomerService.updateUserById(appl.applicantId, updateData)
            })
            .then(function (_user) {
                if (data.status > 0) {
                    var updateOpShop = {
                        "shopCity": _user.shopCity,//店铺城市
                        "shopName": _user.shopName,//店铺名称
                        "shopType": _user.shopType,//店铺类型
                        "shopSubType": _user.shopSubType //商家子类型
                    }
                    return ShopService.updateShopByUserId(_user._id, updateOpShop)
                }
            })
            .then(function () {
                apiHandler.OK(res, {});
                if (data.status > 0) {
                    commonUtil.sendSms("1779106", appl.applicantPhone);
                } else if (data.status < 0) {
                    commonUtil.sendSms("1779110", appl.applicantPhone, "#reason#=" + data.reason);
                }
            }, function (err) {
                return apiHandler.SYS_DB_ERROR(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};


OperationController.prototype.withdrawals = function (req, res) {
    "use strict";
    commonUtil.reqFilter(req, res, {optional: ['status', 'phoneNum', 'source', 'payWays']}, function (data) {
        var conditions = {isDeleted: false, type: 20};
        data.phoneNum && (conditions.applicantPhone = data.phoneNum);
        data.source && (conditions.source = data.source);
        data.status && (conditions.status = parseInt(data.status));
        if (data.payWays == "aliPay") {
            conditions.alipayNum = {$exists: true};
        } else if (data.payWays == "bankPay") {
            conditions.bankCardNum = {$exists: true};
        }
        var pageSlice = commonUtil.getCurrentPageSlice(req, 0, 100, {createdAt: -1});
        return ApplicationService.list(conditions, pageSlice);
    });
};

OperationController.prototype.periorOrderCount = function (req, res) {
    var perior = 7  //  payload

    var oneday = 60 * 60 * 24 * 1000
    var today = new Date()
    today.setHours(0)
    today.setMinutes(0)
    today.setSeconds(0)
    today.setMilliseconds(0)
    var beginTime = today - (perior - 1) * oneday

//初始化返回结果
    var arr_result = [];
    for (var i = beginTime; i <= today; i = i + oneday) {
        var item = {}
        item.date = new Date(i).toDateString()
        item.value = 0
        arr_result.push(item)
    }

    var map = function () {
        var key = new Date(this.createdAt).toDateString()
        emit(key, 1)
    }
    var reduce = function (key, values) {
        var total = 0
        for (var i in values) {
            total += values[i]
        }
        return total
    }
    var command = {
        mapreduce: "orders",
        query: {type: "membership", payStatus: "paid", price: {$gt: 1}, createdAt: {$gt: beginTime}},
        map: map.toString(), //a function we'll define next for mapping
        reduce: reduce.toString(), //a function we'll define next for reducing
        out: {inline: 1}
    };

    Orders.mapReduce(command, function (err, dbres) {
    })
        .then(function (data) {
            for (var j = 0; j < data.length; j++) {
                for (var i = 0; i < arr_result.length; i++) {
                    if (data[j]._id == arr_result[i].date) {
                        arr_result[i].value = data[j].value
                        break;
                    }
                }
            }
            return apiHandler.OK(res, arr_result);
        }, function (err) {
            console.log('err:', err);
        })
};

OperationController.prototype.periorMarketingRecharge = function (req, res) {
    var perior = 7  //  payload

    var oneday = 60 * 60 * 24 * 1000
    var today = new Date()
    today.setHours(0)
    today.setMinutes(0)
    today.setSeconds(0)
    today.setMilliseconds(0)
    var beginTime = today - (perior - 1) * oneday

//初始化返回结果
    var arr_result = [];
    for (var i = beginTime; i <= today; i = i + oneday) {
        var item = {}
        item.date = new Date(i).toDateString()
        item.value = 0
        arr_result.push(item)
    }

    var map = function () {
        var key = new Date(this.createdAt).toDateString()
        emit(key, this.price)
    }
    var reduce = function (key, values) {
        var total = 0
        for (var i in values) {
            total += values[i]
        }
        return total
    }

    var command = {
        mapreduce: "orders",
        query: {type: "marketing", payStatus: "paid", createdAt: {$gt: beginTime}},
        map: map.toString(), //a function we'll define next for mapping
        reduce: reduce.toString(), //a function we'll define next for reducing
        out: {inline: 1}
    };

    Orders.mapReduce(command, function (err, dbres) {
    })
        .then(function (data) {
            for (var j = 0; j < data.length; j++) {
                for (var i = 0; i < arr_result.length; i++) {
                    if (data[j]._id == arr_result[i].date) {
                        arr_result[i].value = data[j].value
                        break;
                    }
                }
            }
            return apiHandler.OK(res, arr_result);
        }, function (err) {
            console.log('err:', err);
        })
};

OperationController.prototype.periorCouponConsume = function (req, res) {
    var perior = 7  //  payload

    var oneday = 60 * 60 * 24 * 1000
    var today = new Date()
    today.setHours(0)
    today.setMinutes(0)
    today.setSeconds(0)
    today.setMilliseconds(0)
    var beginTime = today - (perior - 1) * oneday

//初始化返回结果
    var arr_result = [];
    for (var i = beginTime; i <= today; i = i + oneday) {
        var item = {}
        item.date = new Date(i).toDateString()
        item.value = 0
        arr_result.push(item)
    }

    var map = function () {
        var key = new Date(this.consumedAt).toDateString()
        emit(key, 1)
    }
    var reduce = function (key, values) {
        var total = 0
        for (var i in values) {
            total += values[i]
        }
        return total
    }

    var command = {
        mapreduce: "coupons",
        query: {type: {$in: [8, 9]}, isDeleted: false, isConsumed: true, consumedAt: {$gt: beginTime}},
        map: map.toString(), //a function we'll define next for mapping
        reduce: reduce.toString(), //a function we'll define next for reducing
        out: {inline: 1}
    };

    Orders.mapReduce(command, function (err, dbres) {
    })
        .then(function (data) {
            for (var j = 0; j < data.length; j++) {
                for (var i = 0; i < arr_result.length; i++) {
                    if (data[j]._id == arr_result[i].date) {
                        arr_result[i].value = data[j].value
                        break;
                    }
                }
            }
            return apiHandler.OK(res, arr_result);
        }, function (err) {
            console.log('err:', err);
        })
};

OperationController.prototype.periorNewUser = function (req, res) {
    var perior = 7  //  payload

    var oneday = 60 * 60 * 24 * 1000
    var today = new Date()
    today.setHours(0)
    today.setMinutes(0)
    today.setSeconds(0)
    today.setMilliseconds(0)
    var beginTime = today - (perior - 1) * oneday

//初始化返回结果
    var arr_result = [];
    for (var i = beginTime; i <= today; i = i + oneday) {
        var item = {}
        item.date = new Date(i).toDateString()
        item.value = 0
        arr_result.push(item)
    }

    var map = function () {
        var key = new Date(this.createdAt).toDateString()
        emit(key, 1)
    }
    var reduce = function (key, values) {
        var total = 0
        for (var i in values) {
            total += values[i]
        }
        return total
    }

    var command = {
        mapreduce: "users",
        query: {createdAt: {$gt: beginTime}},
        map: map.toString(), //a function we'll define next for mapping
        reduce: reduce.toString(), //a function we'll define next for reducing
        out: {inline: 1}
    };

    Orders.mapReduce(command, function (err, dbres) {
    })
        .then(function (data) {
            for (var j = 0; j < data.length; j++) {
                for (var i = 0; i < arr_result.length; i++) {
                    if (data[j]._id == arr_result[i].date) {
                        arr_result[i].value = data[j].value
                        break;
                    }
                }
            }
            return apiHandler.OK(res, arr_result);
        }, function (err) {
            console.log('err:', err);
        })
};

/**
 * 建议列表
 * @param req
 * @param res
 */
OperationController.prototype.getSuggestions = function (req, res) {
    var page = req.query.page || 0;

    var pageSlice = commonUtil.getCurrentPageSlice(req, page * 20, 20, {createdAt: -1});

    SuggestionService.listSuggestion(pageSlice).then(function (suggestions) {
        return apiHandler.OK(res, suggestions);
    })
};
OperationController.prototype.handleSuggestion = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['_id', 'status'],
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var update = {
            status: data.status == 2 ? 2 : 1,
            updatedAt: Date.now()
        }
        SuggestionService.updateSuggestion(data._id, update)
            .then(function (s) {
                if (!s) {
                    throw ErrorHandler.getBusinessErrorByCode(8006);
                }
                commonUtil.sendSms('1269989', s.phoneNum,
                    '#name#=' + s.name
                );
                return apiHandler.OK(res, s);
            }, function (err) {
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

OperationController.prototype.cardApplyMemo = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['_id', 'memo'],
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        ApplicationService.updateReceiveMemo(data._id, data.memo)
            .then(function (s) {
                return apiHandler.OK(res, {});
            }, function (err) {
                apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

/**
 *
 * 财务对账处理流程:
 * 1. 遍历所有问题账户
 * 2. 获取当前用户的所有删除记录
 * {
 *  createdAt < 2016-11-20,
 *  future < 2016-11-20,
 *  type in [
 *      'remain',
 *      'recharge',
 *      'pay',
 *      'income',
 *      'withdraw',
 *      'refund',
 *      'fine',
 *      'reward']
 * }
 * 3. 获取当前删除记录相关的订单交易明细
 * 4. 如果计数>0，则批量恢复，否则不做处理
 *
 * @param req
 * @param res
 */
OperationController.prototype.fixBlockedUserTransaction = function (req, res) {
    //var async = require('async');
    var currentCount = 0;
    var userIds = require('../../data/ErrorUserIds').ids;
    var staticTime = 1479686400000; //new Date('2016-11-20 00:00:00:000').getTime();

    console.log('user count: ', userIds.length);
    res.send('beginning.........');
    // 查看用户余额
    var _getAccountCash = function () {
        var sql = TransactionMysqlService.genUsersCashSQL(userIds, staticTime);
        //console.log("sql: " + sql);
        TransactionMysqlService.execSqls(sql)
            .then(function (_res) {
                console.log('Current User counter: ', _res.length);
                var sqls = "";
                _res.forEach(function (r) {
                    console.log("user: ", r.userId, "  cash: ", r.sum);
                    sqls += TransactionMysqlService.genFineUserCash(r.userId, r.sum, null, staticTime);
                });
                console.log(sqls);
                TransactionMysqlService.execSqls(sqls)
                    .then(function (_res) {
                        console.log("OK");
                    }, function (err) {
                        console.log("Err " + err);
                    })
            })
    };
    _getAccountCash();
    var _startHandles = function (currentCount, userIds) {
        async.whilst(
            function () {
                return currentCount < userIds.length;
            },
            function (cb) {
                var userId = userIds[currentCount];
                console.log('Current User counter: ', currentCount);
                currentCount++;
                // 查询每个用户的交易明细
                var sql = TransactionMysqlService.genGetDelTransactionsSQL(0, staticTime, userId);
                TransactionMysqlService.execSqls(sql)
                    .then(function (ts) {
                        var count = 0;
                        console.log('Current User total transactions: ', ts.length);
                        if (ts && ts.length > 0) {
                            //console.log("Current sql: ", sql);
                            _handleEachTrx(count, ts, cb);
                        } else {
                            cb();
                        }
                    });
            },
            function (err, result) {
                if (err) console.log("Err: " + err);
                console.log('All has completed');
            }
        );
    };
    var _handleEachTrx = function (count, ts, cb) {
        async.whilst(
            function () {
                return count < ts.length;
            },
            function (callback) {
                var t = ts[count];
                console.log('Current transaction: ', count);
                count++;
                var sql = TransactionMysqlService.genGetOrderTransactions(t.innerTradeNo);
                TransactionMysqlService.execSqls(sql)
                    .then(function (_res) {
                        if (_res && _res.length > 0) {
                            // 恢复数据
                            // console.log("Del.........");
                            var _sql = TransactionMysqlService.genRemoveDelTransactions(t.id);
                            console.log("SQL : " + _sql);
                            TransactionMysqlService.execSqls(_sql)
                                .then(function (ts) {
                                    if (ts) console.log("ts: " + ts);
                                    callback();
                                }, function (err) {
                                    if (err) console.log("Handle Trx Err : " + err);
                                    callback();
                                });
                        } //else console.log("........");
                    });
            },
            function (err, result) {
                if (err) console.log("Err: " + err);
                else console.log("End!!!");
                cb();
            }
        )
    };
    //_startHandles(currentCount, userIds);

};

OperationController.prototype.updateMoment = function (req, res) {
    res.send('beginning.........');
    var Doctor = require('../models/Doctor');
    var Customer = require('../models/Customer');
    var Moment = require('../models/Moment');
    //var async = require('async');

    var condition = {
        isDeleted: {$ne: true},
        doctorRef: {$exists: true},
        //_id: {$nin: ['578c8c776b9a504e27137765', '54ad5d572389e7d908d12388']}
    }
    Customer.count(condition, function (err, allCount) {
        var perPage = 1000, page = 1, totalPage = Math.ceil(allCount / perPage);
        console.log('allCount, totalPge', allCount, totalPage);
        async.whilst(
            function () {
                return page <= totalPage;
            },
            function (pageCB) {
                Customer.find(condition, 'doctorRef name docChatNum')
                    .populate('doctorRef', 'message2Customer')
                    .sort({createdAt: -1}).skip((page - 1) * perPage).limit(perPage)
                    .exec(function (err, customers) {
                        var currentCount = 0;
                        async.whilst(
                            function () {
                                return currentCount < customers.length;
                            },
                            function (callback) {
                                var customer = customers[currentCount];
                                currentCount++;
                                if (!customer.doctorRef.message2Customer) {
                                    console.log('current count null:', (page - 1) * perPage + currentCount);
                                    return callback();
                                }
                                console.log('customer.doctorRef.message2Customer:', customer.doctorRef.message2Customer);
                                var momentCond = {
                                    userId: customer._id + '',
                                    //isDeleted: false //TODO: 需要注释掉
                                }
                                Moment.count(momentCond)
                                    .then(function (momentNum) {
                                        console.log('momentNum:', momentNum);
                                        if (momentNum > 0) {
                                            return callback();
                                        }
                                        var moment = {};
                                        moment.userId = customer._id;
                                        moment.name = customer.name;
                                        moment.docChatNum = customer.docChatNum;
                                        moment.originalContent = customer.doctorRef.message2Customer || "";
                                        moment.pics = [];
                                        moment.originalUser = {};
                                        moment.originalUser.userId = customer._id;
                                        moment.originalUser.userName = customer.name;
                                        moment.originalUser.docChatNum = customer.docChatNum;
                                        Moment.create(moment)
                                            .then(function (m) {
                                                console.log('moment._id:', m._id);
                                                var updateData = {
                                                    momentRef: m._id,
                                                    currentMoment: customer.doctorRef.message2Customer || ""
                                                };
                                                console.log('updateData:', updateData);
                                                return Customer.update({_id: customer._id}, {$set: updateData});
                                            })
                                            .then(function () {
                                                console.log('current count new:', (page - 1) * perPage + currentCount);
                                                callback();
                                            }, function (err) {
                                                console.log('err:', err);
                                            });
                                    });
                            },
                            function () {
                                page++;
                                pageCB();
                            }
                        );
                    });
            },
            function () {
                console.log('all has completed!');
            }
        )
    });
};

OperationController.prototype.setNameSearch = function (req, res) {
    res.send('beginning.........');
    var Doctor = require('../models/Doctor');
    var Customer = require('../models/Customer');
    var Search = require('../models/Search');
    //var async = require('async');
    Search.find({keyType: 'name'}, 'updatedAt').sort({updatedAt: -1}).limit(1).exec()
        .then(function (search) {
            console.log('search:', search);
            var condition = {
                name: {$exists: true, $nin: ['', null]},
                isDeleted: {$ne: true},
                doctorRef: {$exists: true},
                docChatNum: /^8/,
                updatedAt: {$gt: (search[0] ? search[0].updatedAt : 0)}
            }
            console.log('condition:', condition);
            Customer.count(condition, function (err, allCount) {
                var perPage = 1000, page = 1, totalPage = Math.ceil(allCount / perPage);
                console.log('allCount, totalPge', allCount, totalPage);
                async.whilst(
                    function () {
                        return page <= totalPage;
                    },
                    function (pageCB) {
                        Customer.find(condition, 'name createdAt')
                            .sort({createdAt: 1}).skip((page - 1) * perPage).limit(perPage)
                            .exec(function (err, customers) {
                                var currentCount = 0;
                                async.whilst(
                                    function () {
                                        return currentCount < customers.length;
                                    },
                                    function (callback) {
                                        var customer = customers[currentCount];
                                        currentCount++;
                                        if (!customer.name) {
                                            console.log('current count without name:', (page - 1) * perPage + currentCount);
                                            return callback();
                                        }
                                        var searchInfo = {
                                            key: customer.name,
                                            keyType: 'name',
                                            userCreatedAt: customer.createdAt,
                                            user: customer._id
                                        }
                                        Search.findOne({user: customer._id, keyType: 'name'})
                                            .then(function (search) {
                                                console.log(search ? true : false);
                                                if (search) {
                                                    if (search.key != customer.name) {
                                                        Search.update(
                                                            {_id: search._id},
                                                            {
                                                                $set: {
                                                                    key: customer.name,
                                                                    updatedAt: Date.now()
                                                                }
                                                            }).exec();
                                                        console.log('current count name changed:', (page - 1) * perPage + currentCount);
                                                        return callback();
                                                    } else {
                                                        console.log('current count name same:', (page - 1) * perPage + currentCount);
                                                        return callback();
                                                    }
                                                }
                                                Search.create(searchInfo)
                                                    .then(function () {
                                                        console.log('current count new:', (page - 1) * perPage + currentCount);
                                                        callback();
                                                    });
                                            });
                                    },
                                    function () {
                                        page++;
                                        pageCB();
                                    }
                                );
                            });
                    },
                    function () {
                        console.log('all has completed!');
                    }
                )
            });
        });
};

OperationController.prototype.setOccupationSearch = function (req, res) {
    res.send('beginning.........');
    var Doctor = require('../models/Doctor');
    var Customer = require('../models/Customer');
    var Search = require('../models/Search');
    //var async = require('async');
    Search.find({keyType: 'occupation'}, 'updatedAt').sort({updatedAt: -1}).limit(1).exec()
        .then(function (search) {
            console.log('search:', search);
            var condition = {
                occupation: {$exists: true, $nin: ['', null]},
                isDeleted: {$ne: true},
                doctorRef: {$exists: true},
                docChatNum: /^8/,
                updatedAt: {$gt: (search[0] ? search[0].updatedAt : 0)}
            }
            console.log('condition:', condition);
            Customer.count(condition, function (err, allCount) {
                var perPage = 1000, page = 1, totalPage = Math.ceil(allCount / perPage);
                console.log('allCount, totalPge', allCount, totalPage);
                async.whilst(
                    function () {
                        return page <= totalPage;
                    },
                    function (pageCB) {
                        Customer.find(condition, 'occupation createdAt')
                            .sort({createdAt: 1}).skip((page - 1) * perPage).limit(perPage)
                            .exec(function (err, customers) {
                                var currentCount = 0;
                                async.whilst(
                                    function () {
                                        return currentCount < customers.length;
                                    },
                                    function (callback) {
                                        var customer = customers[currentCount];
                                        currentCount++;
                                        if (!customer.occupation) {
                                            console.log('current count without occupation:', (page - 1) * perPage + currentCount);
                                            return callback();
                                        }
                                        var searchInfo = {
                                            key: customer.occupation,
                                            keyType: 'occupation',
                                            userCreatedAt: customer.createdAt,
                                            user: customer._id
                                        }
                                        Search.findOne({user: customer._id, keyType: 'occupation'})
                                            .then(function (search) {
                                                console.log(search ? true : false);
                                                if (search) {
                                                    if (search.key != customer.occupation) {
                                                        Search.update(
                                                            {_id: search._id},
                                                            {
                                                                $set: {
                                                                    key: customer.occupation,
                                                                    updatedAt: Date.now()
                                                                }
                                                            }).exec();
                                                        console.log('current count occupation changed:', (page - 1) * perPage + currentCount);
                                                        return callback();
                                                    } else {
                                                        console.log('current count occupation same:', (page - 1) * perPage + currentCount);
                                                        return callback();
                                                    }
                                                }
                                                Search.create(searchInfo)
                                                    .then(function () {
                                                        console.log('current count new:', (page - 1) * perPage + currentCount);
                                                        callback();
                                                    });
                                            });
                                    },
                                    function () {
                                        page++;
                                        pageCB();
                                    }
                                );
                            });
                    },
                    function () {
                        console.log('all has completed!');
                    }
                )
            });
        });
};

OperationController.prototype.setFieldSearch = function (req, res) {
    res.send('beginning.........');
    var Doctor = require('../models/Doctor');
    var Customer = require('../models/Customer');
    var Search = require('../models/Search');
    //var async = require('async');
    //var field = req.query.field ;
    //var fields = ['occupation', 'hospital', 'department', 'position'];
    var fields = ['name', 'shopName'];
    var fieldCount = 0;
    async.whilst(
        function () {
            return fieldCount < fields.length;
        },
        function (fieldCB) {
            var field = fields[fieldCount];
            fieldCount++;
            Search.find({keyType: field}, 'updatedAt').sort({updatedAt: -1}).limit(1).exec()
                .then(function (search) {
                    console.log('search:', search);
                    var condition = {
                        isDeleted: {$ne: true},
                        doctorRef: {$exists: true},
                        docChatNum: /^8/,
                        updatedAt: {$gt: (search[0] ? search[0].updatedAt : 0)},
                        //phoneNum: '13526683238'
                    }
                    condition[field] = {$exists: true, $nin: ['', null]};
                    console.log('condition:', condition);
                    Customer.count(condition, function (err, allCount) {
                        var perPage = 1000, page = 1, totalPage = Math.ceil(allCount / perPage);
                        console.log('allCount, totalPge', allCount, totalPage);
                        async.whilst(
                            function () {
                                return page <= totalPage;
                            },
                            function (pageCB) {
                                Customer.find(condition, ('createdAt ' + field))
                                    .sort({createdAt: 1}).skip((page - 1) * perPage).limit(perPage)
                                    .exec(function (err, customers) {
                                        var currentCount = 0;
                                        async.whilst(
                                            function () {
                                                return currentCount < customers.length;
                                            },
                                            function (callback) {
                                                var customer = customers[currentCount];
                                                currentCount++;
                                                if (!customer[field]) {
                                                    console.log('current count without field:', (page - 1) * perPage + currentCount);
                                                    return callback();
                                                }
                                                var searchInfo = {
                                                    key: customer[field],
                                                    keyType: field,
                                                    userCreatedAt: customer.createdAt,
                                                    user: customer._id
                                                }
                                                Search.findOne({user: customer._id, keyType: field})
                                                    .then(function (search) {
                                                        console.log(search ? true : false);
                                                        if (search) {
                                                            if (search.key != customer[field]) {
                                                                Search.update(
                                                                    {_id: search._id},
                                                                    {
                                                                        $set: {
                                                                            key: customer[field],
                                                                            updatedAt: Date.now()
                                                                        }
                                                                    }).exec();
                                                                console.log('current count field changed:', (page - 1) * perPage + currentCount);
                                                                return callback();
                                                            } else {
                                                                console.log('current count field same:', (page - 1) * perPage + currentCount);
                                                                return callback();
                                                            }
                                                        }
                                                        Search.create(searchInfo)
                                                            .then(function () {
                                                                console.log('current count new:', (page - 1) * perPage + currentCount);
                                                                callback();
                                                            });
                                                    });
                                            },
                                            function () {
                                                page++;
                                                pageCB();
                                            }
                                        );
                                    });
                            },
                            function () {
                                fieldCB();
                            }
                        )
                    });
                });
        },
        function () {
            console.log('all has completed!');
        }
    );
};

OperationController.prototype.setShopNameSearch = function (req, res) {
    res.send('beginning.........');
    var Doctor = require('../models/Doctor');
    var Customer = require('../models/Customer');
    var Search = require('../models/Search');
    //var async = require('async');
    var field = req.query.field || 'shopName';
    //var fields = ['occupation', 'hospital', 'department', 'position'];
    var fields = ['shopName'];
    var fieldCount = 0;
    async.whilst(
        function () {
            return fieldCount < fields.length;
        },
        function (fieldCB) {
            var field = fields[fieldCount];
            fieldCount++;
            Search.find({keyType: field}, 'updatedAt').sort({updatedAt: -1}).limit(1).exec()
                .then(function (search) {
                    console.log('search:', search);
                    var condition = {
                        isDeleted: {$ne: true},
                        doctorRef: {$exists: true},
                        docChatNum: /^8/,
                        updatedAt: {$gt: (search[0] ? search[0].updatedAt : 0)},
                        //phoneNum: '13526683238'
                    }
                    condition[field] = {$exists: true, $nin: ['', null]};
                    console.log('condition:', condition);
                    Customer.count(condition, function (err, allCount) {
                        var perPage = 1000, page = 1, totalPage = Math.ceil(allCount / perPage);
                        console.log('allCount, totalPge', allCount, totalPage);
                        async.whilst(
                            function () {
                                return page <= totalPage;
                            },
                            function (pageCB) {
                                Customer.find(condition, ('createdAt ' + field))
                                    .sort({createdAt: 1}).skip((page - 1) * perPage).limit(perPage)
                                    .exec(function (err, customers) {
                                        var currentCount = 0;
                                        async.whilst(
                                            function () {
                                                return currentCount < customers.length;
                                            },
                                            function (callback) {
                                                var customer = customers[currentCount];
                                                console.log(customer);
                                                currentCount++;
                                                if (!customer[field]) {
                                                    console.log('current count without field:', (page - 1) * perPage + currentCount);
                                                    return callback();
                                                }
                                                var searchInfo = {
                                                    key: customer[field],
                                                    keyType: field,
                                                    userCreatedAt: customer.createdAt,
                                                    user: customer._id
                                                }
                                                Search.findOne({user: customer._id, keyType: field})
                                                    .then(function (search) {
                                                        console.log(search ? true : false);
                                                        if (search) {
                                                            if (search.key != customer[field]) {
                                                                Search.update(
                                                                    {_id: search._id},
                                                                    {
                                                                        $set: {
                                                                            key: customer[field],
                                                                            updatedAt: Date.now()
                                                                        }
                                                                    }).exec();
                                                                console.log('current count field changed:', (page - 1) * perPage + currentCount);
                                                                return callback();
                                                            } else {
                                                                console.log('current count field same:', (page - 1) * perPage + currentCount);
                                                                return callback();
                                                            }
                                                        }
                                                        Search.create(searchInfo)
                                                            .then(function () {
                                                                console.log('current count new:', (page - 1) * perPage + currentCount);
                                                                callback();
                                                            });
                                                    });
                                            },
                                            function () {
                                                page++;
                                                pageCB();
                                            }
                                        );
                                    });
                            },
                            function () {
                                fieldCB();
                            }
                        )
                    });
                });
        },
        function () {
            console.log('all has completed!');
        }
    );
};

OperationController.prototype.buildRel = function (req, res) {

    // 1. 分页查询用户信息
    // 2. 内存拼装数据, relations
    // 3. 分页创建关系（循环）
    var cacheRels = [], now = Date.now();//1488724926307 1488724926308
    var cacheUsersObj = {};
    var _findCacheIndex = function (fansId, viperId) {
        return _.findIndex(cacheRels, function (_rel) {
            return (_rel.user == fansId) && (_rel.relUser == viperId);
        });
    };
    // 处理单个账户的关系, 创建／更新 内存中关系数据
    var _handleSingleAccountRel = function (account) {
        // doctorRef docChatNum favoriteDocs userNotes blockDocs blackList
        var index, rel;
        // 分别处理可以影响关系的3类数据

        // 1. 关注关系 & 是否关注后屏蔽动态
        if (account.favoriteDocs && account.favoriteDocs.length > 1) {
            var blockDocs = account.blockDocs || [];
            account.favoriteDocs = _.without(account.favoriteDocs, account.doctorRef);
            account.favoriteDocs.forEach(function (_favId) {
                if (!cacheUsersObj[_favId + '']) {
                    return;
                }
                var _favMainId = cacheUsersObj[_favId + '']._id;
                index = _findCacheIndex(account._id, _favMainId);
                if (index >= 0) {
                    cacheRels[index]["isRelUserFavorite"] = true;
                    if (_.indexOf(blockDocs, _favMainId) >= 0 || _.indexOf(blockDocs, _favId) >= 0) {
                        cacheRels[index]["isRelUserBlocked"] = true;
                    }
                } else {
                    rel = _genDefaultSocialRel(account, cacheUsersObj[_favMainId]);
                    rel["isRelUserFavorite"] = true;
                    if (_.indexOf(blockDocs, _favMainId) >= 0 || _.indexOf(blockDocs, _favId) >= 0) {
                        rel["isRelUserBlocked"] = true;
                    }
                    cacheRels.push(rel);
                }
            })
        }

        // 2. 设置备注关系
        if (account.userNotes && account.userNotes.length > 1) {
            account.userNotes.forEach(function (_note) {
                if (!cacheUsersObj[_note.customerId + '']) {
                    return;
                }
                index = _findCacheIndex(account._id, _note.customerId);
                if (index >= 0) {
                    cacheRels[index]["noteInfo"] = {
                        noteName: _note.note || "",
                        desc: "",
                        pics: []
                    };
                } else {
                    rel = _genDefaultSocialRel(account, cacheUsersObj[_note.customerId + '']);
                    rel["noteInfo"] = {
                        noteName: _note.note || "",
                        desc: "",
                        pics: []
                    };
                    cacheRels.push(rel);
                }

                index = _findCacheIndex(_note.customerId, account._id);
                if (index >= 0) {
                    cacheRels[index]["notedName"] = _note.note || "";
                } else {
                    rel = _genDefaultSocialRel(cacheUsersObj[_note.customerId + ''], account);
                    rel["notedName"] = _note.note || "";
                    cacheRels.push(rel);
                }
            })
        }
        // 3. 设置拉黑关系
        if (account.blackList && account.blackList.length > 1) {
            account.blackList.forEach(function (_blackId) {
                if (!cacheUsersObj[_blackId + '']) {
                    return;
                }
                index = _findCacheIndex(account._id, _blackId);
                if (index >= 0) {
                    cacheRels[index]["isRelUserBlacked"] = true;
                } else {
                    rel = _genDefaultSocialRel(account, cacheUsersObj[_blackId + '']);
                    rel["isRelUserBlacked"] = true;
                    cacheRels.push(rel);
                }
                index = _findCacheIndex(_blackId, account._id);
                if (index >= 0) {
                    cacheRels[index]["isUserBlacked"] = true;
                } else {
                    rel = _genDefaultSocialRel(cacheUsersObj[_blackId + ''], account);
                    rel["isUserBlacked"] = true;
                    cacheRels.push(rel);
                }
            })
        }
    };
    var _genDefaultSocialRel = function (fans, viper) {
        var data = {
            user: fans._id,
            //userDoctorRef: fans.doctorRef || null,
            //userDocChatNum: fans.docChatNum || null,

            relUser: viper._id,
            //relUserDoctorRef: viper.doctorRef || null,
            //relUserDocChatNum: viper.docChatNum || null,
            isRelUserFavorite: false,
            isRelUserBlocked: false,
            isRelUserBlacked: false,
            //noteInfo: { //对relUser的备注信息
            //  noteName: {type: String, default: ''}, //备注的姓名
            //  desc: {type: String, default: ''}, //对relUser的描述
            //  pics: [String] //相关图片
            //},
            //notedName: {type: String, default: ''}, //relUser对user的备注姓名
            createdAt: now,
            updatedAt: now,
            isDeleted: false,
            statisticsUpdatedAt: now
        };
        if (fans.doctorRef) {
            data['userDoctorRef'] = fans.doctorRef;
        }
        if (fans.docChatNum) {
            data['userDocChatNum'] = fans.docChatNum;
        }
        if (viper.doctorRef) {
            data['relUserDoctorRef'] = viper.doctorRef;
        }
        if (viper.docChatNum) {
            data['relUserDocChatNum'] = viper.docChatNum;
        }
        return data;
    }

    res.send('beginning.........');
    var Doctor = require('../models/Doctor');
    var Customer = require('../models/Customer');
    var SocialRel = require('../models/SocialRel');
    var errorArray = [];
    var errorCreatedArray = [];
    var condition = {
        isDeleted: {$ne: true},
        doctorRef: {$exists: true},
        docChatNum: {$exists: true},
    };
    console.log('condition:', condition);
    Customer.count(condition, function (err, allCount) {
        var perPage = 1000, page = 1, totalPage = Math.ceil(allCount / perPage);
        console.log('allCount, totalPge', allCount, totalPage);
        async.whilst(
            function () {
                return page <= totalPage;
            },
            function (pageCB) {
                // 1. 查询用户信息
                console.log(cacheRels.length);
                Customer.find(condition, 'doctorRef docChatNum')
                    .sort({_id: 1})
                    .skip((page - 1) * perPage)
                    .limit(perPage)
                    .exec(function (err, customers) {
                        var currentCount = 0;
                        async.whilst(
                            function () {
                                return currentCount < customers.length;
                            },
                            function (callback) {
                                var customer = customers[currentCount++];
                                cacheUsersObj[customer._id + ''] = {
                                    _id: customer._id + '',
                                    doctorRef: customer.doctorRef + '',
                                    docChatNum: customer.docChatNum
                                }
                                cacheUsersObj[customer.doctorRef + ''] = {
                                    _id: customer._id + '',
                                    doctorRef: customer.doctorRef + '',
                                    docChatNum: customer.docChatNum
                                }
                                callback();
                            },
                            function () {
                                page++;
                                pageCB();
                            }
                        );
                    });
            },
            function (err) {
                console.log('cacheUsersObj:', Object.keys(cacheUsersObj).length);
                perPage = 1000, page = 1, totalPage = Math.ceil(allCount / perPage);
                async.whilst(
                    function () {
                        return page <= totalPage;
                    },
                    function (pageCB) {
                        // 1. 查询用户信息
                        console.log(cacheRels.length);
                        Customer.find(condition, 'doctorRef docChatNum favoriteDocs userNotes blockDocs blackList')
                            .sort({_id: 1})
                            .skip((page - 1) * perPage)
                            .limit(perPage)
                            .exec(function (err, customers) {
                                var currentCount = 0;
                                async.whilst(
                                    function () {
                                        return currentCount < customers.length;
                                    },
                                    function (callback) {
                                        var customer = customers[currentCount++];
                                        if (!customer.doctorRef) {
                                            errorArray.push(customer._id);
                                            return callback();
                                        }
                                        _handleSingleAccountRel(customer);
                                        callback();
                                    },
                                    function () {
                                        page++;
                                        pageCB();
                                    }
                                );
                            });
                    },
                    function (err) {
                        console.log('all has completed', errorArray);
                        console.log('cacheRels:', cacheRels.length);
                        var relPage = 0, totalPage = Math.ceil(cacheRels.length / 100);
                        async.whilst(
                            function () {
                                return relPage < totalPage;
                            },
                            function (relCB) {
                                relPage++;
                                return SocialRel.create(cacheRels.slice(relPage * 100, relPage * 100 + 100))
                                    .then(function () {
                                        relCB();
                                    }, function (err) {
                                        errorCreatedArray.push(JSON.stringify(err));
                                        relCB();
                                    });
                            },
                            function (err) {
                                console.log('cacheRels creat all:', errorArray, errorCreatedArray);
                            }
                        );
                    }
                )
            }
        )
    });


};

OperationController.prototype.expiredRefund = function (req, res) {
    res.send('beginning.........');
    var Hongbao = require('../models/Hongbao');
    var MessageService = require('../services/MessageService');
    var JPushService = require('../services/JPushService');
    var now = Date.now();
    var last = now - constants.TIME1MONTH;
    var condition = {
        isDeleted: false,
        expiredAt: {$lt: now, $gt: last},
        isExpiredRefunded: false //未退款红包
    };
    condition[globalSource] = neZS;
    Hongbao.distinct("_id", condition, function (err, ids) {
        var allCount = ids.length || 0;
        // TODO: 分页,目前仅支持单页处理
        var perPage = 1000;//, page = 1, totalPage = Math.ceil(allCount / perPage);
        console.log('allCount', allCount);
        //async.whilst(
        //    function () {
        //      return page <= totalPage;
        //    },
        //    function (pageCB) {
        var done = 0, todo = 0;
        Hongbao.find(condition)
            .populate('user', 'pushId phoneNum')
            .populate('order', 'payStatus isDeleted')
            .sort({createdAt: -1})
            //.skip((page - 1) * perPage)
            .limit(perPage)
            .exec(function (err, hongbaos) {
                var currentCount = 0;
                async.whilst(
                    function () {
                        return currentCount < hongbaos.length;
                    },
                    function (callback) {
                        var hongbao = hongbaos[currentCount];
                        console.log("hongbao: " + JSON.stringify(hongbao));
                        currentCount++;
                        if ((hongbao.totalCount <= hongbao.usedCount)//已经被领完
                            //(hongbao.totalValue == hongbao.usedValue)//
                            //|| hongbao.isExpiredRefunded
                            || (hongbao.order && (hongbao.order.payStatus != 'paid' || hongbao.order.isDeleted))
                            || !hongbao.order) {
                            console.log('current count null rest : ', currentCount, hongbao.totalValue, hongbao.usedValue);
                            done++;
                            return callback();
                        }
                        var leftMoney = (Math.round((hongbao.totalValue) * 100) - Math.round((hongbao.usedValue) * 100)) / 100;
                        if (leftMoney <= 0) {
                            console.log("Err: current left 0 money");
                            done++;
                            return callback();
                        }
                        var sqls = TransactionMysqlService.genHongbaoIncomeSqls(
                            hongbao.user._id + '',
                            leftMoney,
                            //hongbao.totalValue - hongbao.usedValue,
                            hongbao.order._id + '',
                            "红包退款",
                            true
                        );
                        console.log('sqls:', sqls);
                        TransactionMysqlService.execSqls(sqls)
                            .then(function (_trx) { // 更新订单状态
                                //hongbao.totalValue - hongbao.usedValue;
                                var serverConf = require('../configs/server');
                                var messageContent = '您的动态红包已过期,红包剩余金额' + leftMoney + '元' + '已退回您的钱包,前往查看>';
                                var message = {
                                    userId: hongbao.user._id + '',
                                    type: 'hongbao_refund',
                                    title: '退款: 红包已过期退款' + leftMoney + '元',
                                    content: messageContent,
                                    link: serverConf.HOST + '/1/customer/transaction?orderId=' + hongbao.order._id,
                                    linkTitle: '账单明细',
                                    linkType: 'trx',
                                    trxType: 'hongbao_refund',
                                    orderId: hongbao.order._id
                                };
                                Hongbao.findOneAndUpdate({_id: hongbao._id}, {$set: {isExpiredRefunded: true}}).exec();
                                CustomerService.updateBaseInfo(hongbao.user._id, {
                                    hasNewMessage: true,
                                    'msgReadStatus.sys': true,
                                    'msgReadStatus.all': true
                                });
                                console.log('message:', message);
                                MessageService.createMessage(message);
                                //您的动态红包已过期，红包剩余金额#money#元，已退回至您的账户，详情请进入朱李叶健康APP“我的钱包”中查看。
                                //commonUtil.sendSms("1695826", hongbao.user.phoneNum,
                                //  "#money#=" + leftMoney);
                                if (hongbao.user && hongbao.user.pushId) {
                                    var msgExtras = {
                                        type: 2,//pushMessage:有新消息
                                        contentType: 'sys'
                                    };
                                    var notificationExtras = {
                                        type: 3,//type: 1,为收藏推送, 2,为退款推送
                                        contentType: 'sys'
                                    };
                                    JPushService.pushMessage(hongbao.user.pushId, messageContent, '', msgExtras);
                                    JPushService.pushNotification(hongbao.user.pushId, messageContent, '', notificationExtras);
                                }
                                todo++;
                                callback();
                            })
                    },
                    function () {
                        //page++;
                        //pageCB();
                        console.log('all has completed! ' + done + " : " + todo);
                    }
                );
            });
        //    },
        //    function () {
        //      console.log('all has completed!');
        //    }
        //)
    });
};

OperationController.prototype.expiredRefundWithoutMoment = function (req, res) {
    //没有绑定动态的红包,且有效的红包(),当天退回
    res.send('beginning.........');
    var Hongbao = require('../models/Hongbao');
    var MessageService = require('../services/MessageService');
    var JPushService = require('../services/JPushService');
    var now = Date.now();
    var condition = {
        isDeleted: false,
        moment: {$exists: false},
        isExpiredRefunded: false, //未退款红包
        createdAt: {$gte: (now - constants.TIME_1_DAY - constants.TIME5M), $lte: (now - constants.TIME5M)}//用户可能正在包红包
    };
    condition[globalSource] = neZS;
    console.log('condition:', condition);
    Hongbao.distinct("_id", condition, function (err, ids) {
        var allCount = ids.length || 0;
        // TODO: 分页,目前仅支持单页处理
        var perPage = 1000, page = 1, totalPage = Math.ceil(allCount / perPage);
        console.log('allCount', allCount);
        async.whilst(
            function () {
                return page <= totalPage;
            },
            function (pageCB) {
                var done = 0, todo = 0;
                Hongbao.find(condition)
                    .populate('user', 'pushId phoneNum')
                    .populate('order', 'payStatus isDeleted')
                    .sort({createdAt: -1})
                    .skip((page - 1) * perPage)
                    .limit(perPage)
                    .exec(function (err, hongbaos) {
                        var currentCount = 0;
                        async.whilst(
                            function () {
                                return currentCount < hongbaos.length;
                            },
                            function (callback) {
                                var hongbao = hongbaos[currentCount];
                                console.log("hongbao: " + JSON.stringify(hongbao));
                                currentCount++;
                                if ((hongbao.totalCount <= hongbao.usedCount)//已经被领完
                                    //(hongbao.totalValue == hongbao.usedValue)//
                                    //|| hongbao.isExpiredRefunded
                                    || (hongbao.order && (hongbao.order.payStatus != 'paid' || hongbao.order.isDeleted))
                                    || !hongbao.order) {
                                    console.log('current count null rest : ', currentCount, hongbao.totalValue, hongbao.usedValue);
                                    done++;
                                    return callback();
                                }
                                var leftMoney = (Math.round((hongbao.totalValue) * 100) - Math.round((hongbao.usedValue) * 100)) / 100;
                                if (leftMoney <= 0) {
                                    console.log("Err: current left 0 money");
                                    done++;
                                    return callback();
                                }
                                var sqls = TransactionMysqlService.genHongbaoIncomeSqls(
                                    hongbao.user._id + '',
                                    leftMoney,
                                    //hongbao.totalValue - hongbao.usedValue,
                                    hongbao.order._id + '',
                                    "红包退款",
                                    true
                                );
                                console.log('sqls:', sqls);
                                TransactionMysqlService.execSqls(sqls)
                                    .then(function (_trx) { // 更新订单状态
                                        //hongbao.totalValue - hongbao.usedValue;
                                        var serverConf = require('../configs/server');
                                        var messageContent = '您的动态红包未发送成功，金额' + leftMoney + '元' + '已全部退回您的钱包，前往查看>';
                                        var message = {
                                            userId: hongbao.user._id + '',
                                            type: 'hongbao_refund',
                                            title: '退款: 红包发送失败退款' + leftMoney + '元',
                                            content: messageContent,
                                            link: serverConf.HOST + '/1/customer/transaction?orderId=' + hongbao.order._id,
                                            linkTitle: '账单明细',
                                            linkType: 'trx',
                                            trxType: 'hongbao_refund',
                                            orderId: hongbao.order._id
                                        };
                                        Hongbao.findOneAndUpdate({_id: hongbao._id}, {$set: {isExpiredRefunded: true}}).exec();
                                        CustomerService.updateBaseInfo(hongbao.user._id, {
                                            hasNewMessage: true,
                                            'msgReadStatus.sys': true,
                                            'msgReadStatus.all': true
                                        });
                                        console.log('message:', message);
                                        MessageService.createMessage(message);
                                        //您的动态红包已过期，红包剩余金额#money#元，已退回至您的账户，详情请进入朱李叶健康APP“我的钱包”中查看。
                                        //commonUtil.sendSms("1695826", hongbao.user.phoneNum,
                                        //  "#money#=" + leftMoney);
                                        if (hongbao.user && hongbao.user.pushId) {
                                            var msgExtras = {
                                                type: 2,//pushMessage:有新消息
                                                contentType: 'sys'
                                            };
                                            var notificationExtras = {
                                                type: 3,//type: 1,为收藏推送, 2,为退款推送
                                                contentType: 'sys'
                                            };
                                            JPushService.pushMessage(hongbao.user.pushId, messageContent, '', msgExtras);
                                            JPushService.pushNotification(hongbao.user.pushId, messageContent, '', notificationExtras);
                                        }
                                        todo++;
                                        callback();
                                    })
                            },
                            function () {
                                page++;
                                pageCB();
                                console.log('all has completed! ' + done + " : " + todo);
                            }
                        );
                    });
            },
            function () {
                console.log('all has completed!');
            }
        )
    });
};

OperationController.prototype.backVenderTheExpired = function (req, res) {
    var Coupon = require('../models/Coupon');
    var Customer = require('../models/Customer');
    var Shop = require('../models/Shop');
    //没有绑定动态的红包,且有效的红包(),当天退回
    res.send('beginning.........');
    //var couponIds = ['58e1d0a45b0201a56f101278', '58e1c7ee5b0201a56f100acf', '58e1c1895b0201a56f10046f',
    //  '58e1b8535b0201a56f0ffda2', '58e1b8405b0201a56f0ffd99', '58e1b8315b0201a56f0ffd85', '58e0f5815b0201a56f0fcd38',
    //  '58e0d9965b0201a56f0fbcf9', '58e0b5125b0201a56f0fa4d6', '58e0a7445b0201a56f0f9be2', '58de1a324d93b85626afe06d',
    //  '58dde7044d93b85626afbcc6', '58ddcf484d93b85626afae20', '58dd9d7b4d93b85626af9dfa', '58dce00d4d93b85626af7454',
    //  '58dcc699a7e95b6f184b6fc9', '58dcc2e2a7e95b6f184b6ca1', '58dcc2bda7e95b6f184b6c77', '58dcc2b6a7e95b6f184b6c73',
    //  '58dca3ec823b300c5119f522', '58e238ec5b0201a56f105d2c', '58e237c95b0201a56f105c22', '58e237995b0201a56f105bf7',
    //  '58e234d35b0201a56f1059f7'];
    var now = Date.now();
    var cond = {
        type: 8,
        isDeleted: false,
        isConsumed: false,
        expiredAt: {$lt: now},
        cps: {$gte: 1},
        //boundVenderId: '57d77e24f52e142136bd8573'
    };
    console.log('cond:', cond);
    var errArray = [];
    var hasCoupon = true;
    var coupon = null;
    async.whilst(
        function () {
            return hasCoupon;
        },
        function (callback) {
            Coupon.findOne(cond, 'cps boundVenderId shopProp').exec()
                .then(function (_coupon) {
                    if (!_coupon) {
                        hasCoupon = false;
                        return callback();
                    }
                    coupon = _coupon;
                    var customer = null;
                    var shop = null;
                    Customer.findOne({_id: coupon.boundVenderId}, 'marketing shopVenderApplyStatus shopProp').exec()
                        .then(function (_customer) {

                            customer = JSON.parse(JSON.stringify(_customer));
                            if (coupon.shopProp == 1) {
                                return Shop.findOne({userId: coupon.boundVenderId}, 'remainBalance cps isMarketingClosed').exec();
                            }
                        })
                        .then(function (_shop) {
                            if (coupon.shopProp == 1) {
                                if (!_shop)
                                    throw new Error('not found shop');
                                shop = _shop;
                                customer.marketing = _shop;
                            }
                            return Coupon.update({
                                _id: coupon._id
                            }, {
                                $set: {
                                    isDeleted: true,
                                    isConsumed: true,
                                    updatedAt: now
                                }
                            }).exec();
                        })
                        .then(function () {
                            console.log(customer.marketing);
                            if (!customer || !customer.marketing || isNaN(customer.marketing.remainBalance) || isNaN(customer.marketing.cps) || !customer.marketing.cps || customer.marketing.cps < 1) {//TODO: 数据判断
                                throw new Error('wrong vender data');
                            }
                            var raw = (customer.marketing.remainBalance + coupon.cps ) / customer.marketing.cps;
                            var remainMemberSize = Math.floor(raw);
                            console.log(customer.marketing.remainBalance, coupon.cps, customer.marketing.cps, raw, remainMemberSize);
                            if (coupon.shopProp == 1) {
                                return Shop.update({
                                    userId: coupon.boundVenderId,
                                    'consumedMemberSize': {$gte: 1}
                                }, {
                                    $inc: {
                                        'remainBalance': coupon.cps,
                                        'consumedMemberSize': -1
                                    },
                                    $set: {
                                        'remainMemberSize': remainMemberSize,
                                        updatedAt: now
                                    }
                                }).exec()
                                    .then(function (_res) {
                                        //已审核;isMarketingClosed=false;balance>0
                                        if (CustomerService.isShopAuthorized(customer.shopVenderApplyStatus) && !shop.isMarketingClosed && customer.shopProp == 0 && remainMemberSize >= 1) {
                                            return Customer.update({_id: coupon.boundVenderId}, {$set: {shopProp: 1}}).exec();
                                        } else {
                                            return _res;
                                        }
                                    })
                            } else {
                                var update = {
                                    'marketing.remainMemberSize': remainMemberSize,
                                    updatedAt: now
                                };
                                return Customer.update({
                                    _id: coupon.boundVenderId,
                                    'marketing.consumedMemberSize': {$gte: 1}
                                }, {
                                    $inc: {
                                        'marketing.remainBalance': coupon.cps,
                                        'marketing.consumedMemberSize': -1
                                    },
                                    $set: update
                                }).exec();
                            }
                        })
                        .then(function (_res) {
                            //console.log(_res);
                            if (!_res || _res.nModified != 1) {
                                errArray.push(coupon._id + ":" + coupon.boundVenderId);
                            }
                            callback();
                        }, function (err) {
                            console.log(JSON.stringify(err));
                            errArray.push(coupon._id + ":" + coupon.boundVenderId);
                            callback();
                        })
                });

        },
        function () {
            console.log('backVenderTheExpired all has completed!', errArray);

        }
    );
}
OperationController.prototype.buidSpecialRel = function (req, res) {
    var relMap = {}
    //没有绑定动态的红包,且有效的红包(),当天退回
    res.send('beginning.........');
    var Hongbao = require('../models/Hongbao');
    var MessageService = require('../services/MessageService');
    var JPushService = require('../services/JPushService');
    var now = Date.now();
    var condition = {
        isDeleted: false,
        moment: {$exists: false},
        isExpiredRefunded: false, //未退款红包
        createdAt: {$gte: (now - constants.TIME_1_DAY - constants.TIME5M), $lte: (now - constants.TIME5M)}//用户可能正在包红包
    };
    condition[globalSource] = neZS;

    console.log('condition:', condition);
    Hongbao.distinct("_id", condition, function (err, ids) {
        var allCount = ids.length || 0;
        // TODO: 分页,目前仅支持单页处理
        var perPage = 1000, page = 1, totalPage = Math.ceil(allCount / perPage);
        console.log('allCount', allCount);
        async.whilst(
            function () {
                return page <= totalPage;
            },
            function (pageCB) {
                var done = 0, todo = 0;
                Hongbao.find(condition)
                    .populate('user', 'pushId phoneNum')
                    .populate('order', 'payStatus isDeleted')
                    .sort({createdAt: -1})
                    .skip((page - 1) * perPage)
                    .limit(perPage)
                    .exec(function (err, hongbaos) {
                        var currentCount = 0;
                        async.whilst(
                            function () {
                                return currentCount < hongbaos.length;
                            },
                            function (callback) {
                                var hongbao = hongbaos[currentCount];
                                console.log("hongbao: " + JSON.stringify(hongbao));
                                currentCount++;
                                if ((hongbao.totalCount <= hongbao.usedCount)//已经被领完
                                    //(hongbao.totalValue == hongbao.usedValue)//
                                    //|| hongbao.isExpiredRefunded
                                    || (hongbao.order && (hongbao.order.payStatus != 'paid' || hongbao.order.isDeleted))
                                    || !hongbao.order) {
                                    console.log('current count null rest : ', currentCount, hongbao.totalValue, hongbao.usedValue);
                                    done++;
                                    return callback();
                                }
                                var leftMoney = (Math.round((hongbao.totalValue) * 100) - Math.round((hongbao.usedValue) * 100)) / 100;
                                if (leftMoney <= 0) {
                                    console.log("Err: current left 0 money");
                                    done++;
                                    return callback();
                                }
                                var sqls = TransactionMysqlService.genHongbaoIncomeSqls(
                                    hongbao.user._id + '',
                                    leftMoney,
                                    //hongbao.totalValue - hongbao.usedValue,
                                    hongbao.order._id + '',
                                    "红包退款",
                                    true
                                );
                                console.log('sqls:', sqls);
                                TransactionMysqlService.execSqls(sqls)
                                    .then(function (_trx) { // 更新订单状态
                                        //hongbao.totalValue - hongbao.usedValue;
                                        var serverConf = require('../configs/server');
                                        var messageContent = '您的动态红包未发送成功，金额' + leftMoney + '元' + '已全部退回您的钱包，前往查看>';
                                        var message = {
                                            userId: hongbao.user._id + '',
                                            type: 'hongbao_refund',
                                            title: '退款: 红包发送失败退款' + leftMoney + '元',
                                            content: messageContent,
                                            link: serverConf.HOST + '/1/customer/transaction?orderId=' + hongbao.order._id,
                                            linkTitle: '账单明细',
                                            linkType: 'trx',
                                            trxType: 'hongbao_refund',
                                            orderId: hongbao.order._id
                                        };
                                        Hongbao.findOneAndUpdate({_id: hongbao._id}, {$set: {isExpiredRefunded: true}}).exec();
                                        CustomerService.updateBaseInfo(hongbao.user._id, {
                                            hasNewMessage: true,
                                            'msgReadStatus.sys': true,
                                            'msgReadStatus.all': true
                                        });
                                        console.log('message:', message);
                                        MessageService.createMessage(message);
                                        //您的动态红包已过期，红包剩余金额#money#元，已退回至您的账户，详情请进入朱李叶健康APP“我的钱包”中查看。
                                        //commonUtil.sendSms("1695826", hongbao.user.phoneNum,
                                        //  "#money#=" + leftMoney);
                                        if (hongbao.user && hongbao.user.pushId) {
                                            var msgExtras = {
                                                type: 2,//pushMessage:有新消息
                                                contentType: 'sys'
                                            };
                                            var notificationExtras = {
                                                type: 3,//type: 1,为收藏推送, 2,为退款推送
                                                contentType: 'sys'
                                            };
                                            JPushService.pushMessage(hongbao.user.pushId, messageContent, '', msgExtras);
                                            JPushService.pushNotification(hongbao.user.pushId, messageContent, '', notificationExtras);
                                        }
                                        todo++;
                                        callback();
                                    })
                            },
                            function () {
                                page++;
                                pageCB();
                                console.log('all has completed! ' + done + " : " + todo);
                            }
                        );
                    });
            },
            function () {
                console.log('all has completed!');
            }
        )
    });
};

OperationController.prototype.dailyOPStatistic = function (req, res) {
    var _diy = {}
    res.status(200).end();
    return Promise.resolve().then(function () {

        _diy.tel = req.query.tel;

        var upper = new Date;
        upper.setHours(0), upper.setMinutes(0), upper.setSeconds(0);
        var lower = new Date(upper);
        lower.setDate(lower.getDate() - 1);
        _diy.upper = upper
        _diy.lower = lower
        _diy.dateFilter = {
            $lt: upper.getTime(),
            $gt: lower.getTime()
        };
        _diy.allDateFilter = {
            $lt: upper.getTime()
        };
        //统计日期
        _diy.n0 = lower.toLocaleDateString()
    }).then(function () {
        //日增用户数
        return Customer.count({
            isDeleted: false,
            createdAt: _diy.dateFilter
        }).then(function (n1) {
            _diy.n1 = n1 || 0
        })

    }).then(function () {
        //日活跃用户数
        var condition = {isDeleted: false, createdAt: _diy.dateFilter};
        condition[globalSource] = neZS;
        return Log.distinct('userId', condition).then(function (n3) {
            _diy.n3 = n3.length
        })

        // return Log.distinct('userId', {isDeleted: false, createdAt: _diy.dateFilter}).count().then(function (n3) {
        //   _diy.n3 = n3
        // })

    }).then(function () {
        //日增充值数
        var sql = ' select sum(cash) total_recharge ' +
            ' from zlycare.transaction_details ' +
            ' where createdAt >  ' + _diy.lower.getTime() +
            ' and createdAt <  ' + _diy.upper.getTime() +
            ' and type = "recharge" ' +
            ' and isDeleted = 0 ' +
            ' and source = "docChat" '


        return TransactionMysqlService.execSqls(sql).then(function (data) {
            _diy.n6 = Math.round(data[0].total_recharge * 100) / 100 || 0
        })

    }).then(function () {
        //用户总数
        return Customer.count({
            isDeleted: false,
            createdAt: _diy.allDateFilter
        }).then(function (n10) {
            _diy.n10 = n10 || 0
        })

    }).then(function () {
        //cps商户总数
        return Customer.count({
            isDeleted: false,
            frozen: false,
            shopVenderApplyStatus: 3,
            createdAt: _diy.allDateFilter
        }).then(function (n12) {
            console.log("n12 ", n12)
            _diy.n12 = n12 || 0
        })
    }).then(function () {
        //cps会员总数
        return Membership.distinct('userId', {
            isDeleted: false
            , cardNo: {$in: ["2017050300000", "2017050300001"]}
            , expiredAt: {$gt: _diy.upper.getTime()}
            , balance: {$gt: 0}
        }).then(function (n13) {
            _diy.n13 = n13.length
        })
    }).then(function () {
        //cps商户充值订单总数
        return Orders.count({
            isDeleted: false,
            type: 'marketing',
            payStatus: 'paid',
            createdAt: _diy.allDateFilter
        }).then(function (n14) {
            _diy.n14 = n14
        })
    }).then(function () {
        //cps会员订单总数
        return Orders.count({
            isDeleted: false,
            type: 'membership',
            payStatus: 'paid',
            price: {$gte: 25},
            createdAt: _diy.allDateFilter
        }).then(function (n15) {
            _diy.n15 = n15
        })
    }).then(function () {
        //cps代金券使用总数
        return Coupon.count({
            isDeleted: false,
            type: {$in: [8, 9]},
            isConsumed: true,
            createdAt: _diy.allDateFilter
        }).then(function (n16) {
            _diy.n16 = n16
        })
    }).then(function () {
        //cps日增商户充值订单总数
        return Orders.count({
            isDeleted: false,
            type: 'marketing',
            payStatus: 'paid',
            createdAt: _diy.dateFilter
        }).then(function (n19) {
            _diy.n19 = n19
        })
    }).then(function () {
        //cps日增会员订单总数
        return Orders.count({
            isDeleted: false,
            type: 'membership',
            payStatus: 'paid',
            price: {$gte: 25},
            createdAt: _diy.dateFilter
        }).then(function (n20) {
            _diy.n20 = n20
        })
    }).then(function () {
        //cps日增代金券使用总数
        return Coupon.count({
            isDeleted: false,
            type: {$in: [8, 9]},
            createdAt: _diy.dateFilter
        }).then(function (n21) {
            _diy.n21 = n21
        })
    }).then(function () {
        //cps日增代金券使用总数
        return Coupon.count({
            isDeleted: false,
            type: {$in: [8, 9]},
            isConsumed: true,
            consumedAt: _diy.dateFilter
        }).then(function (n22) {
            _diy.n22 = n22
        })
    }).then(function () {
        commonUtil.sendSms("1709064", _diy.tel,
            "#n0#=" + _diy.n0 +
            "&#n1#=" + _diy.n1 +
            "&#n3#=" + _diy.n3 +
            "&#n6#=" + _diy.n6 +
            "&#n10#=" + _diy.n10 +
            "&#n12#=" + _diy.n12 +
            "&#n13#=" + _diy.n13 +
            "&#n14#=" + _diy.n14 +
            "&#n15#=" + _diy.n15 +
            "&#n16#=" + _diy.n16 +
            "&#n19#=" + _diy.n19 +
            "&#n20#=" + _diy.n20 +
            "&#n21#=" + _diy.n21 +
            "&#n22#=" + _diy.n22
        )
    })
}

//==========================from zlycare-web===================================================

/**
 * 渠道列表
 * @param req
 * @param res
 */
OperationController.prototype.list = function (req, res) {

    //"use strict";
    commonUtil.filterParams(req, res, {
        optional: ['superior']
    }, function (data) {
        var pageSlice = commonUtil.getCurrentPageSlice(req, 0, configs.pageSizeBig, {createdAt: -1}),
            conditions = {isDeleted: false};
        data.superior && (conditions['superior._id'] = data.superior);
        return ChannelService.list(conditions, pageSlice)
            .then(function (list) {
                return apiHandler.OK(res, list);
            }, function (err) {
                return apiHandler.OUTER_DEF(res, err);
            })

    })
};

/**
 * 创建渠道
 * @param req
 * @param res
 */
OperationController.prototype.create = function (req, res) {
    /*"use strict";*/
    var data, user, code;
    commonUtil.filterParams(req, res, {
        required: ['mName', 'mPhoneNum', 'type', 'sName', 'sId', 'sPhoneNum'],
        optional: ['remark']
    }, function (d) {
        data = d;
        console.log(data);
        var ps1 = ChannelService.findOne({'manager.phoneNum': data.mPhoneNum, isDeleted: false});
        //  ps2 = UserService.findOneUser({phoneNum: data.mPhoneNum});

        var ps2 = CustomerService.getInfoByPhone(data.mPhoneNum);

        Promise.all([ps1, ps2])
            .then(function (rs) {
                if (rs[0] && rs[0].code)
                    throw ErrorHandler.getBusinessErrorByCode(1202);

                var p1 = UniqueCodeService.getCode(UniqueCodeTitle.LM_CODE),
                    p2;
                if (rs[1]) {
                    p2 = Promise.resolve(rs[1]);
                } else {
                    var doc = {
                        isDeleted: false,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        source: 'boss',
                        name: data.mName,
                        phoneNum: data.mPhoneNum
                    };
                    p2 = CustomerService.updateUser({phoneNum: data.mPhoneNum}, doc, {new: true, upsert: true});

                }
                return Promise.all([p1, p2]);
            })
            .then(function (values) {
                user = JSON.parse(JSON.stringify(values[1])),
                    code = JSON.parse(JSON.stringify(values[0]));

                var channel = {
                    isDeleted: false,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    code: commonUtil.pad(code.code, 4, 0),
                    manager: {
                        name: data.mName,
                        phoneNum: data.mPhoneNum,
                        _id: user._id
                    },
                    superior: {
                        name: data.sName,
                        _id: data.sId
                    },
                    salesman: {
                        phoneNum: data.sPhoneNum
                    },
                    type: data.type,
                    remark: data.remark || ''
                };

                var p1 = ChannelService.create(channel),
                    p2 = CustomerService.updateUser({_id: data.sId}, {$inc: {channelNum: 1}}),
                    promise = [p1, p2];
                return Promise.all(promise);
            })
            .then(function () {
                return apiHandler.OK(res);
            }, function (err) {
                return apiHandler.OUTER_DEF(res, err);
            })
    });
};

OperationController.prototype.addOpShop = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['docChatNum', 'balance', 'cps']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        if (data.balance < 1 || data.cps < 1) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        var user;
        CustomerService.getMainInfoByDocChatNum(data.docChatNum)
            .then(function (_user) {
                if (!_user) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                }
                user = _user;
                if (constants.shopAuthorizedStatus.indexOf(_user.shopVenderApplyStatus) == -1) {
                    throw ErrorHandler.getBusinessErrorByCode(1518);
                }
                return ShopService.getShopByUserId(_user._id);
            })
            .then(function (_shop) {
                if (_shop) {
                    throw ErrorHandler.getBusinessErrorByCode(1535);
                }
                var newOpShop = {
                    userId: user._id,
                    docChatNum: user.docChatNum,
                    balance: data.balance,
                    remainBalance: data.balance,
                    cps: data.cps,
                    shopCity: user.shopCity,
                    shopName: user.shopName,
                    shopType: user.shopType,
                    shopSubType: user.shopSubType,
                    totalVal: data.balance
                };
                newOpShop.remainMemberSize = Math.floor(data.balance / data.cps);
                console.log(newOpShop);
                return ShopService.createOpShop(newOpShop);
            })
            .then(function (_shop) {
                if (_shop.remainMemberSize >= 1) {
                    var updateData = {
                        shopProp: 1
                    };
                    return CustomerService.updateUserById(_shop.userId, updateData)
                }
                ;
            })
            .then(function () {
                apiHandler.OK(res, {});
                LoggerService.trace(LoggerService.getTraceDataByReq(req));
            }, function (err) {
                apiHandler.handleErr(res, err);
            })
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);


};

OperationController.prototype.updateOpShop = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['_id'],
        optional: ['cps', 'addBalance']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        if (data.cps && data.cps < 1) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1212));
        }
        if (data.addBalance && data.addBalance < 1) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        ShopService.getShopById(data._id)
            .then(function (_shop) {
                if (!_shop) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                }
                var updateData = {};
                var balance = _shop.balance;
                var remainBalance = _shop.remainBalance;
                var cps = _shop.cps;
                if (data.cps) {
                    updateData["cps"] = data.cps;
                    updateData["cpsUpdatedAt"] = Date.now();
                    cps = data.cps;
                }
                if (data.addBalance) {
                    balance += Number(data.addBalance)
                    remainBalance += Number(data.addBalance);
                    updateData["balance"] = balance;
                    updateData["remainBalance"] = remainBalance;
                    updateData["totalVal"] = _shop.totalVal + Number(data.addBalance);
                }
                updateData["remainMemberSize"] = Math.floor(remainBalance / cps);
                return ShopService.updateShopById(data._id, updateData);
            })
            .then(function (_shop) {
                var updateData = {
                    shopProp: 0
                };
                if (_shop.remainMemberSize >= 1 && !_shop.isMarketingClosed) {
                    updateData.shopProp = 1;
                }
                ;
                return CustomerService.updateUserById(_shop.userId, updateData)
            })
            .then(function () {
                apiHandler.OK(res, {});
                LoggerService.trace(LoggerService.getTraceDataByReq(req));
            }, function (err) {
                apiHandler.handleErr(res, err);
            })
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);


};

OperationController.prototype.switchOpShopStatus = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['_id', 'status']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        ShopService.updateShopById(data._id, {isMarketingClosed: data.status})
            .then(function (_shop) {
                if (!_shop) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                }
                var updateData = {
                    shopProp: 0
                }
                if (!data.status && _shop.remainMemberSize >= 1) {
                    updateData.shopProp = 1;
                }
                return CustomerService.updateUserById(_shop.userId, updateData)
            })
            .then(function () {
                apiHandler.OK(res, {});
                LoggerService.trace(LoggerService.getTraceDataByReq(req));
            }, function (err) {
                apiHandler.handleErr(res, err);
            })
    };
    commonUtil.validate(payload, fields, onSuccess, onFailure);
};


/**
 * 修改渠道信息
 * @param req
 * @param res
 */
OperationController.prototype.modify = function (req, res) {
    "use strict";
    commonUtil.filterParams(req, res, {
        required: ['_id'],
        optional: ['update']
    }, function (data) {
        ChannelService.update({_id: data._id}, data.update || {}, {new: true})
            .then(function (rs) {
                return apiHandler.OK(res, rs);
            }, function (err) {
                return apiHandler.OUTER_DEF(res, err);
            });
    })
};

/**
 * 删除渠道
 * @param req
 * @param res
 */
OperationController.prototype.del = function (req, res) {
    "use strict";
    commonUtil.filterParams(req, res, {
        required: ['_id', 'sId']
    }, function (data) {
        console.log(2323323232);
        var p1 = ChannelService.update({_id: data._id}, {isDeleted: true}),
            p2 = CustomerService.updateUser({_id: data.sId}, {$inc: {channelNum: -1}});
        Promise.all([p1, p2])
            .then(function (rs) {
                return apiHandler.OK(res, rs);
            }, function (err) {
                return apiHandler.OUTER_DEF(res, err);
            });
    })
};

OperationController.prototype.init = function (req, res) {
    "use strict";
    commonUtil.filterParams(req, res, {}, function () {
        UniqueCodeService.init()
            .then(function () {
                return apiHandler.OK(res);
            }, function (err) {
                return apiHandler.OUTER_DEF(res, err);
            });
    });
};

/**
 * user list verson2
 * @param req
 * @param res
 */
OperationController.prototype.userList = function (req, res) {
    commonUtil.filterParams(req, res, {
        optional: ['phoneNum', 'source', 'isCharge']
    }, function (data) {
        var pageSlice = commonUtil.getCurrentPageSlice(req, 0, configs.pageSizeBig, {createdAt: -1})
            , conditions = {isDeleted: false};
        data.phoneNum && (conditions.phoneNum = data.phoneNum);
        data.source && (conditions.source = data.source);
        data.isCharge && (conditions.isCharge = Boolean(data.isCharge));
        CustomerService.findUserList(conditions, pageSlice)
            .then(function (data) {
                return apiHandler.OK(res, data);
            }, function (err) {
                return apiHandler.OUTER_DEF(res, err);
            });
    });
};

/**2104
 * 查询发布过的版本信息
 * @param req
 * @param res
 */
OperationController.prototype.findVersions = function (req, res) {
    var type = req.query.type;
    var condition = {};

    switch (type) {
        case "24":
            condition.type = {
                $in: [
                    "24customer-android",
                    "24customer-ios",
                    "24broker-android",
                    "24broker-ios"
                ]
            };
            break;
        case "zly":
            condition.type = {
                $in: [
                    "zly-android",
                    "zly-android-internal",
                    "zly-android-staging",
                    "zly-ios",
                    "zly-ios-internal",
                    "zly-ios-staging"
                ]
            };
            break;
        case "zlydoc":
            condition.type = {
                $in: [
                    "zlydoc-android",
                    "zlydoc-android-staging",
                    "zlydoc-android-internal",
                    "zlydoc-ios",
                    "zlydoc-ios-staging",
                    "zlydoc-ios-internal"
                ]
            };
            break;
        default:
            return apiHandler.COMMON_WRONG_FIELDS(res);
    }

    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, 20, {time: -1});
    VersionService.findVersion(condition, {}, pageSlice)
        .then(function (data) {
            if (data && data.length > 0) {
                apiHandler.OK(res, data);
            } else {
                apiHandler.OK(res, []);
            }
        }, function (err) {
            apiHandler.OUTER_DEF(res, err);
        });
};
/**
 * 创建发布版本信息
 * @param req
 * @param res
 */

OperationController.prototype.createVersion = function (req, res) {
    var payload = req.body;
    var field = {
        required: ['type', 'minCode', 'url', 'code', 'name', 'desc'],
        optional: ['badCode']
    };

    var onFailure = function (handler, err) {
        handler(res, err);
    };
    var onSuccess = function (handler, data) {
        data.time = Date.now();
        VersionService.createVersion(data)
            .then(function (d) {
                apiHandler.OK(res, d);
            }, function (err) {
                apiHandler.OUTER_DEF(res, err);
            });
    };

    commonUtil.validate(payload, field, onSuccess, onFailure);
};
/**ljx
 * 创建一个商家
 * 根据商家热线号创建 docChatNum
 * @param req
 * @param res
 */
OperationController.prototype.createBusinessman = function (req, res) {
    var docChatNum = req.body.docChatNum;
    var ps = CustomerService.updateUser({docChatNum: docChatNum}, {
        isVender: true,
        couponDeductible: 0
    }, {upsert: false});
    ps.then(function (ret) {
        if (!ret) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
        } else {
            return apiHandler.OK(res, ret);
        }
    }, function (err) {
        return apiHandler.OUTER_DEF(res, err);
    });
};

/**ljx
 * 显示商家列表
 * @param req
 * @param res
 */
OperationController.prototype.listBusinessman = function (req, res) {
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, configs.pageSizeBig, {createdAt: -1})
        , conditions = {};
    if (req.query.docChatNum) {
        conditions.docChatNum = req.query.docChatNum
    }
    conditions.isVender = true;
    conditions.isDeleted = false;
    CustomerService.findBusinessList(conditions, pageSlice, {
        doctorRef: 1,
        name: 1,
        docChatNum: 1,
        couponDeductible: 1
    }).then(function (data) {
        return apiHandler.OK(res, data);
    }, function (err) {
        console.log(err);
        return apiHandler.OUTER_DEF(res, err);
    });
};

/**ljx
 * 删除商家
 * @param req
 * @param res
 */
OperationController.prototype.delBusinessman = function (req, res) {
    var docChatNum = req.query.docChatNum;
    var now = Date.now();
    var conditions = {docChatNum: docChatNum}, updates = {isVender: false, updatedAt: now};
    var ps = CustomerService.updateUser(conditions, updates, {upsert: false});
    ps.then(function (ret) {
        if (!ret) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
        } else {
            return apiHandler.OK(res, ret);
        }
    }, function (err) {
        return apiHandler.OUTER_DEF(res, err);
    });
};
/**ljx
 * 代金券运营管理，添加代金券
 * @param req
 * @param res
 */
OperationController.prototype.createCoupon = function (req, res) {
    var docChatNum = req.body.docChatNum;
    var ps = CustomerService.updateUser({docChatNum: docChatNum, isDeleted: false}, {
        isCouponVender: true,
        isVender: true
    }, {upsert: false});
    ps.then(function (ret) {
        if (!ret) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
        } else {
            return apiHandler.OK(res, ret);
        }
    }, function (err) {
        return apiHandler.OUTER_DEF(res, err);
    });
};
/**
 * ljx
 * 显示代金券商家列表
 * @param req
 * @param res
 */
OperationController.prototype.listCoupon = function (req, res) {
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, configs.pageSizeBig, {createdAt: -1})
        , conditions = {isVender: true, isCouponVender: true, isDeleted: false};
    CustomerService.findBusinessList(conditions, pageSlice, {_id: 1, doctorRef: 1, name: 1, docChatNum: 1})
        .then(function (data) {
            data = JSON.parse(JSON.stringify(data));
            ProductService.getProduct({}, 'owner displayPrice soldNum  stock').then(function (productData) {
                productData = JSON.parse(JSON.stringify(productData));
                for (var i = 0; i < data.length; i++) {
                    var index = -1;
                    data[i]['product'] = [];
                    for (var j = 0; j < productData.length; j++) {
                        if (data[i]['_id'] == productData[j]['owner']['_id'].toString()) {
                            index++;
                            data[i]['product'][index] = {};
                            data[i]['product'][index]["display"] = productData[j].displayPrice;
                            data[i]['product'][index]["soldNum"] = productData[j].soldNum;
                            data[i]['product'][index]["stock"] = productData[j].stock;
                        }
                    }
                }
                return apiHandler.OK(res, data);
            }, function (err) {
                return apiHandler.OUTER_DEF(res, err);
            });
        }, function (err) {
            return apiHandler.OUTER_DEF(res, err);
        });
};

OperationController.prototype.addRegion = function (req, res) {
    TransactionMysqlService.getRegion()
        .then(function (_regions) {
            var regions = _regions[0];
            var areas = [];
            for (var i = 0; i < regions.length; i++) {
                var area = {
                    areaId: regions[i].Id,
                    name: regions[i].name,
                    provinceId: regions[i].pid
                };
                if (regions[i].name.indexOf("区") > -1) {
                    area.isDeleted = true;
                }
                areas.push(area);
            }
            Area.create(areas);
            return apiHandler.OK(res, {});
        }, function (err) {
            return apiHandler.OUTER_DEF(res, err);
        }, function (err) {
            return apiHandler.OUTER_DEF(res, err);
        });
};

OperationController.prototype.momentMessageMomentUser = function (req, res) {
    console.log(1111111);
    var MomentMsg = require('../models/MomentMsg');
    var cond = {
        isDeleted: false,
        'momentList.originalMomentId': {$exists: true},
        'momentList.momentUser': {$exists: false}
    };
    var totalCount, pageNum = 0, pageSize = 100;
    MomentMsg.count(cond)
        .then(function (_count) {
            totalCount = _count;
            console.log("+++++++++");
            console.log("totalCount: " + totalCount);
            async.whilst(
                function () {
                    return pageNum < Math.ceil(totalCount / pageSize);
                },
                function (cb) {
                    MomentMsg.find(cond).sort({createdAt: 1}).limit(pageSize)
                        .then(function (_list) {
                            var listNum = 0;
                            async.whilst(
                                function () {
                                    return listNum < _list.length;
                                },
                                function (cbin) {
                                    _list[listNum].momentList.forEach(function (item) {
                                        if (item.originalMomentId && !item.momentUser) {
                                            item.momentUser = item.originalMomentId
                                        }
                                    })
                                    MomentMsg.findOneAndUpdate({_id: _list[listNum]._id}, {$set: {momentList: _list[listNum].momentList}}).exec()
                                        .then(function (_list) {
                                            listNum++;
                                            cbin();
                                        })
                                },
                                function (err) {
                                    console.log(err);
                                    pageNum++;
                                    console.log("+++++++++++++++");
                                    console.log('pageNum: ' + pageNum);
                                    console.log("totalPage: " + Math.floor(totalCount / pageSize))
                                    cb();
                                }
                            )
                        })
                },
                function (err) {
                    console.log(err);
                    console.log('all is well');
                }
            )
            return apiHandler.OK(res, "began");
        })

};

OperationController.prototype.getOpShop = function (req, res) {
    commonUtil.reqFilter(req, res, {optional: ["shopInfo", "shopCity"]}, function (data) {
        console.log(data);
        var conditions = {}
            , page = req.query.pageNum || 0
            ,
            pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {remainMemberSize: 1});
        data.shopInfo && (conditions.$or = [{shopName: data.shopInfo}, {docChatNum: data.shopInfo}]);
        data.shopCity && (conditions.shopCity = new RegExp(data.shopCity, 'i'));
        return ShopService.query(conditions, pageSlice);
    });
};

/**
 * 给运营号添加代金券
 * @param req
 * @param res
 */
OperationController.prototype.createProduct = function (req, res) {
    var userId = req.body.userId;
    var type = req.body.type;
    var count = parseFloat(req.body.count);
    var price = {'0': 5, '1': 10, '2': 20};
    if (price[type]) {
        var findPro = ProductService.getProductsByUserId(userId);
        findPro.then(function (retProduct) {
            if (retProduct && (retProduct.length != 0)) {
                var i = 0;
                while ((i < retProduct.length) && (retProduct[i].displayPrice != constants['COUPON_ACTIVITYNO_PURCHASE_RMB_' + price[type]])) {
                    i++;
                }
                if (i == retProduct.length) {
                    addProduct();
                } else {
                    var stock = retProduct[i].stock + count;
                    ProductService.updateProduct({_id: retProduct[i]._id}, {stock: stock}).then(function (ret) {
                        return apiHandler.OK(res, ret);
                    }, function (err) {
                        return apiHandler.OUTER_DEF(res, err);
                    });
                }
            } else {
                addProduct();
            }
        }, function (err) {
            return apiHandler.OUTER_DEF(res, err);
        });
    } else {
        return apiHandler.OK(res, []);
    }
    var addProduct = function () {
        var data = {
            title: '全城购·代金券',
            displayPrice: constants['COUPON_ACTIVITYNO_PURCHASE_RMB_' + price[type]],
            actualPrice: constants['COUPON_ACTIVITYNO_PURCHASE_RMB_DISCOUNT_' + price[type]],
            rewardPrice: constants['COUPON_ACTIVITYNO_PURCHASE_REWARD_RMB_' + price[type]],
            stock: count,
            soldNum: 0,
            owner: userId
        };
        var ps = ProductService.createProduct(data);
        ps.then(function (ret) {
            if (!ret) {
                return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1503));
            } else {
                return apiHandler.OK(res, ret);
            }
        }, function (err) {
            return apiHandler.OUTER_DEF(res, err);
        });
    };
};


/**
 * 批量帮商户充值推广金额、设置cps并且计算相关参数
 * @param req
 * @param res
 */
OperationController.prototype.marketingRecharge = function (req, res) {
    //post请求示例
    /*var json = {
     "marketingInfos": [
     {
     "docChatNum": "802797992",
     "serviceValue": 300,
     "cps": 10
     }
     ]
     }*/

    var ServiceOrder = require('../models/Order').ServiceOrder;

    var payload = req.body;
    var fields = {required: ["marketingInfos"]};
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {

        var marketingInfos = payload.marketingInfos;
        //生成订单,并充值 
        var count = 0;
        var errDocChatNums = [];
        async.whilst(
            function () {
                return count < marketingInfos.length;
            },
            function (callback) {
                var marketingInfo = marketingInfos[count++];
                console.log(marketingInfo);
                if (!marketingInfo.docChatNum) {
                    return callback();
                }
                var customerCon = {
                    docChatNum: marketingInfo.docChatNum
                };
                var customer = null;
                Customer.findOne(customerCon, 'marketing').exec()
                    .then(function (_customer) {
                        if (!_customer) {
                            errDocChatNums.push(marketingInfo.docChatNum);
                            throw new Error('the customer not exists');
                        }
                        //TODO:?
                        //if(_customer.marketing || isNaN(_customer.marketing.balance) || isNaN(_customer.marketing.remainBalance)){//TODO: 数据判断
                        //  errDocChatNums.push(marketingInfo.docChatNum);
                        //  throw new Error('wrong marketing data');
                        //}
                        customer = _customer;
                        //充值,设置cps
                        var _marketing = _customer.marketing;
                        var update = {
                            $inc: {
                                'marketing.balance': marketingInfo.serviceValue || 0,
                                'marketing.remainBalance': marketingInfo.serviceValue || 0,
                            },
                            $set: {}
                        }
                        console.log('_marketing:', _marketing);
                        if (!_marketing) {
                            update['$set']['marketing.checkinNum'] = 0;
                            update['$set']['marketing.remainMemberSize'] = 0;
                            update['$set']['marketing.consumedMemberSize'] = 0;
                            update['$set']['marketing.cps'] = 0;
                            update['$set']['marketing.cpsUpdatedAt'] = 0;
                            update['$set']['marketing.isMarketingClosed'] = false;
                        }
                        if (marketingInfo.cps >= 1) {
                            update['$set']['marketing.cps'] = marketingInfo.cps;
                            update['$set']['marketing.remainMemberSize'] = Math.floor(commonUtil.getNumsPlusResult([_marketing && _marketing.remainBalance || 0,
                                    marketingInfo.serviceValue || 0], 10) / marketingInfo.cps);
                            update['$set']['marketing.cpsUpdatedAt'] = Date.now();
                        } else if (_marketing.cps >= 1) {
                            update['$set']['marketing.remainMemberSize'] = Math.floor(commonUtil.getNumsPlusResult([_marketing && _marketing.remainBalance || 0,
                                    marketingInfo.serviceValue || 0], 10) / _marketing.cps);
                        }

                        console.log('update:', update);
                        return Customer.update({_id: _customer._id}, update).exec();
                    })
                    .then(function () {
                        //生成订单
                        // 购买者
                        var order = {};
                        order.price = 0;
                        order.reqPayload = marketingInfo;
                        order.payType = Order.PAY_TYPES.SYS_PAY;
                        order.payStatus = Order.PAY_STATUS.PAID;
                        order.type = 'marketing';
                        order.serviceValue = marketingInfo.serviceValue || 0; // 购买用户的ID
                        order.customerId = constants.zlyDocChatId; // 购买用户的ID
                        console.log(order);
                        return OrderService.createServiceOrder(order);
                    })
                    .then(function () {
                        callback();
                    }, function (err) {
                        console.log('err:', err);
                        callback();
                    });
            },
            function (err) {
                console.log('marketingRecharge all has completed', errDocChatNums);
                res.send('all has completed:' + errDocChatNums.length > 0 ? 'with error docChatNums, ' + errDocChatNums.toString() : 'with no error');
            }
        );
    }
    commonUtil.validate(payload, fields, onSuccess, onFailure);
}

/**
 * 批量帮用户充值会员额度
 * @param req
 * @param res
 */
OperationController.prototype.membershipRecharge = function (req, res) {
    //post请求示例
    /*var json = {
     "membershipInfos": [
     {
     "docChatNum": "802797992",
     "serviceValue": 300,
     }
     ]
     }*/

    var ServiceOrder = require('../models/Order').ServiceOrder;
    var payload = req.body;

    var fields = {required: ["membershipInfos"]};
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var membershipInfos = payload.membershipInfos;
        //生成订单,并充值 
        var count = 0;
        var errDocChatNums = [];
        async.whilst(
            function () {
                return count < membershipInfos.length;
            },
            function (callback) {
                var membershipInfo = membershipInfos[count++];
                if (!membershipInfo.docChatNum) {
                    return callback();
                }
                var customerCon = {
                    docChatNum: membershipInfo.docChatNum
                };
                var customer = null;
                Customer.findOneAndUpdate(customerCon, {$inc: {'membership.balance': membershipInfo.serviceValue || 0}}, {fields: 'docChatNum'}).exec()
                    .then(function (_cus) {
                        if (!_cus) {
                            errDocChatNums.push(membershipInfo.docChatNum);
                            throw new Error('not found the customer');
                        }
                        //生成订单
                        // 购买者
                        var order = {};
                        order.price = 0;
                        order.reqPayload = membershipInfo;
                        order.payType = Order.PAY_TYPES.SYS_PAY;
                        order.payStatus = Order.PAY_STATUS.PAID;
                        order.type = 'membership';
                        order.serviceValue = membershipInfo.serviceValue || 0; // 购买用户的ID
                        order.customerId = constants.zlyDocChatId; // 购买用户的ID
                        console.log(order);
                        return OrderService.createServiceOrder(order);
                    })
                    .then(function () {
                        callback();
                    }, function (err) {
                        console.log('err:', err);
                        callback();
                    });
            },
            function (err) {
                console.log('membershipRecharge all has completed', errDocChatNums);
                res.send('all has completed:' + errDocChatNums.length > 0 ? 'with error docChatNums, ' + errDocChatNums.toString() : 'with no error');
            }
        );
    }
    commonUtil.validate(payload, fields, onSuccess, onFailure);
}

OperationController.prototype.couponAddRandom = function (req, res) {
    res.send('beginning..........');
    var nowTS = Date.now();
    var Coupon = require('../models/Coupon');
    var cond = {
        isDeleted: false,
        isConsumed: false,
        expiredAt: {$gt: nowTS},
        '$where': "this.unionCode.length < 7",
        type: 8
    }
    var hasCoupon = true;
    var count = 0;
    async.whilst(
        function () {
            return hasCoupon;
        },
        function (callback) {
            Coupon.findOne(cond).exec()
                .then(function (_coupon) {
                    //count++;
                    if (!_coupon) {
                        hasCoupon = false;
                        return callback();
                    }
                    var update = {};
                    var unionCode = _coupon.unionCode + '' + commonUtil.getRandomNum(10, 99);
                    var qrCode = commonUtil.genJuliyeMD5((_coupon.boundUserId || '') + (_coupon.boundVenderId || '') + _coupon._id + unionCode, false);
                    console.log(_coupon.unionCode, unionCode, _coupon.qrCode, qrCode);
                    update['$set'] = {
                        unionCode: unionCode,
                        qrCode: qrCode
                    };
                    return Coupon.update({_id: _coupon._id}, update).exec();
                })
                .then(function () {
                    callback();
                }, function (err) {
                    console.log('couponAddRandom:', err);
                    callback();
                })
        },
        function () {
            console.log('all has completed');
        }
    );
}

OperationController.prototype.coupon5To9 = function (req, res) {
    res.send('beginning..........');
    var nowTS = Date.now();
    var Coupon = require('../models/Coupon');
    var cond = {
        isDeleted: false,
        isConsumed: false,
        expiredAt: {$gt: nowTS},
        type: 5,
        rmb: 6,
        title: '全城购·代金券',
        //boundUserId: '5441f8dee1f5b4a37d9fd0db'
    }
    var hasCoupon = true;
    var count = 0;
    async.whilst(
        function () {
            //return count < 1;
            return hasCoupon;
        },
        function (callback) {
            Coupon.findOne(cond).exec()
                .then(function (_coupon) {
                    //count++;
                    if (!_coupon) {
                        hasCoupon = false;
                        return callback();
                    }
                    var update = {};
                    return CouponService.updateToUnionCodeCoupon9(_coupon);
                })
                .then(function (_res) {
                    console.log(_res);
                    callback();
                }, function (err) {
                    console.log('coupon5To9:', err);
                    callback();
                })
        },
        function () {
            console.log('all has completed');
        }
    );
}

OperationController.prototype.membershipTransfer = function (req, res) {
    //todo: 没有考虑到如果已存在membership的情况
    res.send('beginning......');
    var Membership = require('../models/Membership');
    var nowTS = Date.now();
    var cond = {
        isDeleted: false,
        'membership.balance': {$gt: 0},

        /*'$or': [
         {'membership.balance': {$gt: 0}},
         {'membership.cost': {$gt: 0}}//todo:@产品
         ],*/
        //phoneNum: {$nin: ['13526683238', '18801279241']}
        //docChatNum: {$in: ['808058127', '801488244', '801047771', '808053989']}
    }
    var errUsers = [];
    Customer.count(cond).exec()
        .then(function (_count) {
            var perPage = 10, page = 1, totalPage = Math.ceil(_count / perPage);
            async.whilst(
                function () {
                    return page <= totalPage;
                },
                function (callback) {
                    var _customer = null;
                    Customer.find(cond, 'membership')
                        .sort({createdAt: -1})
                        .skip((page - 1) * perPage)
                        .limit(perPage).exec()
                        .then(function (_customers) {
                            page++;
                            var memberships = [];
                            for (var i = 0; i < _customers.length; i++) {
                                _customer = _customers[i];
                                var _membership = _customer.membership;
                                console.log(_customer._id + '', _membership);
                                memberships.push({
                                    userId: _customer._id + '',
                                    totalVal: commonUtil.getNumsPlusResult([_membership.balance || 0, _membership.cost || 0], 10),
                                    balance: commonUtil.getNumsPlusResult([_membership.balance || 0], 10),
                                    cost: commonUtil.getNumsPlusResult([_membership.cost || 0], 10),
                                    cardNo: constants.membershipCardNo,
                                    expiredAt: new Date(commonUtil.getDateMidnight(nowTS)).getTime() + constants.TIME60D - 1,//TODO: @产品60天
                                    createdAt: nowTS,
                                })
                            }
                            if (_customers && _customers.length > 0) {
                                return Membership.create(memberships);
                            }
                        })
                        .then(function () {
                            callback();
                        }, function (err) {
                            errUsers.push(_customer._id + '');
                            console.log('err:', err);
                            callback();
                        })
                },
                function (err) {
                    console.log('all has completed, err user: ' + errUsers.toString());
                }
            )
        })
}

OperationController.prototype.genMembershipTrades = function (req, res) {
    res.send('beginning.............');
    var Membership = require('../models/Membership');
    var Order = require('../models/Order').TransferOrder;
    var Coupon = require('../models/Coupon');
    var MembershipTrade = Backend.model('1/membership', undefined, 'membership_trade');
    ;
    var cond = {
        isDeleted: false,
        //userId: '5819ed2593740e996bf3f824'
    }
    var _user_id_begin = '';
    var begin_index = 0;
    var updatedAt = 1596477124225; //todo: 更新到最新时间
    Membership.distinct('userId', cond).exec()
        .then(function (_userIds) {
            _userIds = JSON.parse(JSON.stringify(_userIds));
            console.log(_userIds[0], _userIds[1]);
            //按时间从小到大排序
            _userIds.sort();
            console.log(_userIds[0], _userIds[1]);
            if (_user_id_begin) {
                begin_index = _userIds.indexOf(_user_id_begin);
                console.log('begin_index:', begin_index);
                _userIds = _userIds.slice(begin_index);
            }
            async.whilst(
                function () {
                    return _userIds.length > 0;
                },
                function (callback) {
                    var _userId = _userIds.shift();
                    console.log('current user id:', _userId);
                    var trades = [];
                    var nowTS = Date.now();
                    var cond_buy = {
                        userId: _userId + '',
                        isDeleted: false,
                    };
                    var expiredCardIds = [];
                    Membership.find(cond_buy).exec()
                        .then(function (_memberships) {
                            _memberships.forEach(function (_membership) {
                                //领取的会员额度,目前不存在
                                //购买的会员额度
                                var _trade = {
                                    userId: _userId,
                                    type: 'buy',
                                    value: _membership.totalVal,
                                    memberships: [
                                        {
                                            membershipId: _membership._id + '',
                                            cardNo: _membership.cardNo,
                                            cost: _membership.totalVal,
                                        }
                                    ],
                                    createdAt: _membership.createdAt,
                                    updatedAt: updatedAt
                                };
                                trades.push(_trade);
                                //会员额度过期
                                if (_membership.expiredAt <= nowTS && _membership.balance > 0) {
                                    var _trade_expired = {};
                                    _trade_expired.userId = _userId;
                                    _trade_expired.type = 'expired';
                                    _trade_expired.value = _membership.balance;
                                    _trade_expired.createdAt = _membership.expiredAt;
                                    _trade_expired.updatedAt = updatedAt;
                                    _trade_expired.memberships = [
                                        {
                                            membershipId: _membership._id + '',
                                            cardNo: _membership.cardNo,
                                            cost: _membership.balance,
                                        }
                                    ],
                                        trades.push(_trade_expired);
                                    expiredCardIds.push(_membership._id + '');
                                }
                            })
                            return MembershipTrade.create(trades);
                        })
                        .then(function () {
                            return Membership.update({_id: {$in: expiredCardIds}}, {$set: {hasGenExpiredTrade: true}}, {multi: true}).exec();
                        })
                        .then(function () {
                            //领取代金券,消耗会员额度
                            var cond_coupon = {
                                //isDeleted: false,
                                boundUserId: _userId + '',
                                'memberships.0': {$exists: true}
                            }

                            var trades = [];
                            return Coupon.find(cond_coupon).exec()
                                .then(function (_coupons) {
                                    _coupons.forEach(function (_coupon) {
                                        var _trade = {
                                            userId: _userId,
                                            type: 'coupon',
                                            value: _coupon.rmb,
                                            memberships: _coupon.memberships,
                                            couponId: _coupon._id + '',
                                            shopId: _coupon.boundVenderId,
                                            createdAt: _coupon.createdAt,
                                            updatedAt: updatedAt
                                        };

                                        trades.push(_trade);
                                    })
                                    return MembershipTrade.create(trades);
                                });
                        })
                        .then(function () {
                            //用券返现,消耗会员额度
                            var cond_order = {
                                isDeleted: false,
                                customerId: _userId,
                                type: 'tf',
                                transferType: 'checkin',
                                customerReward: {$gt: 0},
                                'memberships.0': {$exists: true}
                            }
                            var trades = [];
                            return Order.find(cond_order).exec()
                                .then(function (_orders) {
                                    _orders.forEach(function (_order) {
                                        var _trade = {
                                            userId: _userId,
                                            type: 'rebate',
                                            value: _order.customerReward,
                                            memberships: _order.memberships,
                                            orderId: _order._id + '',
                                            shopId: _order.doctorMainId + '',
                                            createdAt: _order.createdAt,
                                            updatedAt: updatedAt
                                        };
                                        trades.push(_trade);
                                    })
                                    return MembershipTrade.create(trades);
                                });
                        })
                        .then(function () {
                            callback();
                        }, function (err) {
                            console.log('err:', err);
                        })
                },
                function () {
                    console.log('all has completed');
                }
            );
        })
}


OperationController.prototype.genOldMembershipTrade = function (req, res) {
    res.send('beginning.............');
    var Membership = require('../models/Membership');
    var Order = require('../models/Order').TransferOrder;
    var Coupon = require('../models/Coupon');
    var MembershipTrade = Backend.model('1/membership', undefined, 'membership_trade');
    var card_no_old = '2017050300000';
    var oldTS = 1594551376417;
    var cond = {
        isDeleted: false,
        cardNo: card_no_old,
        //userId: '5819ed2593740e996bf3f824'
    }
    //若出现错误,删除当前一个用户数据,再重新跑脚本
    var _user_id_begin = '';
    var begin_index = 0;
    Membership.distinct('userId', cond).exec()
        .then(function (_userIds) {
            //console.log(_userIds);
            _userIds = JSON.parse(JSON.stringify(_userIds));
            console.log(_userIds[0], _userIds[1]);
            //按时间从小到大排序
            _userIds.sort();
            console.log(_userIds[0], _userIds[1]);
            if (_user_id_begin) {
                begin_index = _userIds.indexOf(_user_id_begin);
                console.log('begin_index:', begin_index);
                _userIds = _userIds.slice(begin_index);
            }
            //计算总消耗
            //计算当前消耗
            async.whilst(
                function () {
                    return _userIds.length > 0;
                },
                function (callback) {
                    var _userId = _userIds.shift();
                    console.log('current user id:', _userId);
                    var trades = [];
                    var nowTS = Date.now();
                    var match = {
                        userId: _userId + '',
                        isDeleted: false,
                        cost: {$gt: 0}
                    };
                    var group = {
                        _id: 'totalCost',
                        totalCost: {$sum: '$cost'}
                    }
                    var totalCost = 0;
                    var currentCost = 0;
                    var membership_old = null;
                    console.log(match, group);
                    return Membership.aggregate([
                        {$match: match},
                        {$group: group}
                    ]).exec()
                        .then(function (_res) {
                            console.log('_res:', _res);
                            totalCost = _res && _res[0] && _res[0].totalCost || 0;
                            return Membership.findOne({
                                userId: _userId,
                                cardNo: card_no_old
                            }).exec();
                        })
                        .then(function (_membership_old) {
                            console.log(_membership_old);
                            membership_old = _membership_old || null;
                            var match_trade = {
                                userId: _userId + '',
                                type: {$in: ['coupon', 'rebate']}
                            }
                            var group_trade = {
                                _id: 'currentCost',
                                currentCost: {$sum: '$value'}
                            }
                            return MembershipTrade.aggregate([
                                {$match: match_trade},
                                {$group: group_trade}
                            ]).exec();
                        })
                        .then(function (_res) {
                            console.log('_res2:', _res);
                            currentCost = _res && _res[0] && _res[0].currentCost || 0;
                            var rest_cost = commonUtil.getNumsPlusResult([totalCost, -currentCost], 10);
                            console.log('rest_cost:', rest_cost);
                            if (rest_cost <= 0) {
                                return;
                            }
                            var _trade = {
                                userId: _userId,
                                type: 'old',
                                value: rest_cost,
                                memberships: [{
                                    membershipId: membership_old._id + '',
                                    value: rest_cost,
                                    cardNo: card_no_old
                                }],
                                createdAt: membership_old.createdAt + 1,
                                updatedAt: oldTS
                            };
                            return MembershipTrade.create(_trade);
                        })
                        .then(function () {
                            callback();
                        }, function (err) {
                            console.log('err:', err);
                        })
                },
                function () {
                    console.log('all has completed');
                }
            );
        })
}

/**
 * 查询消息通知列表
 * @param req
 * @param res
 */

OperationController.prototype.getNotificationList = function (req, res) {
    var type = req.query.type;
    var pageNum = req.query.pageNum || 0;
    var pageSize = req.query.pageSize || 20;

    var cond = {isDeleted: false};

    if (type) {
        cond.type = type;
    }
    var pageSlice = commonUtil.getCurrentPageSlice(req, pageNum, pageSize, {updatedAt: -1});

    console.log('pageSlice', pageSlice);
    NotificationService.getNotificationList(cond, '', pageSlice)
        .then(function (_n) {
            _n = JSON.parse(JSON.stringify(_n));
            for (var i = 0; i < _n.length; i++) {
                switch (_n[i].type) {
                    case '1':
                        _n[i].typeName = '消息通知';
                        break;
                    case '2':
                        _n[i].typeName = '文章推送';
                        break;
                    case '3':
                        _n[i].typeName = '商品推送';
                        break;
                    case '4':
                        _n[i].typeName = '搜索推送';
                        break;
                }
                _n[i].areaShow = '';
                for (var j = 0; j < _n[i].area.length; j++) {
                    if (j < 1) {
                        _n[i].areaShow += _n[i].area[j];
                    } else if (j < 2) {
                        _n[i].areaShow += '、' + _n[i].area[j];
                    } else {
                        _n[i].areaShow += '...';
                        break;
                    }
                }

                _n[i].tagWeightShow = '';
                if (_n[i] && _n[i].tagWeight) {
                    for (var k = 0; k < _n[i].tagWeight.length; k++) {
                        if (k < 1) {
                            _n[i].tagWeightShow += _n[i].tagWeight[k].title + ' ' + _n[i].tagWeight[k].value;
                        } else if (k < 2) {
                            _n[i].tagWeightShow += ';' + _n[i].tagWeight[k].title + ' ' + _n[i].tagWeight[k].value;
                        } else {
                            _n[i].tagWeightShow += '...';
                            break;
                        }
                    }
                }

                _n[i].tagCodeShow = '';
                if (_n[i] && _n[i].tagCode) {
                    for (var k = 0; k < _n[i].tagCode.length; k++) {
                        if (k < 1) {
                            _n[i].tagCodeShow += _n[i].tagCode[k];
                        } else if (k < 2) {
                            _n[i].tagCodeShow += ';' + _n[i].tagCode[k];
                        } else {
                            _n[i].tagCodeShow += '...';
                            break;
                        }
                    }
                }
            }

            // console.log('得到的数据', _n);
            apiHandler.OK(res, _n);
        }, function (err) {
            apiHandler.OUTER_DEF(res, err);
        });

};
/**
 * 创建消息通知
 * @param req
 * @param res
 */

OperationController.prototype.createNotification = function (req, res) {
    var payload = req.body;
    var field = {
        required: ['type', 'title', 'content', 'isSend'],
        optional: ['link', 'pageId', 'productId', 'subType', 'subTag', 'area', 'tagWeight', 'tagCode']
    };

    var onFailure = function (handler, err) {
        handler(res, err);
    };
    var onSuccess = function (handler, data) {

        var params = {
            type: data.type,
            title: data.title,
            content: data.content,
            isSend: data.isSend
        };
        if (data.link) {
            params.link = data.link;
        }
        if (data.pageId) {
            params.pageId = data.pageId;
        }
        if (data.productId) {
            params.productId = data.productId;
        }
        if (data.subType) {
            params.subType = data.subType;
        }
        if (data.subTag) {
            params.subTag = data.subTag;
        }
        if (data.area) {
            params.area = data.area;
        }
        if (data.tagWeight) {
            params.tagWeight = data.tagWeight;
        }
        if (data.tagCode) {
            params.tagCode = data.tagCode;
        }

        console.log('得到的tagWeight参数', params.tagWeight);
        if (data.type == '1') {
            var reg = /<img.+?src=('|")?([^'"]+)('|")?(?:\s+|>)/img;
            params.pics = [];
            while (tem = reg.exec(data.content)) {
                params.pics.push(tem[2]);
            }
        }


        NotificationService.createNotification(params)
            .then(function (d) {
                pushBossNotification(d);
                apiHandler.OK(res);
            }, function (err) {
                apiHandler.OUTER_DEF(res, err);
            });

    };

    commonUtil.validate(payload, field, onSuccess, onFailure);
};

/**
 * 修改消息通知
 * @param req
 * @param res
 */

OperationController.prototype.modifyNotification = function (req, res) {
    var payload = req.body;
    var field = {
        required: ['_id', 'title', 'content', 'isSend'],
        optional: ['link', 'pageId', 'productId', 'subType', 'subTag', 'area', 'tagWeight', 'tagCode']
    };

    var onFailure = function (handler, err) {
        handler(res, err);
    };
    var onSuccess;
    onSuccess = function (handler, data) {

        var params = {
            title: data.title,
            content: data.content,
            isSend: data.isSend
        };
        if (data.link) {
            params.link = data.link;
        }
        if (data.pageId) {
            params.pageId = data.pageId;
        }
        if (data.productId) {
            params.productId = data.productId;
        }
        if (data.subType) {
            params.subType = data.subType;
        }
        if (data.subTag) {
            params.subTag = data.subTag;
        }
        if (data.area) {
            params.area = data.area;
        }
        if (data.tagWeight) {
            params.tagWeight = data.tagWeight;
        }
        if (data.tagCode) {
            params.tagCode = data.tagCode;
        }

        NotificationService.updNotificationById(data._id, params)
            .then(function (d) {
                pushBossNotification(d);
                apiHandler.OK(res);
            }, function (err) {
                apiHandler.OUTER_DEF(res, err);
            });

    };

    commonUtil.validate(payload, field, onSuccess, onFailure);
};
//不选择地区不推送
var pushBossNotification = function (data) {
    //发送通知
    if (data.isSend && (data.area.length > 0)) {
        var notificationExtras = {
            type: 4,//推送按照type
            contentType: 'notificationCenter',//透传按照contentType
            notificationBody: {
                type: data.type,//type:1-消息通知   2-文章推送 3-商品推送 4-搜索推送  （1-商品类  2-文章类） 5-跳转到消息中心（药品补贴-进度通知 和 提现进度通知）
                messageId: data._id,//消息ID
                title: data.title,//标题
                content: data.content,//内容
                link: data.link || '',//消息链接地址
                pageId: data.pageId || '',//文章ID
                productId: data.productId || '',//商品ID
                subType: data.subType || '',//4-搜索推送  （1-商品类  2-文章类）
                subTag: data.subTag || ''//搜索标签
            }
        };

        // var payload = [{'keyword': '感冒', 'weight': 0.1}, {'keyword': '儿童', 'weight': 0.1}];
        var cond = [];
        for (var i = 0; i < data.tagWeight.length; i++) {
            cond.push({keyword: data.tagWeight[i].title, weight: Number(data.tagWeight[i].value)});
        }
        console.log('拿到的权重信息', cond, cond.length > 0);
        var pushIds;
        var conditions = {
            pushId: {
                $exists: true,
                $ne: ''
            }
        };
        if (cond.length > 0) {
            proxy.get_user_identifier_with_keywords(cond)
                .then(function (err, result) {
                    if (err) {
                        console.log('推送请求接口错误', err);
                    } else {
                        console.log('拿到的用户ID', result);

                        var userIds = result;
                        if (userIds) {
                            conditions._id = {$in: userIds};
                        }

                        var locArea = _.indexOf(data.area, '全部城市');
                        if (locArea == -1) {
                            conditions["location.city"] = {$in: data.area};
                        }
                        if (data.tagCode.length > 0) {
                            conditions['tagCode'] = {$in: data.tagCode};
                        }

                        CustomerService.findUserList(conditions)
                            .then(function (_u) {
                                if (_u) {
                                    var uIds = [];
                                    var pushIds = _.map(_u, function (item) {
                                        if (item && item.pushId) {
                                            uIds.push(_u._id + "");
                                            return item.pushId;
                                        }
                                    });
                                    pushToUser(pushIds, data, notificationExtras);
                                    MessageCenterService.addMessageCenterToUser(uIds, data, data._id);
                                }
                            });
                    }
                });
        } else {
            if (data.tagCode.length > 0) {
                conditions['tagCode'] = {$in: data.tagCode};
            }
            if ((data.area.length > 0) && (_.indexOf(data.area, '全部城市') == -1)) {//推给具体城市
                conditions["location.city"] = {$in: data.area};
            }

            if (data.area.length > 0) {
                if ((_.indexOf(data.area, '全部城市') > -1) && (data.tagCode.length == 0)) {
                    pushIds = 'all';
                }

                if (pushIds != 'all') {
                    console.log('查询条件', conditions);
                    CustomerService.findUserList(conditions)
                        .then(function (_u) {
                            if (_u) {
                                console.log('查到的用户', _u.length);
                                var pushIds = _.map(_u, function (item) {
                                    if (item && item.pushId) {
                                        return item.pushId;
                                    }
                                });

                                console.log('查到的用户pushId', pushIds);
                                pushToUser(pushIds, data, notificationExtras);
                            }
                        });

                } else {
                    pushToUser(pushIds, data, notificationExtras);
                }
            }
        }
    }
};

var pushToUser = function (pushIds, data, notificationExtras) {
    console.log('查询的pushIds', pushIds);
    if (serverConfigs.env) {//正式环境
        console.log('pro', pushIds.length);
    } else {
        console.log('dev', pushIds.length);
        if(!(data.type == "5" || data.type == "6")){
            pushIds = '1517bfd3f7fd885dfe2,190e35f7e07ffbfb13f,161a3797c83cda1784e,101d8559097f9b0a6c3,160a3797c83ea314a40,13165ffa4e367f669ca,1517bfd3f7f8a417c17,1a0018970a9cf5c5512,1104a897929ccd9451e,190e35f7e070ed8c10a,1a1018970a9ae2cbdc0,191e35f7e079ed7c359,1a1018970a9ae23cdb2';
        }
    }
    console.log('推动ID',pushIds);


    if (data.type == '1' || data.type == "5" || data.type == "6") {//消息中心的信息，添加一个透传(ios和android都收到透传)
        JPushService.pushMessage(pushIds, data.title, '', notificationExtras);
    } else {//其它情况android发透传，ios不发
        JPushService.pushMessage(pushIds, data.title, '', notificationExtras, 'android');
    }
    // setTimeout(function () {
    //     consoole.log('延迟推送');
        JPushService.pushNotification(pushIds, data.title, '', notificationExtras, 'ios');
    // },500);

};
/**
 * 对int类型数据的格式化处理
 规则：
 4    4
 4.1  4.10（只有1位小数的时候补齐）
 4.11 4.11
 * @param num
 * @returns {*}
 */
function returnFloat(value){
    var value=Math.round(parseFloat(value)*100)/100;
    var xsd=value.toString().split(".");
    if(xsd.length==1){
        // value=value.toString()+".00";
        return value;
    }
    if(xsd.length>1){
        if(xsd[1].length<2){
            value=value.toString()+"0";
        }
        return value;
    }
}
/**
 * 删除消息通知
 * @param req
 * @param res
 */

OperationController.prototype.delNotification = function (req, res) {
    var id = req.query.id;

    if (!id) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
    }

    NotificationService.delNotificationById(id)
        .then(function (d) {
            apiHandler.OK(res);
        }, function (err) {
            apiHandler.OUTER_DEF(res, err);
        });

};

OperationController.prototype.getCityList = function (req, res) {
    CustomerService.getCityList()
        .then(function (_c) {
            console.log('所有城市', _c);
            var loc = _.indexOf(_c, '');
            console.log('loc', loc);
            if (loc > -1) {
                _c.splice(loc, 1);
            }

            apiHandler.OK(res, _c);
        }, function (err) {
            apiHandler.OUTER_DEF(res, err);
        });

};

OperationController.prototype.getPurchaseList = function (req, res) {
    var phoneNum = req.query.phoneNum;
    var pageNum = req.query.pageNum || 0;
    var pageSize = req.query.pageSize || 20;

    var cond = {isDeleted: false};

    if (phoneNum) {
        cond.phoneNum = phoneNum;
    } else {
        cond["vipMembershipPurchase.updatedAt"] = {$exists: true};
    }

    var pageSlice = commonUtil.getCurrentPageSlice(req, pageNum, pageSize, {"vipMembershipPurchase.updatedAt": -1});


    CustomerService.findUserList(cond, pageSlice, 'phoneNum name vipMembershipPurchase')
        .then(function (_c) {

            console.log('查询得到的数据', _c);
            apiHandler.OK(res, _c);
        }, function (err) {
            apiHandler.OUTER_DEF(res, err);
        });

};


OperationController.prototype.modifyPurchase = function (req, res) {
    var payload = req.body;
    var field = {
        required: ['phoneNum', 'limit'],
        optional: []
    };

    var onFailure = function (handler, err) {
        handler(res, err);
    };
    var onSuccess;
    onSuccess = function (handler, data) {
        CustomerService.updateBaseInfoByPhoneNum(data.phoneNum, {
            "vipMembershipPurchase.limit": data.limit,
            "vipMembershipPurchase.updatedAt": Date.now()
        }).then(function () {
            apiHandler.OK(res);
        }, function (err) {
            apiHandler.OUTER_DEF(res, err);
        });

    };

    commonUtil.validate(payload, field, onSuccess, onFailure);
};


OperationController.prototype.getTagGroupList = function (req, res) {
    var pageNum = Number(req.query.pageNum || 0);
    var pageSize = Number(req.query.pageSize || 20);

    var params = {page_size: pageSize, page_num: pageNum};//page_size,page_num,group_id,group_title

    if (req.query.id) {
        params.group_id = Number(req.query.id);
    }

    if (req.query.title) {
        params.group_title = req.query.title;
    }


    console.log('参数', params);
    proxy.get_keywordgroups(params).then(function (err, result) {
        if (err) apiHandler.handleErr(res, err);
        console.log('标签组列表', err);
        if (result) {
            result = JSON.parse(JSON.stringify(result));
            var retData = [], weight = {};
            for (var i = 0; i < result.length; i++) {
                retData[i] = {};
                retData[i].id = result[i].id;
                retData[i].title = result[i].title;
                retData[i].remark = result[i].memo;
                retData[i].weight = [];
                // result[i].keywords=JSON.parse(JSON.stringify(result[i].keywords));
                // weight =
                for (var key in result[i].keywords) {
                    retData[i].weight.push({tag: key, value: result[i].keywords[key]});
                }
                retData[i].createdAt = ZlycareController.formatUTCTime(result[i].created);
            }

            apiHandler.OK(res, retData);
        }
    });
};

/**
 * @param req
 * @param res
 */
OperationController.prototype.addTagGroup = function (req, res) {
    var payload = req.body;
    var field = {
        required: ['title'],
        optional: ['remark', 'tagWeight']
    };

    var onFailure = function (handler, err) {
        handler(res, err);
    };
    var onSuccess = function (handler, data) {

        console.log('添加权重名称和值', data.tagWeight);
        var remark = data.remark || '', tagWeightArr = data.tagWeight || [], tagWeight = {};
        for (var i = 0; i < tagWeightArr.length; i++) {
            tagWeight[tagWeightArr[i].tag] = tagWeightArr[i].value;
        }
        console.log('tagWeight', tagWeight);
        //不支持备注添加
        proxy.upsert_keywordgroup(data.title, tagWeight, remark).then(function (err, result) {
            // proxy.upsert_keywordgroup(data.title, tagWeight).then(function (err, result) {
            if (err) apiHandler.handleErr(res, err);
            console.log('resultresult', result);//返回标签的全部信息
            if (result) {
                apiHandler.OK(res);
            }
        });

    };

    commonUtil.validate(payload, field, onSuccess, onFailure);
};


OperationController.prototype.modifyTagGroup = function (req, res) {
    var payload = req.body;
    var field = {
        required: ['title'],
        optional: ['remark', 'tagWeight']
    };

    var onFailure = function (handler, err) {
        handler(res, err);
    };
    var onSuccess = function (handler, data) {

        var remark = data.remark || '', tagWeight = data.tagWeight || [];
        proxy.upsert_keywordgroup(data.title, remark, tagWeight).then(function (err, result) {
            if (err) apiHandler.handleErr(res, err);
            console.log('resultresult', result);//返回标签的全部信息
            apiHandler.OK(res);
        });

    };

    commonUtil.validate(payload, field, onSuccess, onFailure);
};


OperationController.prototype.delTagGroup = function (req, res) {
    var id = req.query.id;

    if (!id) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
    }

    id = Number(id);
    proxy.remove_keywordgroup(id).then(function (err, result) {
        if (err) apiHandler.handleErr(res, err);
        console.log('删除返回', result);//返回标签的全部信息

        apiHandler.OK(res);

    });

};


OperationController.prototype.getTagUserList = function (req, res) {
    var pageNum = Number(req.query.pageNum || 0);
    var pageSize = Number(req.query.pageSize || 20);

    var pageSlice = commonUtil.getCurrentPageSlice(req, pageNum, pageSize, {updatedAt: -1});
    var params = {tagGroup: {$exists: true}};
    if (req.query.id) {
        params['tagGroup.id'] = Number(req.query.id);
    }

    if (req.query.title) {
        params['tagGroup.title'] = req.query.title;
    }
    if (req.query.tagCode) {
        params['tagCode'] = req.query.tagCode;
    }

    console.log('wefffff', typeof  params.tagCode);
    var retData = [];
    CustomerService.findUserList(params, pageSlice, 'name createdAt tagGroup phoneNum tagCode')
        .then(function (_user) {

            // var tagGroupLength;
            // for (var i = 0; i < _user.length; i++) {
            //     tagGroupLength = _user[i].tagGroup.length - 1;
            //     if (_user[i].tagGroup[tagGroupLength] && _user[i].tagGroup[tagGroupLength].id) {
            //         retData.push({
            //             id: _user[i].tagGroup[tagGroupLength].id, title: _user[i].tagGroup[tagGroupLength].title,
            //             phoneNum: _user[i].phoneNum, name: _user[i].name, createdAt: _user[i].createdAt,
            //             tagCode: _user[i].tagCode || ''
            //         });
            //     }
            // }
            console.log('得到的用户信息', _user);
            apiHandler.OK(res, _user);
        }, function (err) {
            apiHandler.OUTER_DEF(res, err);
        });
};


OperationController.prototype.addTagCode = function (req, res) {
    var payload = req.body;
    var field = {
        required: ['title', 'area'],
        optional: ['remark', 'contactName', 'contactPhoneNum', 'drugs']
    };
    // drugs:[{factoryCode:String,factoryName:String,drugId:String,drugName:String}],//厂家code，厂家名称，药品ID，药品名称

    var onFailure = function (handler, err) {
        handler(res, err);
    };
    var onSuccess = function (handler, data) {
        TagCodeService.genTagCode(999999, 100000)
            .then(function (tagCode) {
                console.log('渠道码', tagCode);
                if (tagCode) {
                    var tagCode = {
                        code: tagCode,
                        title: data.title,
                        area: data.area || [],
                        remark: data.remark || '',
                        contactName: data.contactName || '',
                        contactPhoneNum: data.contactPhoneNum || '',
                        // drugs: data.drugs || []
                    };

                    var drugs = [];
                    data.drugs.forEach(function (item) {
                        var loc = _.indexOf(item.factoryName, '-');
                        var code = item.factoryName.substr(0, loc);
                        var name = item.factoryName.substr(loc + 1, item.factoryName.length - 1);

                        drugs.push({
                            factoryCode: code,
                            factoryName: name,
                            drugId: item.drugId,
                            drugName: item.drugName
                        });
                    });

                    console.log('得到的bugTag数据', data.drugs);


                    tagCode.drugs = drugs;

                    console.log('得到的bugTag数据', tagCode.drugs);
                    return TagCodeService.createTagCode(tagCode);
                } else {
                    return false;
                }
            })
            .then(function (_code) {
                apiHandler.OK(res, _code);
            }, function (err) {
                apiHandler.OUTER_DEF(res, err);
            });
    };

    commonUtil.validate(payload, field, onSuccess, onFailure);
};

OperationController.prototype.modifyTagCode = function (req, res) {
    var payload = req.body;
    var field = {
        required: ['id'],
        optional: ['remark', 'contactName', 'contactPhoneNum', 'drugs']
    };

    var onFailure = function (handler, err) {
        handler(res, err);
    };
    var onSuccess = function (handler, data) {
        var updates = {};
        if (data.remark) {
            updates.remark = data.remark;
        }
        if (data.contactName) {
            updates.contactName = data.contactName;
        }
        if (data.contactPhoneNum) {
            updates.contactPhoneNum = data.contactPhoneNum;
        }
        console.log('参数', data.drugs);
        // if (data.drugs && data.drugs.length > 0) {

        var drugs = [];
        data.drugs.forEach(function (item) {
            var loc = _.indexOf(item.factoryName, '-');
            var code = item.factoryName.substr(0, loc);
            var name = item.factoryName.substr(loc + 1, item.factoryName.length - 1);

            drugs.push({factoryCode: code, factoryName: name, drugId: item.drugId, drugName: item.drugName});
        });
        updates.drugs = drugs;
        // }

        TagCodeService.updateTagCode({_id: data.id}, updates)
            .then(function () {
                apiHandler.OK(res);
            }, function (err) {
                apiHandler.OUTER_DEF(res, err);
            });
    };

    commonUtil.validate(payload, field, onSuccess, onFailure);
};
OperationController.prototype.getTagCodeList = function (req, res) {
    var pageNum = Number(req.query.pageNum || 0);
    var pageSize = Number(req.query.pageSize || 20);

    var pageSlice = commonUtil.getCurrentPageSlice(req, pageNum, pageSize, {createdAt: -1});
    var params = {};
    if (req.query.code) {
        params.code = Number(req.query.code);
    }

    if (req.query.title) {
        params.title = req.query.title;
    }


    console.log('参数', params);
    TagCodeService.getTagCode(params, pageSlice)
        .then(function (_tag) {
            _tag = JSON.parse(JSON.stringify(_tag));
            for (var i = 0; i < _tag.length; i++) {
                _tag[i].drugsShow = '';
                for (var j = 0; j < _tag[i].drugs.length; j++) {
                    if (j == 0) {
                        _tag[i].drugsShow += _tag[i].drugs[j].drugName;
                    } else if (j < 3) {
                        _tag[i].drugsShow = _tag[i].drugsShow + '、' + _tag[i].drugs[j].drugName;
                    } else if (j == 3) {
                        _tag[i].drugsShow += '...';
                    } else {
                        break;
                    }

                }
            }
            apiHandler.OK(res, _tag);
        }, function (err) {
            apiHandler.OUTER_DEF(res, err);
        });
};


OperationController.prototype.delTagCode = function (req, res) {
    var id = req.query.id;

    if (!id) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
    }

    TagCodeService.deleteTagCode(id)
        .then(function (_tag) {

            apiHandler.OK(res);
        }, function (err) {
            apiHandler.OUTER_DEF(res, err);
        });

};


/**
 * @param req
 * @param res
 */
OperationController.prototype.getTagUserInfo = function (req, res) {
    var phoneNum = req.query.phoneNum;

    if (!phoneNum) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(3001));
    }

    CustomerService.getInfoByPhone(phoneNum)
        .then(function (_u) {
            if (!_u) {
                console.log('用户信息不存在');
                apiHandler.OUTER_DEF(res, ErrorHandler.getBusinessErrorByCode(1503));
            }
            console.log('用户信息', _u._id, _u);
            proxy.get_persona_with_user_identifier(_u._id)
                .then(function (err, result) {
                    if (err) apiHandler.handleErr(res, err);
                    console.log('resultresult', result);//返回标签的全部信息
                    if (result) {
                        var retData = {_id: _u._id, name: _u.name, tagWeight: result};
                        apiHandler.OK(res, retData);
                    }
                });

        }, function (err) {
            apiHandler.OUTER_DEF(res, err);
        });


};

// var params={userId: $scope.query.id,tagWeight:$scope.tagUserInfo};
OperationController.prototype.modifyTagUserInfo = function (req, res) {
    var payload = req.body;
    var field = {
        required: ['userId', 'tagWeight'],
        optional: []
    };

    var onFailure = function (handler, err) {
        handler(res, err);
    };
    var onSuccess;
    onSuccess = function (handler, data) {

        console.log('ddd', data.userId);

        var tagWeight = [];
        data.tagWeight.forEach(function (item) {
            tagWeight.push({title: item.title, weight: item.weight});
        });
        console.log('ddd', tagWeight);
        proxy.reset_persona(data.userId, tagWeight)
            .then(function (err, result) {
                if (err) apiHandler.handleErr(res, err);
                console.log('resultresult', result, err);//返回标签的全部信息
                if (result) {

                    apiHandler.OK(res, result);
                }
            });
    };

    commonUtil.validate(payload, field, onSuccess, onFailure);
};

/**
 * 分批推送
 * @param req
 * @param res
 */
// OperationController.prototype.testPush = function (req, res) {
//     CustomerService.testCustomerCount({pushId: {
//         "$ne": '',
//         $exists: true
//     }})
//         .then(function (_c) {
//             console.log('总数', _c);
//             var pageCount = _c / 50000;
//             var page = -1;
//
//             async.whilst(
//                 function () {
//                     page++;
//                     return page < pageCount;
//                 },
//                 function (callback) {
//
//                     console.log('总页数', pageCount, page);
//                     CustomerService.testBalanceCount({
//                         pushId: {
//                             "$ne": '',
//                             $exists: true
//                         }
//                     }, page * 50000, 50000).then(function (_u) {
//                         console.log('数量', _u.length);
//                         callback();
//                     }, function (err) {
//                         console.log('err:', err);
//                         callback();
//
//                     });
//                 },
//                 function (err) {
//                     console.log('ewdwfewfe:', err);
//
//                 }
//             );
//         });
// };


OperationController.prototype.addFactory = function (req, res) {
    var payload = req.body;
    var field = {
        required: ['name'],
        optional: ['chargerName', 'phoneNum']
    };

    var onFailure = function (handler, err) {
        handler(res, err);
    };
    var onSuccess = function (handler, data) {
        FactoryService.genFactoryCode(999999, 100000)
            .then(function (factoryCode) {
                console.log('厂家code', factoryCode);
                if (factoryCode) {
                    return FactoryService.createFactory({
                        code: factoryCode,
                        name: data.name,
                        chargerName: data.chargerName,
                        phoneNum: data.phoneNum
                    });
                } else {
                    return false;
                }
            })
            .then(function (_factory) {
                apiHandler.OK(res, _factory);
                if (_factory) {
                    proxy.create_factory_user(_factory.code, _factory.name)
                        .then(function (err, result) {
                            console.log('厂家cms返回值', result);
                            FactoryService.updateFactory({code: _factory.code}, {cmsUserName: result.cms_username})
                        });
                }
            }, function (err) {
                apiHandler.OUTER_DEF(res, err);
            });
    };

    commonUtil.validate(payload, field, onSuccess, onFailure);
};


OperationController.prototype.getFactoryCodeNameList = function (req, res) {

    FactoryService.getFactory({}, 'code name')
        .then(function (_f) {

            var retData = [];
            _f.forEach(function (item) {
                if (item.code && item.name) {
                    retData.push(item.code + '-' + item.name);
                }
            });
            apiHandler.OK(res, retData);
        }, function (err) {
            apiHandler.OUTER_DEF(res, err);
        });
};
OperationController.prototype.getFactoryList = function (req, res) {
    var pageNum = Number(req.query.pageNum || 0);
    var pageSize = Number(req.query.pageSize || 20);

    var pageSlice = commonUtil.getCurrentPageSlice(req, pageNum, pageSize, {createdAt: -1});
    var params = {};

    if (req.query.name) {
        params.name = req.query.name;
    }


    console.log('参数', params);
    FactoryService.getFactory(params, '', pageSlice)
        .then(function (_tag) {

            console.log('fwefewf', _tag);
            apiHandler.OK(res, _tag);
        }, function (err) {
            apiHandler.OUTER_DEF(res, err);
        });
};

OperationController.prototype.modifyFactory = function (req, res) {
    var payload = req.body;
    var field = {
        required: ['id'],
        optional: ['chargerName', 'phoneNum']
    };

    var onFailure = function (handler, err) {
        handler(res, err);
    };
    var onSuccess;
    onSuccess = function (handler, data) {

        var params = {_id: data.id};
        var updates = {};

        updates.chargerName = data.chargerName;
        updates.phoneNum = data.phoneNum;

        FactoryService.updateFactory(params, updates)
            .then(function (_tag) {

                console.log('fwefewf', _tag);
                apiHandler.OK(res);
            }, function (err) {
                apiHandler.OUTER_DEF(res, err);
            });
    };

    commonUtil.validate(payload, field, onSuccess, onFailure);
};

OperationController.prototype.addFactoryRecharge = function (req, res) {
    var payload = req.body;
    var field = {
        required: ['name', 'price'],
        optional: []
    };

    var onFailure = function (handler, err) {
        handler(res, err);
    };
    var onSuccess = function (handler, data) {
        var loc = _.indexOf(data.name, '-');
        var code = data.name.substr(0, loc);
        var name = data.name.substr(loc + 1, data.name.length - 1);
        console.log('code', code);
        console.log('name', name);
        var retData;
        FactoryRechargeService.createFactoryRecharge({factoryCode: code, factoryName: name, price: data.price})
            .then(function (_factoryRecharge) {

                retData = _factoryRecharge;
                return FactoryService.updateFactory({code: code}, {
                    $inc: {
                        totalVal: data.price,
                        unFrozenVal: data.price
                    }
                });
            })
            .then(function () {

                apiHandler.OK(res, retData);
                LoggerService.trace(LoggerService.getTraceDataByReq(req));
            }, function (err) {
                apiHandler.OUTER_DEF(res, err);
            });
    };

    commonUtil.validate(payload, field, onSuccess, onFailure);
};


OperationController.prototype.getFactoryRechargeList = function (req, res) {
    var pageNum = Number(req.query.pageNum || 0);
    var pageSize = Number(req.query.pageSize || 20);

    var pageSlice = commonUtil.getCurrentPageSlice(req, pageNum, pageSize, {createdAt: -1});
    var params = {};

    if (req.query.name) {
        params.factoryName = req.query.name;
    }


    console.log('参数', params);
    FactoryRechargeService.getFactoryRecharge(params, '', pageSlice)
        .then(function (_f) {

            apiHandler.OK(res, _f);
        }, function (err) {
            apiHandler.OUTER_DEF(res, err);
        });
};

OperationController.prototype.getFactoryValueList = function (req, res) {
    var pageNum = Number(req.query.pageNum || 0);
    var pageSize = Number(req.query.pageSize || 20);

    var pageSlice = commonUtil.getCurrentPageSlice(req, pageNum, pageSize, {createdAt: -1});
    var params = {totalVal: {$gt: 0}};

    if (req.query.name) {
        params.name = req.query.name;
    }


    console.log('参数', params);
    var retData;
    FactoryService.getFactory(params, '', pageSlice)
        .then(function (_f) {
            retData = JSON.parse(JSON.stringify(_f));
            var currentIndex = -1;
            async.whilst(
                function () {
                    currentIndex++;
                    return currentIndex < retData.length;
                },
                function (callback) {
                    FactoryDrugRelService.getFactoryDrugRel({factoryCode: retData[currentIndex].code, stopPlan: false})
                        .then(function (_fdr) {
                            console.log('wefewfew', _fdr);
                            retData[currentIndex].frozenVal = 0;
                            _fdr.forEach(function (item) {

                                retData[currentIndex].frozenVal += item.planVal;//已冻结金额（会员计划中的计划金额）
                            });
                            callback();
                        });

                },
                function (err, n) {
                    console.log('厂家充值金额', retData);

                    for (var i = 0; i < retData.length; i++) {

                        retData[i].unFrozenVal = (Math.floor((retData[i].unFrozenVal) * 100) / 100).toFixed(2);
                    }
                    apiHandler.OK(res, retData);
                }
            );

        }, function (err) {
            apiHandler.OUTER_DEF(res, err);
        });
};


OperationController.prototype.addDrug = function (req, res) {
    var payload = req.body;
    var field = {
        required: ['factoryName', 'name', 'images', 'packageInfo', 'desc'],
        optional: []
    };

    var onFailure = function (handler, err) {
        handler(res, err);
    };
    var onSuccess = function (handler, data) {
        var loc = _.indexOf(data.factoryName, '-');
        var factoryCode = data.factoryName.substr(0, loc);
        var factoryName = data.factoryName.substr(loc + 1, data.factoryName.length - 1);
        console.log('code', factoryCode);
        console.log('name', factoryName);
        DrugService.createDrug({
            factoryCode: factoryCode,
            factoryName: factoryName,
            name: data.name,
            images: data.images,
            packageInfo: data.packageInfo,
            desc: data.desc
        })
            .then(function (_d) {

                apiHandler.OK(res, _d);
            }, function (err) {
                apiHandler.OUTER_DEF(res, err);
            });
    };

    commonUtil.validate(payload, field, onSuccess, onFailure);
};

OperationController.prototype.modifyDrug = function (req, res) {
    var payload = req.body;
    var field = {
        required: ['id'],
        optional: ['images', 'packageInfo', 'desc']
    };

    var onFailure = function (handler, err) {
        handler(res, err);
    };
    var onSuccess;
    onSuccess = function (handler, data) {

        // var loc = _.indexOf(data.factoryName, '-');
        // var factoryCode = data.factoryName.substr(0, loc);
        // var factoryName = data.factoryName.substr(loc + 1, data.factoryName.length - 1);
        // console.log('code', factoryCode);
        // console.log('name', factoryName);
        var params = {_id: data.id};
        var updates = {};
        if (data.images) {
            updates.images = data.images;
        }
        if (data.packageInfo) {
            updates.packageInfo = data.packageInfo;
        }
        if (data.desc) {
            updates.desc = data.desc;
        }
        DrugService.updateDrug(params, updates)
            .then(function (_d) {

                console.log('fwefewf', _d);
                apiHandler.OK(res);
            }, function (err) {
                apiHandler.OUTER_DEF(res, err);
            });
    };

    commonUtil.validate(payload, field, onSuccess, onFailure);
};


OperationController.prototype.getDrugList = function (req, res) {
    var pageNum = Number(req.query.pageNum || 0);
    var pageSize = Number(req.query.pageSize || 20);

    var pageSlice = commonUtil.getCurrentPageSlice(req, pageNum, pageSize, {createdAt: -1});
    var params = {};

    if (req.query.factoryName) {
        params.factoryName = req.query.factoryName;
    }
    if (req.query.name) {
        params.name = req.query.name;
    }


    console.log('参数', params);
    DrugService.getDrug(params, '', pageSlice)
        .then(function (_d) {

            console.log('——d', _d);
            apiHandler.OK(res, _d);
        }, function (err) {
            apiHandler.OUTER_DEF(res, err);
        });
};

OperationController.prototype.getDrugListByFactoryCode = function (req, res) {

    var params = {};

    if (req.query.factoryCode) {
        params.factoryCode = req.query.factoryCode;
    }


    console.log('参数', params);
    DrugService.getDrug(params, '')
        .then(function (_d) {

            console.log('——d', _d);
            apiHandler.OK(res, _d);
        }, function (err) {
            apiHandler.OUTER_DEF(res, err);
        });
};


OperationController.prototype.addFactoryDrugRel = function (req, res) {
    var payload = req.body;
    var field = {
        required: ['factoryName', 'planName', 'planVal', 'area', 'drugId', 'drugName', 'normalCount', 'leastCount', 'maxCount', 'memberCount'],
        optional: ['remark']
    };

    var onFailure = function (handler, err) {
        handler(res, err);
    };
    var onSuccess = function (handler, data) {
        var loc = _.indexOf(data.factoryName, '-');
        var factoryCode = data.factoryName.substr(0, loc);
        var factoryName = data.factoryName.substr(loc + 1, data.factoryName.length - 1);
        console.log('code', factoryCode);
        console.log('name', factoryName);

        FactoryService.getFactory({code: factoryCode})
            .then(function (_factory) {
                if (!_factory || _factory.length == 0)
                    throw ErrorHandler.getBusinessErrorByCode(2401);

                if (_factory && _factory[0] && (_factory[0].unFrozenVal < data.planVal))
                    throw ErrorHandler.getBusinessErrorByCode(2402);

                if (data.normalCount > data.maxCount)
                    throw ErrorHandler.getBusinessErrorByCode(2403);//补贴数量高于最大值，请减少申请数量

                if (data.normalCount < data.leastCount)
                    throw ErrorHandler.getBusinessErrorByCode(2404);

                if (data.leastCount > data.maxCount)
                    throw ErrorHandler.getBusinessErrorByCode(2418);


                if ((Math.floor((data.planVal / data.normalCount / data.memberCount) * 100) / 100).toFixed(2) < 0.01) {
                    throw ErrorHandler.getBusinessErrorByCode(2417);
                }

                if (_factory.unFrozenVal < data.planVal)
                    throw ErrorHandler.getBusinessErrorByCode(2407);

                //可补贴最大数量太高时，提交时做判断：提示文案比如:可补贴最大数量应该小于100
                if (data.maxCount > data.normalCount * data.memberCount) {
                    var err = ErrorHandler.getBusinessErrorByCode(2422);
                    err.message += data.normalCount * data.memberCount;
                    throw err;
                }

                return FactoryDrugRelService.getFactoryDrugRel({//每个厂家每个药品只能添加一个计划，除非已有计划被取消
                    factoryCode: factoryCode,
                    drugId: data.drugId,
                    stopPlan: false
                });
            })
            .then(function (_already) {
                console.log('已经存在的计划', _already);
                if (_already.length > 0) {
                    throw ErrorHandler.getBusinessErrorByCode(2408);
                }

                return FactoryService.updateFactory({code: factoryCode}, {$inc: {unFrozenVal: -data.planVal}});//消耗掉未冻结金额
            })
            .then(function () {
                var factoryDrugRel = {
                    factoryCode: factoryCode,
                    factoryName: factoryName,
                    planName: data.planName,
                    planVal: data.planVal,
                    balanceVal: data.planVal,
                    area: data.area,
                    drugId: data.drugId,
                    drugName: data.drugName,
                    normalCount: data.normalCount,
                    leastCount: data.leastCount,
                    maxCount: data.maxCount,
                    memberCount: data.memberCount,
                    reimbursePrice: (Math.floor((data.planVal / data.normalCount / data.memberCount) * 100) / 100).toFixed(2)
                };
                if (data.remark) {
                    factoryDrugRel.remark = data.remark;
                }
                return FactoryDrugRelService.createFactoryDrugRel(factoryDrugRel);
            })
            .then(function (_f) {
                apiHandler.OK(res, _f);
                LoggerService.trace(LoggerService.getTraceDataByReq(req));
            }, function (err) {
                apiHandler.OUTER_DEF(res, err);
            });
    };

    commonUtil.validate(payload, field, onSuccess, onFailure);
};


OperationController.prototype.modifyFactoryDrugRel = function (req, res) {
    var payload = req.body;
    var field = {
        required: ['id'],
        optional: ['planName', 'planVal', 'area', 'normalCount', 'leastCount', 'maxCount', 'memberCount', 'remark']
    };

    var onFailure = function (handler, err) {
        handler(res, err);
    };
    var onSuccess = function (handler, data) {
        var factoryDrugRel;
        FactoryDrugRelService.getFactoryDrugRel({_id: data.id, stopPlan: false})
            .then(function (_fdr) {
                if (!_fdr || !_fdr[0])
                    throw ErrorHandler.getBusinessErrorByCode(2405);

                factoryDrugRel = _fdr[0];
                var usedPlanVal = factoryDrugRel.planVal - factoryDrugRel.balanceVal;

                if (data.planVal < usedPlanVal)//已消耗的金额<=预算金额
                    throw ErrorHandler.getBusinessErrorByCode(2406);

                return FactoryService.getFactory({code: factoryDrugRel.factoryCode});
            })
            .then(function (_factory) {//预算金额<=厂家未冻结金额+当前计划剩余金额
                if (!_factory || _factory.length == 0)
                    throw ErrorHandler.getBusinessErrorByCode(2401);
                _factory = _factory[0];
                console.log('efefewfew', _factory.unFrozenVal, factoryDrugRel.planVal, (_factory.unFrozenVal + factoryDrugRel.planVal) < data.planVal, data.planVal);
                if ((_factory.unFrozenVal + factoryDrugRel.planVal) < data.planVal)
                    throw ErrorHandler.getBusinessErrorByCode(2407);

                if (data.normalCount > data.maxCount)
                    throw ErrorHandler.getBusinessErrorByCode(2403);//补贴数量高于最大值，请减少申请数量

                if (data.normalCount < data.leastCount)
                    throw ErrorHandler.getBusinessErrorByCode(2404);

                if (data.leastCount > data.maxCount)
                    throw ErrorHandler.getBusinessErrorByCode(2418);

                if ((Math.floor((data.planVal / data.normalCount / data.memberCount) * 100) / 100).toFixed(2) < 0.01) {
                    throw ErrorHandler.getBusinessErrorByCode(2417);
                }

                if (data.maxCount > data.normalCount * data.memberCount) {
                    var err = ErrorHandler.getBusinessErrorByCode(2422);
                    err.message += data.normalCount * data.memberCount;
                    throw err;
                }

                return FactoryService.updateFactory({code: factoryDrugRel.factoryCode}, {$inc: {unFrozenVal: -data.planVal + factoryDrugRel.planVal}});//消耗掉未冻结金额
            })
            .then(function () {

                var updates = {};
                if (data.planName) {
                    updates.planName = data.planName;
                }
                console.log('data.planVal', data.planVal);
                console.log('factoryDrugRel.planVal', factoryDrugRel.planVal);
                if (data.planVal) {
                    updates.planVal = data.planVal;
                    updates.$inc = {balanceVal: data.planVal - factoryDrugRel.planVal};//更新计划剩余金额
                    updates.reimbursePrice = (Math.floor((data.planVal / data.normalCount / data.memberCount) * 100) / 100).toFixed(2);
                }
                if (data.area) {
                    updates.area = data.area;
                }
                if (data.normalCount) {
                    updates.normalCount = data.normalCount;
                }
                if (data.leastCount) {
                    updates.leastCount = data.leastCount;
                }
                if (data.maxCount) {
                    updates.maxCount = data.maxCount;
                }
                if (data.memberCount) {
                    updates.memberCount = data.memberCount;
                }
                if (data.remark) {
                    updates.remark = data.remark;
                }

                return FactoryDrugRelService.updateFactoryDrugRel(data.id, updates);
            })
            .then(function (_fdr) {

                apiHandler.OK(res);
                LoggerService.trace(LoggerService.getTraceDataByReq(req));
            }, function (err) {
                apiHandler.OUTER_DEF(res, err);
            });
    };

    commonUtil.validate(payload, field, onSuccess, onFailure);
};


OperationController.prototype.getFactoryDrugRelList = function (req, res) {
    var pageNum = Number(req.query.pageNum || 0);
    var pageSize = Number(req.query.pageSize || 20);

    var pageSlice = commonUtil.getCurrentPageSlice(req, pageNum, pageSize, {createdAt: -1});
    var params = {};

    if (req.query.factoryName) {
        params.factoryName = req.query.factoryName;
    }


    console.log('参数', params);
    FactoryDrugRelService.getFactoryDrugRel(params, '', pageSlice)
        .then(function (_fdr) {

            _fdr = JSON.parse(JSON.stringify(_fdr));
            // for (var i = 0; i < _fdr.length; i++) {
            //     // _fdr[i].balanceVal = (Math.floor(_fdr[i].balanceVal * 100) / 100).toFixed(2);
            //     var balanceValString=_fdr[i].balanceVal.toString();
            //     var loc=balanceValString.indexOf('.');
            //     var second=balanceValString.substr(loc,2);
            //     var first=balanceValString.substr(0,loc);
            //     _fdr[i].balanceVal = Number(first+second);
            // }

            console.log('会员维护计划列表', _fdr);
            apiHandler.OK(res, _fdr);
        }, function (err) {
            apiHandler.OUTER_DEF(res, err);
        });
};
/*取消计划的时候，剩余未使用的钱，退还到厂家的账户的未冻结金额中
 开启计划的时候，仅修改状态
 */
OperationController.prototype.handleFactoryDrugRePlan = function (req, res) {
    var payload = req.body;
    var field = {
        required: ['id', 'stopPlan'],
        optional: []
    };

    var onFailure = function (handler, err) {
        handler(res, err);
    };
    var onSuccess = function (handler, data) {

        var cond = {_id: data.id}, updates = {};
        if (data.stopPlan == true) {
            cond.stopPlan = false;
            updates.stopPlan = true;
            updates.balanceVal = 0;
        } else if (data.stopPlan == false) {  //不允许取消后再次开启计划
            //cond.stopPlan = true;
            //updates.stopPlan = false;
            return apiHandler.OUTER_DEF(res, ErrorHandler.getBusinessErrorByCode(1801));
        }
        console.log('updates', updates);

        var fdr;
        FactoryDrugRelService.getFactoryDrugRel(cond)
            .then(function (_fdr) {
                if (!_fdr || _fdr.length == 0) {
                    throw ErrorHandler.getBusinessErrorByCode(2405);
                }

                fdr = _fdr[0];
                return FactoryDrugRelService.updateFactoryDrugRelByCond(cond, updates);
            })
            .then(function (_fdr) {
                if (_fdr && data.stopPlan && _fdr.stopPlan) {
                    FactoryService.updateFactory({code: fdr.factoryCode}, {$inc: {unFrozenVal: fdr.balanceVal}});//将计划中未使用的余额退回厂家账户
                }

                apiHandler.OK(res);
                LoggerService.trace(LoggerService.getTraceDataByReq(req));
            }, function (err) {
                apiHandler.OUTER_DEF(res, err);
            });

    };

    commonUtil.validate(payload, field, onSuccess, onFailure);
};


//OperationController.prototype.testDrugReimbursement = function (req, res) {
//    var payload = req.body;
//    var field = {
//        required: ['userId', 'orderId', 'drugName', 'number', 'cash']
//    };
//
//    var onFailure = function (handler, err) {
//        handler(res, err);
//    };
//    var onSuccess = function (handler, data) {
//        TransactionMysqlService.getTransactionByInnerTradeNo(data.orderId + "")
//            .then(function (t) {
//                if (t.length > 0) { //重复报销
//                    throw ErrorHandler.getBusinessErrorByCode(2409);
//                }
//
//                var sql = TransactionMysqlService.genUserDrugReimbursementSql(data.userId + "", data.orderId + "", "药品补贴-" + data.drugName, data.cash, "x" + data.number);
//                return TransactionMysqlService.execSqls(sql);
//            })
//            .then(function (_res) {
//                apiHandler.OK(res);
//            }, function (err) {
//                apiHandler.OUTER_DEF(res, err);
//            });
//    };
//
//    commonUtil.validate(payload, field, onSuccess, onFailure);
//};


OperationController.prototype.getReimburseList = function (req, res) {
    var pageNum = Number(req.query.pageNum || 0);
    var pageSize = Number(req.query.pageSize || 20);

    var pageSlice = commonUtil.getCurrentPageSlice(req, pageNum, pageSize, {createdAt: -1});
    var params = {}, userParams = {};


    if (req.query.name) {
        params.userName = req.query.name;
    }
    if (req.query.phoneNum) {
        params.userPhoneNum = req.query.phoneNum;
    }
    if (req.query.drugName) {
        params.drugName = req.query.drugName;
    }

    if (req.query.checkStatus) {
        params.checkStatus = req.query.checkStatus;
    }

    ReimburseService.getReimburse(params, {}, pageSlice)
        .then(function (_r) {

            var retData = JSON.parse(JSON.stringify(_r));
            for (var i = 0; i < retData.length; i++) {
                retData[i].reimburseImgs1 = retData[i].reimburseImgs.slice(0, 4);
                retData[i].reimburseImgs2 = retData[i].reimburseImgs.slice(4, retData[i].reimburseImgs.length);
                retData[i].drugImgs1 = retData[i].drugImgs.slice(0, 4);
                retData[i].drugImgs2 = retData[i].drugImgs.slice(4, retData[i].drugImgs.length);
                retData[i].reimburseTotal = (Math.floor((retData[i].reimburseCount * retData[i].reimbursePrice) * 100) / 100).toFixed(2);
            }

            console.log('药品申请列表', retData);
            apiHandler.OK(res, retData);
        }, function (err) {
            apiHandler.OUTER_DEF(res, err);
        });
};


OperationController.prototype.handleReimburse = function (req, res) {
    var payload = req.body;
    var field = {
        required: ['id', 'checkStatus'],
        optional: ['remark']
    };

    var onFailure = function (handler, err) {
        handler(res, err);
    };
    var onSuccess = function (handler, data) {
        console.log('参数', data.id, data.checkStatus, data.remark);
        var checkStatus = Number(data.checkStatus || 0);
        var cond = {_id: data.id, checkStatus: 0}, updates = {checkStatus: checkStatus};
        if ((checkStatus == -1) && (!data.remark)) {
            apiHandler.OUTER_DEF(res, ErrorHandler.getBusinessErrorByCode(2415));
        }
        if (data.remark) {
            updates.remark = data.remark;
        }

        var userReimburse, factoryDrugPlan;
        ReimburseService.getReimburse({_id: data.id})
            .then(function (_r) {
                userReimburse = JSON.parse(JSON.stringify(_r[0]));
                console.log('用户退款信息', userReimburse);
                if (checkStatus == 1) {
                    return FactoryDrugRelService.getFactoryDrugRel({
                        factoryCode: userReimburse.factoryCode,
                        drugId: userReimburse.drugId,
                        stopPlan: false
                    });
                } else {
                    return null;
                }
            })
            .then(function (_frd) {

                if (checkStatus == 1) {
                    if (!_frd || _frd.length == 0) {
                        throw ErrorHandler.getBusinessErrorByCode(2405);
                    }
                    console.log('会员服务计划', _frd);

                    if (_frd && _frd.length > 0) {
                        factoryDrugPlan = _frd[0];
                        if (factoryDrugPlan.balanceVal < userReimburse.reimbursePrice * userReimburse.reimburseCount) {
                            throw ErrorHandler.getBusinessErrorByCode(2413);//计划剩余报销额度不足
                        }
                    } else {
                        return factoryDrugPlan;
                    }
                }
                else {
                    return null;
                }
            })
            .then(function (_r) {
                console.log('维护加护扣钱', _r);
                if (checkStatus == 1) {
                    return ReimburseService.getReimburse({
                        user: userReimburse.user,
                        planId: factoryDrugPlan._id,
                        drugId: userReimburse.drugId,
                        checkStatus: 1,
                        createdAt: {$lt: factoryDrugPlan.createdAt + constants.TIME1Y}
                    }, 'drugId reimburseCount');//每用户每年的最大申请数量
                } else {
                    return null;
                }
            })
            .then(function (_hasReim) {
                if (_hasReim) {
                    console.log('已经审核通过的数量', _hasReim);
                    var sum = 0;
                    _hasReim.forEach(function (item) {
                        if (item.reimburseCount) {
                            sum += item.reimburseCount;
                        }
                    });
                    console.log('总补贴数量', sum, factoryDrugPlan.maxCount, sum + userReimburse.reimburseCount);
                    if ((sum > factoryDrugPlan.maxCount) || (sum + userReimburse.reimburseCount > factoryDrugPlan.maxCount)) {
                        throw ErrorHandler.getBusinessErrorByCode(2420);//用户的该药品补贴数量已达最大
                    }
                    return FactoryDrugRelService.updateFactoryDrugRel(factoryDrugPlan._id, {$inc: {balanceVal: -userReimburse.reimbursePrice * userReimburse.reimburseCount}});
                }
            })
            .then(function (_u) {
                return ReimburseService.updateReimburse(cond, updates);
            })
            .then(function (_u) {
                if (checkStatus == 1) {
                    TransactionMysqlService.getTransactionByInnerTradeNo(userReimburse._id + "")
                        .then(function (t) {
                            console.log(t.length);
                            if (t.length > 0) { //重复报销
                                throw ErrorHandler.getBusinessErrorByCode(2409);
                            }

                            var sql = TransactionMysqlService.genUserDrugReimbursementSql(userReimburse.user._id + '', userReimburse._id + "", "药品补贴-" + userReimburse.drugName, (userReimburse.reimbursePrice * userReimburse.reimburseCount).toFixed(2), "x" + userReimburse.reimburseCount);
                            TransactionMysqlService.execSqls(sql);

                        });
                }
                apiHandler.OK(res);

                return CustomerService.getAllInfoByID(userReimburse.user);
            })
            .then(function (_userInfo) {
                var message = {type: "5", content: userReimburse.drugName, messageRef: userReimburse._id};

                if (checkStatus == 1) {
                    message.title = '您申请的药品补贴已通过审核，' + returnFloat(userReimburse.reimburseCount * userReimburse.reimbursePrice) + '元已到帐，前往"我的钱包"查看详情';
                    message.subType = 1;
                } else if (checkStatus == -1) {
                    message.title = '您申请的药品补贴未通过审核，前往"我的补贴"查看详情';
                    message.subType = 2;
                }

                var notificationExtras = {
                    type: 4,//推送按照type
                    contentType: 'notificationCenter',//透传按照contentType
                    notificationBody: {
                        type: "5",//type:1-消息通知   2-文章推送 3-商品推送 4-搜索推送  （1-商品类  2-文章类） 5-药品补贴  6-提现进度通知
                        title: message.title,//标题
                        content: userReimburse.drugName,//药品名称
                    }
                };
                pushToUser(_userInfo.pushId, message, notificationExtras);
                MessageCenterService.addMessageCenterToUser([userReimburse.user], message, '', message.messageRef);


            }, function (err) {
                apiHandler.OUTER_DEF(res, err);
            });
    };

    commonUtil.validate(payload, field, onSuccess, onFailure);
};
module.exports = exports = new OperationController();