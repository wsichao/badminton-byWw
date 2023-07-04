/**
 *  biz_relation
 *
 *  业务关系(区别与社交关系)
 *    － 推荐粉丝
 *    － 服务助理
 *    － 广告推广
 *    － 其它（该类关系可以动态扩展）
 *
 */

var
  mongodb = require('../configs/db'),
  StatisticsHelper = require('../../lib/StatisticsHelper'),
  Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;
var fields = {
  source: {type: String, default: 'docChat'},  //数据来源: docChat-医聊
  // 基本属性
  createdAt: {type: Number, default: Date.now},// 创建时间
  updatedAt: {type: Number, default: Date.now},// 最近业务(需统计的)更新时间
  statisticsUpdatedAt: {type: Number, default: Date.now}, // 最近更新时间
  isDeleted: {type: Boolean, default: false},  // 是否标识删除

  // 关系属性
  type: {type: String, default: "recmnd_fans"},// 关系类型: recmnd_fans推荐粉丝, ass服务助理, ad推广
  fromId: {type: String, default: ""}, // 关系主体: 专家医生 副账号Id
  fromRef: {
    type: Schema.ObjectId,
    ref : 'Doctor'
  },
  toId: {type: String, default: ""},  // 关系指向: 顾问医生/拉粉医生 副账号Id
  toRef: {
    type: Schema.ObjectId,
    ref : 'Doctor'
  },
  fansId: [String], // 关系为推荐粉丝, 粉丝的ID列表,冗余方便查询
  orderId: [String], // 关系为广告/助理服务, 存储订单列表 
  weight: {type: Number, default: 0} // 权重

};
var selectedFields = "-fromRef -toRef";
var relation = new Schema(fields, {
  collection: 'relations'
});

mongoosePre(relation, 'relation');

hookUpModel(relation);
var RelationsRecmndFan = mongodb.mongoose.model('Relations', relation);
RelationsRecmndFan.fields = fields;
RelationsRecmndFan.selectedFields = selectedFields;

module.exports = RelationsRecmndFan;