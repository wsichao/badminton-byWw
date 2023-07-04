/**
 * 唯一号
 * create by menzhongxin
 */

var
  mongodb = require('../configs/db'),
  Schema = mongodb.mongoose.Schema;
var TITLE = {
  'LM_CODE': 'LM_CODE'
};
var uniqueCodeSchema = new Schema({
  title: {type: String, default:''},
  code: {type: Number, default: 0}

},{
  collection: 'uniqueCode'
});
var UniqueCode = mongodb.mongoose.model('UniqueCode', uniqueCodeSchema);

module.exports = {
  UniqueCode: UniqueCode,
  Title: TITLE
};