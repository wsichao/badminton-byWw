/**
 * Created by yichen on 2017/6/12.
 */
"use strict";

let EmchatRecords = Backend.model('1/im', undefined, 'em_chat_record');
let EmchatService = Backend.service('common','EmchatService');
let request = require('request');
let async = require('async');
let fs = require('fs');
let mongoose = require('mongoose');

module.exports = {
  // __beforeAction: function () {
  //   let ip = getClientIp(this.req);
  //   if (ip.indexOf("127.0.0.1") == -1) {
  //     return this.fail("必须 127.0.0.1 启用 Controller");
  //   }
  // },
  getAction: function () {
    console.log('come in');
    var that  = this;
    let deferred = Backend.Deferred.defer();
    var now = 1497316149000 //Date.now();
    var yesterdayEnd = new Date(getDateMidnight(now)).getTime() - 1;
    var yesterdayBegin = new Date(getDateMidnight(yesterdayEnd)).getTime();
    var cond = {
      timestamp : {
        $gte :  yesterdayBegin ,
        $lt : yesterdayEnd
      }
    }
    var counter = 0;
    return EmchatRecords.find(cond)
      .then(function(_records){
        if(_records.length > 0){
          async.whilst(
            function () {
              return counter < _records.length;
            },
            function (cb) {
              console.log(counter);
              var imgUrl, imgSecret;
              if(_records[counter].payload && _records[counter].payload.bodies && _records[counter].payload.bodies[0].type
                  && _records[counter].payload.bodies[0].type == 'img' ){
                imgUrl = _records[counter].payload.bodies[0].url;
                console.log(imgUrl);
              }else{
                counter++;
                 cb();
                 return;
              }
              var options = {
                url : imgUrl,
                headers: {
                  'Accept-Encoding': 'gzip',
                },
                encoding: null  // it is very import!!
              }
              request(options,function(error, response , body){
                if (!error && response.statusCode == 200) {
                  var id = mongoose.Types.ObjectId().toString();

                  fs.writeFile('1111',body,function(err){
                    if(!err){
                      console.log("写入成功！")
                      uploadLocalFile('1111',id,function(err,data){
                        if(!err){
                          console.log(data);
                          var cond = {
                            msg_id : _records[counter].msg_id
                          }
                          EmchatRecords
                            .findOneAndUpdate(
                              cond ,
                              {"qiniuResource" : data.key}
                              )
                            .then(function(_record){
                              if(_record){
                                counter++;
                                cb();
                              }else{
                                console.log("error msg_id : " + _records[counter].msg_id)
                                counter++;
                                cb();
                              }
                            })

                        }else{
                          console.log("error msg_id : " + _records[counter].msg_id)
                          counter++;
                          cb();
                        }
                      });
                    }

                  })

                }else{
                  console.log("error msg_id : " + _records[counter].msg_id)
                  counter++;
                  cb();
                }
              });


            },
            function (err, result) {
              if (err) console.log("Err: " + err);
              console.log('all has completed');
            }
          );
        }
      })


  }

}