/**
 * Created by yichen on 2017/6/8.
 */

"use strict";

let service = Backend.service("1/im","message_detail");

module.exports = {
  __beforeAction: function () {
    return userInfoAuth(this.req, {});
  },
  mockAction: function () {
    var result = {
      items:[
        {
          "msg_id":"339674032473379932",
          "timestamp":"1496651323629",
          "direction":"outgoing",
          "to":"zly_test_1",
          "from":"admin@easemob.com",
          "chat_type":"chat",
          "payload":
            {"bodies":[
              {
                "file_length":128827,//图片附件大小（单位：字节）
                "filename":"test1.jpg", //图片名称
                "secret":"DRGM8OZrEeO1vafuJSo2IjHBeKlIhDp0GCnFu54xOF3M6KLr", //secret在上传图片后会返回，只有含有secret才能够下载此图片
                "size":{"height":1325,"width":746},//图片尺寸
                "type":"img",//图片消息类型
                "url":"https://a1.easemob.com/easemob-demo/chatdemoui/chatfiles/65e54a4a-fd0b-11e3-b821-ebde7b50cc4b", //上传图片消息地址，在上传图片成功后会返回UUID
              }

            ],"from":"zly_test_2","to":"zly_test_1"}},
        {
          "msg_id":"339674032473379933",
          "timestamp":"1496651323620",
          "direction":"outgoing",
          "to":"zly_test_1",
          "from":"admin@easemob.com",
          "chat_type":"chat",
          "payload":
            {"bodies":[{"msg":" test send msg    2 to 1","type":"txt"}],"from":"zly_test_2","to":"zly_test_1"}},
        {"msg_id":"339681410363163772","timestamp":"1496653041422","direction":"outgoing","to":"zly_test_1","from":"admin@easemob.com","chat_type":"chat", "payload": {"bodies":[{"msg":" test send msg    2 to 1","type":"txt"}],"from":"zly_test_2","to":"zly_test_1"}},
        {"msg_id":"339681337814295672","timestamp":"1496653024534","direction":"outgoing","to":"zly_test_1","from":"admin@easemob.com","chat_type":"chat", "payload": {"bodies":[{"msg":" test send msg    2 to 1","type":"txt"}],"from":"zly_test_2","to":"zly_test_1"}}
      ]
    };
    return this.success(result);
  },
  getAction: function () {
    //console.log('come in');
    var that  = this;
    var userId = this.req.identity.userId;
    var user = this.req.identity.user;
    if (!isUUID24bit(userId) || !isExist(user)) {
      return this.fail(8005);
    }
    let ImUserName = user.im.userName;
    let chatUserName = this.query.chatUserName; // im username
    if(!chatUserName){
      return this.fail(8005)
    }
    let pageSize = this.query.pageSize;
    let timestamp = this.query.timestamp;

    return service.getChatRecord(ImUserName,chatUserName,timestamp,pageSize)
      .then(function(result){
        return that.success({items:result});
      })
  }

}