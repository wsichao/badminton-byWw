"use strict";
const drugActivity = Backend.model('activity', undefined, 'drug_activity'),
    DrugActivityService = Backend.service('drugActivity', 'drugActivity'),
    DrugGroupModel = Backend.model('drugActivity', undefined, 'drugGroup'),
    FactoryDrugRelModel = require('./../../../app/models/FactoryDrugRel'),
    CollectionCenterService = Backend.service('collectionCenter', 'collectionCenter'),
    DrugService = Backend.service('allowance', 'drugService'),
    co = require('co');
module.exports = {
    getFactoryDrugRel: function (cond, option, pageSlice) {
        cond.isDeleted = false;
        cond.stopPlan = false;

        let factoryRechargeFields = option || FactoryDrugRelModel.publicFields;
        return FactoryDrugRelModel.find(cond, factoryRechargeFields, pageSlice).sort({reimbursePrice: -1,createdAt: -1});
    },
}