/**
 * Created by yichen on 2018/3/12.
 */


"use strict";

const request = require('request');
const Q = require('q');

module.exports = {
  getWXUserInfo: function (code) {
    let defer = Q.defer();
    let options = {
      method: 'get',
      url: 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx4ed521122f366f4c&secret=cc8ef9954950fe63b6b17c057a4a1ea7&code='+
      code
      +'&grant_type=authorization_code',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    request(options, function (err, res, body) {
      if (err) {
        console.log(err);
      }else {
        console.log("get token")
        console.log(body);
        body = JSON.parse(body);
        let options2 = {
          method: 'get',
          url: 'https://api.weixin.qq.com/sns/userinfo?access_token='+ body.access_token +'&openid='+ body.openid +'&lang=zh_CN',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        };
        request(options2, function (err, res, body) {
          if (err) {
            console.log(err);
          }else {
            console.log('get userInfo')
            console.log(body);
            defer.resolve(JSON.parse(body));
          }
        })
      }
    })
    return defer.promise;
  }
}