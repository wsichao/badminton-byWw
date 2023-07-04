/**
 * 用户相关util
 * Created by Mr.Carry on 2017/12/4.
 * token_5a1f80d16fcc99712cddd91d
 */
"use strict";
let q = require("q");
let encrypt = require('../../lib/common-util');
// let MongoClient = require('mongodb').MongoClient;
//

module.exports = {
  /**
   * 获取用户token
   * @param user_id 用户id
   */
  getToken(user_id) {
    // var url = "mongodb://10.162.201.58:27017/";
    // MongoClient.connect(url, function(err, db) {
    //   if (err) throw err;
    //   var dbo = db.db("zlydata");
    //   dbo.collection("users").findOne({_id:user_id},function(err, result){
    //     if (err) throw err;
    //     console.log(result);
    //     db.close();
    //   })
    // });


    //
    // return user_model.findOne({_id:user_id})
    //   .then(function(user){
    //     return encrypt.commonMD5(user_id+user.lastestLoginTime,'wecare',true)
    //   })
  },
  getFixedToken(){
    let user_id = '5993b6307659a1ef0d9b1a96';
    let lastestLoginTime = 1520303825115;
    let token = encrypt.commonMD5(user_id + lastestLoginTime, 'wecare', true)
    return {
      user_id: user_id,
      token: token
    }
  }

};