/**
 * Created by Mr.Carry on 2017/7/10.
 */
"use strict";
let red_paper_service = Backend.service('1/red_paper', 'red_paper');
let moment_service = Backend.service('1/moment', 'moment');
let user_service = Backend.service('common', 'user_service');
let config_service = Backend.service('common', 'config_service');
let TransactionMysqlService = require('../../../../app/services/TransactionMysqlService');


module.exports = {
  __beforeAction: function () {
    return userInfoAuth(this.req, {});
  },
  getAction: function () {
    //let moment_id = '59644378ce9e7e4c31f1d092';
    //let user_id = '5937b047381b03789aa18e82';
    let moment_id = this.query.moment_id;
    let current_user_id = this.req.userId;
    let user_id = '';//发布动态的用户id
    let res = {};
    return red_paper_service
      .checkRedPaper(moment_id, current_user_id)
      .then(count=> {
        if (count > 0) {
          res.isSuccess = true;
          throw new Error('已领取过该动态红包')
        }
        return moment_service.getUserId(moment_id)
      })
      .then(r=> {
        user_id = r.userId;
        return user_service.getRestTimesToday(current_user_id);
      })
      .then(count=> {
        if (count <= 0) {
          res.isSuccess = true;
          throw new Error('每天最多领取10次');
        }
        return red_paper_service.getRedPaper(moment_id, current_user_id)
      })
      .then(result=> {
        if (result) {
          res.isSuccess = true;
          res.redPaperAmount = result.amount;
        } else {
          res.isSuccess = false;
          res.redPaperAmount = 0;
        }
        res.redPaperAmount = result.amount;
        return config_service.getHeavenConfigInfo();
      }).then(r => {
        res.shareAmount = r.inviteValue;
        return red_paper_service
          .getUser([user_id])
      })
      .then(function (r) {
        res.name = r[0].name;
        res.avatar = r[0].avatar;
        return red_paper_service.getRedPaperRemainder(moment_id);
      })
      .then(count=> {
        res.redPaperNumber = count || 0;
      })
      .then(function () {
        //3.平账
        if (res.isSuccess) {
          var sqls = TransactionMysqlService.genMomentRedPaperSqls(current_user_id, res.redPaperAmount, "hongbao_" + getNewObjectId(), "",
            false, {hongbaoFrom: res.name});
          TransactionMysqlService.execSqls(sqls).then(item => {

          });
        }
      })
      .then(function () {
        return user_service.reduceRestTimesToday(current_user_id)
      })
      .then(function (r) {
          console.log(r);
          return user_service.getInfoByUserId(user_id)
      })
      .then(function(_user) {
          return user_service.robRedPaperFollow(current_user_id, _user.doctorRef + '');
      })
      .then(function () {
          return res;
      })
      .catch(err=> {
        console.log(err)
        return {
          "isSuccess": false,
          "shareAmount": 0,
          "name": "",
          "avatar": "",
          "redPaperNumber": 0
        }
      })
  },
  mockAction: function () {
    return this.success({
      "redPaperAmount": 0.12,
      "redPaperNumber": 4,
      "shareAmount": 3.0,
      "avatar": "EDA813A9-4379-47B6-B966-F162F7529021",
      "name": "于世民",
      "isSuccess": true
    });
  }
};