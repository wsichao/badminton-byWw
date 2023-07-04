/**
 * Created by zhaoyifei on 15/6/10.
 */
var util = require('util'),
  mongodb = require('../configs/db'),
  constants = require('../configs/constants'),
  Schema = mongodb.mongoose.Schema,
  ObjectId = Schema.ObjectId;

/**
 * @type {Schema}
 */
var ValidateSchema = new Schema({
  phoneNum: String,//手机号
  authCode: String,//认证码
  isAuth: {type: Boolean, default: false},//是否已被认证成功
  createdAt: {type: Number, default: Date.now},//生成时间
  updatedAt: {type: Number, default: Date.now},//最近更新时间
  expireAt: {type: Number, default: Date.now},//最近更新时间
  isDeleted: {type: Boolean, default: false}//该条记录是否被删除
}, {
  collection: 'validates'
});

mongoosePre(ValidateSchema, 'validate');

var Validate = mongodb.mongoose.model('Validate', ValidateSchema);

module.exports = Validate;