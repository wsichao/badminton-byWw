/**
 * Created by guoyichen on 2017/3/6.
 */

var
    mongodb = require('../configs/db'),
    StatisticsHelper = require('../../lib/StatisticsHelper'),
    Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;


var fields = {

    title: String,          //商品标题
    description: String,    //商品描述

    displayPrice:Number,  //价格
    actualPrice:Number,  //实际价格
    rewardPrice:Number, //奖励价格

    stock : Number, //库存
    soldNum : Number,  //已卖数量

    owner : {type: Schema.Types.ObjectId, ref: 'User'},//拥有者的主账号id

    createdAt: {type: Number, default: Date.now},//用户注册时间
    updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
    isDeleted: {type: Boolean, default: false}//该条记录是否被删除

};



var productSchema = new Schema(fields, {
    collection: 'products'
});
hookUpModel(productSchema);
var Product = mongodb.mongoose.model('Product', productSchema);
Product.fields = fields;
module.exports = Product;
