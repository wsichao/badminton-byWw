/**
 *
 * 3月邀请有奖页面链接转换
 *
 * Created by yichen on 2018/3/30.
 */
const co = require('co');
const link_transfer_model = Backend.model('activity','','link_transfer');
'use strict';
module.exports = {
  __rule: function (valid) {
    return valid.object({
      s: valid.string().required()
    });
  },
  getAction: function () {
    let self = this;
    let query = this.query;
    co(function *(){
      let transfer = yield  link_transfer_model.methods.get_link(query.s);
      self.res.redirect(transfer.realLink);
    })
  }
}
