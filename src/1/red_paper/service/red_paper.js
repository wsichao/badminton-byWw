/**
 * Created by Mr.Carry on 2017/7/10.
 */
"use strict";

let _ = require('underscore');
let red_paper_model = Backend.model('1/red_paper', undefined, 'red_paper');
let customer_model = Backend.model('common', undefined, 'customer');
let moment = require('moment');
let invite_record_model =Backend.model('1/red_paper',undefined,"invite_record");


module.exports = {
  /**
   * 获取红包组,10个红包共2元
   * @returns {*}
   */
  getRedPaperNumbers: function () {
    var numberList = [0.01, 0.06, 0.12, 0.16,
      0.18, 0.22, 0.24, 0.28, 0.34, 0.39,];
    return _.shuffle(numberList);
  },
  chanceGetRedPaper: function(momentId,userId,location){
    var that = this;
    var now = Date.now();
    var chance = 1; //100%发红包
    if (!location) {
      chance = 0;
    }
    var momentRedPaperLimit;
    return Backend.cache.get("momentRedPaper" + dateFormat(now, 'yyyy-MM-dd'))
      .then(function (result) {
        momentRedPaperLimit = Number(result);
        if (momentRedPaperLimit) {
          console.log("今日还剩红包：" + momentRedPaperLimit);
          if (momentRedPaperLimit < 1) {
            chance = 0
          }
        } else {
          Backend.cache.set("momentRedPaper" + dateFormat(now, 'yyyy-MM-dd'), 1000, 60 * 60 * 24 * 3);
        }
        return red_paper_model.find({publishUserId : userId,timeStr:dateFormat(now,'yyyy-MM-dd')})
      })
      .then(function(_redPapers){
        if(_redPapers && _redPapers.length){
          chance = 0
        }
        if(chance){
          console.log("发红包动态咯+++++++++++++++");
          var redPapers = [];
          var redPaperAmounts = that.getRedPaperNumbers();
          redPaperAmounts.forEach(function (item) {
            var redPaperItem = {
              momentId : momentId,
              timeStr : dateFormat(now,'yyyy-MM-dd'),
              amount : item,      //金额
              publishUserId :userId
            };
            redPapers.push(redPaperItem)
          })
          if (Number(momentRedPaperLimit) > 0) {
            Backend.cache.set("momentRedPaper" + dateFormat(now, 'yyyy-MM-dd'), momentRedPaperLimit - 1, 60 * 60 * 24 * 3)
          }
          return red_paper_model.create(redPapers);
        } else {
          console.log("不是红包动态呀——————————————");
          return [];
        }
      })
  },
  getRedPaper: function (momentId, userId) {
    var cond = {
      momentId: momentId,
      isDeleted: false,
      isReceived: false
    };
    return red_paper_model.findOne(cond).sort({_id: 1})
      .then(function (redPaper) {
        console.log("++++++++++");
        console.log(redPaper);
        if (redPaper) {
          var update = {
            isReceived: true,
            receivedUserId: userId
          }
          return red_paper_model.findOneAndUpdate({_id: redPaper._id}, {$set: update}, {new: true})
        } else {
          return false;
        }
      })
  },
  /**
   * 首页红包剩余量
   * @param moment_ids
   * @param user_id
   */
  getRedPaperCount: function (moment_ids, user_id) {
    let currentDate = moment().format('YYYY-MM-DD');
    let result = red_paper_model.find({
      momentId: {'$in': moment_ids},
      //timeStr: currentDate,
      isDeleted: false
    }).then(function (data) {
      let indexObj = _.groupBy(data, 'momentId');
      for (let p in indexObj) {
        let items = indexObj[p];
        let redPaperNumber = -1;
        // 用户是否已领取过当前动态红包 已领取返回 -1
        let is_get = _.find(items, item => {
          if (item.receivedUserId == user_id) {
            return true;
          }
          return false;
        })
        // 未领取 返回红包剩余量
        if (!is_get) {
          let list = _.filter(items, item => {
            if (!item.isReceived) {
              return true;
            }
            return false;
          });
          if (list) {
            redPaperNumber = list.length;
          } else {
            redPaperNumber = 0;
          }
        }
        indexObj[p] = redPaperNumber;
      }
      let result = {};
       moment_ids.forEach(item=> {
        let obj = {};
        result[item] = -1;
        if (indexObj[item]) {
          result[item] = indexObj[item];
        }

        return obj;
      })
      return result;
    })
    return result;
  },
  getUser: function (userIds) {
    return customer_model
      .find({_id: {$in: userIds}}, '_id avatar name shopVenderApplyStatus shopName shopAvatar')
      .then(data=> {
        return data.map(item=> {
          let name = '';
          let avatar = '';
          if (item.shopVenderApplyStatus >= 3) {
            name = item.shopName || "";
            avatar = item.shopAvatar || "";
          }
          else if (item.shopVenderApplyStatus <= 2) {
            name = item.name || "";
            avatar = item.avatar || "";
          }
          return {_id: item._id, name: name, avatar: avatar};
        })

      });
  },
  /**
   * 根据动态id 获取剩余红包数
   * @param moment_id
   * @returns {*}
   */
  getRedPaperRemainder: function (moment_id) {
    let currentDate = moment().format('YYYY-MM-DD');
    return red_paper_model.count({
      momentId: moment_id,
      //timeStr: currentDate,
      isReceived: false,
      isDeleted: false
    })
  },
  getInviteList:function (userId) {
      var condition={
          inviter:userId,
          isDeleted:false
      }
      return invite_record_model.find(condition);

    },
  /**
   * 检查用户当天是否领取过该动态红包
   * @param moment_id
   * @param user_id
   * @returns {*}
   */
  checkRedPaper: function (moment_id, user_id) {
    let currentDate = moment().format('YYYY-MM-DD');
    return red_paper_model.count({
      momentId: moment_id,
      timeStr: currentDate,
      receivedUserId: user_id,
      isDeleted: false
    })
  }
};