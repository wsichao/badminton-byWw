/**
 * model 全局配置
 * Created by Mr.Carry on 2017/5/22.
 */
"use strict";
let hookUpModel = require('../../lib/StatisticsHelper').hookUpModel;

module.exports = {
  __createBefore: function (config, options) {
    config.createdAt = {type: Number, default: Date.now};
    config.updatedAt = {type: Number, default: Date.now};
    config.isDeleted = {type: Boolean, default: false};
    config.statisticsUpdatedAt = {type: Number, default: Date.now};
  },
  __createAfter: function (mongo_schema, md) {

    mongoosePre(mongo_schema, md); //每个查询添加source: { '$ne': 'zs' },非专属热线数据

    hookUpModel(mongo_schema);
  }
};