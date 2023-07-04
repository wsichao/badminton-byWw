/**
 * 环信实时回调保存聊天记录
 * Created by yichen on 2017/7/13.
 */



'use strict';

let _ = require("underscore");

module.exports = {
  postAction: function (){
    console.log('come in');
    let that = this;
    let postData = this.post;
    if(!_.keys(postData).length){

      console.log("data error");
      return that.fail(8005);
    }
    console.log(postData);

    let EmchatRecords = Backend.model('1/im', undefined, 'em_chat_record');

    return EmchatRecords.create(postData)
      .then(function () {
        console.log('ended.');
        return that.success({msg:"success"});
    });


  }
}
