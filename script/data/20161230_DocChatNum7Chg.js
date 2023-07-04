/**
 *  将7开头的7位号段改为700
 *  DocChat-backend
 *  Created by Jacky.L on 12/30/16.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */

db.users.findOne({docChatNum: /^7[0-9]{6}$/}).count()

db.users.find({docChatNum: /^7/}).count();
var cond = {docChatNum: /^7/};
  cond[globalSource] = neZS;

db.users.distinct("docChatNum",cond);
// 更新主账户
var users = db.users.find({docChatNum: /^7/})
users.forEach(function(d){
  var num = d.docChatNum;
  if (num.length == 7){
    d.docChatNum = "700" + num.substring(1,7);
    print(d.docChatNum);
    db.users.save(d);
  }else if(num.length == 9){
    print("New 7 Pre Code: " + num);
  }else{
    print("Err Code: " + num);
  }
})







// 更新副账户
db.doctors.find({docChatNum: /^7/}).forEach(function(d){
  var num = d.docChatNum;
  if (num.length == 7){
    d.docChatNum = "700" + num.substring(1,7);
    print(d.docChatNum);
    db.doctors.save(d);
  }else if(num.length == 9){
    //d.docChatNum = num.
    print("New 7 Pre Code: " + num);
  }else{
    print("Err Code: " + num);
  }
})















/**
 *  将7开头的7位号段改为700
 *  DocChat-backend
 *  Created by Jacky.L on 12/30/16.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */

// db.users.find({docChatNum: /^6[0-9]{5}$/}).count()//699
// db.users.find({docChatNum: /^7[0-9]{6}$/}).count()//4801
// db.users.find({docChatNum: /^8[0-9]{5}$/}).count()//12738


///////////////////////////////////////////////更新8号段
var reg6 = /^8[0-9]{5}$/ ;
// 更新主账户
var users = db.users.find({docChatNum: reg6},{_id:1,docChatNum:1})
users.forEach(function(d){
  var num = d.docChatNum;
  d.docChatNum = "8000" + num.substring(1,6);
  print(d.docChatNum);
  db.users.update({_id: d._id}, {$set: {docChatNum:   d.docChatNum}});
})

// 更新副账户
var doctors = db.doctors.find({docChatNum: reg6}, {_id:1,docChatNum:1})
doctors.forEach(function(d){
  var num = d.docChatNum;
  d.docChatNum = "8000" + num.substring(1,6);
  print(d.docChatNum);
  db.doctors.update({_id: d._id}, {$set: {docChatNum:   d.docChatNum}});
})


///////////////////////////////// 修改7开头号段


var reg6 = /^7[0-9]{6}$/ ;
//db.doctors.find({docChatNum: reg6},{_id:1,docChatNum:1}).count()
// 更新主账户
var users = db.users.find({docChatNum: reg6},{_id:1,docChatNum:1})
users.forEach(function(d){
  var num = d.docChatNum;
  d.docChatNum = "700" + num.substring(1,7);
  print(d.docChatNum);
  db.users.update({_id: d._id}, {$set: {docChatNum:   d.docChatNum}});
})

// 更新副账户
var doctors = db.doctors.find({docChatNum: reg6}, {_id:1,docChatNum:1})
doctors.forEach(function(d){
  var num = d.docChatNum;
  d.docChatNum = "700" + num.substring(1,7);
  print(d.docChatNum);
  db.doctors.update({_id: d._id}, {$set: {docChatNum:   d.docChatNum}});
})


