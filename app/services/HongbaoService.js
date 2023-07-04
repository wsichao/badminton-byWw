var
    Hongbao = require('../models/Hongbao');
function HongbaoService (){
}
HongbaoService.prototype.constructor = HongbaoService;

HongbaoService.prototype.createHongbao = function (data){
    return Hongbao.create(data);
};
HongbaoService.prototype.updateHongbao = function (condition, update){
    if(!update.updatedAt){
        update.updatedAt = Date.now();
    }
    return Hongbao.findOneAndUpdate(condition, update, {new: true});
}

HongbaoService.prototype.getInfoById = function (id){
    var condition = {};
    condition._id = id;
    condition.isDeleted = false;
    condition.isExpiredRefunded = false;
    return Hongbao.findOne(condition).exec();
}

HongbaoService.prototype.getOrderAndHongbaoById = function (id){
    var condition = {};
    condition._id = id;
    condition.isDeleted = false;
    return Hongbao.findOne(condition).populate("order").exec();
}

HongbaoService.prototype.getInfoAndMomentById = function (id){
    var condition = {};
    condition._id = id;
    condition.isDeleted = false;
    return Hongbao.findOne(condition).populate("moment","originalContent");
}

module.exports = new HongbaoService();