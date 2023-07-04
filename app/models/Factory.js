/**
 * Created by lijinxia on 2017/11/29.
 * 厂家表
 */

var
    mongodb = require('../configs/db'),
    StatisticsHelper = require('../../lib/StatisticsHelper'),
    Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;

var fields = {
    code:Number, //厂家ID
    name:String,//厂家名称
    chargerName:String,//负责人姓名
    phoneNum:String,//负责人联系电话
    totalVal:Number,//总充值金额
    unFrozenVal:Number,//未冻结金额
    cmsUserName:String,//cms中的用户名

    isDeleted: {type: Boolean, default: false},//标记删除
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now},
    statisticsUpdatedAt: {type: Number, default: Date.now}
};
var factorySchema = new Schema(fields, {
    collection: 'factory'
});

mongoosePre(factorySchema, 'factory');

hookUpModel(factorySchema);
var Factory = mongodb.mongoose.model('factory', factorySchema);
Factory.fields = fields;
Factory.publicFields = Object.keys(fields).join(' ');
module.exports = Factory;