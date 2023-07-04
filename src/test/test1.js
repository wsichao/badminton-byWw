/**
 * Created by Mr.Carry on 2017/5/19.
 */

"use strict";
let emchatService = require("./../../app/services/EmchatService");

//emchatService.getToken(function (data) {
//  console.log(data)
//})

//emchatService.createUser("zly_test_1","123456",function(data){
//  console.log(data)
//})
//
//emchatService.createUser("zly_test_5","zly_test_6",'ttt',function(data){
//  console.log(data)
//})

// c9d78bc0-429b-11e7-93b7-618ec3d29dc0

// zly_test : 123456
//zly_test_1 : 123456


//emchatService.sendText({
//  type: 'users',
//  target: ['zly_test_1'],
//  content: ' test send msg    2 to 1',
//  from: 'zly_test_2'
//})


//emchatService.getChatFile({callback : function(data){
//  console.log(data);
//}})

//emchatService.getUser('594097cd056a18e6049b19ef',function(data){
//  console.log(data)
//})

//emchatService.showFriends('5938c8697f202355460dcec5',function(data){
//  console.log()
//})

//emchatService.getBlacklist('5937de3944579df25f6868d7',function(data){
//
//})

var list = [
  "594104c83a149a1421d61615",
  "5940e5978646094672508de6",
  "5940e4f4ecde85526c57c3d8",
  "5940a2a9ecde85526c57beff",
  "59409f2becde85526c57bea4",
  "5940930ee736a1331010ee99",
  "5940925fe736a1331010ee88",
  "593fe51ce736a1331010edb7",
  "593fad3e9518804c12e09b5b",
  "593fad3e9518804c12e09b59",
  "593fad3e9518804c12e09b57",
  "593fad3e9518804c12e09b55",
  "593fad3e9518804c12e09b53",
  "593fad3d9518804c12e09b50",
  "593fad3d9518804c12e09b4e",
  "593fad3d9518804c12e09b4c",
  "593fad3d9518804c12e09b4a",
  "593fad3d9518804c12e09b48",
  "593fad3c9518804c12e09b45",
  "593fad3c9518804c12e09b43",
  "593fad3c9518804c12e09b41",
  "593fad3c9518804c12e09b3f",
  "593fad3c9518804c12e09b3d",
  "593fad3b9518804c12e09b3a",
  "593fad3b9518804c12e09b38",
  "593fad3b9518804c12e09b36",
  "593fad3b9518804c12e09b34",
  "593fad3b9518804c12e09b32",
  "593fad3a9518804c12e09b2f",
  "593fad3a9518804c12e09b2d",
  "593fad3a9518804c12e09b2b",
  "593fad3a9518804c12e09b29",
  "593fad3a9518804c12e09b27",
  "593fad399518804c12e09b24",
  "593fad399518804c12e09b22",
  "593fad399518804c12e09b20",
  "593fad399518804c12e09b1e",
  "593fad399518804c12e09b1c",
  "593fad389518804c12e09b19",
  "593fad389518804c12e09b17",
  "593fad389518804c12e09b15",
  "593fad389518804c12e09b13",
  "593fad389518804c12e09b11",
  "593fad379518804c12e09b0e",
  "593fad379518804c12e09b0c",
  "593fad379518804c12e09b0a",
  "593fad379518804c12e09b08",
  "593fad379518804c12e09b06",
  "593fad369518804c12e09b03",
  "593fad369518804c12e09b01",
  "593fad369518804c12e09aff",
  "593fad369518804c12e09afd",
  "593fad369518804c12e09afb",
  "593fad359518804c12e09af8",
  "593fad359518804c12e09af6",
  "593fad359518804c12e09af4",
  "593fad359518804c12e09af2",
  "593fad359518804c12e09af0",
  "593fad349518804c12e09aed",
  "593fad349518804c12e09aeb",
  "593fad349518804c12e09ae9",
  "593fad349518804c12e09ae7",
  "593fad349518804c12e09ae5",
  "593fad339518804c12e09ae2",
  "593fad339518804c12e09ae0",
  "593fad339518804c12e09ade",
  "593fad339518804c12e09adc",
  "593fad339518804c12e09ada",
  "593fad329518804c12e09ad7",
  "593fad329518804c12e09ad5",
  "593fad329518804c12e09ad3",
  "593fad329518804c12e09ad1",
  "593fad329518804c12e09acf",
  "593fad319518804c12e09acc",
  "593fad319518804c12e09aca",
  "593fad319518804c12e09ac8",
  "593fad319518804c12e09ac6",
  "593fad319518804c12e09ac4",
  "593fad309518804c12e09ac1",
  "593fad309518804c12e09abf",
  "593fad309518804c12e09abd",
  "593fad309518804c12e09abb",
  "593fad309518804c12e09ab9",
  "593fad2f9518804c12e09ab6",
  "593fad2f9518804c12e09ab4",
  "593fad2f9518804c12e09ab2",
  "593fad2f9518804c12e09ab0",
  "593fad2f9518804c12e09aae",
  "593fad2e9518804c12e09aab",
  "593fad2e9518804c12e09aa9",
  "593fad2e9518804c12e09aa7",
  "593fad2e9518804c12e09aa5",
  "593fad2e9518804c12e09aa3",
  "593fad2d9518804c12e09aa0",
  "593fad2d9518804c12e09a9e",
  "593fad2d9518804c12e09a9c",
  "593fad2d9518804c12e09a9a",
  "593fad2d9518804c12e09a98",
  "593fad2c9518804c12e09a95",
  "593fad2c9518804c12e09a93",
  "593fad2c9518804c12e09a91"
]


var index = 0;

let sss = setInterval(function () {
  if(list.length <=0) {
    clearInterval(sss);
  }
  let form_username = list.pop();
  emchatService.sendText({
    type: 'users',
    target: ['593922b92208b5f947058296'],
    content: index++ + ' this is from ' + form_username + '   to    593922b92208b5f947058296',
    from: form_username
  })
}, 300);