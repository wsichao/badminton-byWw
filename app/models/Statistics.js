/**
 * 网络请求日志
 *
 */

var
  mongodb = require('../configs/db'),
  Schema = mongodb.mongoose.Schema;
var CONS = {
  TYPE: {
    "COMMON": "common",
    "LAST_REL_UPD": "last_rel_upd"
  }
};
var StatisticsSchema = new Schema({
  source: {type: String, default: 'docChat'},//数据来源: docChat-医聊

  type: {type: String, default: 'common'},// common 默认为统计信息; last_rel_upd 系统信息 记录上次统计时间;
  infoTime: {type: Number, default: 0}, //统计数据的截至时间(包括当天)
  infoName: {type: String, default: 'Indicator'}, //指标数据统计

  customerNum: {type: Number, default: 0}, //累计患者数
  doctorNum: {type: Number, default: 0}, //累计医生数
  connectedDoctorNum: {type: Number, default: 0},//累计接通电话医生数
  orderNum: {type: Number, default: 0}, //累计订单数(所有订单，包括失败的)
  connectedOrderNum: {type: Number, default: 0}, //累计成单数
  Non120ConnectedOrderNum: {type: Number, default: 0}, //除120的累计成单数
  NonEmployeeConnectedOrderNum: {type: Number, default: 0}, //除公司员工的累计成单数

  rechargeSum: {type: Number, default: 0}, //患者累计充值
  customerRealityPay: {type: Number, default: 0}, //患者实际支出
  customerModelPay: {type: Number, default: 0}, //患者模型支出
  doctorRealityIncome: {type: Number, default: 0}, //医生实际收入
  doctorModelIncome: {type: Number, default: 0},  //医生模型收入

  tfSum: {type: Number, default: 0}, //用户累积付款支出
  adSum: {type: Number, default: 0}, //用户累积广告支出

  createdAt: {type: Number, default: Date.now},
  updatedAt: {type: Number, default: Date.now},
  isDeleted: {type: Boolean, default: false}
}, {
  collection: 'statistics'
});

mongoosePre(StatisticsSchema, 'statistic');

var Statistics = mongodb.mongoose.model('Statistics', StatisticsSchema);
Statistics.CONS = CONS;
module.exports = Statistics;
