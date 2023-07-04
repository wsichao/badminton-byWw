/**
 * Created by liuyong on 15/11/10.
 */
/**
 *
 *  通用Http请求处理
 *  Created by Jacky.L on 8/17/15.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var
  util = require('util'),
  http = require('http'),
  https = require('https'),
  _ = require('underscore');

module.exports = {
  /* Header options */
  genOptions: function (host, port, path, method, payload, type) {
    return {
      host: host,
      port: port || 443,
      path: encodeURI(path),
      method: method,
      headers: {
        "Content-Type": type || 'application/json',
        "Content-Length": Buffer.byteLength(payload || '')
      }
    };
  },
  /* 发送请求 */
  sendRequest: function (options, payload, onError, onSuccess) {

    //console.log("come in send request" + util.inspect(options));
    //console.log("come in send request" + util.inspect(payload));
    var request = https.request(options, function (resp) {

      var code = resp.statusCode;
      var data = "";
      //console.log("Request callback..." + code);

      resp.on('data', function (chunk) {
        console.log("OnData!");
        data += chunk;
      });
      resp.on('error', function (e) {
        console.log('OnError! ' + e.message);
        onError(e);
        //res.status(400).end("Error:" + e.message);
      });
      resp.on('end', function () {
        console.log('OnEnd! ' + data);
        if (code > 199 && code < 300)
          onSuccess(data);
        else
          onError(new Error(data));
        //res.status(200).end(data);
      })
    });
    if (payload && payload.length > 0)
      request.write(payload);
    request.end();
  }
};