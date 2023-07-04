///**
// * Created by guoyichen on 2017/1/12.
// */
//
//var
//  _ = require('underscore'),
//  Doctor = require('../../app/models/Doctor'),
//  Customer = require('../../app/models/Customer'),
//  DoctorService = require('../../app/services/DoctorService'),
//  async = require('async');
//
//var error = 0;
//Customer.find({docChatNum: /^6/})
//  .then(function (_cList) {
//    console.log(_cList.length);
//    var counter = 0;
//    async.whilst(
//      function () {
//        return counter < _cList.length;
//      },
//      function (cb) {
//        console.log(counter);
//        _cList[counter]._docChatNum = _cList[counter].docChatNum;
//        //FIXME!!!!!! BUG!!!!
//        // _cList[counter].docChatNum = "802" + _cList[counter].docChatNum.replace(_cList[counter].docChatNum.substring(1, 3), "");
//        console.log(_cList[counter].docChatNum);
//        //_cList[counter].save()
//        Customer.update(
//          {_id: _cList[counter]._id},
//          {
//            docChatNum: _cList[counter].docChatNum,
//            _docChatNum: _cList[counter]._docChatNum,
//            updatedAt: Date.now()
//          })
//          .then(function (v) {
//            return DoctorService.updateBaseInfo(
//              _cList[counter].doctorRef,
//              {"docChatNum": _cList[counter].docChatNum});
//          })
//          .then(function (b) {
//            counter++;
//            cb();
//          }, function (err) {
//            console.log("Err!!!!" + err);
//            error++;
//            counter++;
//            cb();
//          })
//
//      },
//      function (err, result) {
//        if (err) console.log("Err: " + err);
//        console.log('all has completed ', "ERR", error);
//      }
//    );
//  });
