/**
 * Created by lijinxia on 2017/11/29.
 * 会员维护计划表
 */
var
    mongodb = require('../configs/db'),
    StatisticsHelper = require('../../lib/StatisticsHelper'),
    Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;

var fields = {
    factoryCode:Number, //厂家ID
    factoryName:String,//厂家名称
    planName:String,//厂家计划名称
    planVal:Number,//计划预算金额
    balanceVal:Number,//计划剩余金额  废弃字段
    area:[String],//地区  废弃
    region:[{province:String,provinceId:Schema.ObjectId,city:String,cityId:Schema.ObjectId,district:String,districtId:Schema.ObjectId}],//三级地区
    drugId:String,//药品ID
    // drug: {type: Schema.Types.ObjectId, ref: 'drug'}, //药品信息
    drugName:String,//药品名称
    normalCount:Number,//每用户每年正常的用药数量
    leastCount:Number,//每用户每次最少申请补贴数量
    maxCount:Number,//每用户每年可补贴最大数量
    memberCount:Number,//维护会员数
    reimbursePrice:Number,//每件补贴金额
    remark:String,//备注
    stopPlan:{type: Boolean, default: false},//是否停止计划

    rangeUser:[{startTime:Number,endTime:Number,planId:Schema.ObjectId,reimburseStatus:Number}],//范围人群   reimburseStatus-1 已补贴 指定审核时间指定计划 申请审核通过 2 未补贴 指定审核时间指定计划 申请审核通过的(已补贴)用户的补集(From User表) 废弃
    userGroupId: Schema.ObjectId,
    isDeleted: {type: Boolean, default: false},//标记删除
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now},
    statisticsUpdatedAt: {type: Number, default: Date.now}
};
var factoryDrugRelSchema = new Schema(fields, {
    collection: 'factoryDrugRel'
});

mongoosePre(factoryDrugRelSchema, 'factoryDrugRel');

hookUpModel(factoryDrugRelSchema);
var FactoryDrugRel = mongodb.mongoose.model('factoryDrugRel', factoryDrugRelSchema);
FactoryDrugRel.fields = fields;
FactoryDrugRel.publicFields = Object.keys(fields).join(' ');
module.exports = FactoryDrugRel;