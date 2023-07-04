/**
 *  Modified by Jacky.L on 3/6/14
 *  增加了对http请求返回body中字段的判断
 *
 *  Modified by Jacky.L on 4/19/14. from the repo
 *  https://gist.github.com/bsstoner/2760444
 *
 *  Modified version of TJ's http support file from the Express repo:
 *  https://github.com/visionmedia/express/blob/master/test/support/http.js
 *
 *  Module dependencies.
 *
 */

var EventEmitter = require('events').EventEmitter
  , should = require('should')
  , util = require('util')
  , configs = require('../app/configs/server')
  , methods = ['get', 'post', 'put', 'delete', 'head']
  , http = require('http')
  , server
  , addr = {"port": configs.port, "address": configs.host};

exports.createServer = function (app, fn) {
  console.log("Testing http request....");
  if (server) {
    return fn();
  }
  console.log("You should start server first...");
  server = app;
  server.listen(0, function () {
    console.log("begin listening")
    fn();
  });
};

exports.request = function () {
  return new Request();
};

function Request() {
  var self = this;
  this.data = [];
  this.header = {};
};

/**
 * Inherit from `EventEmitter.prototype`.
 */

Request.prototype.__proto__ = EventEmitter.prototype;

methods.forEach(function (method) {
  Request.prototype[method] = function (path) {
    return this.request(method, path);
  };
});

Request.prototype.set = function (field, val) {
  this.header[field] = val;
  return this;
};

Request.prototype.write = function (data) {
  this.data.push(data);
  return this;
};

Request.prototype.request = function (method, path) {
  this.method = method;
  this.path = path;
  return this;
};

Request.prototype.expect = function (body, fn) {
  this.end(function (res) {
    if ('number' == typeof body) {
      res.statusCode.should.equal(body);
    } else if (body instanceof RegExp) {
      res.body.should.match(body);
    } else {
      console.log(body);
      //对请求返回的结果进行匹配
      if (body.statusCode)
        res.statusCode.should.equal(body.statusCode);
      if (body["shouldHave"]){
        var shouldHave = body["shouldHave"];
        for (var i = 0 ; i < shouldHave.length; i++){
          var json = JSON.parse(res.body);
          console.log("should have param: "+shouldHave[i]+"  value: "+json.res[0]["symptom"]);
          //res.body.should.match(new RegExp('^.*'));//new RegExp('^.*(' + shouldHave[i] + ').*'));
          json.res[0]["symptom"].should.not.equal(null);
          console.log("finish "+i)
        }
      }// res.body.should.equal(body);
    }
    fn();
  });
};

Request.prototype.end = function (fn) {

  var req = http.request({
    method: this.method, port: addr.port, host: addr.address, path: this.path, headers: this.header
  });

  this.data.forEach(function (chunk) {
    req.write(chunk);
  });

  req.on('response', function (res) {
    var buf = '';
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      buf += chunk
    });
    res.on('end', function () {
      res.body = buf;
      fn(res);
    });
  });

  req.end();

  return this;
};