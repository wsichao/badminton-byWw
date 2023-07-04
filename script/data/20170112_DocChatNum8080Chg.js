/**
 * Created by guoyichen on 2017/1/12.
 */

var
  _ = require('underscore'),
  Doctor = require('../../app/models/Doctor'),
  Customer = require('../../app/models/Customer'),
  DoctorService = require('../../app/services/DoctorService'),
  async = require('async');

Customer.find({docChatNum: /^80260/ }) ///^(0|1|5)/
  .then(function (_cList) {
    console.log(_cList.length);
    var counter = 0;
    async.whilst(
      function () {
        return counter < _cList.length;
      },
      function (cb) {
        console.log(counter);
        //if (['00001', '00002', '00003'].indexOf(_cList[counter].docChatNum) < 0){
          //_cList[counter]._docChatNum = _cList[counter].docChatNum;
        _cList[counter].docChatNum = "8026" + _cList[counter].docChatNum.substr(5,5);
        //}
        //_cList[counter].save()
        Customer.update(
          {_id: _cList[counter]._id},
          {
            docChatNum: _cList[counter].docChatNum,
            //_docChatNum: _cList[counter]._docChatNum,
            updatedAt: Date.now()
          })
          .then(function (v) {
            return DoctorService.updateBaseInfo(
              _cList[counter].doctorRef,
              {
                "docChatNum": _cList[counter].docChatNum,
                updatedAt: Date.now()
              })
          })
          .then(function (b) {
            counter++;
            cb();
          }, function (err) {
            console.log("ERR: " + err);
            counter++;
            cb();
          })
      },
      function (err, result) {
        if (err) console.log("Err: " + err);
        console.log('all has completed');
      }
    );
  });