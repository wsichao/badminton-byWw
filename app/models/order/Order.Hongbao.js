
var mongodb = require('../../configs/db'),
    Schema = mongodb.mongoose.Schema,
    Customer = require('../Customer'),
    Hongbao = require('../Hongbao');

var hongbao_fields = {
    customerId: {type: Schema.Types.ObjectId, ref: 'User'}, //包红包用户
    customerRefId : String, //副账户id
    customerName: String, //用户名字
    customerPhoneNum: String, //用户手机号
    hongbao: {type: Schema.Types.ObjectId, ref: 'Hongbao'},
    totalValue: {type: Number, default: 0}, //红包总金额
    totalCount:  {type: Number, default: 0}, //红包总数
};

module.exports = exports = hongbao_fields;