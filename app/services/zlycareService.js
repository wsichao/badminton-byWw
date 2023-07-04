/**
 * Created by Mr.Carry on 2017/8/21.
 */
"use strict";
var MongoClient = require('mongodb').MongoClient;
var server = require('../configs/server');
var Deferred = require("q");
var ObjectId = require('mongodb').ObjectID;
var crypto = require('crypto')
//var insertData = function(db, callback) {
//  //连接到表
//  var collection = db.collection('tb2');
//  //插入数据
//  var data = [{"name":'wilson001',"age":21},{"name":'wilson002',"age":22}];
//  collection.insert(data, function(err, result) {
//    if(err)
//    {
//      console.log('Error:'+ err);
//      return;
//    }
//    callback(result);
//  });
//}

let conn = function () {
  let deferred = Deferred.defer();
  MongoClient.connect(server.DB_CONN_STR, function (err, db) {
    if(err) throw err;

    deferred.resolve(db);
  });
  return deferred.promise;
}


module.exports = {
  insertUser: function (_id, name, phone) {
    return conn()
      .then(function (db) {
        var collection = db.collection('users');
        let deferred = Deferred.defer();
        collection.find({_id: ObjectId(_id)}).toArray(function (err, data) {
          deferred.resolve(data);
          db.close();
        });
        return deferred.promise;
      })
      .then(function (data) {
        let deferred = Deferred.defer();
        if (!data || data.length == 0) {
          conn().then(function (db) {
            var collection = db.collection('users');
                  return collection.insert({
                          _id: ObjectId(_id),
                          name: name,
                          phoneNum: phone,
                          loginlastTime: 1503284919546.0,
                          __sources: '24',
                          isDeleted : false
                      }, function (err, data) {
                          deferred.resolve(data);
                          db.close();
                      })
          })
        }else{
          deferred.resolve(data[0]);
        }

        return deferred.promise;
      })
  },
  updateUser: function (_id, name) {
    return conn().then(function (db) {
      let deferred = Deferred.defer();
      var collection = db.collection('users');
      collection.update({
        _id: ObjectId(_id)
      }, {'$set': {name: name}}, function (err, data) {
        deferred.resolve(data);
        db.close();
      });

      return deferred.promise;
    })
  },
  getToken(_id){
    let secret = 'wecare';
    return conn().then(function (db) {
      let deferred = Deferred.defer();
      var collection = db.collection('users');
      collection.find({_id: ObjectId(_id)}).toArray(function (err, result) {
        if (result.length > 0) {
          result = result[0]
        }
        let abc = result.loginlastTime;
        let s = crypto.createHash('md5').update(_id + '' + secret + abc).digest('hex').toUpperCase();
        deferred.resolve(s);
        db.close();
      });
      return deferred.promise;
    });
  }
}

