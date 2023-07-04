/**
 * 动态推荐系统样本埋点
 * Created by fly on 2017－07－26.
 */

'use strict';
// let _model = Backend.model('1/recommend', undefined, 'dynamic_sample');


let _model = require('../../../../app/models/DynamicSample');
module.exports = {

  genSample: function (userId, info) {
    if(!userId || !info || isNaN(info.type) || !info.targetId || isNaN(info.action) || !info.tags){
      console.log('info err');
    }
    let sample = {
      userId: userId,
      type: info.type,
      targetId: info.targetId,
      action: info.action,
      tags: info.tags
    }
    return _model.create(sample);
  }
}