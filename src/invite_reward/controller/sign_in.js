/**
 * Created by yichen on 2018/3/12.
 */


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
    return self.display('invite_prize/signIn',{data : JSON.stringify(query)});
  }
}