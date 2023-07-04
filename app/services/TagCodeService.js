/**
 * Created by lijinxia on 2017/11/21.
 */
var _ = require('underscore'),
    Q = require("q"),
    ErrorHandler = require('../../lib/ErrorHandler'),
    TagCode = require('../models/TagCode');


var TagCodeService = function () {
};
TagCodeService.prototype.constructor = TagCodeService;

TagCodeService.prototype.createTagCode = function (tag) {

    return TagCode.create(tag);
};
/**
 * 生成渠道码
 * @param max
 * @param min
 * @param existsTagCodes
 */
TagCodeService.prototype.genTagCode = function (max, min, existsTagCodes) {
    var tagCode = Math.floor(Math.random() * (max - min + 1) + min);
    // 查询现有的号码
    if (existsTagCodes && existsTagCodes.length > 0) {
        var defer = Q.defer();
        for (var i = 0; i < 1000; i++) {// 限尝试1000次,否则失败 @fixme
            if (!_.contains(existsTagCodes, tagCode)) {
                defer.resolve(tagCode);
                break;
            }else {
                tagCode = Math.floor(Math.random() * (max - min + 1) + min);
            }
        }
        return defer.promise;
    } else {
        return distinctTagCode()
            .then(function (_tagCodes) { //分配号码
                //Return
                for (var i = 0; i < 1000; i++) {// 限尝试1000次,否则失败 @fixme
                    if (!_.contains(_tagCodes, tagCode)){
                        return tagCode;
                    }else {
                        tagCode = Math.floor(Math.random() * (max - min + 1) + min);
                    }
                }
                //请求处理失败
                throw new ErrorHandler.genBackendError(8007);
            })
    }
};
var distinctTagCode = function () {
    return TagCode.distinct('code', {}).exec();
};
TagCodeService.prototype.getTagCode = function (cond,pageSlice) {
    cond.isDeleted = false;
    console.log('查询条件',cond);
    return TagCode.find(cond,TagCode.publicFields,pageSlice).exec();
};

TagCodeService.prototype.updateTagCode= function (cond,updates) {
    cond.isDeleted = false;

    return TagCode.update(cond,updates).exec();
};
TagCodeService.prototype.deleteTagCode = function (id) {
    var cond={isDeleted:false};
    cond._id=id;

    return TagCode.update(cond, {isDeleted: true}).sort({createdAt: -1}).exec();
};

/**
 * 城市的三级结构
 * @returns {Promise}
 */
TagCodeService.prototype.regions = function () {


    return TagCode.find({provinceId: {$exists: true},province: {$exists: true},cityId: {$exists: true},city: {$exists: true},districtId: {$exists: true},district: {$exists: true},isDeleted: false});
};
module.exports = exports = new TagCodeService();