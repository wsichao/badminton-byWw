/**
 * Created by guoyichen on 2017/2/23.
 */

var
    _ = require('underscore'),
    Doctor = require('../../app/models/Doctor'),
    Customer = require('../../app/models/Customer'),
    async = require('async'),
    DoctorService = require('../../app/services/DoctorService'),
    Q = require("q");


//var error = 0;
var outCount = 0;
var err = 0 ;
var ok = 0;
var chatCounter = 1;
var total;
var existsDocChatNum;
//var _GenDocChatNum = function () {
//    var prefix = "803";
//    chatCounter++;
//    for (var i = 0; i < 1000; i++) {// 限尝试10次,否则失败 @fixme
//        var docChatNum = prefix + commonUtil.getRandomNumByStr("1", "999999", 6);
//        if (!_.contains(_chatNums, docChatNum) && !_.contains(reservedDocChatNum, docChatNum))
//            return docChatNum;
//    }
//
//    return num;
//};
var now = Date.now();
Q.all([
    Customer.count({ doctorRef : { $exists : false },isDeleted:false }),
    DoctorService.distinctDocChatNum()
])
    .then(function(list){
        total = list[0];
        existsDocChatNum = list[1];
        async.whilst(
            function () {
                return outCount !=-1;
            },
            function (cbd) {
                Customer.find({ doctorRef : { $exists : false },isDeleted:false },"phoneNum docChatNum sex name avatar profile pinyinName").limit(1000).exec(function(err, _users){
                    //.then(function(_users){
                   // outCount = 1;
                    if(!_users || _users.length<=0){
                        outCount = -1;
                        cbd();
                    }
                    var counter = 0;
                    async.whilst(
                        function () {
                            return counter < _users.length ;
                        },
                        function (cb) {
                            console.log(counter);
                            console.log(_users.length)
                            console.log(total);
                            console.log("total docChatNum Count " + existsDocChatNum.length)
                            var startNum = '801';
                            var randNum = 6;
                            var min = 1;
                            DoctorService.genDoctorChatNum(startNum, randNum, min,null,null,existsDocChatNum)
                                .then(function(docChatNum){
                                    console.log("docChatNum:" + docChatNum);
                                    existsDocChatNum.push(docChatNum);
                                    var docData = {};
                                    docData.applyStatus = 'done';
                                    docData.docChatNum = docChatNum;
                                    docData.phoneNum = _users[counter].phoneNum;
                                    docData.callPrice = {
                                        customerInitiateTime : 5 ,
                                        doctorInitiateTime : 5 ,
                                        initiatePayment : 0 ,
                                        initiateIncome : 0 ,
                                        paymentPerMin : 0 ,
                                        incomePerMin : 0 ,
                                        canLackMoney : false ,
                                        lackedMoney : 0
                                    };
                                    docData.realName = _users[counter].name;
                                    docData.sex = _users[counter].sex;
                                    docData.isOnline = true;
                                    return DoctorService.applyTobeDoctor(docData);
                                })
                                .then(function(_doctor) {
                                    var update = {};
                                    update.doctorRef = _doctor._id;
                                    update.docChatNum = _doctor.docChatNum;
                                    update.updatedAt = now;
                                    var condition = {
                                        _id : _users[counter]._id,
                                        isDeleted : false
                                    }
                                    return Customer.findOneAndUpdate(condition, update).exec();
                                })
                                .then(function(){
                                    counter++;
                                    ok++;
                                    cb();
                                },function(err){
                                    console.log("ERR: " + err);
                                    counter++;
                                    err++;
                                    cb();
                                })
                        },
                        function (err, result) {
                            if (err) console.log("Err: " + err);
                            console.log('all has completed');
                            cbd()
                        }
                    );
                });

            },
            function (err, result) {
                if (err) console.log("OUT Err: " + err);
                console.log('OUT all has completed', ok , err);
            })
    })






