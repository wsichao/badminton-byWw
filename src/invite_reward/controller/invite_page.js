/**
 * Created by yichen on 2018/3/12.
 */

const link_transfer_model = Backend.model('activity','','link_transfer');
const co = require('co');
'use strict';
module.exports = {
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required()
    });
  },
  getAction: function () {
    let self = this;
    let query = this.query;
    let share_url = '/invite_reward/sign_in?cms_id=68&user_id=' + query.user_id + '&channel_code=';
    if(query.channel_code) {
      share_url +=  query.channel_code
    }
    let result = co(function *(){
      let transfer = yield  link_transfer_model.methods.find_link(share_url);
      let result;
      if(transfer){
        result = transfer;
      }else{
        result = yield link_transfer_model.methods.set_link(share_url);
      }
      return { data : JSON.stringify({share_url : ("/url/ir3?s="+result._id)})};
    })
    return self.display('invite_prize/inviteIndex.html',result);
  }
}

