/**
 * Created by guoyichen on 2017/3/7.
 */


var
    Product = require('../models/Product');
function ProductService (){
}
ProductService.prototype.constructor = ProductService;

ProductService.prototype.createProduct = function (data){
    return Product.create(data);
};
ProductService.prototype.updateProduct = function (condition, update){
    if(!update.updatedAt){
        update.updatedAt = Date.now();
    }
    return Product.findOneAndUpdate(condition, update, {new: true}).exec();
}

ProductService.prototype.getProductsByUserId = function (userId, update){
    var condition ={
        isDeleted : false,
        owner : userId
    }
    return Product.find(condition).limit(100).exec();
}

ProductService.prototype.getProductsById = function (id){
    var condition ={
        isDeleted : false,
        _id : id
    }
    return Product.findOne(condition).exec();
}
/**ljx
 * 查询优惠券商家列表
 * @param ownerArray
 * @returns {*|Promise|Array|{index: number, input: string}}
 */
ProductService.prototype.getCouponList=function(ownerArray,params){
    var condition ={
        isDeleted : false,
        //$in:{owner:ownerArray}
        owner: {$in: ownerArray}
    }
    return Product.find(condition, params).limit(100).exec();
};
/**ljx
 * 查询代金券信息
 * @param condition
 * @param params
 * @returns {*|Promise|Array|{index: number, input: string}}
 */
ProductService.prototype.getProduct=function(condition,params){
    var condition ={
        isDeleted : false
    }
    return Product.find(condition,params).populate("owner","_id").limit(100).exec();
};
module.exports = new ProductService();