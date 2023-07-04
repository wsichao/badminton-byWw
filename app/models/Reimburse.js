/**
 * Created by lijinxia on 2017/12/1.
 * 用户申请补贴表
 */
var
    mongodb = require('../configs/db'),
    StatisticsHelper = require('../../lib/StatisticsHelper'),
    Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;

var fields = {
    // userId:String,//申请补贴用户ID
    user: {type: Schema.Types.ObjectId},//申请补贴用户
    userName:String,//用户姓名
    userPhoneNum:String,//用户手机号
    factoryCode:Number,//厂家code
    factoryName:String,//厂家名称
    planId:String,//计划ID
    planName:String,//厂家计划名称
    drugId:String,//药品ID
    drugName: String,//药品名称
    images:[String],//药品图片
    drugPackage: String,//包装规格
    drugDesc: String,//描述
    reimburseImgs:[String],//购药凭证
    drugImgs:[String],//药品照片
    reimbursePrice: Number,//每个补贴
    reimburseCount:Number,//合计数量
    // reimburseTotal:Number,//合计补贴
    checkStatus:{type: Number, default: 0},//审核状态 0-补贴审核中  1-审核通过  -1-审核未通过
    remark:{type: String, default: ''},//审核说明
    // city:String,//申请补贴所在的市  废弃

    province:String,//申请补贴所在省 province-省，city-市，district-县
    city:String,//申请补贴所在城市 province-省，city-市，district-县
    district:String,//申请补贴所在城市 province-省，city-市，district-县

    buyChannel:Schema.Types.ObjectId,//购买渠道ID
    buyChannelName:String,//购买渠道名称

    //渠道审核字段
    channelCheckStatus:{type: Number, default: 100},//审核状态 100-审核中  200-审核通过  300-审核未通过
    channelCheckRejectReason : String,
    drugAuditorId : {type :Schema.Types.ObjectId },//审核人员id
    channelCheckedAt:{type: Number},//审核时间


    isDeleted: {type: Boolean, default: false},//标记删除
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now},
    statisticsUpdatedAt: {type: Number, default: Date.now}
};
var reimburseSchema = new Schema(fields, {
    collection: 'reimburse'
});

mongoosePre(reimburseSchema, 'reimburse');

hookUpModel(reimburseSchema);
var Reimburse = mongodb.mongoose.model('reimburse', reimburseSchema);
Reimburse.fields = fields;
Reimburse.publicFields = Object.keys(fields).join(' ');
module.exports = Reimburse;