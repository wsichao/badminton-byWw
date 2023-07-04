/**
 * 会员额度卡片service
 * Created by fly on 2017－05－25.
 */
'use strict';
let _model = Backend.model('1/membership', undefined, 'membership_card');
let user_service = Backend.service('common', 'user_service');
let async = require('async');
let _ = require('underscore');
module.exports = {
  /**
   * 获取过期的会员额度卡片
   * @param user_id
   * @returns {Promise|Array|{index: number, input: string}|*}
   */
  getExpiredMembershipCards: function (user_id,cardType, options) {
    let nowTS = Date.now();
    let cond = {
      userId: user_id,
      isDeleted: false,
      expiredAt: {$lte: nowTS},
      balance: {$gte: 0},
      type : cardType
    };
    if(cardType == 'city_buy'){
      cond.type = { $nin : ['zlycare','zlycare_vip'] }
    }
    console.log(cond);
    return _model.find(cond).sort({expiredAt: -1}).exec()
  },
  createMembership: function (membership) {
    return _model.create(membership);
  },
  getUserMembershipInfo: function (userId, hasBoughtSenior) {
    //
    userId += '';
    var nowTS = Date.now();
    var todayBeginTS = new Date(getDateMidnight(nowTS)).getTime();
    /*var cond = {
     userId: userId,
     isDeleted: false,
     expiredAt: {$gt: nowTS},
     validAt: {$lt: nowTS},
     balance: {$gte: 0},
     type: {
     $nin : ["zlycare",'zlycare_vip']
     }
     //cardNo: {$exists: true},
     };*/
    var info = {
      title: '',
      subTitle: '',
      type: '',
      totalVal: 0,
      balance: 0,
      membershipVals: []
    };
    var result = [];
    /*return _model.find(cond, 'totalVal balance cost expiredAt').exec()
     .then(function (_memberships) {
     console.log(_memberships);
     _memberships.forEach(function (_membership) {
     info.totalVal += _membership.totalVal;
     info.balance += _membership.balance;
     });
     info.title = '全城购会员卡';
     info.type = 'city_buy';
     console.log('city_Info:', info);
     var cityBuyInfo = JSON.parse(JSON.stringify(info));
     result.push(cityBuyInfo);*/

    var condition = {
      userId: userId,
      isDeleted: false,
      balance: {$gte: 0},
      type: 'zlycare'
    }
    return _model.find(condition, 'totalVal balance cost expiredAt').exec()
      .then(function (_memberships) {
        info.totalVal = 0;
        info.balance = 0;
        _memberships.forEach(function (_membership) {
          info.totalVal += _membership.totalVal;
          info.balance += _membership.balance;
        });
        info.title = '朱李叶健康高级会员卡';
        info.type = 'zlycare';
        console.log('city_Info:', info);
        var zlycareInfo = JSON.parse(JSON.stringify(info));
        result.push(zlycareInfo);
        var condition = {
          userId: userId,
          isDeleted: false,
          balance: {$gte: 0},
          type: 'zlycare_vip'
        }
        return _model.find(condition, 'totalVal balance cost expiredAt').exec()
      })
      .then(function (_memberships) {
        info.totalVal = 0;
        info.balance = 0;
        _memberships.forEach(function (_membership) {
          info.totalVal += _membership.totalVal;
          info.balance += _membership.balance;
        });
        info.title = '朱李叶健康VIP会员卡';
        info.type = 'zlycare_vip';
        console.log('city_Info:', info);
        var zlycareVipInfo = JSON.parse(JSON.stringify(info));
        result.push(zlycareVipInfo);
        membershipVals.forEach(function (item) {
          /*if (item.type == 'city_buy') {
           item.expiredTime = item.expired30Days;
           result[0].membershipVals.push(item)
           } else*/ if (item.type == 'zlycare') {
            let _item = {};
            _.extend(_item, item);
            if(hasBoughtSenior){//不是第一次购买,发费298
              _item.cost = SENIOR_COST;
            }
            result[0].membershipVals.push(_item)
          } else if (item.type == 'zlycare_vip') {
            result[1].membershipVals.push(item)
          }
        })
        return result;
      })
  },
  getMembershipInfoByCond: function (cond, fields) {
    return _model.find(cond).sort({expiredAt: -1}).exec()
  },
  getVipMembershipBalance: function (user_id, membership_type) {
    let nowTS = Date.now();
    let match = {
      type: membership_type,
      userId: user_id,
      isDeleted: false,
      expiredAt: {$gt: nowTS},
      validAt: {$lt: nowTS},
      balance: {$gt: 0},
    };
    let group = {
      _id: '$userId',
      balance: {$sum: '$balance'},
        normalValue:{$sum: '$normalValue'}
    }
    console.log(match, group);
    return _model.aggregate([
      { '$match': match },
      { '$group': group },
    ]).exec()
  },
  consumedVipMembership: function (membership_type, userId, cost, options) {
    //todo: 该服务限制访问频率
    let defer = Backend.Deferred.defer();
    let originalCost = cost;
    let nowTS = Date.now();
    let cond = {
      type: membership_type,
      userId: userId,
      isDeleted: false,
      expiredAt: {$gt: nowTS},
      validAt: {$lt: nowTS},
      balance: {$gt: 0},
      //cardNo: {$exists: true},
    };
    let _options = {
      sort: {expiredAt: 1}
    }
    let hasMembership = true;
    let memberships = [];
    console.log('cost: ', cost, hasMembership);
    async.whilst(
      function () {
        return cost > 0 && hasMembership;
      },
      function (callback) {
        let consumedVal = 0;
        _model.findOne(cond, 'balance', _options).exec()
          .then(function (_membership) {
            if (!_membership) {
              hasMembership = false;
              throw new Error('not exists');
            }
            consumedVal = cost;
            if (cost > _membership.balance) {
              consumedVal = _membership.balance;
            }
            return _model.findOneAndUpdate({_id: _membership._id, balance: {$gte: consumedVal}},
              {$inc: {balance: -consumedVal, cost: consumedVal}}).exec();
          })
          .then(function (_membership) {
            //console.log('_membership:', _membership);
            if (_membership) {
              cost = getNumsPlusResult([cost, -consumedVal], 100);
              memberships.push({
                membershipId: _membership._id + '',
                cost: consumedVal,
                cardNo: _membership.cardNo
              });
            }
            callback();
          }, function (err) {
            console.log('err:', err);
            callback();

          });
      },
      function (err) {
        console.log('consumedMembership:', originalCost, cost, memberships);
        defer.resolve({
          isConsumedSuccess: cost == 0 ? true : false,
          memberships: memberships
        });
        //生成会员额度消费明细
        if (memberships.length > 0) {
          let TradeService = Backend.service('1/zlycare', 'member_trade_service');
          let _trade = {
            userId: userId,
            vipType: membership_type,
            type: 'use',
            value: getNumsPlusResult([originalCost, -cost], 100),
            memberships: memberships,
            productId: options.productId || '',
            productName: options.productName || '',
            code: options.code || '',
            marketingPrice: options.marketingPrice || 0
          }
          //console.log('_trade:', _trade);
          TradeService.genVipMembershipTrade(_trade);
        }
      }
    )
    return defer.promise;
  }
}