/**
 * Created by Mr.Carry on 2017/6/7.
 */
"use strict";

let emChatService = Backend.service("common/","EmchatService")

module.exports = {
  getAction : function(){
    let user_id = this.query.user_id;
    let nickname = this.query.nickname;
    let user_service = Backend.service("1/im", "user");
    return this.success(user_service.updateNick(user_id,nickname));
    // emChatService.getBlacklist("5938b06c8fc8f0947531c698",function(data){
    //   console.log(data);
    // })

  },
  mockAction : function(){
    return this.success({name : 1});
  }
}