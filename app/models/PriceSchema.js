/**
 * 定价模型
 * @type {exports}
 */
var mongodb = require('../configs/db'),
  Schema = mongodb.mongoose.Schema;

var PriceSchema = new Schema({
  //_id: {type: Schema.ObjectId, unique: true},
  customerInitiateTime: {type: Number, default: 5}, //患者起步价包含时长，单位分钟
  doctorInitiateTime: {type: Number, default: 5}, //医生起步价包含时长,单位分钟
  initiatePayment: Number, //患者起步支出
  initiateIncome: Number, //医生起步收入
  paymentPerMin: Number, //患者起步时长后每分钟支出
  incomePerMin: Number, //医生起步时长后每分钟收入
  discount: {type: Number, default: 1},  //给患者的折扣 0~1之间
  canLackMoney: {type: Boolean, default: false}, //能否欠费
  lackedMoney: {type: Number, default: 0}, //欠费金额
});

module.exports = PriceSchema;


