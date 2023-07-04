var
    _ = require('underscore'),
    util = require('util'),
    commonUtil = require('../../lib/common-util'),
    crypto = require('crypto'),
    apiHandler = require('../configs/ApiHandler'),
    ErrorHandler = require('../../lib/ErrorHandler'),
    configs = require('../configs/api'),
    serverConfigs = require('../configs/server'),
    constants = require('../configs/constants'),
    Activity = require('../configs/activity'),
    Q = require("q"),
    serverConf = require('../configs/server'),
    Promise = require('promise'),
    VoipRecord = require('../models/VoipRecord'),
    VoipCallback = require('../models/VoipCallback');

var sha1 = commonUtil.sha1;
var https = require('https');
var querystring = require('querystring');
var devAppKey = '9a89885d816fb6293f9484f4e00dcb9e',
  devAppSecret = '9401b54cfbf5';
var conf = {
    appkey: serverConf.env == 1 ? constants.voipAppKey : devAppKey,
    appSecret: serverConf.env == 1 ? constants.voipAppSecret : devAppSecret,
    nonce: commonUtil.getRandomNumByStr(0,999,6),
    curTime : new Date().getTime()/1000,
}
var genUniqueAccidStr = function(){
    var accid = 'zly' + new Date().getTime()+ commonUtil.getRandomCode(16);//3+13 + 16
    return accid;
}
var genCheckSum = function(nonce, curTime) {
    return commonUtil.sha1(conf.appSecret + nonce + curTime);
}
var genMD5 = function(data) {
    return crypto.createHash('md5').update(data).digest('hex').toLowerCase();
}
var setAccidAndToken = function(accid, option){
    var defer = Q.defer();

    //云信ID == accid == 'app用户账号',保证唯一性
    //token == 云信ID的密码,token改变后,需要同步到网易云信webserver,否则连接云信imserver会失败
    //连接云信imserver,需要accid和token
    //CheckSum有效期：出于安全性考虑，每个checkSum的有效期为5分钟(用CurTime计算)，建议每次请求都生成新的checkSum，
    //同时请确认发起请求的服务器是与标准时间同步的，比如有NTP服务。
    //CheckSum检验失败时会返回414错误码，具体参看code状态表。
    conf.checkSum = genCheckSum(conf.nonce, conf.curTime);
    var headers = {
        'AppKey': conf.appkey,
        'Nonce' : conf.nonce,
        'CurTime' : conf.curTime,
        'CheckSum' : conf.checkSum,
        'Content-Type' : 'application/x-www-form-urlencoded;charset=utf-8',
    }

    var postData = {
        accid: accid,
    }
    for(var key in option){
        postData[key] = option[key];
    }
    var options = {
        protocol: 'https:',
        hostname: 'api.netease.im',
        path: '/nimserver/user/create.action',
        method: 'POST',
        headers: headers,
    }
    var data = '';
    var httpReq = https.request(options,function(result){
        result.setEncoding('utf-8');
        result.on('data',function(chunk){
            data += chunk;
        });
        result.on('end',function(){
            console.log('data:', data);
            //200、403(非法操作或没有权限)、414(参数错误)、416(频率控制)、431(HTTP重复请求)、500(服务器内部错误)
            //code:200,info:{}  code:414,desc: 'already register'
            return defer.resolve(JSON.parse(data));
        });
        result.on('err',function(err){
            console.log('err:', err);
            return defer.resolve({code: err.code});
        });
    });
    httpReq.write(querystring.stringify(postData));
    httpReq.on('error',function(err){
        console.log('err:', err.code, err);
        return defer.resolve({code: err.code,err: JSON.stringify(err)});
    });
    httpReq.end();
    return defer.promise;
}
var VoipService = function VoipService () {
}
VoipService.prototype.constructor = VoipService;

VoipService.prototype.genUniqueAccidStr = genUniqueAccidStr;

VoipService.prototype.genCheckSum = genCheckSum;

VoipService.prototype.genMD5 = genMD5;

VoipService.prototype.setAccidAndToken = setAccidAndToken;

VoipService.prototype.updateAccid = function(accid, option){
    var defer = Q.defer();
    conf.checkSum = genCheckSum(conf.nonce, conf.curTime);
    var headers = {
        'AppKey': conf.appkey,
        'Nonce' : conf.nonce,
        'CurTime' : conf.curTime,
        'CheckSum' : conf.checkSum,
        'Content-Type' : 'application/x-www-form-urlencoded;charset=utf-8',
    }

    var postData = {
        accid: accid,
    }
    for(var key in option){
        postData[key] = option[key];
    }
    var options = {
        protocol: 'https:',
        hostname: 'api.netease.im',
        path: '/nimserver/user/update.action',
        method: 'POST',
        headers: headers,
    }
    var data = '';
    var httpReq = https.request(options,function(result){
        result.setEncoding('utf-8');
        result.on('data',function(chunk){
            data += chunk;
        });
        result.on('end',function(){
            console.log('data:', data);
            //200、403(非法操作或没有权限)、414(参数错误)、416(频率控制)、431(HTTP重复请求)、500(服务器内部错误)
            //code:200,info:{}  code:414,desc: 'already register'
            return defer.resolve(JSON.parse(data));
        });
        result.on('err',function(err){
            console.log('err:', err);
            return defer.resolve({code: err.code});
        });
    });
    httpReq.write(querystring.stringify(postData));
    httpReq.on('error',function(err){
        console.log('err:', err.code, err);
        return defer.resolve({code: err.code,err: JSON.stringify(err)});
    });
    httpReq.end();
    return defer.promise;
}

VoipService.prototype.updateToken = function(accid, option){
    var defer = Q.defer();
    conf.checkSum = genCheckSum(conf.nonce, conf.curTime);
    var headers = {
        'AppKey': conf.appkey,
        'Nonce' : conf.nonce,
        'CurTime' : conf.curTime,
        'CheckSum' : conf.checkSum,
        'Content-Type' : 'application/x-www-form-urlencoded;charset=utf-8',
    }

    var postData = {
        accid: accid,
    }
    for(var key in option){
        postData[key] = option[key];
    }
    var options = {
        protocol: 'https:',
        hostname: 'api.netease.im',
        path: '/nimserver/user/refreshToken.action',
        method: 'POST',
        headers: headers,
    }
    var data = '';
    var httpReq = https.request(options,function(result){
        result.setEncoding('utf-8');
        result.on('data',function(chunk){
            data += chunk;
        });
        result.on('end',function(){
            console.log('data:', data);
            //200、403(非法操作或没有权限)、414(参数错误)、416(频率控制)、431(HTTP重复请求)、500(服务器内部错误)
            //code:200,info:{}  code:414,desc: 'already register'
            return defer.resolve(JSON.parse(data));
        });
        result.on('err',function(err){
            console.log('err:', err);
            return defer.resolve({code: err.code});
        });
    });
    httpReq.write(querystring.stringify(postData));
    httpReq.on('error',function(err){
        console.log('err:', err.code, err);
        return defer.resolve({code: err.code,err: JSON.stringify(err)});
    });
    httpReq.end();
    return defer.promise;
}

VoipService.prototype.blockAccid = function(accid, option){
    var defer = Q.defer();
    conf.checkSum = genCheckSum(conf.nonce, conf.curTime);
    var headers = {
        'AppKey': conf.appkey,
        'Nonce' : conf.nonce,
        'CurTime' : conf.curTime,
        'CheckSum' : conf.checkSum,
        'Content-Type' : 'application/x-www-form-urlencoded;charset=utf-8',
    }

    var postData = {
        accid: accid
    }
    for(var key in option){
        postData[key] = option[key];
    }
    var options = {
        protocol: 'https:',
        hostname: 'api.netease.im',
        path: '/nimserver/user/block.action',
        method: 'POST',
        headers: headers,
    }
    var data = '';
    var httpReq = https.request(options,function(result){
        result.setEncoding('utf-8');
        result.on('data',function(chunk){
            data += chunk;
        });
        result.on('end',function(){
            console.log('data:', data);
            //200、403(非法操作或没有权限)、414(参数错误)、416(频率控制)、431(HTTP重复请求)、500(服务器内部错误)
            //code:200,info:{}  code:414,desc: 'already register'
            return defer.resolve(JSON.parse(data));
        });
        result.on('err',function(err){
            console.log('err:', err);
            return defer.resolve({code: err.code});
        });
    });
    httpReq.write(querystring.stringify(postData));
    httpReq.on('error',function(err){
        console.log('err:', err.code, err);
        return defer.resolve({code: err.code,err: JSON.stringify(err)});
    });
    httpReq.end();
    return defer.promise;
}

VoipService.prototype.unblockAccid = function(accid, option){
    var defer = Q.defer();
    conf.checkSum = genCheckSum(conf.nonce, conf.curTime);
    var headers = {
        'AppKey': conf.appkey,
        'Nonce' : conf.nonce,
        'CurTime' : conf.curTime,
        'CheckSum' : conf.checkSum,
        'Content-Type' : 'application/x-www-form-urlencoded;charset=utf-8',
    }

    var postData = {
        accid: accid
    }
    for(var key in option){
        postData[key] = option[key];
    }
    var options = {
        protocol: 'https:',
        hostname: 'api.netease.im',
        path: '/nimserver/user/unblock.action',
        method: 'POST',
        headers: headers,
    }
    var data = '';
    var httpReq = https.request(options,function(result){
        result.setEncoding('utf-8');
        result.on('data',function(chunk){
            data += chunk;
        });
        result.on('end',function(){
            console.log('data:', data);
            //200、403(非法操作或没有权限)、414(参数错误)、416(频率控制)、431(HTTP重复请求)、500(服务器内部错误)
            //code:200,info:{}  code:414,desc: 'already register'
            return defer.resolve(JSON.parse(data));
        });
        result.on('err',function(err){
            console.log('err:', err);
            return defer.resolve({code: err.code});
        });
    });
    httpReq.write(querystring.stringify(postData));
    httpReq.on('error',function(err){
        console.log('err:', err.code, err);
        return defer.resolve({code: err.code,err: JSON.stringify(err)});
    });
    httpReq.end();
    return defer.promise;
}

VoipService.prototype.createRecord = function(channelId,data) {
    var cond = {
        channelId: channelId
    }
    return VoipRecord.update(cond, {$setOnInsert: data}, {upsert: true}).exec();
}

VoipService.prototype.createVoipCallback = function(channelId,data) {
    var cond = {
        channelId: channelId
    }
    data.createdAt = (new Date()).valueOf();
    return VoipCallback.update(cond, {$setOnInsert: data}, {upsert: true}).exec();
}

module.exports = new VoipService();