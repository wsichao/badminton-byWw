/**
 * Created by yichen on 2017/5/3.
 */

var
    Promise = require('promise'),
    async = require('async'),
    _ = require('underscore'),
    Q = require("q"),
    commonUtil = require('../../lib/common-util'),
    constants = require('../configs/constants'),

    Membership = require('../models/Membership'),
    VipMemberTradesService = require('../../app/services/VipMemberTradesService'),
    Promise = require('promise'),
    Q = require("q");


var MembershipService = function () {
};
MembershipService.prototype.constructor = MembershipService;

MembershipService.prototype.createMembership = function (data) {
    return Membership.create(data);
};

MembershipService.prototype.getUserMembershipInfo = function (userId, cardTye) {
    //
    cardTye = cardTye || 'city_buy';
    userId += '';
    var nowTS = Date.now();
    var todayBeginTS = new Date(commonUtil.getDateMidnight(nowTS)).getTime();
    var cond = {
        userId: userId,
        isDeleted: false,
        expiredAt: {$gt: nowTS},
        validAt: {$lt: nowTS},
        balance: {$gte: 0},
        //cardNo: {$exists: true},
        type: cardTye
    };
    if (cardTye == 'city_buy') {
        console.log(1111);
        cond.type = {$nin: ['zlycare', 'zlycare_vip']};
    }
    console.log(cond.type);
    var info = {
        totalVal: 0,
        balance: 0,
        cost: 0,
        expiringVal: 0 //即将过期的额度
    };
    //TODO: 和aggregation做比较
    return Membership.find(cond, 'totalVal balance cost expiredAt').exec()
        .then(function (_memberships) {
            _memberships.forEach(function (_membership) {
                info.totalVal += _membership.totalVal;
                info.balance += _membership.balance;
                info.cost += _membership.cost;
                //console.log(todayBeginTS, constants.membershipExpiringTS,todayBeginTS + constants.membershipExpiringTS,  _membership.expiredAt);
                if ((todayBeginTS + constants.membershipExpiringTS) > _membership.expiredAt || 0) {
                    info.expiringVal += _membership.balance;
                }
            });
            console.log('membershipInfo:', info);
            return info;
        });
}

//获取用户所用可用会员额度卡
MembershipService.prototype.getValidMembershipList = function (userId, cardType, pageSlice) {
    var nowTS = Date.now();
    var cond = {
        userId: userId,
        isDeleted: false,
        expiredAt: {$gt: nowTS},
        balance: {$gte: 0},
        type: cardType
    }
    if (cardType == 'city_buy') {
        cond.type = {$nin: ['zlycare', 'zlycare_vip']}
    }
    return Membership.find(cond, '', pageSlice).exec()
}
/**
 * 获取历史会员额度count
 * @param userId
 * @returns {Array|{index: number, input: string}|Promise|*}
 */
MembershipService.prototype.getmembershipCount = function (userId) {
    var cond = {
        userId: userId,
        isDeleted: false,
    }
    return Membership.count(cond).exec()
}


//该服务限制访问频率
MembershipService.prototype.consumedMembership = function (userId, cost, options) {
    var defer = Q.defer();
    var originalCost = cost;
    var nowTS = Date.now();
    var cond = {
        userId: userId,
        isDeleted: false,
        expiredAt: {$gt: nowTS},
        validAt: {$lt: nowTS},
        balance: {$gt: 0},
        //cardNo: {$exists: true},
    };
    var _options = {
        sort: {expiredAt: 1}
    }
    var hasMembership = true;
    var memberships = [];
    console.log('cost: ', cost, hasMembership);
    async.whilst(
        function () {
            return cost > 0 && hasMembership;
        },
        function (callback) {
            var consumedVal = 0;
            Membership.findOne(cond, 'balance', _options).exec()
                .then(function (_membership) {
                    if (!_membership) {
                        hasMembership = false;
                        throw new Error('not exists');
                    }
                    consumedVal = cost;
                    if (cost > _membership.balance) {
                        consumedVal = _membership.balance;
                    }
                    return Membership.findOneAndUpdate({_id: _membership._id, balance: {$gte: consumedVal}},
                        {$inc: {balance: -consumedVal, cost: consumedVal}}).exec();
                })
                .then(function (_membership) {
                    //console.log('_membership:', _membership);
                    if (_membership) {
                        cost = commonUtil.getNumsPlusResult([cost, -consumedVal], 10);
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
            var hasRebate = options.hasRebate || false;
            if (memberships.length > 0) {
                var TradeService = Backend.service('1/membership', 'membership_trade');
                var _options = {
                    memberships: memberships,
                    couponId: options.couponId || '',
                    shopId: options.shopId || '',
                    orderId: options.orderId || ''
                }
                console.log('_options:', _options);
                TradeService.genMembershipTrade(userId, hasRebate ? 'rebate' : 'coupon',
                    commonUtil.getNumsPlusResult([originalCost, -cost], 10), _options);
            }
        }
    )
    return defer.promise;
}

/*MembershipService.prototype.consumedMembershipNew = function (userId, cost, options) {
 var defer = Q.defer();
 var originalCost = cost;
 var nowTS = Date.now();
 var cond = {
 userId: userId,
 isDeleted: false,
 expiredAt: {$gt: nowTS},
 validAt: {$lt: nowTS},
 balance: {$gt: 0},
 //cardNo: {$exists: true},
 };
 var _options = {
 sort: { expiredAt: 1 }
 }
 var hasMembership = true;
 var memberships = [];
 console.log('cost: ',cost, hasMembership);
 Membership.find(cond, 'balance', _options).exec()
 .then(function(_memberships){
 if(!_memberships || _memberships.length == 0){
 throw new Error('not exists');
 }
 consumedVal = cost;
 if(cost > _membership.balance){
 consumedVal = _membership.balance;
 }
 return Membership.findOneAndUpdate({_id: _membership._id, balance: {$gte: consumedVal}},
 {$inc: {balance: -consumedVal, cost: consumedVal}}).exec();
 })
 .then(function(_membership){
 //console.log('_membership:', _membership);
 if(_membership){
 cost = commonUtil.getNumsPlusResult([cost, -consumedVal], 10);
 memberships.push({
 membershipId: _membership._id + '',
 cost: consumedVal,
 cardNo: _membership.cardNo
 });
 }
 callback();
 }, function(err){
 console.log('err:', err);
 callback();

 });
 async.whilst(
 function () {
 return cost > 0 && hasMembership;
 },
 function (callback) {
 var consumedVal = 0;

 },
 function (err) {
 console.log('consumedMembership:', originalCost, cost, memberships);
 defer.resolve({
 isConsumedSuccess: cost == 0 ? true : false,
 memberships: memberships
 });
 }
 )
 return defer.promise;
 }*/


MembershipService.prototype.getVipMembershipBalance = function (user_id, membership_type) {
    var nowTS = Date.now();
    var membershipTypeArr=membership_type.split(',');
    var match = {
        type:{$in:membershipTypeArr},
        userId: user_id,
        isDeleted: false,
        expiredAt: {$gt: nowTS},
        validAt: {$lt: nowTS},
        balance: {$gt: 0}
    };
    var group = {
        _id: '$userId',
        balance: {$sum: '$balance'},
        normalValue: {$sum: '$normalValue'}
    }
    console.log(match, group);
    return Membership.aggregate([
        {'$match': match},
        {'$group': group},
    ]).exec();
};


/**
 * 获取过期的会员额度卡片
 * @param user_id
 * @returns {Promise|Array|{index: number, input: string}|*}
 */
MembershipService.prototype.getExpiredMembershipCards = function (user_id, cardType, options) {
    var nowTS = Date.now();
    var cond = {
        userId: user_id,
        isDeleted: false,
        expiredAt: {$lte: nowTS},
        balance: {$gte: 0},
        type: cardType
    };
    if (cardType == 'city_buy') {
        cond.type = {$nin: ['zlycare', 'zlycare_vip']}
    }
    console.log(cond);
    return Membership.find(cond).sort({expiredAt: -1}).exec()
};

var getNumsPlusResult = function (numArray, theTenPower) {
    theTenPower = theTenPower || 100;
    var result = 0;
    for (var i = 0; i < numArray.length; i++) {
        result += Math.round(Number(numArray[i]) * theTenPower);
    }
    return result / theTenPower;
}
MembershipService.prototype.consumedVipMembership = function (membership_type, userId, cost, isNormalFlag, options) {
    //todo: 该服务限制访问频率

    var defer = Q.defer();
    var originalCost = cost;
    var nowTS = Date.now();
    var cond = {
        type: membership_type,
        userId: userId,
        isDeleted: false,
        expiredAt: {$gt: nowTS},
        validAt: {$lt: nowTS},
        balance: {$gt: 0},
        //cardNo: {$exists: true},
    };
    if (isNormalFlag) {
        cond.normalValue = {$gt: 0};
    }
    var _options = {
        sort: {expiredAt: 1}
    }
    var hasMembership = true;
    var memberships = [];
    console.log('cost: ', cost, hasMembership);
    async.whilst(
        function () {
            return cost > 0 && hasMembership;
        },
        function (callback) {
            var consumedVal = 0, isNormalValue = 0;
            Membership.findOne(cond, 'balance normalValue', _options).exec()
                .then(function (_membership) {
                    console.log('_membership_membership', _membership);
                    if (!_membership) {
                        hasMembership = false;
                        throw new Error('not exists');
                    }
                    consumedVal = cost;
                    var condition = {_id: _membership._id};
                    var updates = {$inc: {balance: -consumedVal, cost: consumedVal}};
                    if (isNormalFlag) {//是常用药
                        if ((cost > _membership.normalValue)) {
                            consumedVal = _membership.normalValue;
                        }
                        condition.balance = {$gte: consumedVal};
                        condition.normalValue = {$gte: consumedVal};

                        updates = {$inc: {balance: -consumedVal, normalValue: -consumedVal, cost: consumedVal}};
                    } else {
                        if ((cost > _membership.balance)) {
                            consumedVal = _membership.balance;
                        }
                        condition.balance = {$gte: consumedVal};

                        updates = {$inc: {balance: -consumedVal, cost: consumedVal}};
                    }
                    console.log('cost', cost);
                    console.log('eferferfre', updates);

                    return Membership.findOneAndUpdate(condition, updates).exec();
                })
                .then(function (_membership) {
                    //console.log('_membership:', _membership);
                    if (_membership) {
                        cost = getNumsPlusResult([cost, -consumedVal], 100);
                        memberships.push({
                            membershipId: _membership._id + '',
                            cost: consumedVal,
                            isNormalFlag: isNormalFlag,
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
            // defer.resolve({
            //     isConsumedSuccess: cost == 0 ? true : false,
            //     memberships: memberships
            // });
            //生成会员额度消费明细
            if (memberships.length > 0) {
                var TradeService = Backend.service('1/zlycare', 'member_trade_service');
                var _trade = {
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
                VipMemberTradesService.genVipMembershipTrade(_trade).then(function (_trade) {
                    console.log('交易记录',_trade);
                    defer.resolve({
                        isConsumedSuccess: cost == 0 ? true : false,
                        memberships: memberships,
                        tradeId:_trade._id
                    });
                })
            }
        }
    )
    return defer.promise;
};


MembershipService.prototype.synNormalValue = function () {
    Membership.find({
        normalValue: {$exists: false},
        isDeleted: false,
        balance: {$gt: 0}
    }).sort({_id: -1}).limit(10000).exec()
        .then(function (items) {
            items.forEach(function (item) {
                // console.log('item',item,item.balance,item.balance>=50);
                if (item.balance >= 50) {
                    Membership.update({_id: item._id}, {normalValue: 50}).exec();
                } else {
                    Membership.update({_id: item._id}, {normalValue: item.balance}).exec();
                }
            });
        });
};


MembershipService.prototype.udpMembershipById = function (id, updates) {
    var cond = {_id: id, isDeleted: false};
    Membership.update(cond, updates).exec();
};
module.exports = exports = new MembershipService();




