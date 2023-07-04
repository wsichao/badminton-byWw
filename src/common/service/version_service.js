/**
 * Created by yichen on 2017/6/22.
 */


'use strict';
let _model = Backend.model('common', undefined, 'version');
module.exports = {
  findVersion: function (cond) {
    cond.isDeleted = false;
    return _model.find(cond).exec()
  }
}
