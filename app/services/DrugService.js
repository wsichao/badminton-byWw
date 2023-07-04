/**
 * Created by lijinxia on 2017/11/29.
 */
var _ = require('underscore'),
    Q = require("q"),
    ErrorHandler = require('../../lib/ErrorHandler'),
    Drug = require('../models/Drug');


var DrugService = function () {
};
DrugService.prototype.constructor = DrugService;

DrugService.prototype.createDrug = function (drug) {

    return Drug.create(drug);
};

DrugService.prototype.getDrug = function (cond,option,pageSlice) {
    cond.isDeleted = false;

    var factoryRechargeFields=option||Drug.publicFields;
    return Drug.find(cond,factoryRechargeFields,pageSlice).sort({createdAt:-1}).exec();
};

DrugService.prototype.updateDrug= function (cond,updates) {
    cond.isDeleted = false;
    return Drug.update(cond, updates).exec();
};
module.exports = exports = new DrugService();