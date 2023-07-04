/**
 * Created by lijinxia on 2017/11/21.
 */
var AdvertiseRel = require('../models/AdvertiseRel');


var AdvertiseRelService = function () {
};
AdvertiseRelService.prototype.constructor = AdvertiseRelService;

AdvertiseRelService.prototype.createAdvertiseRel= function (adRel) {

    return AdvertiseRel.create(adRel);
};

AdvertiseRelService.prototype.getAdById = function (deviceId,userId) {
    var cond = {
        isDeleted: false,
        $or:[{userId:userId},{deviceId:deviceId}]
    };

    return AdvertiseRel.findOne(cond).sort({createdAt: -1}).exec();
};

AdvertiseRelService.prototype.updateAdvertiseRel= function (cond, updates) {
    cond.isDeleted = false;
    return AdvertiseRel.update(cond, updates).exec();
};


module.exports = exports = new AdvertiseRelService();