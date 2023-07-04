/**
 * 网络请求日志
 *
 */

var
  StatisticsHelper = require('../../lib/StatisticsHelper'),
  mongodb = require('../configs/db'),
  Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;

var LogSchema = new Schema({
  source: {type: String, default: 'docChat'},//数据来源: docChat-医聊

  ip: {type: String, default: ""},//用户IP
  terminalId: {type: String, default: ""},//设备串号
  userId: {type: String, default: ""},//用户id

  httpMethod: {type: String, default: ""},//请求方法
  httpUri: {type: String, default: ""},//请求Uri
  httpParams: {type: Schema.Types.Mixed, default: {}}, //请求参数
  httpReqPayload: {type: Schema.Types.Mixed, default: {}}, //request payload
  httpResPayload: {type: Schema.Types.Mixed, default: {}}, //response payload
  createdAt: {type: Number, default: Date.now},
  statisticsUpdatedAt: {type: Number, default: Date.now},
  isDeleted: {type: Boolean, default: false}
}, {
  collection: 'logs'
});

mongoosePre(LogSchema, 'log');

hookUpModel(LogSchema);
var Log = mongodb.mongoose.model('Log', LogSchema);

module.exports = Log;
