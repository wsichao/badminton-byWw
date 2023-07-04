/**
 * 意见反馈
 */

var
  mongodb = require('../configs/db'),
  Schema = mongodb.mongoose.Schema;
var CONS = {
  TYPE: {
    CUS: "24_cus", // 24热线客户端反馈
    DOC: "24_doc"  // 24热线医生端反馈
  }
};
var suggestionSchema = new Schema({
  source: {type: String, default: 'docChat'},
  type: {type: String, default: CONS.TYPE.CUS},// 默认是客户端反馈

  userId: String, //申请人id
  name: String,//用户姓名
  phoneNum: String,//用户的手机号
  hospital: String,
  department: String,
  content: {type: String, default: ""},//反馈信息 
  status: {type: Number, default: 0}, //处理阶段, 0 - 未处理; 1 - 已阅读/接受; 2 - 已处理;

  createdAt: {type: Number, default: Date.now},
  updatedAt: {type: Number, default: Date.now},
  isDeleted: {type: Boolean, default: false}
}, {
  collection: 'suggestions'
});

mongoosePre(suggestionSchema, 'suggestion');

var Suggestion = mongodb.mongoose.model('Suggestion', suggestionSchema);

module.exports = Suggestion;