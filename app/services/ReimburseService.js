/**
 * Created by lijinxia on 2017/12/1.
 */
var _ = require('underscore'),

    Reimburse = require('../models/Reimburse');


var ReimburseService = function () {
};
ReimburseService.prototype.constructor = ReimburseService;

ReimburseService.prototype.createReimburse = function (reimburse) {

    return Reimburse.create(reimburse);
};

ReimburseService.prototype.getReimburse = function (cond,option,pageSlice) {
    cond.isDeleted = false;

    var factoryRechargeFields=option||Reimburse.publicFields;
    return Reimburse.find(cond,factoryRechargeFields,pageSlice).populate('user','name phoneNum').sort({createdAt:-1}).exec();
};
ReimburseService.prototype.getReimburseOnly = function (cond,option,pageSlice) {
    cond.isDeleted = false;

    var factoryRechargeFields=option||Reimburse.publicFields;
    return Reimburse.find(cond,factoryRechargeFields,pageSlice).sort({createdAt:-1}).exec();
};

ReimburseService.prototype.updateReimburse= function (cond,updates) {
    console.log('条件',cond);
    cond.isDeleted=false;
    return Reimburse.findOneAndUpdate(cond, updates,{new:true}).exec();
};
module.exports = exports = new ReimburseService();