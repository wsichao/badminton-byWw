/**lib/middleware/ClientAuthentication.js
 * Created by yichen on 2017/6/6.
 */
"use strict";

var EmchatService = Backend.service("common", "EmchatService");
var Customer = Backend.model("common", undefined, "customer");
var EmchatRecord = Backend.model('1/im', undefined, 'em_chat_record');
let _ = require('underscore');

module.exports = {
  getFriendsByIMUsername : function(imUserName){
    let defer = Backend.Deferred.defer();
    EmchatService.showFriends(imUserName,function(data){
      var imFriends = JSON.parse(data).data;
      defer.resolve(imFriends);
    })
    return defer.promise;
  },
  getLastChatRecord : function(imUserName,imFriends){
    var cond =
      {
        "$or":
        [
          {"from": {$in: imFriends},to:imUserName},
          {"from": imUserName, to : {$in: imFriends}}
        ],
        deletedBy : {$ne : imUserName}
      };
    return EmchatRecord.find(cond).sort({"timestamp" : -1}).limit(1000).exec()
      .then(function(_records){
        var lastRecords = [];
        //过滤出每个用户最后一条
        for(var i = 0 ; i<_records.length ; i++){
          for(var j = 0 ; j<imFriends.length ; j++){
            if(_records[i].from == imFriends[j] || _records[i].to == imFriends[j]){
              lastRecords.push(_records[i]);
              imFriends.splice(j,1)
               break;
            }
          }
        }
        return lastRecords ;
      })
  },
  /**
   *  获取最后一条消息记录
   * @param imUserName
   * @param imFriends
   * @returns {Promise.<T>}
   */
  getLastChatRecordOptimized : function(imUserName,imFriends){

    let match_1 =
      {
        "from": {$in: imFriends},
        to:imUserName,
        deletedBy : {$ne : imUserName}
      };
    let match_2 = {
      "from": imUserName,
      to : {$in: imFriends},
      deletedBy : {$ne : imUserName}
    }
    let sort = {
      timestamp: -1
    }
    let group_1 = {
      _id: '$from',
      msg_id: {'$first':  '$msg_id'},
      timestamp: {'$first':  '$timestamp'},
      to: {'$first':  '$to'},
      from: {'$first':  '$from'},
      chat_type: {'$first':  '$chat_type'},
      payload: {'$first':  '$payload'},
    }
    let group_2 = {
      _id: '$to',
      msg_id: {'$first':  '$msg_id'},
      timestamp: {'$first':  '$timestamp'},
      to: {'$first':  '$to'},
      from: {'$first':  '$from'},
      chat_type: {'$first':  '$chat_type'},
      payload: {'$first':  '$payload'},
    }
    let aggregation_1 = [
      { $match: match_1 },
      { $sort: sort },
      { $group: group_1 }
    ];
    let aggregation_2 = [
      { $match: match_2 },
      { $sort: sort },
      { $group: group_2 }
    ];
    let Q = Backend.Deferred;
    return Q.all([
      EmchatRecord.aggregate(aggregation_1).exec(),
      EmchatRecord.aggregate(aggregation_2).exec()
    ])
    .then(function(_res){
      //console.log(_res);
      let items = [];
      let from_array = _res && _res[0] || [];
      let to_array = _res && _res[1] || [];
      let from_map = _.indexBy(from_array, function(item){
        return item.to + '_' + item.from;
      });
      let to_map = _.indexBy(to_array, function(item){
        return item.from + '_' + item.to;
      });
      let keys = _.union(Object.keys(from_map), Object.keys(to_map));
      keys.forEach(function(key){
        let item = null;
        let item_from = from_map[key];
        let item_to = to_map[key];
        if(item_from && item_to){
          item = item_from;
          //console.log(item_from, item_to);
          if(item_from.timestamp < item_to.timestamp){
            item = item_to;
          }
        }else{
          item = item_from || item_to;
        }
        items.push(item);
      });
      //console.log(from_map);
      //Array.prototype.push.apply(items, _res[0]);
      //Array.prototype.push.apply(items, _res[1]);
      return items;
    })
    /*return EmchatRecord.find(cond).sort({"timestamp" : -1}).exec()
      .then(function(_records){
        var lastRecords = [];
        //过滤出每个用户最后一条
        for(var i = 0 ; i<_records.length ; i++){
          for(var j = 0 ; j<imFriends.length ; j++){
            if(_records[i].from == imFriends[j] || _records[i].to == imFriends[j]){
              lastRecords.push(_records[i]);
              imFriends.splice(j,1)
               break;
            }
          }
        }
        return lastRecords ;
      })*/
  },
  /**
   * 通过IMusername查询用户信息
   * @param imUserNames
   * @returns {Array|{index: number, input: string}}
   */
  getUsersByIMUserName : function(imUserNames){
    var cond = {
      isDeleted : false,
      'im.userName': {$in : imUserNames}
    };
    return Customer.find(cond , "_id avatar name im shopName shopAvatar docChatNum shopAddress").exec();
  },
  getOfflineMessages : function(imUserName){
    return EmchatService.getOfflineMessages(imUserName)
  }

};