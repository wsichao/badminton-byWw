/**
 * Created by Mr.Carry on 2017/5/27.
 */
"use strict";
var redis = require("redis");

//client = redis.createClient(9736,'182.92.154.16',{auth_pass: 'zly2017_'});
let client = redis.createClient(6379,'r-2zea8647ebd69944.redis.rds.aliyuncs.com',{auth_pass: 'Aliyunredis2017'});
client.set("57d77e24f52e142136bd8573_5819ed2593740e996bf3f824","5819ed2593740e996bf3f824")




  client.get("57d77e24f52e142136bd8573_5819ed2593740e996bf3f824",function(err,data){
    console.log("get:"+data)
    client.expire("57d77e24f52e142136bd8573_5819ed2593740e996bf3f824", 0);
    client.get("57d77e24f52e142136bd8573_5819ed2593740e996bf3f824",function(err,data2){
      console.log("exp:"+data2)
    })
  })

