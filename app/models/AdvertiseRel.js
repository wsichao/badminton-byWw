/**
 * Created by lijinxia on 2017/11/21.
 */
//存储用户对广告的操作

var
    mongodb = require('../configs/db'),
    StatisticsHelper = require('../../lib/StatisticsHelper'),
    Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;

var fields = {
    userId:{type: String, default: ''}, //用户主账号ID
    deviceId : {type: String, default: ''}, //设备ID
    adIds:[String],//不感兴趣广告ID数组

    isDeleted: {type: Boolean, default: false},//标记删除
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now},
    statisticsUpdatedAt: {type: Number, default: Date.now}
};
var advertiseRelSchema = new Schema(fields, {
    collection: 'advertiseRel'
});

mongoosePre(advertiseRelSchema, 'advertiseRel');

hookUpModel(advertiseRelSchema);
var AdvertiseRel = mongodb.mongoose.model('advertiseRel', advertiseRelSchema);
AdvertiseRel.fields = fields;
AdvertiseRel.publicFields = Object.keys(fields).join(' ');
module.exports = AdvertiseRel;