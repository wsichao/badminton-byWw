/**
 * im消息列表
 * Created by yichen on 2017/6/6.
 */

"use strict";

let service = Backend.service("1/im","message_list");
let imSessionService = Backend.service("1/im", "im_session");
let SocialRelService = require('../../../../app/services/SocialRelService');
let _ = require('underscore');

module.exports = {
  __beforeAction: function () {
    return userInfoAuth(this.req, {});
  },
  mockAction: function () {
    var result = {
      items:[
        {
          "_id": "57d77e24f52e142136bd8573",
          "im_id": "aaa",
          "avatar": "612C2204-90A8-4641-BB07-309EE1F51096",
          "name": "yichen",
          "timestamp": 1496735169908,
          "lastMsg": {
            "msg_id":"339674032473379932",
            "timestamp":"1496651323629",
            "direction":"outgoing",
            "to":"zly_test_1",
            "from":"admin@easemob.com",
            "chat_type":"chat",
            "payload":
              {"bodies":[{"msg":" test send msg    2 to 1","type":"txt"}],"from":"zly_test_2","to":"zly_test_1"}}
        },

        {
          "_id": "57d77e24f52e142136bd8573",
          "im_id": "aaa",
          "avatar": "612C2204-90A8-4641-BB07-309EE1F51096",
          "name": "yichen",
          "timestamp": 1496735169908,
          "lastMsg": {"msg_id":"339681410363163772","timestamp":"1496653041422","direction":"outgoing","to":"zly_test_1","from":"admin@easemob.com","chat_type":"chat", "payload": {"bodies":[{"msg":" test send msg    2 to 1","type":"txt"}],"from":"zly_test_2","to":"zly_test_1"}}
        },
        {
          "_id": "57d77e24f52e142136bd8573",
          "im_id": "aaa",
          "avatar": "612C2204-90A8-4641-BB07-309EE1F51096",
          "name": "yichen",
          "timestamp": 1496735169908,
          "lastMsg":{"msg_id":"339681337814295672","timestamp":"1496653024534","direction":"outgoing","to":"zly_test_1","from":"admin@easemob.com","chat_type":"chat", "payload": {"bodies":[{"msg":" test send msg    2 to 1","type":"txt"}],"from":"zly_test_2","to":"zly_test_1"}}
        },
      ]
    };
    return this.success(result);
  },
  getAction: function () {
    var that  = this;
    /* 1.获取im好友列表
     * 2.获取历史消息中最后一条数据
     * 3.查询用户表
     * 4.拼接
     */
    var userId = this.req.identity.userId;
    var user = this.req.identity.user;
    if (!isUUID24bit(userId) || !isExist(user)) {
      return this.fail(8005);
    }
    if(!user.im){
      return this.success({});
    }
    var imUserName = user.im.userName;
    var imFriends = [];
    var imFriendsStic = [];
    var lastChatRecords;
    var FriendDetails = [];
    var result = [];
    return imSessionService
      .getSession(imUserName)
      .then(function(_imSession){
        if(_imSession){
          imFriends = _.without(JSON.parse(JSON.stringify(_imSession.sessions)),null);
          imFriendsStic = _.without(JSON.parse(JSON.stringify(_imSession.sessions)),null);
        }
        //console.log(imFriends);
        return  service.getLastChatRecordOptimized(imUserName, imFriends)
        //return  service.getLastChatRecord(imUserName, imFriends);
      })
      .then(function(_lastChatRecords){
        lastChatRecords = _lastChatRecords;
        return service.getUsersByIMUserName(imFriendsStic)
      })
      .then(function(_users){
        FriendDetails = JSON.parse(JSON.stringify(_users));
        for(var j = 0 ;j<FriendDetails.length;j++){
            var item = {};
            item._id = _users[j]._id;
            item.im_id = _users[j].im.userName;
            item.docChatNum = _users[j].docChatNum;
            //todo :通过类型来判断 yichen
            item.avatar =  _users[j].shopAvatar || _users[j].avatar;
            item.name = _users[j].shopName || _users[j].name;
            item.shopAdress = _users[j].shopAddress || "";
            item.lastMsg = {};
            for(var i = 0 ; i<lastChatRecords.length;i++){
              var compareUserName ;
              if(imUserName == lastChatRecords[i].from){
                compareUserName = lastChatRecords[i].to
              }else if(imUserName == lastChatRecords[i].to){
                compareUserName = lastChatRecords[i].from
              }
              if(compareUserName == FriendDetails[j].im.userName){
                item.lastMsg = lastChatRecords[i];
                item.timestamp = lastChatRecords[i].timestamp;
                break;
              }
            }
            result.push(item);
        }
        var relUserIds = [];
        FriendDetails.forEach(function(item){
          relUserIds.push(item._id);
        })
        return SocialRelService.getNoteNameByIds(userId, relUserIds)
      })
      .then(function(_nameList){
        var relNameList = _.indexBy(_nameList, "relUser");
        result.forEach(function (item) {
          if (relNameList[item._id]) {
            item.name = relNameList[item._id] && relNameList[item._id].noteInfo && relNameList[item._id].noteInfo.noteName || item.name
          }
        })
        //删除
        return service.getOfflineMessages(imUserName)
      })
      .then(function(_countData){
        //console.log(_countData && _countData.count || 0);
        return that.success({offline_msg_count : _countData && _countData.count || 0,items:result});
      })
  }

}