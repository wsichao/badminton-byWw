/**
 * Controller 通用中间件
 * Created by Mr.Carry on 2017/5/22.
 */
"use strict";
var mongoose = require('mongoose');
require('./model/mcSceneLog');

/** 获取Model，创建Book的实例 Entity **/
var Log = mongoose.model('mcSceneLog');

let genWebToken = function (req, res){
  let cookies = req.cookies || {};
  let base_url = req.path;
  let token = cookies.token || '';
  console.log(req.cookies, base_url);
  if(token){
    return;
  }
  //第一次访问,生成token;或者过期,重新生成
  let options = {
    maxAge: 24 * 10 * 60 * 1000,
    //maxAge: 20 * 1000,
    //httpOnly: true,
    //secure: true
  }
  let ts = getNewObjectId();
  token = commonMD5(base_url + ts, webTokenSalt, true);
  console.log(token, ts);
  res.cookie('token', token, options);
  res.cookie('ts', ts, options);
}
//保存log
let saveLog = function (req, res){
 
  const httpParams = req.query
  const httpReqPayload = req.body
  let userId = new mongoose.Types.ObjectId
  if (req.identity.userId) {
    userId = mongoose.Types.ObjectId(req.identity.userId)
  }
 
  var log = new Log({
    httpUri: req.path,
    httpMethod: req.method,
    createdAt: Date.now(),
    userId: userId,
    httpReqPayload: httpReqPayload,
    httpParams: httpParams
  });

  log.save()
}
module.exports = {
  method: function () {
    let req = this.req;
    let res = this.res;
    genWebToken(req, res);
    saveLog(req, res);
  }

};

