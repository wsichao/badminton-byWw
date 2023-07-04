/**
 *
 *  Customer
 *  患者基本信息
 *  Authors: Tom
 *  Created by Tom on on 5/20/15.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var
  mongodb = require('../configs/db'),
  StatisticsHelper = require('../../lib/StatisticsHelper'),
  Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;
var fields = {
  userId: String, //主账户Id
  docChatNum : String, //账户热线号
  createdAt: {type: Number, default: Date.now},//用户注册时间
  updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
  isDeleted: {type: Boolean, default: false},//该条记录是否被删除
  statisticsUpdatedAt: {type: Number, default: Date.now},

  balance: {type: Number, default: 0}, // 营销推广余额,当前账户未被使用的，实际消费时抵扣
  remainBalance: {type: Number, default: 0},// 营销推广余额扣除掉已经被预定了的，实际领券时抵扣
  checkinNum: {type: Number, default: 0}, // 商家实际收取了多少代金券
  totalVal : {type: Number, default: 0},//运营总共冲值金额

  // 注意充值时两个balance都应该增加
  remainMemberSize: {type: Number, default: 0},// 当前剩余的会员名额
  consumedMemberSize: {type: Number, default: 0},// 当前消耗掉的会员名额
  cps: {type: Number, default: 0}, //cost per sale

  cpsUpdatedAt: {type: Number, default: Date.now},//cps修改时间

  isMarketingClosed: {type: Boolean, default: false}, //true-暂停推广, false-继续推广
  //认证相关信息
  shopCity : String,
  shopName : String,
  shopType : String,
  shopSubType : String
};
var selectFields = "-isDeleted -statisticsUpdatedAt";
var shopSchema = new Schema(fields, {
  collection: 'shops'
});
hookUpModel(shopSchema);
var Shop = mongodb.mongoose.model('Shop', shopSchema);
Shop.fields = fields;
module.exports = Shop;
