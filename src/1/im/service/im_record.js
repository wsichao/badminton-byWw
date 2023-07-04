/**
 * Created by yichen on 2017/6/9.
 */

"use strict";
let ec_chat_record_model = Backend.model("1/im", undefined , "em_chat_record" );


module.exports = {
  deleteChatRecord: function(from_im_user_name, record_id){
    var cond = {
      isDeleted : false ,
      msg_id : record_id
    }
    return ec_chat_record_model.update( cond ,  {$addToSet : {'deletedBy': from_im_user_name}});

  }
};