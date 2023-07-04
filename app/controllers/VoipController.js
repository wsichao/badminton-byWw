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
    CallController = require('./CallController'),
    CustomerService = require('../services/CustomerService'),
    DoctorService = require('../services/DoctorService'),
    OrderService = require('../services/OrderService'),
    VoipService = require('../services/VoipService');

var VoipController = function VoipController () {
}
VoipController.prototype.constructor = VoipController;

VoipController.prototype.setAccidAndToken = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['userId', 'role']
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var userId = data.userId,
            role = data.role;
        if (_.keys(data).length == 0) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8001));
        }
        if (['doctor', 'customer'].indexOf(role) < 0) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        var ServiceMap = {
            doctor: DoctorService,
            customer: CustomerService
        }
        var resData = {};
        var existAccid = false;
        ServiceMap[data.role].getInfoByID(userId)
            .then(function (user) {
                if (!user) {
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                }
                console.log('user:',user.accid);
                if (user.accid && user.callToken) {
                    resData.accid = user.accid;
                    resData.callToken = user.callToken;
                    existAccid = true;
                    //TODO:
                    return resData;
                }
                VoipService.setAccidAndToken(user._id + '', {name: user.phoneNum});
            })
            .then(function (resObj) {
                if(existAccid)
                    return;
                var errMap = {
                    403: 1801,
                    414: 1802,
                    416: 1803,
                    431: 1804,
                    500: 1805
                }
                if (resObj.code != 200) {
                    return apiHandler.handleErr(res, errMap[resObj.code] ? ErrorHandler.getBusinessErrorByCode(errMap[resObj.code]) : resObj.err);
                }
                var info = resObj.info;
                console.log('resObj:', resObj);
                var updateData = {
                    $set: {accid: info.accid, callToken: info.token, updatedAt: Date.now()}
                }
                return ServiceMap[role].updateBaseInfo(userId, updateData);
            })
            .then(function(u){
                if(existAccid)
                    return apiHandler.OK(res, resData);
                resData.accid = u.accid;
                resData.callToken = u.callToken;
                return apiHandler.OK(res, resData);
            }, function (err) {
                console.log(err);
                apiHandler.handleErr(res, err);
            })

    };
    commonUtil.validate(payload, fields, onSuccess, onFailure);
};


VoipController.prototype.updateAccid = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['userId', 'accid', 'role']
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var userId = data.userId,
            accid = data.accid,
            role = data.role;
        if (_.keys(data).length == 0) {
            throw ErrorHandler.getBusinessErrorByCode(8001);
        }
        if (['doctor', 'customer'].indexOf(role) < 0) {
            throw ErrorHandler.getBusinessErrorByCode(8005);
        }
        VoipService.updateAccid(accid)
            .then(function(resObj){
                var errMap = {
                    403: 1801,
                    414: 1802,
                    416: 1803,
                    431: 1804,
                    500: 1805
                }
                if (resObj.code != 200) {
                    throw errMap[resObj.code] ? ErrorHandler.getBusinessErrorByCode(errMap[resObj.code]) : resObj.err;
                }
                var ServiceMap = {
                    doctor: DoctorService,
                    customer: CustomerService
                }
                var updateData = {
                    $set: {accid: accid, updatedAt: Date.now()}
                }
                return ServiceMap[data.role].updateBaseInfo(userId, updateData);
            })
            .then(function(u){
                return apiHandler.OK(res);
            }, function (err) {
                console.log(err);
                apiHandler.handleErr(res, err);
            });
    };
    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

VoipController.prototype.updateToken = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['userId', 'accid', 'role']
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var userId = data.userId,
            accid = data.accid,
            role = data.role;
        if (_.keys(data).length == 0) {
            throw ErrorHandler.getBusinessErrorByCode(8001);
        }
        if (['doctor', 'customer'].indexOf(role) < 0) {
            throw ErrorHandler.getBusinessErrorByCode(8005);
        }
        VoipService.updateToken(accid)
            .then(function(resObj){
                var errMap = {
                    403: 1801,
                    414: 1802,
                    416: 1803,
                    431: 1804,
                    500: 1805
                }
                if (resObj.code != 200) {
                    throw errMap[resObj.code] ? ErrorHandler.getBusinessErrorByCode(errMap[resObj.code]) : resObj.err;
                }
                var ServiceMap = {
                    doctor: DoctorService,
                    customer: CustomerService
                }
                var info = resObj.info;
                var updateData = {
                    $set: {accid: info.accid, callToken: info.token, updatedAt: Date.now()}
                }
                return ServiceMap[data.role].updateBaseInfo(userId, updateData);
            })
            .then(function(u){
                return apiHandler.OK(res, {accid: u.accid, callToken: u.callToken});
            }, function (err) {
                console.log(err);
                apiHandler.handleErr(res, err);
            });
    };
    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

VoipController.prototype.blockAccid = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['userId', 'accid', 'role'],
        optional: ['needkick']
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var userId = data.userId,
            accid = data.accid,
            needkick = data.needkick,
            role = data.role;
        if (_.keys(data).length == 0) {
            throw ErrorHandler.getBusinessErrorByCode(8001);
        }
        if (['doctor', 'customer'].indexOf(role) < 0) {
            throw ErrorHandler.getBusinessErrorByCode(8005);
        }
        VoipService.blockAccid(accid, {needkick: needkick})
            .then(function(resObj){
                var errMap = {
                    403: 1801,
                    414: 1802,
                    416: 1803,
                    431: 1804,
                    500: 1805
                }
                if (resObj.code != 200) {
                    throw errMap[resObj.code] ? ErrorHandler.getBusinessErrorByCode(errMap[resObj.code]) : resObj.err;
                }
                var ServiceMap = {
                    doctor: DoctorService,
                    customer: CustomerService
                }
                var info = resObj.info;
                var updateData = {
                    $set: {isAccidBlocked: true, updatedAt: Date.now()}
                }
                return ServiceMap[data.role].updateBaseInfo(userId, updateData);
            })
            .then(function(u){
                return apiHandler.OK(res, {accid: u.accid, callToken: u.callToken});
            }, function (err) {
                console.log(err);
                apiHandler.handleErr(res, err);
            });
    };
    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

VoipController.prototype.unblockAccid = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['userId', 'accid', 'role'],
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        var userId = data.userId,
            accid = data.accid,
            role = data.role;
        if (_.keys(data).length == 0) {
            throw ErrorHandler.getBusinessErrorByCode(8001);
        }
        if (['doctor', 'customer'].indexOf(role) < 0) {
            throw ErrorHandler.getBusinessErrorByCode(8005);
        }
        VoipService.unblockAccid(accid)
            .then(function(resObj){
                var errMap = {
                    403: 1801,
                    414: 1802,
                    416: 1803,
                    431: 1804,
                    500: 1805
                }
                if (resObj.code != 200) {
                    throw errMap[resObj.code] ? ErrorHandler.getBusinessErrorByCode(errMap[resObj.code]) : resObj.err;
                }
                var ServiceMap = {
                    doctor: DoctorService,
                    customer: CustomerService
                }
                var updateData = {
                    $set: {isAccidBlocked: false, updatedAt: Date.now()}
                }
                return ServiceMap[data.role].updateBaseInfo(userId, updateData);
            })
            .then(function(u){
                return apiHandler.OK(res, {accid: u.accid, callToken: u.callToken});
            }, function (err) {
                console.log(err);
                apiHandler.handleErr(res, err);
            });
    };
    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

VoipController.prototype.updateAccidAndToken = function (req, res) {
    console.log('come in 0');
    var payload = req.body;
    var fields = {
        required: ['callerAccid', 'token', 'callerId', 'callerRole', 'calleeId', 'calleeRole']
    };
    var queryUser = function (userId, Service) {
        console.log('come in 0.9',Service.constructor);
        var defer = Q.defer();
        Service.getInfoByID(userId)
            .then(function(user){
                if (!user) {
                    console.log('come in 1');
                    return defer.reject(ErrorHandler.getBusinessErrorByCode(1503));
                }
                return defer.resolve(user);
            });
        return defer.promise;
    };

    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        if (_.keys(data).length == 0) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8001));
        }
        var callerAccid = data.callerAccid,
            callerToken = data.callerToken,
            callerId = data.callerId,
            callerRole = data.callerRole,
            calleeId = data.calleeId,
            calleeRole = data.calleeRole;
        if (['doctor', 'customer'].indexOf(callerRole) < 0 || ['doctor', 'customer'].indexOf(calleeRole) < 0) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8005));
        }
        var ServiceMap = {
            doctor: DoctorService,
            customer: CustomerService
        }
        var resData = {};
        var qTasks = [queryUser(callerId,ServiceMap[callerRole]),queryUser(calleeId,ServiceMap[calleeId])];
        Q.all(qTasks)
            .then(function(result){
                console.log('result:',result);
                var caller= result[0],
                    callee= result[1];
                if(caller.accid != callerAccid || caller.token != callerToken){
                    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1806));
                }

                apiHandler.OK(res,result);
            },function(err){
                apiHandler.handleErr(res, err);
            })
            .done();
        ServiceMap[data.role].getInfoByID(userId)
            .then(function (user) {
                if (!user) {
                    console.log('come in 1');
                    throw ErrorHandler.getBusinessErrorByCode(1503);
                }
                if (user.accid && user.callToken) {
                    console.log('come in 2');
                    resData.accid = user.accid;
                    resData.callToken = user.callToken;
                    return apiHandler.OK(res, resData);
                }
                setAccidAndToken(user._id + '', {name: user.phoneNum}, function (resObj) {
                    var errMap = {
                        403: 1801,
                        414: 1802,
                        416: 1803,
                        431: 1804,
                        500: 1805
                    }
                    if (resObj.code != 200) {
                        return apiHandler.handleErr(res, errMap[resObj.code] ? ErrorHandler.getBusinessErrorByCode(errMap[resObj.code]) : resObj.err);
                    }
                    var info = resObj.info;
                    console.log('come in 3');
                    console.log('resObj:', resObj);
                    var updateData = {
                        $set: {accid: info.accid, callToken: info.token, updatedAt: Date.now()}
                    }
                    ServiceMap[data.role].updateBaseInfo(user._id, updateData).then(function (user) {
                        console.log('come in 4');
                        resData.accid = user.accid;
                        resData.callToken = user.callToken;
                        return apiHandler.OK(res, resData);
                        ;
                    });
                })
            }, function (err) {
                console.log(err);
                apiHandler.handleErr(res, err);
            });
    };
    commonUtil.validate(payload, fields, onSuccess, onFailure);
    var qTasks = [queryUser()];
};

VoipController.prototype.actionCallback = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['callerAccid', 'calleeAccid', 'orderId', 'role', 'action'],
        optional: ['time']
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        if (_.keys(data).length == 0) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8001));
        }
        var callerAccid = data.callerAccid,
            calleeAccid = data.calleeAccid,
            role = data.role,
            action = data.action,
            time =  data.time ||new Date().getTime(),//TODO:
            orderId = data.orderId;
        if(['caller', 'callee'].indexOf(role) < 0 ){
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1811));
        }
        var roleAction = [];
        if(role == 'caller'){
            roleAction = ["CALLER_EMIT", "CALLER_EMIT_HANGUP", "CALLER_EMIT_SUCCESS", "CALLER_RING_HANGUP", "CALLER_CALLING_HANGUP"];
        }else {
            roleAction = ["CALLEE_RING_HANGUP", "CALLEE_RING_REV", "CALLEE_CALLING_HANGUP"];
        }
        if (roleAction.indexOf(action) < 0 ) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1811));
        }
        var sequenceMap = {//动作时序
            'CALLER_EMIT': 0,
            'CALLER_EMIT_SUCCESS': 1,
            'CALLER_EMIT_HANGUP': 1,
            'CALLER_RING_HANGUP': 2,
            'CALLEE_RING_HANGUP': 2,
            'CALLEE_RING_REV': 3,
            'CALLER_CALLING_HANGUP': 4,
            'CALLEE_CALLING_HANGUP': 4,
        }
        var byeTypeMap = {//结束类型
            'CALLER_EMIT': -10,
            'CALLER_EMIT_HANGUP': -3,
            'CALLER_RING_HANGUP': -10,
            'CALLEE_RING_HANGUP': -9,
            'CALLER_CALLING_HANGUP': -10,
            'CALLEE_CALLING_HANGUP': 4,
            'CALLER_EMIT_SUCCESS': 11,//??
            'CALLEE_RING_REV': 12,//??
        }
        var fieldMap = {
            'CALLER_EMIT_SUCCESS': 'ringingbegintime',
            'CALLER_RING_HANGUP': 'ringingendtime',
            'CALLEE_RING_HANGUP': 'ringingendtime',
            'CALLEE_RING_REV': 'ringingendtime',
        };
        var field = fieldMap[action];
        var updateData = {};
        updateData['$set'] = {};
        if(field){
            updateData['$set'][field] = time;
        }
        updateData['$set']['byetype'] = byeTypeMap[action];
        OrderService.getOrderByID(orderId)
            .then(function(o){
                if(!o){
                    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1401));
                }
                if(sequenceMap[o.voipStatus] <  sequenceMap[action]){
                    updateData['$set']['voipStatus'] = action;
                }
                var overStatusArray = ['CALLER_EMIT_HANGUP','CALLER_RING_HANGUP','CALLEE_RING_HANGUP'];//未通话挂断
                if(overStatusArray.indexOf(action) > -1 && o.callStatus != 'over'){
                    updateData['$set']['callStatus'] = 'over';
                }
                return OrderService.updateOrderInfo(orderId,updateData);
            })
            .then(function(o){
                return apiHandler.OK(res);
            }, function(err){
                console.log(err);
                apiHandler.handleErr(res, err);
            });
    };
    commonUtil.validate(payload, fields, onSuccess, onFailure);
    //TODO: 更新订单状态
};

VoipController.prototype.successCallback = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['orderId', 'theHangup'],
        optional: ['time']
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        if (_.keys(data).length == 0) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8001));
        }
        var theHangup = data.theHangup,
            time =  data.time ||new Date().getTime(),//TODO:
            orderId = data.orderId;
        if(['caller', 'callee'].indexOf(theHangup) < 0 ){
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1811));
        }
        var byeTypeMap = {//结束类型
            'caller': '3',
            'callee': '4',
        }
        var updateData = {};
        updateData['$set'] = {};
        updateData['$set']['byetype'] = byeTypeMap[theHangup];
        OrderService.getOrderByID(orderId)
            .then(function(o){
                if(!o){
                    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1401));
                }
                return OrderService.updateOrderInfo(orderId,updateData);
            })
            .then(function(o){
                return apiHandler.OK(res);
            }, function(err){
                console.log(err);
                apiHandler.handleErr(res, err);
            });
    };
    commonUtil.validate(payload, fields, onSuccess, onFailure);
};

VoipController.prototype.failCallback = function (req, res) {
    var payload = req.body;
    var fields = {
        required: ['orderId', 'theHangup', 'failType'],
        optional: ['time']
    };
    var onFailure = function (handler, type) {
        handler(res, type);
    };
    var onSuccess = function (handler, data) {
        if (_.keys(data).length == 0) {
            return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(8001));
        }
        var theHangup = data.theHangup,
            failType = data.failType,
            time =  data.time ||new Date().getTime(),//TODO:
            orderId = data.orderId;
        var byeTypeMap = {//结束类型
            'caller': '-3',
            'callee': '-9',
        }
        var updateData = {};
        updateData['$set'] = {};
        if(theHangup == 'caller'){//zly_fail_caller   zly_fail_callee
            updateData['$set']['byetype'] = byeTypeMap['caller'];
        }else if(theHangup == 'callee'){
            updateData['$set']['byetype'] = byeTypeMap['callee'];
        }
        updateData['$set']['callStatus'] = 'over';
        //404:对方不存在  414:参数错误  403:非法操作或没有权限  11001:通话不可达，对方离线状态
        //code 408:超时 12:正在通话

        //callStatus=failed 原因：1303-余额不足  1402-有欠费订单 1301-医生不在线 1302-医生正忙 1304-患者正忙 5001-双向回拨请求失败 5002-voip无应答,5003-voip通话不可达，对方离线状态
        //未生成订单：1503用户不存在，1205空号，1209号码被冻结，1808被叫方版本低,不支持voip通话
        //生成订单： 正常挂断，无应答，net
        var codeReasonMap = {
            'no_reply' : '5002',//无应答
            '11001' : '5003'//voip通话不可达，对方离线状态
        }
        if(theHangup == 'neither'){
            updateData['$set']['callStatus'] = 'failed';
            if(['no_reply','11001'].indexOf(failType) > -1){
                updateData['$set']['failedReason'] = codeReasonMap[failType];
            }
        }
        OrderService.getOrderByID(orderId)
            .then(function(o){
                if(!o){
                    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1401));
                }
                return OrderService.updateOrderInfo(orderId,updateData);
            })
            .then(function(o){
                if (failType == '11001'){
                    console.log('11001:',o.calleePhoneNum,o.calleeName,o.callerName);
                    commonUtil.sendSms("1640790", o.calleePhoneNum, "#doctorName#=" + o.calleeName + "&#customerName#=" + o.callerName );
                }
                return apiHandler.OK(res);
            }, function(err){
                console.log(err);
                apiHandler.handleErr(res, err);
            });
    };
    commonUtil.validate(payload, fields, onSuccess, onFailure);
};


VoipController.prototype.callbackVoip = function (req, res) {
    console.log('callbackVoip:',req.body,req.headers);
    if(_.isEmpty(req.body)){
        return apiHandler.OK(res);
    }
    var payload = JSON.stringify(req.body);
    var headers = req.headers;
    //var MD5 = VoipService.genMD5(payload);
    var genCheckSum = VoipService.genCheckSum(headers['md5'], headers['curtime']);
    console.log(headers['checksum'],genCheckSum);
    if(headers['checksum'] != genCheckSum){
        console.error('checksum校验错误');
        return  apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1809));
    }
    payload = JSON.parse(payload);
    //if(['5', '6'].indexOf(payload.eventType) < 0){
    //    return  apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1811));
    //}
    if(payload.eventType == '5'){//音频通话抄送
        //if(payload.type != 'AUDIO' || payload.live != '0'){
        //    return apiHandler.handleErr(res, ErrorHandler.getBusinessErrorByCode(1811));
        //}
        var members = payload.members;
        if(typeof members == 'string'){
            members = JSON.parse(members);
        }
        console.log('members:',typeof members , members.constructor, members);
        var voipCond = {
            channelId: payload.channelId,
        }
        var callerDuration, calleeDuration, totalDuration = payload.duration;
        members.forEach(function(member){
            if(member.caller){
                callerDuration = member.duration;
                voipCond.callerAccid = member.accid;
            }else{
                calleeDuration = member.duration;
                voipCond.calleeAccid = member.accid;
            }
        });
        var minDuration = Math.min(callerDuration, calleeDuration, totalDuration);
        var promise =  OrderService.getOrderByAccids(voipCond.callerAccid, voipCond.calleeAccid, Number(payload.createtime))
            .then(function(o){
                if (!o){
                    payload.members = JSON.stringify(payload.members);
                    VoipService.createVoipCallback(payload.channelId, payload);
                    throw ErrorHandler.getBusinessErrorByCode(1401);
                } else if (o.callStatus == "over" && o.channelId == payload.channelId){
                    throw ErrorHandler.getBusinessErrorByCode(1403);
                }
                var data = {};
                console.log("Direction " + o.direction);
                if(o.callerId){ //新订单
                    data.channelId = payload.channelId;
                    //data.byetype = payload.cdr.byetype[0];
                    data.begincalltime = payload.createtime;
                    //data.ringingbegintime = payload.cdr.ringingbegintime[0];
                    //data.ringingendtime = payload.cdr.ringingendtime[0];
                    if (payload.status == 'SUCCESS'){ //通话成功
                        data.time = minDuration;
                        data.callStatus = 'over';
                    }else{
                        data.time = 0;
                        data.callStatus = 'failed';
                    }
                    data.byetype = 3;//先默认为主叫挂断
                    data.callerPayment = OrderService.getCustomerPayment(data.time, o);
                    data.calleeIncome = OrderService.getDocIncome(data.time, o);
                    if(data.callerPayment == 0 && data.calleeIncome ==0){
                        data.payStatus = 'paid';
                        data.updatedAt = Date.now();
                    }
                    console.log('data:',data);
                    return OrderService.updateOrderInfo(o._id, data);
                    //CallController.orderNextTodo(OrderService.updateOrderInfo(o._id, data),res);//更新订单相关信息
                }else{ //老订单

                    data.channelId = payload.channelId;
                    //data.byetype = payload.cdr.byetype[0];
                    data.begincalltime = payload.createtime;
                    //data.ringingbegintime = payload.cdr.ringingbegintime[0];
                    //data.ringingendtime = payload.cdr.ringingendtime[0];
                    if (payload.status == 'SUCCESS'){ //通话成功
                        data.time = minDuration;
                        data.callStatus = 'over';
                    }else{
                        data.time = 0;
                        data.callStatus = 'failed';
                    }
                    data.byetype = 3;//先默认为主叫挂断
                    if (o.direction == 'C2D' && data.time != 0) {//患者打给医生
                        data.customerPayment = o.isMyExclusiveDoctor ? 0 : OrderService.getCustomerPayment(data.time, o);
                        data.doctorIncome = o.isMyExclusiveDoctor ? 0 : OrderService.getDocIncome(data.time, o);
                    } else if (data.time != 0) {  //不用付费
                        data.payStatus = 'paid';
                        data.updatedAt = Date.now();
                    } else {
                        data.updatedAt = Date.now();
                    }
                    console.log('data:',data);
                    return OrderService.updateOrderInfo(o._id, data, true);

                }
            });
        CallController.orderNextTodo_pre(promise,res);//更新订单相关信息

    } else if(payload.eventType == '6'){
        //抄送音频录音
        console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
        var fileInfo = payload.fileinfo;
        if(typeof payload.fileinfo == 'string'){
            fileInfo = JSON.parse(payload.fileinfo);
        }
        var fileInfo = fileInfo[0];
        console.log('fileInfo:',typeof fileInfo, fileInfo);
        var updateData = fileInfo;
        VoipService.createRecord(fileInfo.channelid, updateData)
            .then(function(o){
                apiHandler.OK(res);
            },function(err){
                apiHandler.handleErr(res, err);
            });
    }
};
module.exports = new VoipController();