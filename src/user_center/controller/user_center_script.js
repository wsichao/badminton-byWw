/**
 *
 * 用户中心-用户洗入用户中心脚本
 *
 * Created by yichen on 2018/6/25.
 */



'use strict';

let _ = require("underscore");
let user_center_service = Backend.service('user_center','handle_user_center');
let async = require('async');
let user_modle = require('../../../app/models/Customer');
let co = require('co');

module.exports = {
  __beforeAction: function () {
    let ip = getClientIp(this.req);
    if (ip.indexOf("127.0.0.1") == -1) {
      return this.fail("必须 127.0.0.1 启用 Controller");
    }
  },
  getAction: function (){
    console.log("come in");
    console.time('script');
    let that  = this;
    let user_count;
    let page_size = 1000;
    let skip = 0;
    let result = co(function* () {
      user_count = yield user_modle.count({openId : {$exists : false},phoneNum: /^1\d{10}$/});
      console.log(user_count)
      for(let i = 0 ;i<user_count/page_size;i++){
        let users = yield user_modle.find({openId : {$exists : false},phoneNum: /^1\d{10}$/ }).skip(skip).limit(page_size);
        //cool code
        for(let j = 0;j<users.length;j++){
          let userInfo = {
            phone_num : users[j].phoneNum,

            pwd : users[j].loginPassword || '',

            name : users[j].name,

            avatar : users[j].avatar,

            wechat : users[j].thirdParty && users[j].thirdParty.wx && users[j].thirdParty.wx.id || '',

            qq: users[j].thirdParty && users[j].thirdParty.qq && users[j].thirdParty.qq.id || '',

            weibo: users[j].thirdParty && users[j].thirdParty.wb && users[j].thirdParty.wb.id || ''
          }
          let result = yield user_center_service.user_init(userInfo);
          if(result && !result.errno && result.data && result.data.id){
            let user = yield user_modle.findOneAndUpdate({_id:users[j]._id}, {$set: {openId : result.data.id}}, {new: true}).exec();
            if(user){
            }
          }
          console.log('结束')
        }
        skip = skip + page_size;
      }
      console.timeEnd('script');
      return {note : '所有完成'}
    });
    return this.success(result)


  }
}
