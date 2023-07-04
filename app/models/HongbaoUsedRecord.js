var
    mongodb = require('../configs/db'),
    StatisticsHelper = require('../../lib/StatisticsHelper'),
    Customer = require('./Customer'),
    Moment = require('./Moment'),
    Hongbao = require('./Hongbao'),
    Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;
var fields = {
    source: {type: String, default: 'docChat'},//数据来源: docChat-医聊
    userId: {type: Schema.Types.ObjectId, ref: 'User'}, //领取红包用户的主账号ID
    userName: String, //领取红包时的名字
    hongbao: {type: Schema.Types.ObjectId, ref: 'Hongbao'}, //红包
    moment: {type: Schema.Types.ObjectId, ref: 'Moment'}, //红包绑定的动态
    value: {type: Number, default: 0}, //红包金额
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now}
};
var hongbaoUsedRecordSchema = new Schema(fields, {
    collection: 'hongbaoUsedRecords'
});
hookUpModel(hongbaoUsedRecordSchema);
var HongbaoUsedRecord = mongodb.mongoose.model('HongbaoUsedRecord', hongbaoUsedRecordSchema);
HongbaoUsedRecord.fields = fields;
HongbaoUsedRecord.publicFields = '';
module.exports = HongbaoUsedRecord;
