/**
 * Created by yichen on 2017/6/8.
 */

"use strict";

let EmchatRecords = Backend.model('1/im', undefined, 'em_chat_record');
let EmchatService = Backend.service("common", "EmchatService");
let request = require('request');
let zlib = require('zlib');
var gunzipStream = zlib.createGunzip();

module.exports = {
  __beforeAction: function () {
    let ip = getClientIp(this.req);
    if (ip.indexOf("127.0.0.1") == -1) {
      return this.fail("必须 127.0.0.1 启用 Controller");
    }
  },
  getAction: function () {
    console.log('come in');
    var that = this;
    let deferred = Backend.Deferred.defer();

    var now = new Date();
    var timeStr = Number(now.format('yyyyMMddhh')) - 2;
    console.log(timeStr);
    var recordsCount = 0;
    //方法体放在export外面 todo yichen
    function getRecords() {
      EmchatService.getChatRecord({
        timeStr: timeStr,
        callback: function (data) {
          data = JSON.parse(data);

          if (!data.error) {
            var options = {
              url: data.data[0].url,
              headers: {
                'Accept-Encoding': 'gzip',
              },
              encoding: null  // it is very import!!
            }
            request(options, function (error, response, body) {
              if (!error && response.statusCode == 200) {
                //now body it is gzip stream buffer
                zlib.unzip(body, function (err, buffer) {
                  var result = buffer.toString('utf-8').split("\n");
                  var resArr = [];
                  result.forEach(function (item) {
                    if (item != '') {
                      var temp = JSON.parse(item);
                      resArr.push(temp);
                    }
                  })
                  recordsCount += resArr.length;
                  if (resArr instanceof Array) {
                    record(resArr).then(function () {
                      console.log('ended.');
                      console.log('records count: ' + recordsCount);
                      deferred.resolve({count: recordsCount})
                      return that.success();
                    });
                  }

                })
              }

            });

          } else {
            console.log(JSON.stringify(data), null, 4);
            deferred.resolve({});
          }
        }
      })
    }

    function record(entities) {
      return EmchatRecords.create(entities)
    }

    getRecords();

    return deferred.promise;


  }

}
