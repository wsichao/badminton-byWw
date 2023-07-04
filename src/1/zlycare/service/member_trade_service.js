/**
 * 高级会员或者vip会员,额度明细
 * Created by fly on 2017－06－22.
 */
'use strict';
let _model = Backend.model('1/zlycare', undefined, 'member_trade');
/**
 * 生成会员额度交易明细
 * @param user_id 用户主账户id
 * @param type 额度明细类型, eg:'use' | 'buy'
 * @param value 会员额度金额
 * @param options 可选参数
 * @returns {_trade}
 */
let _genMembershipTrade = function (tade) {
  return _model.create(tade);
}
module.exports = {
  genVipMembershipTrade: _genMembershipTrade,
  getVipMembershipTrades: function (user_id, type, options) {
    let cond = {
      isDeleted: false,
      userId: user_id,
      vipType: type,
      type: 'use'
    };
    return _model.find(cond, '', options || null).exec();
  },
  genVipTradeCode: function () {
    let cond = {
      _id: '594ba273b30ed9781c5949ee'
    }
    return _model.findOneAndUpdate(cond, {$inc: {code: 1}}).exec()
    .then(function(_trade){
      let code = _trade.code + '' + getRandomNum(10, 99);
      return code;
    })
  },
  getTradeByCode: function (code) {
    let cond = {
      isDeleted: false,
      code: code
    }
    return _model.findOne(cond).exec();
  },
  getTradeById: function (trade_id) {
    let cond = {
      isDeleted: false,
      _id: trade_id
    }
    return _model.findOne(cond).exec();
  },
  setTradeChecked: function (trade_id, check_vender_id) {
    let cond = {
      isDeleted: false,
      _id: trade_id,
      isChecked: false,
        step:0
    };
    let now_ts = Date.now();
    let update = {
      $set: {
        isChecked: true,
        step:2,
        stepAt:now_ts,
        checkedAt:now_ts,
        updatedAt: now_ts,
        checkVenderId: check_vender_id
      }
    }
    return _model.findOneAndUpdate(cond, update).exec();
  }
}