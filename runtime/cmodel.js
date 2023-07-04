/**
 * Created by Mr.Carry on 2017/5/17.
 */

'use strict';
const util = require("./util");
const base_url = util.getBaseUrl();
let model_map = {};
const getModel = (module, cmodel) => {
  const model = require(base_url + '/' + module + '/model/' + cmodel);
  return model;
}

const model = (module, db, md) => {
  if (model_map[module + md]) {
    return model_map[module + md];
  }

  let mongodb = Backend.config.getDB(Backend.type, db);
  let Schema = mongodb.Schema;

  let sechma_config = getModel(module, md);

  // schema 创建前事件
  if (getModelConfig().__createBefore) {
    getModelConfig().__createBefore(sechma_config.config, sechma_config.options);
  }
  let mongo_schema = new Schema(sechma_config.config, sechma_config.options);
  // schema 创建完成后事件
  if (getModelConfig().__createAfter) {
    getModelConfig().__createAfter(mongo_schema);
  }


  let MongoModel = mongodb.model(md, mongo_schema);
  MongoModel.methods = sechma_config.methods || {};
  for (var p in sechma_config.methods) {
    MongoModel.methods[p] = sechma_config.methods[p].bind(MongoModel);
  }
  model_map[module + md] = MongoModel;
  return MongoModel;
}

/**
 *  获取模型配置
 */
const getModelConfig = () => {
  const model_config = require(base_url + '/common/model');
  return model_config;
}

module.exports = {
  getModel: getModel,
  model: model
}
