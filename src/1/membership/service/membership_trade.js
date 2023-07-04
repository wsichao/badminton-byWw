/**
 * 会员额度明细service
 * Created by fly on 2017－05－25.
 */
'use strict';
let _model = Backend.model('1/membership', undefined, 'membership_trade');
let _model_card = Backend.model('1/membership', undefined, 'membership_card');

/**
 * 生成会员额度交易明细
 * @param user_id 用户主账户id
 * @param type 额度明细类型, eg:'expired' | 'coupon' | 'rebate' | 'buy' | 'get'
 * @param value 会员额度金额
 * @param options 可选参数
 * @returns {_trade}
 */
let _genMembershipTrade = function (user_id, type, value, options) {
  let _trade = {
    userId: user_id,
    type: type,
    value: value,
    memberships: options.memberships || [],
    couponId: options.couponId || '',
    orderId: options.orderId || '',
    shopId: options.shopId || ''
  }
  if(options && options.createdAt){
    _trade.createdAt = options.createdAt;
  }
  return _model.create(_trade);
}
module.exports = {
  /**
   * 获取用户的会员额度交易明细
   * @param user_id
   * @returns {Promise|Array|{index: number, input: string}|*}
   */
  getMembershipTrades: function (user_id, options) {
    let cond = {
      isDeleted: false,
      userId: user_id
    };
    let fields = '';
    options = options || {};
    console.log(cond, fields, options);
    return _model.find(cond, fields, options).exec();
  },
  /**
   * 格式化返回数据
   * @param trade
   * @returns {{title: string, value: string, createdAt: *}}
   */
  formatMembershipTradeTitle: function (trade, shop_id_name_map) {
    let _title = '';
    let _value = '';
    let _shop_name = shop_id_name_map[trade.shopId + ''] && shop_id_name_map[trade.shopId + ''].shopName || '';
    console.log('_shop_name:', _shop_name);
    switch (trade.type) {
      case 'old':
        _title = '历史额度消耗';
        _value = '-' + trade.value.toFixed(2) + '元';
        break;
      case 'expired':
        _title = '额度到期扣除';
        _value = '-' + trade.value.toFixed(2) + '元';
        break;
      case 'coupon':
        _title = '领券: ' + _shop_name;
        _value = '-' + trade.value.toFixed(2) + '元';
        break;
      case 'rebate':
        _title = '用券返现: ' + _shop_name;
        _value = '-' + trade.value.toFixed(2) + '元';
        break;
      case 'buy':
        _title = '购买会员额度';
        _value = '+' + trade.value.toFixed(2) + '元';
        let _membership = trade && trade.memberships && trade.memberships[0] || {};
        if(_membership.cardNo && (_membership.cardNo == membershipCardNo)){
          _title = '历史额度迁移';
        }
        break;
      case 'get':
        _title = '领取会员额度';
        _value = '+' + trade.value.toFixed(2) + '元';
        break;
      default:
        break;
    }
    /*console.log({
      title: _title,
      value: _value,
      createdAt: trade.createdAt
    });*/
    return {
      title: _title,
      value: _value,
      createdAt: trade.createdAt
    };
  },
  genMembershipTrade: _genMembershipTrade,
  genExpiredTrades: function () {
    let nowTS = Date.now();
    let defer = Backend.Deferred.defer();
    defer.resolve('beginning......');
    let async = require('async');
    let cond = {
      hasGenExpiredTrade: {$ne: true},
      expiredAt: {$lte: nowTS}
      //userId: '5819ed2593740e996bf3f824'
    }
    var hasData = true;
    async.whilst(
      function () {
        return hasData;
      },
      function (callback) {
        let card = null;
         _model_card.findOne(cond).exec()
        .then(function(_card){
          if(!_card){
            hasData = false;
            throw new Error('no card');
          }
          card = _card;
          let options = {
            createdAt: _card.expiredAt + 1,
            memberships: [{
              membershipId: _card._id + '',
              cardNo: _card.cardNo,
              cost: _card.balance
            }]
          };
         return _genMembershipTrade(_card.userId, 'expired', _card.balance, options);
        })
        .then(function(){
         return _model_card.update({_id: card._id}, {$set: {hasGenExpiredTrade: true}}).exec();
        })
        .then(function(){
          callback();
        }, function(err){
          console.log('err:', err);
          callback();
        })
      },
      function () {
        console.log('all has completed !');
      }
    );
    return defer.promise;
  },
  createMembershipTrade: function (trade) {
    return _model.create(trade);
  }
}