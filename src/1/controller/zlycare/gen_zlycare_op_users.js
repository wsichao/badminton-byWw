/**
 * 添加运营号脚本
 * Created by yichen on 2017/7/27.
 */


'use strict';
let _model = Backend.model('common', undefined, 'config');
let userService = Backend.service('common','user_service');
let xlsx = require('node-xlsx');
let _ = require('underscore');

module.exports = {
  __beforeAction: function () {
    let ip = getClientIp(this.req);
    if (ip.indexOf("127.0.0.1") == -1) {
      return this.fail("必须 127.0.0.1 启用 Controller");
    }
  },
  getAction: function () {
    console.log('come in');
    var list = xlsx.parse("./data/健康会员中心号标签.xls");
    var docChatNums = [];
    var insertData = [];
    list[0].data.forEach(function(item){
      docChatNums.push(item[2]);
    })
    console.log(docChatNums);
    return userService.getInfoByDocChatNums(docChatNums,'docChatNum')
      .then(function(_users){
        console.log('共找到用户个数');
        console.log(_users.length);
        _users = _.indexBy(_users,'docChatNum');
        list[0].data.forEach(function(item){
          if(_users[item[2]]){
            var insertDataItem = {
              "userId" : _users[item[2]]._id,
              "tags" : []
            }
            insertDataItem.tags.push(item[3]);
            insertData.push(insertDataItem);
          }
        })
        //return insertData;
        return _model.findOneAndUpdate({_id:"59773d44b1bce56941cdf6c6"},
          {$addToSet:{"field.tagItems":{$each: insertData}}},
          {new: true})
      })

    return this.success('beginning.......');
  }
}