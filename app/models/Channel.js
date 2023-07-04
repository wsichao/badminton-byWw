/**
 * 渠道
 * create by menzhongxin
 */

var
  mongodb = require('../configs/db'),
  Schema = mongodb.mongoose.Schema;

var managerSchema = {
  _id: String,
  name: String,
  phoneNum: String
};
var superiorSchema = {
  _id: String,
  name: String
};
var salesmanSchema = {
  phoneNum: String
};
var channelSchema = new Schema({
  // 基本属性
  source: {type: String, default: 'docChat'},//数据来源: docChat-医聊
  createdAt: {type: Number, default: Date.now},//用户注册时间
  updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
  isDeleted: {type: Boolean, default: false},//该条记录是否被删除
  statisticsUpdatedAt: {type: Number, default: Date.now},
  salesman: salesmanSchema, //业务员
  manager: managerSchema, //当前渠道负责人
  superior: superiorSchema, //上级负责人
  type: {type: String, default: ''},
  code: String, //识别码
  remark: String //备注
},{
  collection: 'channels'
});
mongoosePre(channelSchema, 'channel');

var Channel = mongodb.mongoose.model('Channel', channelSchema);
module.exports = Channel;