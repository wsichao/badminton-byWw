/**
 * Created by lijinxia on 2017/11/29.
 */
var _ = require('underscore'),
    Q = require("q"),
    ErrorHandler = require('../../lib/ErrorHandler'),
    Factory = require('../models/Factory');


var FactoryService = function () {
};
FactoryService.prototype.constructor = FactoryService;

FactoryService.prototype.createFactory = function (factory) {

    return Factory.create(factory);
};
/**
 * 厂家ID
 * @param max
 * @param min
 * @param existsTagCodes
 */
FactoryService.prototype.genFactoryCode = function (max, min, existsFactoryCode) {
    var factoryCode = Math.floor(Math.random() * (max - min + 1) + min);
    // 查询现有的号码
    if (existsFactoryCode && existsFactoryCode.length > 0) {
        var defer = Q.defer();
        for (var i = 0; i < 1000; i++) {// 限尝试1000次,否则失败 @fixme
            if (!_.contains(existsFactoryCode, factoryCode)) {
                defer.resolve(factoryCode);
                break;
            } else {
                factoryCode = Math.floor(Math.random() * (max - min + 1) + min);
            }
        }
        return defer.promise;
    } else {
        return distinctFactoryCode()
            .then(function (_tagCodes) { //分配号码
                //Return
                for (var i = 0; i < 1000; i++) {// 限尝试1000次,否则失败 @fixme
                    if (!_.contains(_tagCodes, factoryCode)) {
                        return factoryCode;
                    } else {
                        factoryCode = Math.floor(Math.random() * (max - min + 1) + min);
                    }
                }
                //请求处理失败
                throw new ErrorHandler.genBackendError(8007);
            })
    }
};
var distinctFactoryCode = function () {
    return Factory.distinct('code', {}).exec();
};
FactoryService.prototype.getFactory = function (cond, option, pageSlice) {
    cond.isDeleted = false;

    var factoryFields = option || Factory.publicFields;
    return Factory.find(cond, factoryFields, pageSlice).sort({createdAt: -1}).exec();
};
FactoryService.prototype.getFactoryByCmsId = function (cmsId) {
    var cond = {
        isDeleted: false,
        cmsUserName: cmsId
    };
    return Factory.findOne(cond).exec();
};
FactoryService.prototype.updateFactory = function (cond, updates) {
    cond.isDeleted = false;

    return Factory.update(cond, updates).exec();
};
module.exports = exports = new FactoryService();