/**
 * Created by guoyichen on 2016/12/6.
 */
var
  constants = require('../configs/constants'),
  util = require("../../lib/common-util"),
  DoctorService = require("../services/DoctorService"),
  OrderService = require("../services/OrderService"),
  ErrorHandler = require('../../lib/ErrorHandler'),
  _ = require('underscore')

var WebCallController = function () {
};
/**
 *
 * @param req
 * @param res
 */
WebCallController.prototype.webcallInit = function (req, res) {
  var from = req.query.from
    , timestamp = req.query.timestamp
    , phoneNum = req.query.phoneNum
    , name = req.query.name
    , type = req.query.type
    , secret = req.query.secret
  console.log(JSON.stringify(from + "&" + type));
  var errPage = function (res, err) {
    res.render("./adviser/403.html", {err: err})
  };
  var okPage = function (type, phoneNum, name) {
    var data = {};
    var grp;
    DoctorService.getDocListByDocGrpNum(type, {
      "avatar": 1,
      "_id": 1,
      "dacChatNum": 1,
      "name": 1,
      "docChatNum": 1,
      "doctorRef": 1
    })
      .then(function (_grp) {
        if (!_grp) {
          throw ErrorHandler.genBackendError(1504);
        }
        grp = _grp;
        var idArray = [];
        for (var i = 0; i < _grp.length; i++) {
          idArray.push(_grp[i]._id + "");
        }
        console.log(idArray.length);
        return OrderService.getNotBusyList(idArray);
      })
      .then(function (idGrp) {
        console.log(idGrp.length);
        if (idGrp.length == 0) {
          res.render("./adviser/book.html");
        }
        var j = Math.floor(Math.random() * idGrp.length);
        data.phoneNum = phoneNum;
        data.name = name;
        for (var i = 0; i < grp.length; i++) {
          if (grp[i]._id == idGrp[j]) {

            data.info = grp[i].doctorRef;
            break;
          }
        }
        return OrderService.getValidPhoneOrderCountByDoctorID(data.info._id)
      })
      .then(function (count) {
        data.orderNum = count + "";
        if ((data.info.callPrice.initiatePayment + data.info.callPrice.paymentPerMin) > 0) {
          console.log(data.info)
          return errPage(res, "医生信息有误")
        } else {
          console.log(JSON.stringify(data));
          res.render("./adviser/adviser_main", {data: JSON.stringify(data)})
        }
      });
  }
  if (!util.isAllExist([from, type])) {
    return errPage(res, "未知来源");
  }
  // 判断操作
  var fromMap = _.indexBy(constants.WEBCALL_TYPE, 'from');
  var fromObj = fromMap[from];
  if (fromObj) {
    if (secret) {
      if (!util.isAllExist([timestamp, secret])) {
        return errPage(res, "无秘钥");
      }
      var secData = "";
      secData += from;
      secData += timestamp;
      secData += type;
      if (phoneNum) {
        secData += phoneNum;
      }
      if (name) {
        secData += name;
      }
      var cacuSecret = util.commonMD5(secData, fromObj.salt);
      console.log(cacuSecret);
      if (cacuSecret == secret) {
        okPage(type, phoneNum, name);
      } else {
        return errPage(res, "秘钥错误");
      }
    } else {
      return okPage(type)
    }
  } else {
    return errPage(res, "来源错误")
  }
}
module.exports = exports = new WebCallController()