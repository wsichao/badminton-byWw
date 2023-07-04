/**
 * 城市表
 * Created by Mr.Carry on 2017/12/112
 */
"use strict";
var
  mongodb = require('./../../configs/db'),
  Schema = mongodb.mongoose.Schema;

let town = new Schema({
  id: String,
  townName: String,
  hospitals: [String]
});

let city = new Schema({
  id: String,
  cityName: String,
  hospitals: [String],
  town: [town]
});

let servicePackageArea = new Schema({
  createdAt: {type: Number, default: Date.now},//用户注册时间
  updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
  isDeleted: {type: Boolean, default: false},//该条记录是否被删除
  statisticsUpdatedAt: {type: Number, default: Date.now},

  provinceName: String, //省名称
  hospitals: [Schema.ObjectId], //下属医院
  city: [city]
}, {
  collection: 'servicePackageArea'
});

let ServicePackage = mongodb.mongoose.model('ServicePackageArea', servicePackageArea);
module.exports = ServicePackage;