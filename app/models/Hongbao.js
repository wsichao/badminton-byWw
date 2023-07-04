var
    mongodb = require('../configs/db'),
    StatisticsHelper = require('../../lib/StatisticsHelper'),
    Customer = require('./Customer'),
    Moment = require('./Moment'),
    HongbaoOrder = require('./Order').HongbaoOrder,
    Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;
var fields = { //红包可用的条件:isDeleted=false, expiredAt > now, payStatus=paid
    source: {type: String, default: 'docChat'},//数据来源: docChat-医聊
    user: {type: Schema.Types.ObjectId, ref: 'User'}, //发红包用户主账号ID
    moment: {type: Schema.Types.ObjectId, ref: 'Moment'}, //红包绑定的动态
    order: {type: Schema.Types.ObjectId, ref: 'HongbaoOrder'}, //红包绑定的订单id
    totalValue: {type: Number, default: 0}, //红包总金额
    totalCount:  {type: Number, default: 0}, //红包总数
    usedValue: {type: Number, default: 0}, //已领取金额
    usedCount: {type: Number, default: 0}, //已领取数
    values: [Number], //所有红包金额
    expiredAt: {type: Number, default: Date.now}, //有效期
    // Deprecated !! 该字段未使用
    payStatus: {type: String, default: 'paying', enum: ['paying', 'paid']}, //paying-待支付, paid-已支付,

    isExpiredRefunded: {type: Boolean, default: false}, //未发完的已过期的红包是否已退款给用户
    isDeleted: {type: Boolean, default: false},
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now},
    statisticsUpdatedAt: {type: Number, default: Date.now}
};
var hongbaoSchema = new Schema(fields, {
    collection: 'hongbaos'
});
mongoosePre(hongbaoSchema, 'hongbao');

hookUpModel(hongbaoSchema);
var Hongbao = mongodb.mongoose.model('Hongbao', hongbaoSchema);
Hongbao.fields = fields;
Hongbao.publicFields = '';
module.exports = Hongbao;
