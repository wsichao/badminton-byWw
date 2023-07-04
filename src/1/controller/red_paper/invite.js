/**
 * 邀请用户注册
 * Created by fly on 2017－07－10.
 */
'use strict';
let user_service = Backend.service('common', 'user_service');
let config_service = Backend.service('common', 'config_service');
let invite_service = Backend.service('1/red_paper', 'invite_record_service');
module.exports = {
  __beforeAction: function () {
    /* if(!isUserInfoAuthorized(this.req)){
     return this.fail(8005);
     }*/
  },
  mockAction: function () {
    let resObj = {
    }
    return this.success(resObj);
  },
  getAction: function () {
    let self = this;
    let query = this.query;
    let phone_num = query.phone_num || '';
    let invite_id = query.invite_id || '';
    //验证手机号的有效性
    if(!phone_num || !isValidPhone(phone_num) || !invite_id){
      return this.fail(8005);
    }
    let resObj = {
    }
    //生产用户
    let inviteeReward = 0;
    return config_service.getHeavenConfigInfo()
    .then(function(_config){
      //console.log('_config:', _config);
      inviteeReward = _config.inviteValue || 0;
      return user_service.genUserFromWeb(invite_id, phone_num)
    })
    .then(function(_res){
      if(_res.isRegistered){
        if(_res.isNewUser){
          throw getBusinessErrorByCode(2415);
        }
        throw getBusinessErrorByCode(2414);
      }
      //生产邀请纪录
      let invite_info = {
        inviter: invite_id + '',
        invitee: _res.invitee_id + '',
        inviteePhone: phone_num,
        inviteeReward: inviteeReward
      };
      return invite_service.genInviteRecord(invite_info);
    })
    .then(function(){
      return self.success(resObj);
    }, function(e){
      //console.log(e, e.code);
      if(e){
        return self.fail(e.code);
      }
    })
  }
}
