/**
 * Created by fly on 2017－05－27.
 */

'use strict';
let _model = Backend.model('common', undefined, 'shop');
module.exports = {
  getShopInfoByUserIds: function (user_ids, fields, optoins) {
    let cond = {
      isDeleted: false,
      userId: {$in: user_ids},
    }
    fields = fields || '';
    optoins = optoins || {};
    return _model.find(cond, fields, optoins).exec()
  }
}
