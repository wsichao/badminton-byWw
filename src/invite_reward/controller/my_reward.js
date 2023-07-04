/**
 * Created by yichen on 2018/3/12.
 */

'use strict';


const invitation_bonus_log_service = Backend.service('activity','invitation_bonus_log');
module.exports = {
  __rule: function (valid) {
    return valid.object({
      user_id: valid.string().required()
    });
  },
  getAction: function () {
    let self = this;
    let query = this.query;
    let final = invitation_bonus_log_service.fromUserinvitation(query.user_id)
      .then(function(result){
        return {data : JSON.stringify(result)}
      })
    return self.display('invite_prize/myBountyTwo.html',final);
  }
}
