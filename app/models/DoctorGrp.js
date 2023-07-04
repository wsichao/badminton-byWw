/**
 * 医生分组信息
 * @type {exports}
 */
var
  mongodb = require('../configs/db'),
  StatisticsHelper = require('../../lib/StatisticsHelper'),
  Schema = mongodb.mongoose.Schema;
var hookUpModel = StatisticsHelper.hookUpModel;
var doctorSchema = new Schema({
  doctorId: String,
  doctorName: String,
  docChatNum: Number
});

var fields = {
  source: {type: String, default: 'docChat'},//数据来源:  docChat-医聊
  docChatList: [String], // 医疗号列表
  docListDisplay: String, // 分组显示信息
  description: {type: String, default: ""}, // 说明文案
  memo: {type: String, default: ""}, // 备注说明
  createdAt: {type: Number, default: Date.now},//用户注册时间
  updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
  isDeleted: {type: Boolean, default: false},//该条记录是否被删除
  statisticsUpdatedAt: {type: Number, default: Date.now}
};
var doctorGrpSchema = new Schema(fields, {
  collection: 'doctor_group'
});
hookUpModel(doctorGrpSchema);
var DoctorGrp = mongodb.mongoose.model('DoctorGrp', doctorGrpSchema);
module.exports = DoctorGrp;
