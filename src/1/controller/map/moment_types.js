/**
 * 所有动态分类
 * Created by fly on 2017－06－28.
 */
'use strict';
let config_service = Backend.service('common', 'config_service');
module.exports = {
  __beforeAction: function () {

  },
  mockAction: function () {
    let resObj = {
      version: 1,
      items: [
        {
          type: 'all',
          name: '全部',
          icon: 'http://7j1ztl.com1.z0.glb.clouddn.com/mapfilter_all.png'
        },{
          type: 'favorite',
          name: '收藏',
          icon: 'http://7j1ztl.com1.z0.glb.clouddn.com/mapfilter_favorite.png'
        },{
          type: 'shop',
          name: '商户',
          icon: 'http://7j1ztl.com1.z0.glb.clouddn.com/mapfilter_shop.png'
        },{
          type: 'medical',
          name: '医疗',
          icon: 'http://7j1ztl.com1.z0.glb.clouddn.com/mapfilter_medical.png'
        },{
          type: 'finance',
          name: '金融',
          icon: 'http://7j1ztl.com1.z0.glb.clouddn.com/mapfilter_finance.png'
        },{
          type: 'personal',
          name: '个人',
          icon: 'http://7j1ztl.com1.z0.glb.clouddn.com/mapfilter_personal.png'
        }
      ]
    }
    return this.success(resObj);
  },
  getAction: function () {
    let self = this;
    let version = self.req.query.version || '';
    console.log('version:',version);
    let config_id = '5954af71b1bce56941cdeb7f';
    let resObj = {
      version: 0,
      items: []
    }
    return config_service.getConfigInfoById(config_id)
    .then(function(_config){
      if(!_config || !_config.field || !_config.field.momentTypes || !_config.field.momentTypes[0] ){
        return self.success(resObj);
      }
      let _field = _config.field;
      let momentTypeVersion = _field.momentTypeVersion || 0;
      resObj.version = momentTypeVersion;
      if(version != momentTypeVersion){
        resObj.items = _field.momentTypes || [];
      }
      return self.success(resObj);
    })
  }
}