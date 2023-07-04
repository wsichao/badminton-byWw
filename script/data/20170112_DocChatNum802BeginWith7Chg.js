/**
 * Created by guoyichen on 2017/1/12.
 */

var
  _ = require('underscore'),
  Doctor = require('../../app/models/Doctor'),
  Customer = require('../../app/models/Customer'),
  async = require('async'),
  DoctorService = require('../../app/services/DoctorService'),
  list = [];

var error = 0;
Customer.find({docChatNum: /^802/}, "docChatNum")
  .then(function (_list) {
    _list.forEach(function (d) {
      list.push(d.docChatNum);
    });
    console.log("begin with 802:" + _list.length);
    console.log(list[0]);
    console.log(list.indexOf('8027212742'));
    return list;
  })
  .then(function (v) {
    return Customer.find({docChatNum: /^7/}).exec();
  })
  .then(function (_cList) {
    console.log(_cList.length);
    var counter = 0;
    async.whilst(
      function () {
        return counter < _cList.length;
      },
      function (cb) {
        console.log(counter);
        _cList[counter]._docChatNum = _cList[counter].docChatNum;
        _cList[counter].docChatNum = "8027" + _cList[counter].docChatNum.substr(4,5);//replace(_cList[counter].docChatNum.substring(1, 3), "");
        if (list.indexOf(_cList[counter].docChatNum) >= 0) {
          var startNum = '8027';
          var randNum = 5;
          var min = 1;
          DoctorService.genDoctorChatNum(startNum, randNum, min)
            .then(function (docChatNum) {
              _cList[counter].docChatNum = docChatNum;
              //return _cList[counter].save()
              list.push(docChatNum);
              return Customer.update(
                {_id: _cList[counter]._id},
                {
                  docChatNum: _cList[counter].docChatNum,
                  _docChatNum: _cList[counter]._docChatNum,
                  updatedAt: Date.now()
                }).exec();
            })
            .then(function () {
              return DoctorService.updateBaseInfo(
                _cList[counter].doctorRef,
                {"docChatNum": _cList[counter].docChatNum});
            })
            .then(function (v) {
              counter++;
              cb();
            }, function (err) {
              console.log("Error " + err);
              error++;
              counter++;
              cb();
            })
        } else {
          list.push(_cList[counter].docChatNum);
          Customer.update(
            {_id: _cList[counter]._id},
            {
              docChatNum: _cList[counter].docChatNum,
              _docChatNum: _cList[counter]._docChatNum,
              updatedAt: Date.now()
            })
            .then(function (v) {
              return DoctorService.updateBaseInfo(
                _cList[counter].doctorRef,
                {"docChatNum": _cList[counter].docChatNum});
            })
            .then(function (b) {
              counter++;
              cb();
            }, function (err) {
              console.log("Err!!!!" + err);
              error++;
              counter++;
              cb();
            })
        }
      },
      function (err, result) {
        if (err) console.log("Err: " + err);
        console.log('all has completed');
      }
    );
  });

