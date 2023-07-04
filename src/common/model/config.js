/**
 * 存放配置信息
 * Created by fly on 2017－06－23.
 */
'use strict';
module.exports = {
  config: {
    field: Object,
    note: {type: String, default: ''} //配置信息说明
  },
  options:{
    collection: 'configs'
  }
}