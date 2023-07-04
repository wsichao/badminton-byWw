/**
 * Created by lijinxia on 2017/11/29.
 * 厂家充值表
 */
var
    mongodb = require('../configs/db'),
    StatisticsHelper = require('../../lib/StatisticsHelper'),
    Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;

var fields = {
    factoryCode:Number, //厂家ID
    factoryName:String,//厂家名称
    price:Number,//本次充值金额

    isDeleted: {type: Boolean, default: false},//标记删除
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now},
    statisticsUpdatedAt: {type: Number, default: Date.now}
};
var factoryRechargeSchema = new Schema(fields, {
    collection: 'factoryRecharge'
});

mongoosePre(factoryRechargeSchema, 'factoryRecharge');

hookUpModel(factoryRechargeSchema);
var FactoryRecharge = mongodb.mongoose.model('factoryRecharge', factoryRechargeSchema);
FactoryRecharge.fields = fields;
FactoryRecharge.publicFields = Object.keys(fields).join(' ');
module.exports = FactoryRecharge;