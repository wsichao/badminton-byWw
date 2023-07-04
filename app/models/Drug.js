/**
 * Created by lijinxia on 2017/11/29.
 * 药品表
 */
var
    mongodb = require('../configs/db'),
    StatisticsHelper = require('../../lib/StatisticsHelper'),
    Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;

var fields = {
    factoryCode:Number, //厂家ID
    factoryName:String,//厂家名称
    name:String,//药品名称
    images:[String],//药品图片
    packageInfo:String,//包装规格
    desc:String,//功能简介

    isDeleted: {type: Boolean, default: false},//标记删除
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now},
    statisticsUpdatedAt: {type: Number, default: Date.now}
};
var drugSchema = new Schema(fields, {
    collection: 'drug'
});

mongoosePre(drugSchema, 'drug');

hookUpModel(drugSchema);
var Drug = mongodb.mongoose.model('drug', drugSchema);
Drug.fields = fields;
Drug.publicFields = Object.keys(fields).join(' ');
module.exports = Drug;