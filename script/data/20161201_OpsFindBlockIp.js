//
//db.logs.find({httpUri: "/1/common/authcode"})
//
//var allip = db.logs.distinct("ip");
//var okip = db.logs.distinct("ip", {httpUri: {$nin: ["/1/common/authcode", "/1/common/authCode"]}});
//var susip = [];
//allip.forEach(function(ip){
//  if (okip.indexOf(ip) < 0) {
//    susip.push(ip);
//  }
//});
//var str = "";
//var errip = [];
//// susip.forEach(function(d){
////     str += "'" + d + "',";
//// })
//susip.forEach(function(d){
// var count = db.logs.count({ip: d})
// if (count > 100) errip.push(d)
//})
//
//var str = "";
//errip.forEach(function(d){
//    str += "'" + d + "',";
//})
//
//
//
//
//
//
//
//
//
//
//
//
//
//db.logs.find({ip: "49.77.156.12"}).sort({_id: -1}).limit(10)
//db.logs.find({httpUri: "/1/common/authCode"}).sort({_id: -1}).limit(10)
//db.logs.find({httpUri: "/1/common/authcode"}).sort({_id: -1}).limit(10)
//
//
//var okip = db.logs.distinct("ip", {createdAt: {$gt: 1480608000000},httpUri: {$nin: ["/1/common/authcode", "/1/common/authCode"]}});
//var allip = db.logs.distinct("ip", {createdAt: {$gt: 1480608000000}});
//
//var susip = [];
//allip.forEach(function(ip){
//  if (okip.indexOf(ip) < 0) {
//    susip.push(ip);
//  }
//});
//// 新出现的一批问题IP
//var ips = ["110.247.60.14","39.190.99.119"]
//db.logs.count({ip: "110.247.60.14"})
//db.logs.count({ip: "39.190.99.119", createdAt: {$gt: 1480608000000}})
//
//
//
//{
//    "_id" : ObjectId("582ee620f9cab47189ac419c"),
//    "type" : "last_rel_upd",
//    "memo" : "上次更新关系的时间点",
//    "updatedAt" : 1480609501987.0000000000000000,
//    "createdAt" : 1479468531590.0000000000000000
//}