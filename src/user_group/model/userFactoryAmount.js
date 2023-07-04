/**
 * 用户分组表(userGroup)
 *
 * Created by yichen on 2018/4/19.
 */

"use strict";

module.exports = {
  config: {
    factory : Backend.Schema.Types.ObjectId, //厂家ID
    user : Backend.Schema.Types.ObjectId, //补贴用户ID
    amount : Number, //成功补贴的总金额
  },
  options: {
    collection: 'userFactoryAmount'
  }
};