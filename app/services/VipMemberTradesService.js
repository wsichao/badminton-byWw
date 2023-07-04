/**
 * Created by lijinxia on 2017/9/7.
 */
var
    VipMemberTrades = require('../models/VipMemberTrades');

function VipMemberTradesService() {
}
VipMemberTradesService.prototype.constructor = VipMemberTradesService;


VipMemberTradesService.prototype.genVipTradeCode = function (id) {
    var cond = {
        _id: '594ba273b30ed9781c5949ee'
    };
    return VipMemberTrades.findOneAndUpdate(cond, {$inc: {code: 1}}).exec()
        .then(function (_trade) {
            var code = _trade.code + '' + getRandomNum(10, 99);
            return code;
        });
};

/**
 * 生成会员额度交易明细
 * @param user_id 用户主账户id
 * @param type 额度明细类型, eg:'use' | 'buy'
 * @param value 会员额度金额
 * @param options 可选参数
 * @returns {_trade}
 */
VipMemberTradesService.prototype.genVipMembershipTrade = function (tade) {
    return VipMemberTrades.create(tade);

};


VipMemberTradesService.prototype.getVipMembershipTradeById = function (id) {
    var cond = {
        _id: id,
        isDeleted: false
    };
    return VipMemberTrades.findOne(cond).exec();

};

VipMemberTradesService.prototype.udpVipMembershipTradeById = function (id,updates) {
    var cond = {
        _id: id,
        isDeleted: false
    };
    return VipMemberTrades.update(cond,updates).exec();

};
module.exports = new VipMemberTradesService();