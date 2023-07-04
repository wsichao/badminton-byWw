/**
 * Created by lijinxia on 2017/11/29.
 */
var FactoryDrugRel = require('../models/FactoryDrugRel');


var FactoryDrugRelService = function () {
};
FactoryDrugRelService.prototype.constructor = FactoryDrugRelService;

FactoryDrugRelService.prototype.createFactoryDrugRel = function (factoryDrugRel) {

    return FactoryDrugRel.create(factoryDrugRel);
};

FactoryDrugRelService.prototype.getFactoryDrugRel = function (cond, option, pageSlice) {
    cond.isDeleted = false;
    cond.stopPlan=false;

    var factoryRechargeFields = option || FactoryDrugRel.publicFields;
    return FactoryDrugRel.find(cond, factoryRechargeFields, pageSlice).sort({reimbursePrice: -1,createdAt: -1}).exec();
};

FactoryDrugRelService.prototype.getFactoryDrugRelAll = function (cond, option, pageSlice) {
    cond.isDeleted = false;

    var factoryRechargeFields = option || FactoryDrugRel.publicFields;
    return FactoryDrugRel.find(cond, factoryRechargeFields, pageSlice).sort({reimbursePrice: -1,createdAt: -1}).exec();
};

FactoryDrugRelService.prototype.updateFactoryDrugRel = function (id, updates) {
    var cond = {isDeleted: false};
    cond._id = id;

    return FactoryDrugRel.update(cond, updates).exec();
};
FactoryDrugRelService.prototype.updateFactoryDrugRelByCond = function (cond, updates) {
    cond.isDeleted = false;


    return FactoryDrugRel.findOneAndUpdate(cond, updates, {new: true}).exec();
};


FactoryDrugRelService.prototype.areaCount = function () {


    return FactoryDrugRel.distinct('area', {balanceVal: {$gt: 0}, stopPlan: false, isDeleted: false}).exec();
};
/**
 * 城市的三级结构
 * @returns {Promise}
 */
FactoryDrugRelService.prototype.regionCount = function () {


    return FactoryDrugRel.distinct('region', {stopPlan: false, isDeleted: false}).exec();
};

// FactoryDrugRelService.prototype.getDrugFactoryDrugRelInfo = function (planId) {
//     let cond = {_id: planId, isDeleted: false};
//
//     console.log('查询条件',cond);
//     return FactoryDrugRel.aggregate([
//         {'$match': cond},
//         {'$lookup': {from: 'drug', localField: 'drugId', foreignField: '_id', as: 'drugInfo'}},
//         // {'$sort': {collectedAt: -1}},
//         // // {'$limit': pageSize}
//     ]).exec();
// };
module.exports = exports = new FactoryDrugRelService();