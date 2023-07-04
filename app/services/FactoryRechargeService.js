/**
 * Created by lijinxia on 2017/11/29.
 */
var _ = require('underscore'),
    Q = require("q"),
    ErrorHandler = require('../../lib/ErrorHandler'),
    FactoryRecharge = require('../models/FactoryRecharge');


var FactoryRechargeService = function () {
};
FactoryRechargeService.prototype.constructor = FactoryRechargeService;

FactoryRechargeService.prototype.createFactoryRecharge = function (factoryRecharge) {

    return FactoryRecharge.create(factoryRecharge);
};

FactoryRechargeService.prototype.getFactoryRecharge = function (cond,option,pageSlice) {
    cond.isDeleted = false;

    var factoryRechargeFields=option||FactoryRecharge.publicFields;
    return FactoryRecharge.find(cond,factoryRechargeFields,pageSlice).sort({createdAt:-1}).exec();
};

FactoryRechargeService.prototype.updateFactoryRecharge = function (id,updates) {
    var cond={isDeleted:false};
    cond._id=id;

    return FactoryRecharge.update(cond, updates).exec();
};
module.exports = exports = new FactoryRechargeService();