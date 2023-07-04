var
    _ = require('underscore'),
    commonUtil = require('../../lib/common-util'),
    apiHandler = require('../configs/ApiHandler'),
    ErrorHandler = require('../../lib/ErrorHandler'),
    configs = require('../configs/api'),
    constants = require('../configs/constants'),
    Q = require("q"),
    CustomerService = require('../services/CustomerService'),
    DoctorService = require('../services/DoctorService'),
    OrderService = require('../services/OrderService'),
    CallbackService = require('../services/CallbackService'),
    PayService = require('../services/PayService'),
    HongbaoService = require('../services/HongbaoService'),
    JPushService = require('../services/JPushService'),
    //MomentService = require('../services/MomentService'),
    //MessageService = require('../services/MessageService'),
    HongbaoHelper = require('../../lib/helper/HongbaoHelper'),
    WXController = require('./WXController'),
    TransactionMysqlService = require('../services/TransactionMysqlService'),
    CONS = OrderService.CONS,
    COMMENT = CONS.COMMENT,
    SocialRelService = require('../services/SocialRelService'),
    ProductService = require('../services/ProductService'),
    CacheService = require('../services/CacheService'),
    CouponService = require('../services/CouponService'),
    MembershipService = require('../services/MembershipService');

var OrderController = function () {
};
OrderController.prototype.constructor = OrderController;

OrderController.prototype.getCustomerPhoneOrdersById = function (req, res) {
    var identity = req.identity;
    if (!commonUtil.isUUID24bit(identity.userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var userId = identity.userId;
    var page = req.query.pageNum || 0;
    var showAll = req.query.showAll || false;
    var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {createdAt: -1});

    var user, orders;
    CustomerService.getInfoByID(userId)
        .then(function (u) {
            if (!u) {
                throw ErrorHandler.getBusinessErrorByCode(1503);
            }
            user = u;
            return OrderService.getPhoneOrdersByAccountID(userId, pageSlice, showAll);
        })
        .then(function (_orders) {
            //头像,姓名,热线号
            orders = JSON.parse(JSON.stringify(_orders));
            var userIds = [];
            orders.forEach(function (order) {
                if (order.callerId != userId) {
                    userIds.push(order.callerId);
                } else if (order.calleeId != userId) {
                    userIds.push(order.calleeId);
                }
            });
            return CustomerService.getInfoByIDsSelfFlied(userIds, 'avatar name docChatNum');
        })
        .then(function (_users) {
            _users = _.indexBy(_users, '_id');
            //console.log(orders);
            var resultOrders = [];
            orders.forEach(function (order) {
                var _user;
                if (order.callerId != userId) { // 当前用户是被叫
                    _user = _users[order.callerId] //查询主叫;
                    if (_user) {
                        order.callerAvatar = _user.avatar || "";
                        order.callerName = _user.name || "";
                        order.callerDocChatNum = _user.docChatNum || "";
                        resultOrders.push(order);
                    }
                } else if (order.calleeId != userId) {//当前用户是主叫
                    _user = _users[order.calleeId];//查询被叫
                    if (_user) {
                        order.calleeAvatar = _user.avatar || "";
                        order.calleeName = _user.name || "";
                        order.calleeDocChatNum = _user.docChatNum || "";
                        resultOrders.push(order);
                    }
                }
            });
            console.log(resultOrders.length);
            apiHandler.OK(res, resultOrders);
        }, function (err) {
            apiHandler.handleErr(res, err);
        })
};

OrderController.prototype.getCustomerPhoneOrdersByIdAndBookmark = function (req, res) {
    var identity = req.identity;
    if (!commonUtil.isUUID24bit(identity.userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var userId = identity.userId;
    //var page = req.query.pageNum || 0;
    //var showAll = req.query.showAll || false;
    var bookmark = req.query.bookmark || 0;
    //var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {createdAt: -1});

    var user, orders, resultOrders = [];

    OrderService.getPhoneOrdersByAccountIDAndBookmark(userId, bookmark)
        .then(function (_orders) {
            //头像,姓名,热线号
            orders = JSON.parse(JSON.stringify(_orders));
            var userIds = [];
            orders.forEach(function (order) {
                if (order.callerId != userId) {
                    userIds.push(order.callerId);
                } else if (order.calleeId != userId) {
                    userIds.push(order.calleeId);
                }
            });
            // console.log(userIds.length);
            userIds = _.uniq(userIds);
            //console.log(userIds.length);
            return CustomerService.getInfoByIDsSelfFlied(userIds, 'avatar name docChatNum');
        })
        .then(function (_users) {
            //console.log(1111);
            // console.log(_users.length);
            _users = _.indexBy(_users, '_id');
            //console.log(orders);
            orders.forEach(function (order) {
                var _user;
                if (order.callerId != userId) { // 当前用户是被叫
                    _user = _users[order.callerId] //查询主叫;
                    if (_user) {
                        order.callerAvatar = _user.avatar || "";
                        order.callerName = _user.name || "";
                        order.callerDocChatNum = _user.docChatNum || "";
                        resultOrders.push(order);
                    }
                } else if (order.calleeId != userId) {//当前用户是主叫

                    _user = _users[order.calleeId];//查询被叫
                    if (_user) {
                        order.calleeAvatar = _user.avatar || "";
                        order.calleeName = _user.name || "";
                        order.calleeDocChatNum = _user.docChatNum || "";
                        resultOrders.push(order);
                    }
                }
            });
            var relUserIds = [];
            resultOrders.forEach(function (item) {
                relUserIds.push(item.calleeId);
                relUserIds.push(item.callerId);
            });
            return SocialRelService.getNoteNameByIds(userId, relUserIds)
        })
        .then(function (_nameList) {
            console.log(_nameList.length);
            var relNameList = _.indexBy(_nameList, "relUser");
            resultOrders.forEach(function (item) {
                if (relNameList[item.callerId]) {
                    item.callerName = relNameList[item.callerId] && relNameList[item.callerId].noteInfo && relNameList[item.callerId].noteInfo.noteName || item.callerName;
                }
                if (relNameList[item.calleeId]) {
                    item.calleeName = relNameList[item.calleeId] && relNameList[item.calleeId].noteInfo && relNameList[item.calleeId].noteInfo.noteName || item.calleeName;
                }
            });
            console.log(resultOrders.length);
            var resData = {
                items: resultOrders,
                bookmark: orders.length > 0 ? orders[0].createdAt : bookmark
            }
            apiHandler.OK(res, resData);
        }, function (err) {
            apiHandler.handleErr(res, err);
        })
};


/**
 * 获取用户1H内的最近一次通话,并标记
 *
 * @param req
 * @param res
 */
OrderController.prototype.getCLastNeedCommentOrders = function (req, res) {

    var userId = req.query.userId;
    var orderId = req.query.orderId || '';

    if (!userId || !commonUtil.isUUID24bit(userId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var order, callWay = '';
    Promise.resolve()
        .then(function () {
            if (orderId) { //只有双向回拨,需要主动请求第三方获取订单信息
                if (!commonUtil.isUUID24bit(orderId)) {
                    throw ErrorHandler.getBusinessErrorByCode(8005);
                }
                var fields = "_id calleeId calleeName calleeDocChatNum " +
                    "calleeAvatar calleeSex createdAt callerPayment time isCommentHint callStatus callWay provider channelId appId callPrice";
                var option = {
                    fields: fields
                }
                return OrderService.getOrderByID(orderId, option)
                    .then(function (_order) {
                        if (!_order) {
                            throw ErrorHandler.getBusinessErrorByCode(8005);
                        }
                        order = JSON.parse(JSON.stringify(_order));
                        console.log('order info:', order);
                        order["commentConfig"] = { //constants.COMMENT_CONF;
                            rank: COMMENT.RANK,
                            contentTxtSize: COMMENT.CONT_TXT_SIZE,
                            contentHint: COMMENT.CONT_HINT,
                            tags: COMMENT.TAGS
                        };
                        if (order.callStatus == 'over') {
                            if (order.time == 0 || (order.callerPayment == 0 )) {
                                return {};
                            }
                            return order;
                        }
                        callWay = _order.callWay;
                        if (_order.callWay != 'call_both') {
                            return {};
                        }
                        if (_order.isCommented || _order.isCommentHint) {
                            return {};
                        }
                        //未评价,主动请求第三方
                        return CallbackService.getTheThirdCallInfo(order)
                            .then(function (_res) {
                                var callBothType = order.provider;
                                var update = {};
                                if (!callBothType || callBothType == 'yuntongxun') { //云联通
                                    if (_res.state !== '0') { //成功
                                        throw new Error();
                                    }
                                    update = {
                                        "updatedAt": Date.now(),
                                        "isCommentHint": true,
                                        callStatus: 'waitCB',
                                        time: Number(_res.callTime)
                                    };

                                    update.calleeIncome = OrderService.getDocIncome(update.time, order);
                                    update.callerPayment = OrderService.getCustomerPayment(update.time, order);
                                    if (update.time == 0 || (update.callerPayment == 0 )) {
                                        return {};
                                    }
                                    order.callStatus = 'waitCB';
                                    order.time = update.time;
                                    order.callerPayment = update.callerPayment;
                                    OrderService.updateNotOverOrderInfo(order._id, update);

                                } else if (callBothType == 'feiyucloud') {
                                    console.log(typeof  _res);
                                    var payload = JSON.parse(_res);
                                    console.log('payload:', payload);
                                    var data = {
                                        "updatedAt": Date.now(),
                                        "isCommentHint": true,
                                        callStatus: 'waitCB'
                                    }
                                    order.callStatus = 'waitCB';

                                    data.byetype = String(payload.stopReason); //非正常通话,为飞语云传值
                                    console.log(typeof data.byetype);
                                    if (['1', '2'].indexOf(String(payload.stopReason)) > -1) {
                                        //通话成功, 飞语云不满一分钟按一分钟收费
                                        data.time = Math.ceil((Number(payload.callEndTime) - Number(payload.callStartTime)) / 1000); //返回数据单位为ms
                                        order.time = Math.ceil((Number(payload.callEndTime) - Number(payload.callStartTime)) / 1000); //返回数据单位为ms
                                    }
                                    else
                                        data.time = 0;
                                    data.calleeIncome = OrderService.getDocIncome(data.time, order);
                                    data.callerPayment = OrderService.getCustomerPayment(data.time, order);
                                    console.log(data);
                                    if (data.time == 0 || (data.callerPayment == 0 )) {
                                        return {};
                                    }
                                    order.callerPayment = data.callerPayment;
                                    data['otherCallbackData.callbackFirstStartTime'] = payload.callbackFirstStartTime;
                                    data['otherCallbackData.callbackFirstEndTime'] = payload.callbackFirstEndTime;
                                    data['otherCallbackData.callStartTime'] = payload.callStartTime;
                                    data['otherCallbackData.callEndTime'] = payload.callEndTime;
                                    data['otherCallbackData.trueShowNumberType'] = payload.trueShowNumberType; //真实的显号类型：1为显示号码，2为不显示号码
                                    data['otherCallbackData.trueIfRecord'] = payload.trueIfRecord; //真实的是否录音：1为录音，0或者2为不录音
                                    data['otherCallbackData.isRecordSuccess'] = false; //默认录音不成功
                                    update = data;
                                    OrderService.updateNotOverOrderInfo(order._id, update);
                                } else {
                                    return {};
                                }
                                console.log('come in 0', order);
                                return order;
                            });
                    })
            } else {
                return {};
            }
        })
        .then(function (_order) {
            if ((orderId && callWay == 'voip') || !orderId) {
                // 获取用户1H内的最近一次通话,并标记
                return OrderService.getLatestCallAndMark(userId)
                    .then(function (_order) {
                        console.log("Order info: " + _order);
                        _order = JSON.parse(JSON.stringify(_order));
                        if (_order) {
                            // 验证order是合法的: 已查询过 || 可评论状态 完成、通话中(还未回调)
                            if (_order.isCommentHint || !_.contains([CONS.CALL_STATUS.BUSY, CONS.CALL_STATUS.OVER], _order.callStatus)) {
                                _order = {};
                            } else {
                                _order["commentConfig"] = { //constants.COMMENT_CONF;
                                    rank: COMMENT.RANK,
                                    contentTxtSize: COMMENT.CONT_TXT_SIZE,
                                    contentHint: COMMENT.CONT_HINT,
                                    tags: COMMENT.TAGS
                                };
                            }
                        } else {
                            _order = {};
                        }
                        return _order;
                    })
            } else {
                return _order;
            }
        })
        .then(function (_order) {
            delete _order.isCommentHint;
            delete _order.callStatus;//callWay callBothType channelId appId
            delete _order.callWay;
            delete _order.callBothType;
            delete _order.channelId;
            delete _order.appId;
            delete _order.callPrice;
            delete _order.provider;
            order = _order;
            return SocialRelService.getNoteNameByIds(userId, [order.calleeId]);
        })
        .then(function (_nameList) {
            order.calleeName = _nameList[0] && _nameList[0].noteInfo && _nameList[0].noteInfo.noteName || order.calleeName;
            console.log("order:", order);
            return apiHandler.OK(res, order);
        }, function (err) {
            return apiHandler.handleErr(res, err);
        });

};

OrderController.prototype.commentOrder = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['orderId', 'rank', 'callerId', 'calleeId'],
        optional: ['content', 'tags']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        //var userId = req.headers[constants.HEADER_USER_ID] || "";
        // 数据清理
        data.rank = (_.contains(_.range(1, COMMENT.RANK + 1, 1), data.rank)) ? data.rank : 1;
        data.tags = (data.tags && data.tags.length > 0) ? data.tags : [];
        data.tagStr = "";
        if (data.tags.length > 0) {
            data.tagStr = _.reduce(data.tags, function (a, b) {
                    return (a + "; " + b)
                }) || "";
        }
        data.content = data.content || "";
        var checked = _.every([data.orderId, data.callerId, data.calleeId], function (d) {
            return commonUtil.isUUID24bit(d);
        });
        if (!checked)
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        // 1. 更新订单评价信息
        OrderService.addComment(data)
            .then(function (_order) {


                // 2. 更新用户评价统计
                if (_order) {
                    data.calleeRefId = _order.calleeRefId;
                    return DoctorService.updateDoctorCommentInfo(data);
                }
                else
                    throw ErrorHandler.getBusinessErrorByCode(8005);
            })
            .then(function () {
                return apiHandler.OK(res);
            }, function (err) {
                return apiHandler.handleErr(res, err);
            });
    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

OrderController.prototype.getDocCommentedInfo = function (req, res) {
    var doctorId = req.query.doctorId;//用户的附表Id,doctorId
    var pageSlice = commonUtil.getCurrentPageSlice(req, 0, constants.DEFAULT_PAGE_SIZE, {createdAt: -1});

    var comment = {};
    if (!doctorId || !commonUtil.isUUID24bit(doctorId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    // TODO 1. 查询医生的评价统计信息,并验证医生
    DoctorService.findCommentInfo(doctorId)
        .then(function (_comment) {
            if (!_comment) throw ErrorHandler.getBusinessErrorByCode(8005);
            comment.commentNum = _comment.commentNum || 0;
            comment.zanNum = _comment.zanNum || 0;
            comment.commentedTags = _comment.commentedTags || {};

            // TODO 2. 查询医生的历史评价列表
            return OrderService.findCommentList(doctorId, pageSlice);
        })
        .then(function (_comments) {
            var comments = [];
            if (_comments && _comments.length > 0) {
                _comments = JSON.parse(JSON.stringify(_comments));
                _.each(_comments, function (comm) {
                    comments.push({
                        customerName: comm.callerName || '',//??
                        rank: comm.comment.rank,
                        tags: comm.comment.tags || [],
                        tagStr: comm.comment.tagStr || "",
                        content: comm.comment.isContentChecked ? comm.comment.content : "",
                        createdAt: comm.comment.createdAt
                    });
                })
            }
            comment.comments = comments;
            return apiHandler.OK(res, comment);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
    //return apiHandler.OK(res, {
    //  commentNum: 100,
    //  zanNum: 123,
    //  commentedTags: {
    //    "顾问非常热心": 100,
    //    "帮到我了": 30,
    //    "牛牛牛!!": 11
    //  },
    //  comments: [
    //    {
    //      customerName: "路遥",
    //      rank: 3,
    //      tags: "顾问非常热心;帮到我了",
    //      content: "顾问非常热心顾问非常热心顾问非常热心顾问非常热心",
    //      createdAt: 1477372487728
    //    },{
    //      customerName: "张三",
    //      rank: 2,
    //      tags: "顾问非常热心;",
    //      content: "",
    //      createdAt: 1477372480000
    //    },{
    //      customerName: "路遥",
    //      rank: 1,
    //      tags: "",
    //      content: "帮到我了帮到我了帮到我了帮到我了帮到我了",
    //      createdAt: 1477372467728
    //    }
    //  ]
    //});
};

OrderController.prototype.getCustomerValidPhoneOrdersById = function (req, res) {
    var userId = req.query.userId;
    var page = req.query.pageNum || 0;
    var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {updatedAt: -1});

    OrderService.getValidPhoneOrdersByCustomerID(userId, pageSlice, showAll)
        .then(function (orders) {
            //console.log(orders);
            apiHandler.OK(res, orders);
        }, function (err) {
            apiHandler.handleErr(res, err);
        })
};

OrderController.prototype.getDoctorPhoneOrdersById = function (req, res) {
    var userId = req.query.userId;
    var page = req.query.pageNum || 0;
    var showAll = req.query.showAll || false;

    var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {updatedAt: -1});

    OrderService.getPhoneOrdersByDoctorID(userId, pageSlice, showAll)
        .then(function (orders) {
            //console.log(orders);
            apiHandler.OK(res, orders);
        }, function (err) {
            apiHandler.handleErr(res, err);
        })
};

OrderController.prototype.getDoctorValidPhoneOrdersById = function (req, res) {
    var userId = req.query.userId;
    var page = req.query.pageNum || 0;
    var pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {updatedAt: -1});

    OrderService.getValidPhoneOrdersByDoctorID(userId, pageSlice)
        .then(function (orders) {
            //console.log(orders);
            apiHandler.OK(res, orders);
        }, function (err) {
            apiHandler.handleErr(res, err);
        })
};

OrderController.prototype.getOrderById = function (req, res) {
    var userId = req.identity ? req.identity.userId : '';
    var user = req.identity && req.identity.user ? req.identity.user : null;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(user)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var orderId = req.query.orderId;
    var order;
    var orderUserIds = [];

    OrderService.getOrderByID(orderId)
        .then(function (order) {
            if (!order) {
                throw ErrorHandler.getBusinessErrorByCode(1401);
            } else {
                if (!order.type || order.type != CONS.TYPE.PHONE) {
                    // FIXME : 优化 如果非phone订单，需要两次查询,
                    return OrderService.commonFindOrderById(order.type, orderId);
                }
                return order;
            }
        })
        .then(function (o) {
            order = JSON.parse(JSON.stringify(o));
            //订单中存在的用户
            if (order.doctorMainId) {
                orderUserIds.push(order.doctorMainId + '');
            }
            if (order.customerId) {
                orderUserIds.push(order.customerId + '');
            }
            if (order.callerId) {
                orderUserIds.push(order.callerId + '');
            }
            if (order.calleeId) {
                orderUserIds.push(order.calleeId + '');
            }
            //兼容老订单无主账号id
            if (order.doctorId) {
                orderUserIds.push(order.doctorId + '');
            }

            if (orderUserIds.indexOf(userId) < 0 && (orderUserIds.indexOf((user.doctorRef && user.doctorRef._id ? user.doctorRef._id + '' : '')) < 0)) {
                return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(2002));
            }
            if (order.type && order.type == CONS.TYPE.PHONE) {
                if (userId == order.callerId)
                    order.price = order.callerPayment - order.couponDeductedRMB
                else
                    order.price = order.calleeIncome;
            }
            apiHandler.OK(res, order);
        }, function (err) {
            apiHandler.handleErr(res, err);
        });
};

OrderController.prototype.createAdPreOrder = function (req, res) {
    var identity = req.identity; // 用户身份信息
    var payload = req.body; // 提交内容
    var fields = {
        required: ['doctorId', 'price', 'payType'],
        optional: ['payPwd']
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        // 1. 信息验证 user、doctor、price
        var userId = identity.userId;
        var user;
        var doctor;
        var order = {};
        var response;
        var now = Date.now();
        if (data.price < 1) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1522));
        }
        CustomerService.getAllInfoByID(userId)
            .then(function (_user) {
                if (!_user || !_user.doctorRef || !_user.doctorRef._id) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                }
                user = JSON.parse(JSON.stringify(_user));
                if (data.payType == 'sys_pay' && data.payPwd != user.payPwd) {
                    throw ErrorHandler.getBusinessErrorByCode(1524);
                }
                // to doctor
                doctor = _user.doctorRef;
                // from doctor
                return CustomerService.getAllInfoByDocId(data.doctorId);
            })
            .then(function (d) {
                if (!d || !d.doctorRef || !d.doctorRef._id) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                }
                // 2. 生成待支付订单，返回订单信息
                order._id = commonUtil.getNewObjectId();
                order.price = data.price;
                order.customerId = user._id + "";
                order.customerName = user.name || user.nickname || "";
                order.customerPhoneNum = user.phoneNum;
                order.customerDocId = doctor._id;
                order.customerDocChatNum = user.docChatNum;
                order.doctorId = d.doctorRef._id;
                order.doctorMainId = d._id;
                order.doctorRealName = d.name;
                order.doctorDocChatNum = d.docChatNum;
                order.doctorSex = d.sex;
                order.doctorAvatar = d.avatar;
                order.doctorPhoneNum = d.phoneNum;
                order.payType = data.payType;
                order.createdAt = now;
                order.updatedAt = now;
                order.payStatus = CONS.PAY_STATUS.TO_PAY;

                response = {
                    "prepayId": CONS.TYPE.AD + "-" + order._id,
                    "timestamp": now,
                    "prdName": '推广竞价'
                };
                if (order.payType == "wx_pay") {
                    var d = {
                        money: data.price,
                        tradeNo: CONS.TYPE.AD + "-" + order._id,
                        body: '推广竞价'
                    };
                    return WXController.WXPay(req, d);
                }
            })
            .then(function (r) {
                if (r) response = r;
                order.prepareId = response.prepayId;
                if (order.payType != PayService.CONS.PAY_TYPE.SYS) {
                    return OrderService.createADOrder(order);
                } else {
                    return OrderService.createADOrder(order)
                        .then(function (_order) {
                            // 交易明细
                            var sqls = TransactionMysqlService.genAdPaymentSqls(
                                _order.customerId,
                                _order.doctorId,
                                _order.payType,
                                _order.price,
                                constants.ORDER_AD_RADIO,
                                "",
                                _order._id + "",
                                "竞价广告;");
                            return TransactionMysqlService.execSqls(sqls)
                                .then(function () { // 更新订单状态
                                    // SEND SMS
                                    commonUtil.sendSms("1642410", _order.doctorPhoneNum,
                                        "#name#=" + _order.customerName);
                                    return OrderService.commonPayOrderById(_order._id);
                                })
                        })
                        .then(function () {
                            // 查询关系,判断是否已加权重,新增/更新关系
                            return DoctorService.isRelExists(order.doctorId, order.customerDocId, "ad")
                                .then(function (_rel) {
                                    if (!_rel) {
                                        return DoctorService.createRel({
                                            type: "ad",
                                            fromId: order.doctorId,
                                            fromRef: commonUtil.getObjectIdByStr(order.doctorId),
                                            toId: order.customerDocId,
                                            toRef: commonUtil.getObjectIdByStr(order.customerDocId),
                                            orderId: [order._id + ""],
                                            weight: order.price
                                        });
                                    } else {
                                        var historyOrder = _rel.orderId || [];
                                        if (historyOrder.indexOf(order.orderId) < 0) {
                                            historyOrder.push(order._id + "");
                                            // add weight
                                            return DoctorService.addRelWeight(_rel._id, order.price, null, [order._id + ""]);
                                        }// else do nothing
                                    }
                                })
                        })
                }
            })
            .then(function () {
                apiHandler.OK(res, response);
            }, function (err) {
                apiHandler.handleErr(res, err);
            })

    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);

}

OrderController.prototype.createServicePreOrder = function (req, res) {
    var payload = req.body;
    var userId = req.identity && req.identity.userId;
    var appUser = req.identity && req.identity.user ? req.identity.user : '';
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isExist(appUser)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var fields = {
        required: ['type', 'price', 'payType'],
        optional: ['payPwd', 'serviceValue', 'cardType'] //memberInviteCode 邀请码目前版本 4.6.1 没用到
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        if (data.price < 0) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1206));
        }
        if (appUser.hasBoughtSenior && data.price == constants.yhPrice && ['zlycare', 'zlycare_vip'].indexOf(data.cardType) > -1) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(2209));
        }
        var order = {};
        var now = Date.now();
        var response;
        var prdName, user;
        //var memberInviteUser ;
        //var memberInviteUpdateData = {};
        /*limitApiCall(userId, 'order_service', 5)
         .then(function(isLimited) {
         if (isLimited) {
         throw getBusinessErrorByCode(8003);
         }
         return TransactionMysqlService.getAccountByUserIdAndDoctorId(userId + '', appUser.doctorRef._id + '');
         })*/
        TransactionMysqlService.getAccountByUserIdAndDoctorId(userId + '', appUser.doctorRef._id + '')
            .then(function (_account) {
                if (_account.amount <= 0 && data.payType == 'sys_pay') {
                    throw ErrorHandler.getBusinessErrorByCode(2203);
                }
                return CustomerService.getUserPayPwdByID(userId, "payPwd vipMembershipPurchase")
            })
            .then(function (_user) {
                if (!_user) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                }
                if (data.payType == 'sys_pay' && data.payPwd != _user.payPwd) {
                    throw ErrorHandler.getBusinessErrorByCode(1524);
                }
                user = _user;
                //会员余额大于限制额度，则不能购买会员卡
                return MembershipService.getVipMembershipBalance(userId, 'zlycare,zlycare_vip');
            })
            .then(function (_l) {

                console.log('用户额度',user,user.vipMembershipPurchase ,user.vipMembershipPurchase.limit);
                var limit = user.vipMembershipPurchase&&user.vipMembershipPurchase.limit ? user.vipMembershipPurchase.limit : constants.membershipLimit;
                console.log('剩余报销额度',_l,limit);
                if (_l.length>0&&_l[0].balance > limit) {
                    throw ErrorHandler.getBusinessErrorByCode(2303);
                }


                // if(data.memberInviteCode){
                //     return CustomerService.getMainInfoByDocChatNum(data.memberInviteCode)
                // }
                // })
                // .then(function(_merberInviteUser){
                //     var isLegalMemberInviteCode = false;
                //     if(data.memberInviteCode){
                //         if(!_merberInviteUser){
                //             throw ErrorHandler.getBusinessErrorByCode(1208);
                //         }else{
                //             memberInviteUser = _merberInviteUser;
                //             isLegalMemberInviteCode = true;
                //         }
                //     }
                order._id = commonUtil.getNewObjectId();
                order.price = data.price;
                order.payType = data.payType;
                order.payStatus = CONS.PAY_STATUS.TO_PAY;
                order.type = data.type;
                order.cardType = data.cardType || 'city_buy';
                if (data.type == "membership") {
                    // 25 购买 300 额度
                    // if(isLegalMemberInviteCode){
                    //     order.serviceValue = constants.membershipVals[0].benefitVal + 10;
                    // }else{
                    //     order.serviceValue = constants.membershipVals[0].benefitVal;
                    // }
                    // order.cardNo = constants.membershipVals[0].cardNo;
                    constants.membershipVals.forEach(function (item) {
                        if (order.cardType == item.type) {
                            order.serviceValue = item.benefitVal;
                            order.cardNo = item.cardNo;
                            prdName = item.title;
                        }
                    })
                    if (!order.cardNo) {
                        throw ErrorHandler.getBusinessErrorByCode(8005);
                    }
                } else if (data.type == "marketing") {
                    order.serviceValue = data.price;
                } else {
                    throw ErrorHandler.getBusinessErrorByCode(8005);
                }
                // 购买者
                order.customerId = appUser._id; // 购买用户的ID
                order.customerRefId = appUser.doctorRef._id; // 购买用户的副账户ID
                order.customerName = appUser.name; // 购买用户的姓名
                order.customerPhoneNum = appUser.phoneNum; // 购买用户的手机号
                order.customerDocChatNum = appUser.docChatNum;// 购买者医聊号码
                // if(memberInviteUser){
                //     order.memberInviteId =  memberInviteUser._id; // 邀请码用户的ID
                //     order.memberInviteName= memberInviteUser.name; // 邀请码用户的姓名
                //     order.memberInvitePhoneNum= memberInviteUser.phoneNum; // 邀请码用户的手机号
                //     order.memberInviteDocChatNum= memberInviteUser.docChatNum;// 邀请医聊号码
                // }
                //返回值信息
                response = {
                    "timestamp": now
                };
                if (data.type == "membership") {
                    response.prepayId = CONS.TYPE.MEMBERSHIP + "-" + order._id;
                    response.prdName = prdName;

                } else if (data.type == "marketing") {
                    response.prepayId = CONS.TYPE.MARKETING + "-" + order._id;
                    response.prdName = '推广费用';
                } else {
                    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1214));
                }
                order.prepareId = response.prepayId;
                //微信支付生成微信订单码
                if (order.payType == "wx_pay") {
                    var d = {
                        money: data.price,
                        tradeNo: response.prepayId,
                        body: response.prdName
                    };
                    return WXController.WXPay(req, d);
                }
            })
            .then(function (wxResponse) {
                if (wxResponse) {
                    order.prepareId = wxResponse.prepayId;
                    console.log(wxResponse.prepayId);
                    response.prepayId = wxResponse.prepayId;
                }

                return OrderService.createServiceOrder(order);

            })
            //余额支付完成后面操作
            // 1.操作mysql扣除余额
            // 2.生成产品
            // 3.完成购买，更改订单状态
            // 4.0524活动，充值会员额度后送 5+5两张券
            // 5.会员额度
            .then(function (_order) {
                if (_order.payType == PayService.CONS.PAY_TYPE.SYS && data.price != 0) {
                    var sqls = TransactionMysqlService.genServicePaymentSqls(
                        _order.customerId,
                        _order.payType,
                        _order.price,
                        "",
                        _order._id + "",
                        order.type);
                    return TransactionMysqlService.execSqls(sqls)
                }
            })
            .then(function () {
                if (order.payType == PayService.CONS.PAY_TYPE.SYS) {
                    if (order.type == "membership") {
                        var newMembership = {
                            userId: userId,
                            balance: order.serviceValue,
                            totalVal: order.serviceValue
                        };
                        console.log(constants.membershipVals);
                        for (var i = 0; i < constants.membershipVals.length; i++) {

                            if (order.cardType == constants.membershipVals[i].type) {

                                newMembership.cardNo = constants.membershipVals[i].cardNo;
                                var expiredTime = constants.membershipVals[i].expired30Days || constants.membershipVals[i].expiredTime
                                newMembership.expiredAt = new Date(commonUtil.getDateMidnight(now)).getTime() + expiredTime - 1;
                                newMembership.type = constants.membershipVals[i].type;
                                break;
                            }
                        }
                        console.log(newMembership);
                        return MembershipService.createMembership(newMembership);
                    }
                }
            })
            .then(function (_membership) {
                if (_membership) {
                    var updateData = {
                        membershipId: _membership._id,
                        payStatus: CONS.PAY_STATUS.PAID,
                        updatedAt: Date.now()
                    };
                    return OrderService.updateServiceOrderInfo(order._id, updateData);
                }
            })
            .then(function (_order) {
                if (_order) {
                    order = _order;
                }
                if (order.payType == PayService.CONS.PAY_TYPE.SYS) {
                    var updateData = {};
                    if (order.type == "marketing") {
                        updateData = {
                            $inc: {
                                "marketing.balance": order.serviceValue,
                                "marketing.remainBalance": order.serviceValue,
                                "marketing.boughtNum": 1
                            }
                        };
                        if (appUser.marketing && appUser.marketing.cps) {
                            var balance = appUser.marketing.remainBalance || 0;
                            updateData["marketing.remainMemberSize"] = Math.floor((balance + order.serviceValue) / appUser.marketing.cps)
                        }
                        return CustomerService.updateUserById(userId, updateData);
                    }

                }
            })
            .then(function (_user) {
                if (_user) {
                    return OrderService.commonPayOrderById(order._id);
                }
            })
            .then(function () {
                console.log('trade info:', order.type, order.payStatus, order.customerId);
                if (order.type == 'membership' && order.payStatus == CONS.PAY_STATUS.PAID) {
                    //生成会员额度生产明细
                    if (order.cardType == 'city_buy') {
                        var TradeService = Backend.service('1/membership', 'membership_trade');
                        var _options = {
                            orderId: order._id + '',
                            memberships: [{
                                membershipId: order.membershipId,
                                cardNo: order.cardNo,
                                cost: order.serviceValue
                            }]
                        }
                        TradeService.genMembershipTrade(order.customerId, 'buy', order.serviceValue, _options);
                    } else {
                        var zlycareTradeService = Backend.service('1/zlycare', 'member_trade_service');
                        var trade = {
                            userId: order.customerId,
                            type: 'buy',
                            value: order.serviceValue,
                            orderId: order._id + '',
                            memberships: [{
                                membershipId: order.membershipId,
                                cardNo: order.cardNo,
                                cost: order.serviceValue
                            }],
                            vipType: order.cardType
                        };
                        zlycareTradeService.genVipMembershipTrade(trade);

                        //如果用户不是第一次购买高级会员,购买金额为298
                        //购买高级会员或者vip会员,收藏801010866
                        CustomerService.buyMembershipAndFavorite(order.cardType, order.customerId, '801010866');
                        commonUtil.sendSms("1907890", appUser.phoneNum, '', true);
                    }

                } else if (order.type == 'marketing' && order.payStatus == CONS.PAY_STATUS.PAID) {
                    //优惠券数量>1 ?充值通知想领券的顾客
                    var RemindService = Backend.service("1/city_buy", "remind_send_stamps");
                    RemindService.sendMsgToUser(appUser._id);
                }
            })
            .then(function () {
                apiHandler.OK(res, response);
            }, function (err) {
                apiHandler.handleErr(res, err);
            })

    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);

}

OrderController.prototype.createHongbaoPreOrder = function (req, res) {
    var identity = req.identity; // 用户身份信息
    var payload = req.body; // 提交内容
    var fields = {
        required: ['price', 'payType', 'totalCount'],
        optional: ['payPwd']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var user;
        var doctor;
        var order = {};
        var hongbao = {};
        var response;
        var now = Date.now();

        var userId = req.identity && req.identity.userId ? req.identity.userId : "";
        data.totalCount = parseInt(data.totalCount);
        console.log('values:', _.values(CONS.PAY_TYPES));
        if (isNaN(data.totalCount) || data.totalCount < 1
            || !commonUtil.isUUID24bit(userId) || !data.payType || _.values(CONS.PAY_TYPES).indexOf(data.payType) < 0) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        var averageValue = data.price / data.totalCount;
        if (averageValue < 0.01 || averageValue > 200) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        CustomerService.getAllInfoByID(userId)
            .then(function (_user) {
                if (!_user || !_user.doctorRef || !_user.doctorRef._id || _user.doctorRef.isDeleted) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                }
                user = JSON.parse(JSON.stringify(_user));
                if (data.payType == 'sys_pay' && data.payPwd != user.payPwd) {
                    throw ErrorHandler.getBusinessErrorByCode(1524);
                }
                //先生成一个红包
                var hongbaoId = commonUtil.getNewObjectId(),
                    orderId = commonUtil.getNewObjectId();
                var values,
                    valueCount = 0;
                //averageValue = Math.floor(averageValue * 100) * 0.01;
                //console.log('averageValue:', averageValue);
                //for(var i = 0; i< data.totalCount; i++){
                //    if(i == data.totalCount -1 ){
                //        values.push(data.price - valueCount);
                //        continue;
                //    }
                //    valueCount += averageValue;
                //    values.push(averageValue);
                //}
                //values = HongbaoHelper.genSimpleRandomMoney(data.price,data.totalCount);
                values = HongbaoHelper.genRandomMoneyByRatio(data.price, data.totalCount, 0.8, 0.2);
                if (!values) throw ErrorHandler.getBusinessErrorByCode(2102);
                hongbao = {
                    _id: hongbaoId,
                    user: user._id,
                    order: orderId,
                    totalValue: data.price,
                    totalCount: data.totalCount,
                    values: values,
                    expiredAt: Date.now() + constants.TIME7D, //默认有效期为一个星期
                    //expiredAt: Date.now() + constants.TIME1M, //TODO: REMOVED  when production
                    createdAt: now,
                    updatedAt: now
                };
                HongbaoService.createHongbao(hongbao);
                //生成订单
                order._id = orderId;
                order.totalValue = data.price;
                order.customerId = user._id;
                order.customerRefId = user.doctorRef || "";
                order.customerName = user.name || user.nickname || "";
                order.customerPhoneNum = user.phoneNum;
                order.payType = data.payType;
                order.createdAt = now;
                order.updatedAt = now;
                order.payStatus = CONS.PAY_STATUS.TO_PAY;
                order.hongbao = hongbaoId;

                response = {
                    "prepayId": CONS.TYPE.HONGBAO + "-" + order._id,
                    "timestamp": now,
                    "prdName": '动态红包'
                };
                if (order.payType == "wx_pay") {
                    var d = {
                        money: data.price,
                        tradeNo: CONS.TYPE.HONGBAO + "-" + order._id,
                        body: '动态红包'
                    };
                    return WXController.WXPay(req, d);
                }
            })
            .then(function (r) {
                if (r) response = r;
                //response.hongbaoId = hongbao.hongbaoId;
                order.prepareId = response.prepayId;
                if (order.payType != PayService.CONS.PAY_TYPE.SYS) {
                    return OrderService.createHongbaoOrder(order);
                } else {
                    return OrderService.createHongbaoOrder(order)
                        .then(function (_order) {
                            // 创建红包交易明细
                            var sqls = TransactionMysqlService.genHongbaoPaymentSqls(
                                _order.customerId + '',
                                '', //
                                _order.payType,
                                _order.totalValue,
                                '', //payTitle
                                '', //incomeTitle
                                _order.prepareId,
                                _order._id + "",
                                "动态红包;");
                            return TransactionMysqlService.execSqls(sqls)
                                .then(function () { // 更新订单状态
                                    // SEND SMS TODO: 定义短信模版
                                    //commonUtil.sendSms("1642410",_order.userPhoneNum,
                                    //    "#name#=" + _order.userName  );
                                    return OrderService.commonPayOrderById(_order._id);
                                })
                        })
                }
            })
            .then(function () {
                apiHandler.OK(res, response);
            }, function (err) {
                apiHandler.handleErr(res, err);
            })

    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
}
/**
 * 仅用于发布红包动态之前
 *
 * @param req
 * @param res
 */
OrderController.prototype.deleteHongbaoOrder = function (req, res) {
    var identity = req.identity; // 用户身份信息
    var payload = req.body; // 提交内容
    var hongbaoId = req.query.hongbaoId || '';
    var fields = {
        optional: ['hongbaoId']
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var userId = req.identity && req.identity.userId ? req.identity.userId : "";
        data.hongbaoId = data.hongbaoId || hongbaoId
        if (!commonUtil.isUUID24bit(userId) || !commonUtil.isUUID24bit(data.hongbaoId)) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        console.log('hongbaoId:', data.hongbaoId);
        //删除红包,退款
        var condition = {
            _id: data.hongbaoId,
            user: userId,
            moment: {$exists: false}// 还没有发布动态
        };
        HongbaoService.updateHongbao(condition, {$set: {isDeleted: true, isExpiredRefunded: true}})
            .then(function (_hongbao) {
                if (!_hongbao) {
                    throw ErrorHandler.getBusinessErrorByCode(2100);
                }
                var sqls = TransactionMysqlService.genHongbaoIncomeSqls(
                    _hongbao.user + '',
                    _hongbao.totalValue,// - _hongbao.usedValue,
                    _hongbao.order + '',
                    "红包退款",
                    true
                );
                return TransactionMysqlService.execSqls(sqls)
                    .then(function (_trx) { // 更新订单状态
                        //
                        return;
                    })
            })
            .then(function () {
                apiHandler.OK(res);
            }, function (err) {
                apiHandler.handleErr(res, err);
            })

    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

OrderController.prototype.createTransferPreOrder = function (req, res) {
    var identity = req.identity; // 用户身份信息
    var payload = req.body; // 提交内容
    var fields = {
        required: ['doctorId', 'price', 'payType'],
        optional: ['memo', 'productCode', 'payPwd', 'couponId', 'type', 'productId']
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var userId = identity.userId;
        var user;
        var business;
        var assistant;
        var order = {};
        var response;
        var now = Date.now();
        var prdName;
        var product, coupon;
        if (data.price < 1) {//TOTEST
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1522));
        }
        // if(!data.productCode){
        //   return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        // }
        data.productCode = data.productCode ? data.productCode.trim() : '';
        if (data.productCode && JSON.stringify(data.productCode).length < 5) {
            var zero = "";
            var lenth = 5 - JSON.stringify(data.productCode).length;
            while (lenth--) zero += "0";
            data.productCode = zero + data.productCode;
        }
        Promise.resolve()
            .then(function () {
                return CacheService.isTransferExistsLocal(userId);
            })
            .then(function (_cache) {
                if (_cache) {//请求过于频繁
                    throw ErrorHandler.getBusinessErrorByCode(8003);
                } else {
                    CacheService.addOrUpdTransferExistsLocal(userId);
                }
            })
            .then(function () {
                return Q.all([
                    CustomerService.getAllInfoByID(userId),
                    CustomerService.getInfoByDocChatNum(data.productCode)
                ])
            })
            .then(function (_accout) {
                var _user = _accout[0];
                var _assistant = _accout[1];// 商品代号指定的医生
                if (!_user) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                }
                if (data.payType == 'sys_pay' && data.payPwd != _user.payPwd) {
                    throw ErrorHandler.getBusinessErrorByCode(1524);
                }
                if (data.productCode && (!_assistant || !_assistant.doctorRef || !_assistant.doctorRef._id)) { // 如果有商品代号,但是没有查询到医生信息,报错
                    throw ErrorHandler.getBusinessErrorByCode(1523);
                }
                user = JSON.parse(JSON.stringify(_user));
                if (data.productCode) {
                    assistant = JSON.parse(JSON.stringify(_assistant));
                }
                if (data.type == "product") {
                    return OrderService.getLatestTransferOrderByCustomerId(_user._id);
                }
            })
            .then(function (_order) {
                //一个周只能买一次
                if (data.type == "product" && _order.length) {
                    var orderCreatdAt = _order[0].createdAt;
                    if (now - orderCreatdAt < constants.TIME1Y && theWeek(now) == theWeek(orderCreatdAt)) {
                        throw ErrorHandler.getBusinessErrorByCode(1531);
                    }
                }
                if (data.type == "product") {
                    return CustomerService.hasTheDeviceGot(user.deviceId, user._id + '', 5, '', req.identity && req.identity.appVersion || '');
                }
            })
            .then(function (hasTheDeviceGot) {
                if (hasTheDeviceGot) {
                    throw ErrorHandler.getBusinessErrorByCode(2115);
                }
                return CustomerService.getAllInfoByDocId(data.doctorId);
            })
            .then(function (d) {
                if (!d || !d.doctorRef || !d.doctorRef._id) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                }
                business = d;
                // 2. 生成待支付订单，返回订单信息
                order._id = commonUtil.getNewObjectId();
                order.price = data.price;
                order.productCode = data.productCode || "";
                order.productDocId = assistant ? assistant.doctorRef._id + '' : '';
                order.productDocName = assistant ? assistant.realName || "" : '';
                order.productMainId = assistant ? assistant._id || "" : '';
                order.memo = data.memo || "";
                order.customerId = user._id + "";
                order.customerName = user.name || user.nickname || "";
                order.customerPhoneNum = user.phoneNum;
                order.customerDocChatNum = user.docChatNum;
                order.doctorId = d.doctorRef._id;
                order.doctorMainId = d._id;
                order.doctorRealName = d.name;
                order.doctorDocChatNum = d.docChatNum;
                order.doctorPhoneNum = d.phoneNum;
                order.doctorPushId = d.pushId;
                order.doctorSex = d.sex;
                order.doctorAvatar = d.avatar;
                order.payType = data.payType;
                order.createdAt = now;
                order.updatedAt = now;
                order.payStatus = CONS.PAY_STATUS.TO_PAY;
                prdName = '向' + d.name + '付款' + (order.productCode ? ("(" + order.productCode + ")") : "");
                response = {
                    "prepayId": CONS.TYPE.TRANSFER + "-" + order._id,
                    "timestamp": now,
                    "prdName": prdName
                };
                order.transferType = data.type || "normal";
                if (order.transferType == "product") {
                    return ProductService.getProductsById(data.productId)
                }
            })
            .then(function (_product) {
                // if (_product && _product.stock > 0) {
                //     product = _product;
                //     order.productId = data.productId;
                //     order.productSnapshot = {
                //         title: _product.title,          //商品标题
                //         displayPrice: _product.displayPrice,  //价格
                //         actualPrice: _product.actualPrice,  //实际价格
                //         rewardPrice: _product.rewardPrice, //奖励价格
                //         owner: _product.owner//拥有者的主账号id
                //     }
                // }
                if (data.couponId && business.isVender) {
                    return CouponService.getCouponById(data.couponId)
                }
            })
            .then(function (_coupon) {
                if (data.couponId && !_coupon) {
                    throw ErrorHandler.getBusinessErrorByCode(1532);
                }
                if (_coupon) {
                    coupon = _coupon;
                    order.couponId = data.couponId;
                    order.couponDeductedRMB = _coupon.rmb < order.price ? _coupon.rmb : order.price;
                    if (coupon.type == 7) {
                        order.couponDeductedRMB = (order.price * ( 1 - coupon.discount)) < coupon.higherThreshold ?
                            Math.round(order.price * ( 1 - coupon.discount) * 100) / 100 : coupon.higherThreshold;
                    }
                }
                if (order.payType == "wx_pay") {
                    var _d = {
                        money: data.price,
                        tradeNo: CONS.TYPE.TRANSFER + "-" + order._id,
                        body: prdName
                    };
                    if (_coupon) {
                        if (_coupon.type == 7) {
                            _d.money = _d.money - order.couponDeductedRMB;
                            _d.money = Math.round(_d.money * 100) / 100;
                        } else {
                            _d.money = Math.max((data.price - _coupon.rmb), 0);
                            _d.money = Math.round(_d.money * 100) / 100;
                        }
                    }
                    return WXController.WXPay(req, _d);
                }
            })
            .then(function (r) {
                if (r) response = r;
                order.prepareId = response.prepayId;
                if (order.payType != PayService.CONS.PAY_TYPE.SYS) {
                    return OrderService.createTransferOrder(order);
                } else { //余额支付
                    return OrderService.createTransferOrder(order)
                        .then(function (_order) {
                            order = _order;
                            console.log(_order.prepareId + "," + _order._id)
                            // 交易明细
                            var orderTitle = _order.doctorRealName;
                            if (_order.productCode) {
                                orderTitle += "(" + _order.productCode + ")";
                            }
                            //购买代金券;使用优惠券券;正常
                            var sqls = '';
                            if (_order.productId) { //购买代金券,需要创建全城购代金券
                                var productSnapshot = _order.productSnapshot;
                                var assistantInfo = {
                                    productMainId: _order.productMainId + '',
                                    rewardPrice: productSnapshot.rewardPrice
                                }
                                sqls = TransactionMysqlService.genTransferPaymentForVoucherSqls(userId + '',
                                    productSnapshot.owner + '',
                                    _order.payType,
                                    productSnapshot.actualPrice,
                                    '付款: ' + _order.doctorRealName + '(代金券)',
                                    '收款: ' + _order.customerName + '(代金券)',
                                    '',
                                    _order._id + '',
                                    assistantInfo,
                                    "购买代金券;"
                                    , order.couponDeductedRMB
                                );
                            } else if (_order.couponId) { //使用代金券,需要创建24全城购特惠券
                                sqls = TransactionMysqlService.genTransferPaymentSqls(_order.customerId + '',
                                    _order.doctorMainId + '',
                                    _order.payType,
                                    _order.price,
                                    orderTitle,
                                    _order.customerName,
                                    _order.prepareId + '',
                                    _order._id + "",
                                    "转账;", order.couponDeductedRMB);
                            } else { //正常
                                sqls = TransactionMysqlService.genTransferPaymentSqls(_order.customerId + '',
                                    _order.doctorMainId + '',
                                    _order.payType,
                                    _order.price,
                                    orderTitle,
                                    _order.customerName,
                                    _order.prepareId + '',
                                    _order._id + "",
                                    "转账;");
                            }
                            console.log('sqls:', sqls);
                            return TransactionMysqlService.execSqls(sqls)
                                .then(function () { // 更新订单状态
                                    if (order.productId) { //购买代金券,需要创建全城购代金券
                                        var productSnapshot = order.productSnapshot;
                                        var coupon_new = {
                                            activityNo: constants.COUPON_ACTIVITYNO_PURCHASE,
                                            type: 5,
                                            title: productSnapshot.title,
                                            subTitle: '',
                                            description: '',
                                            manual: '',
                                            rmb: productSnapshot.displayPrice,
                                            rmbDescription: '¥' + productSnapshot.displayPrice,
                                            expiredAt: commonUtil.setValidAtSomeMonth(Date.now(), constants.COUPON_ACTIVITYNO_PURCHASE_TIME_MONTH),
                                            boundUserId: userId,
                                            boundUserPhoneNum: user.phoneNum,
                                            orderId: order._id + ''
                                        };
                                        console.log('coupon0:', coupon_new);
                                        CouponService.createCoupon(coupon_new);
                                        var prodCond = {
                                            _id: order.productId,
                                            isDeleted: false
                                        }
                                        ProductService.updateProduct(prodCond, {$inc: {stock: -1, soldNum: 1}});
                                    }
                                    if (order.couponId) { //使用代金券,使用非24全城购特惠券,需要创建24全城购特惠券
                                        if (data.couponId && coupon.type == 5) {
                                            var validAt = commonUtil.setValidAtSomeDate(24);
                                            var coupon_new = {
                                                activityNo: constants.COUPON_ACTIVITYNO_SPECIAL,
                                                type: 6,
                                                title: constants.COUPON_ACTIVITYNO_SPECIAL_TITLE,
                                                subTitle: '仅限24日当日使用',
                                                description: '',
                                                manual: '',
                                                rmb: constants.COUPON_ACTIVITYNO_SPECIAL_RMB,
                                                rmbDescription: '¥' + constants.COUPON_ACTIVITYNO_SPECIAL_RMB,
                                                expiredAt: commonUtil.setExpiredAtSomeDate(24),
                                                validAt: validAt,
                                                //dateBegin: 24,
                                                //dateEnd: 24,
                                                //timeBegin: 0,
                                                //timeEnd: 24,
                                                boundUserId: userId,
                                                boundUserPhoneNum: user.phoneNum,
                                                orderId: order._id + ''
                                            };
                                            console.log('coupon1:', coupon_new);
                                            CouponService.createCoupon(coupon_new);
                                        }
                                        //标记优惠券使用过
                                        CouponService.consumedCoupon(coupon._id, order.couponDeductedRMB);
                                        //如果isVender = true,记录优惠券抵扣金额
                                        if (business.isVender) {
                                            CustomerService.updateBaseInfo(business._id, {$inc: {couponDeductible: order.couponDeductedRMB}});
                                        }
                                    }

                                    //收款消息;如果有服务助理,跳转到其主页
                                    CustomerService.pushTransactionIncomeMsg(order);

                                    return OrderService.commonPayOrderById(_order._id);
                                });
                        })
                        .then(function () {
                            // 查询关系,判断是否已加权重,新增/更新关系
                            if (commonUtil.isUUID24bit(order.productDocId) && commonUtil.isUUID24bit(order.doctorId)) {
                                return DoctorService.isRelExists(order.doctorId, order.productDocId, "ass")
                                    .then(function (_rel) {
                                        if (!_rel) {
                                            return DoctorService.createRel({
                                                type: "ass",
                                                fromId: order.doctorId,
                                                fromRef: commonUtil.getObjectIdByStr(order.doctorId),
                                                toId: order.productDocId,
                                                toRef: commonUtil.getObjectIdByStr(order.productDocId),
                                                orderId: [order._id + ""],
                                                weight: 1
                                            });
                                        } else {
                                            var historyOrder = _rel.orderId || [];
                                            if (historyOrder.indexOf(order.orderId) < 0) {
                                                historyOrder.push(order._id + "");
                                                console.log("orders: " + historyOrder.length);
                                                // add weight
                                                return DoctorService.addRelWeight(_rel._id, 1, null, historyOrder);//[order._id + ""]);
                                            }// else do nothing
                                        }
                                    })
                            }
                        })
                }
            })
            .then(function (o) {
                apiHandler.OK(res, response);
            }, function (err) {
                apiHandler.handleErr(res, err);
            })

    };

    commonUtil.validate(payload, fields, onSuccess, onFailure);

};

//获得时间是当前年份的第几周
function theWeek(time) {
    var thisDay = new Date(time);
    var firstDay = new Date(thisDay.getFullYear(), 0, 1);//本年的第一天,Js月份从0开始记！0就是1月啦。
    var dayWeek = thisDay.getDay();//今天周几
    if (dayWeek == 0) {
        dayWeek = 7;
    }
    var startWeek = firstDay.getDay();//本年第一天周几
    if (startWeek == 0) {
        startWeek = 7;
    }
//第几周
    var weekNum = ((thisDay.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000) + startWeek - dayWeek) / 7 + 1;

    return Math.floor(weekNum);
}

OrderController.prototype.getOrderStatus = function (req, res) {
    var identity = req.identity;
    var userId = identity ? identity.userId : "";
    var prepareId = req.query.prepareId;
    var type = req.query.type;//
    if (type == 'hongbao') {
        type = 'hb';
    }
    console.log("order   TYPE         " + type);
    if (!prepareId || !userId) {
        return apiHandler.handleErr(res, ErrorHandler.genBackendError(8005));
    }
    OrderService.commonFindOrderById(type, null, prepareId)
        .then(function (_order) {
            console.log(111);
            console.log(_order);
            if (!_order) {
                return apiHandler.handleErr(res, ErrorHandler.genBackendError(8005));
            }
            console.log('_order.type:', _order.type, _order.hongbao, _order.customerId);
            if ((_order.customerId + '') != userId) {
                return apiHandler.handleErr(res, ErrorHandler.genBackendError(8005));
            }
            var resObJ = {payStatus: _order.payStatus || ""};
            if (_order.type == 'hb') {
                resObJ.hongbaoId = _order.hongbao;
            }
            //如果有购买广告位,转账收入,调用平账服务
            if ([CONS.TYPE.AD, CONS.TYPE.TRANSFER].indexOf(_order.type) > -1) {
                var incomeUserId = _order.doctorMainId;
                var incomeUserRefId = _order.doctorId;
                CustomerService.payTheNonPayment(incomeUserId, incomeUserRefId);
            }
            return apiHandler.OK(res, resObJ);
        }, function (err) {
            return apiHandler.handleErr(res, err);
        })
    // switch(type){
    //   case CONS.TYPE.AD:
    //     OrderService.commonFindOrderById(type, null, prepareId)
    //     .then(function(_order){
    //       if (!_order) {
    //         return apiHandler.handleErr(res, ErrorHandler.genBackendError(8005));
    //       }
    //       if (_order.customerId != userId) {
    //         return apiHandler.handleErr(res, ErrorHandler.genBackendError(8005));
    //       }
    //       return apiHandler.OK(res, _order.payStatus || "");
    //     })
    //     break;
    //   case CONS.TYPE.TRANSFER:
    //     OrderService.commonFindOrderById(type, null, prepareId)
    //     .then(function(_order){
    //       if (!_order) {
    //         return apiHandler.handleErr(res, ErrorHandler.genBackendError(8005));
    //       }
    //       if (_order.customerId != userId) {
    //         return apiHandler.handleErr(res, ErrorHandler.genBackendError(8005));
    //       }
    //       return apiHandler.OK(res, _order.payStatus || "");
    //     })
    //     break;
    //   default:
    //     console.log("Err: Unknown pay type!!")
    //     break;
    // }

}

OrderController.prototype.uploadOrderSharePics = function (req, res) {
    var userId = req.identity ? req.identity.userId : '',
        orderId = req.body ? req.body.orderId : '';
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isUUID24bit(orderId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }
    var payload = req.body;
    var fields = {
        required: ['orderId', 'sharePics']
    }
    var onFailure = function (hanlder, type) {
        handler(res, type);
    };
    var onSuccess = function (hanlder, data) {
        OrderService.getOrderByID(orderId)
            .then(function (o) {
                if (!o || o.callWay != 'voip') {
                    throw ErrorHandler.getBusinessErrorByCode(1401);
                }
                if ([o.callerId + '', o.calleeId + ''].indexOf(userId) < 0) {
                    throw ErrorHandler.getBusinessErrorByCode(1801);
                }
                var sharePics = [], updateData = {};

                data.sharePics.forEach(function (sharePic) {
                    if (!sharePic) {
                        return;
                    }
                    sharePics.push({
                        ownerId: userId,
                        sharePic: sharePic,
                        createdAt: new Date().getTime()
                    })
                });
                updateData['$push'] = {sharePics: {$each: sharePics}};
                return OrderService.updateOrderInfo(orderId, updateData);
            })
            .then(function (o) {
                console.log('sharePics:', o.sharePics);
                apiHandler.OK(res);
            }, function (err) {
                apiHandler.handleErr(res, err);
            });
    };
    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

OrderController.prototype.getOrderSharePics = function (req, res) {
    var userId = req.identity ? req.identity.userId : '',
        orderId = req.query.orderId;
    if (!commonUtil.isUUID24bit(userId) || !commonUtil.isUUID24bit(orderId)) {
        return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
    }

    var page = req.query.pageNum || 0,
        pageSlice = commonUtil.getCurrentPageSlice(req, page * constants.DEFAULT_PAGE_SIZE, constants.DEFAULT_PAGE_SIZE, {createdAt: -1});
    console.log('pageSlice:', pageSlice);
    OrderService.getOrderByID(orderId)
        .then(function (o) {
            if (!o || o.callWay != 'voip') {
                return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1401));
            }
            o = JSON.parse(JSON.stringify(o));
            if ([o.callerId + '', o.calleeId + ''].indexOf(userId) < 0) {
                return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1801));
            }
            var sharePics = [];
            o.sharePics.forEach(function (sharePic) {
                if (!sharePic || sharePic.isDeleted) {
                    return;
                }
                delete sharePic.isDeleted;
                sharePics.unshift(sharePic);
            });
            var resData = {
                count: sharePics.length
            }
            sharePics = sharePics.slice(pageSlice.skip, pageSlice.skip + pageSlice.limit);
            console.log('sharePics.length:', sharePics.length);
            resData.sharePics = sharePics;
            apiHandler.OK(res, resData);
        });

};
module.exports = exports = new OrderController();
