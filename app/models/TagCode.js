/**
 * Created by lijinxia on 2017/11/21.
 */
var
    mongodb = require('../configs/db'),
    StatisticsHelper = require('../../lib/StatisticsHelper'),
    Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;

var fields = {
    code:Number, //渠道码
    title:String,//名称
    remark:String,//备注
    area:[String],//所属城市  废弃
    province:String,//省
    provinceId:Schema.ObjectId,//省
    city:String,//市
    cityId:Schema.ObjectId,//市
    district:String,//区
    districtId:Schema.ObjectId,//区
    contactName:String,//联系人姓名
    contactPhoneNum:String,//联系人电话
    drugs:[{factoryCode:String,factoryName:String,drugId:String,drugName:String}],//厂家code，厂家名称，药品ID，药品名称
    location: {type: [Number,Number], default: []},  //[longitude, latitude] // 经纬度

    isDeleted: {type: Boolean, default: false},//标记删除
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now},
    statisticsUpdatedAt: {type: Number, default: Date.now}
};
var tagCodeSchema = new Schema(fields, {
    collection: 'tagCode'
});

mongoosePre(tagCodeSchema, 'tagCode');

hookUpModel(tagCodeSchema);
var TagCode = mongodb.mongoose.model('tagCode', tagCodeSchema);
TagCode.fields = fields;
TagCode.publicFields = Object.keys(fields).join(' ');
module.exports = TagCode;