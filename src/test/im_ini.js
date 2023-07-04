/**
 * Created by fly on 2017－06－12.
 */

var request = require('request');

setInterval(function(){
  request("http://127.0.0.1:9020/1/im/initialize_user",function(err,res,body){
    console.log(body)
  })
},1000)


