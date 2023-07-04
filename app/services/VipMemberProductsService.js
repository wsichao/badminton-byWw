/**
 * Created by lijinxia on 2017/9/5.
 */
var
    VipMemberProducts = require('../models/VipMemberProducts');

function VipMemberProductsService() {
}
VipMemberProductsService.prototype.constructor = VipMemberProductsService;

VipMemberProductsService.prototype.getVipMemberProductsByCon = function (con, params) {
    con.isDeleted = false;
    return VipMemberProducts.find(con, params || VipMemberProducts.commonFields).sort({createdAt: -1}).exec();
};
VipMemberProductsService.prototype.getVipMemberProductsById = function (id) {
    var condition = {
        isDeleted: false,
        _id: id,
        thirdType: {$ne: ''}
        // online: 1,
        // status: 1
    };
    return VipMemberProducts.findOne(condition, VipMemberProducts.commonFields).exec();
};
VipMemberProductsService.prototype.getVipServicesByCond = function (cond, pageSlice) {
    cond.isDeleted = false;
    cond.status = 1;
    cond.online = 1;
    if (!cond.thirdType) {
        cond.thirdType = {$nin: [null, '']};
    }
    return VipMemberProducts.find(cond, '', pageSlice).exec();
};

VipMemberProductsService.prototype.getVipProduct = function (product_id,fields) {
    var cond = {
        _id: product_id,
        isDeleted: false,
        status: 1,
        online: 1
    }
    return VipMemberProducts.findOne(cond).exec();
};

module.exports = new VipMemberProductsService();