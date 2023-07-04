/**
 *
 *  DocChat-backend
 *  Created by Jacky.L on 10/25/16.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var grp = require("../app/models/DoctorGrp");

grp.create({
  doctorList: [{
    doctorId: "1111",
    doctorName: "aaa",
    docChatNum: 12323
  }],
  description: "ddddddddddddddd",
  memo: "memomemo........"
});


//////////Fake relation data
///* 1 */
//{
//    "_id" : ObjectId("58243e16e3a65026e16b1b40"),
//    "source" : "docChat",
//    "isDeleted" : false,
//    "type" : "recmnd_fans",
//    "fromId" : "57d7c21e169991094da7ce2c",
//    "fromRef" : ObjectId("57d7c21e169991094da7ce2c"),
//    "toId" : "5673ae3cd80b01401d16d769",
//    "toRef" : ObjectId("5673ae3cd80b01401d16d769"),
//    "weight" : 200.0000000000000000
//}
//
///* 2 */
//{
//    "_id" : ObjectId("5824432685bffea55042702c"),
//    "source" : "docChat",
//    "isDeleted" : false,
//    "type" : "recmnd_fans",
//    "fromId" : "57d7c21e169991094da7ce2c",
//    "fromRef" : ObjectId("57d7c21e169991094da7ce2c"),
//    "toId" : "57cce5c0410a3967495be7ce",
//    "toRef" : ObjectId("57cce5c0410a3967495be7ce"),
//    "weight" : 100.0000000000000000
//}
//
///* 3 */
//{
//    "_id" : ObjectId("5824434d85bffea55042702d"),
//    "source" : "docChat",
//    "isDeleted" : false,
//    "type" : "ass",
//    "fromId" : "57d7c21e169991094da7ce2c",
//    "fromRef" : ObjectId("57d7c21e169991094da7ce2c"),
//    "toId" : "57cce5c0410a3967495be7ce",
//    "toRef" : ObjectId("57cce5c0410a3967495be7ce"),
//    "weight" : 100.0000000000000000
//}
//
///* 4 */
//{
//    "_id" : ObjectId("5824436b85bffea55042702e"),
//    "source" : "docChat",
//    "isDeleted" : false,
//    "type" : "ad",
//    "fromId" : "57d7c21e169991094da7ce2c",
//    "fromRef" : ObjectId("57d7c21e169991094da7ce2c"),
//    "toId" : "57cce5c0410a3967495be7ce",
//    "toRef" : ObjectId("57cce5c0410a3967495be7ce"),
//    "weight" : 100.0000000000000000
//}
//
///* 5 */
//{
//    "_id" : ObjectId("582443f285bffea55042702f"),
//    "source" : "docChat",
//    "isDeleted" : false,
//    "type" : "recmnd_fans",
//    "fromId" : "57e0d0d054d5efdf6177ee40",
//    "fromRef" : ObjectId("57e0d0d054d5efdf6177ee40"),
//    "toId" : "57cce5c0410a3967495be7ce",
//    "toRef" : ObjectId("57cce5c0410a3967495be7ce"),
//    "weight" : 100.0000000000000000
//}
//
///* 6 */
//{
//    "_id" : ObjectId("582445ef85bffea550427030"),
//    "source" : "docChat",
//    "isDeleted" : false,
//    "type" : "recmnd_fans",
//    "fromId" : "57cce5c0410a3967495be7ce",
//    "fromRef" : ObjectId("57cce5c0410a3967495be7ce"),
//    "toId" : "57d7c21e169991094da7ce2c",
//    "toRef" : ObjectId("57d7c21e169991094da7ce2c"),
//    "weight" : 100.0000000000000000
//}
//
///* 7 */
//{
//    "_id" : ObjectId("58246ae485bffea550427031"),
//    "source" : "docChat",
//    "isDeleted" : false,
//    "type" : "recmnd_fans",
//    "fromId" : "57e0de0f54d5efdf6177ee7a",
//    "fromRef" : ObjectId("57e0de0f54d5efdf6177ee7a"),
//    "toId" : "57cce5c0410a3967495be7ce",
//    "toRef" : ObjectId("57cce5c0410a3967495be7ce"),
//    "weight" : 100.0000000000000000
//}
//
///* 8 */
//{
//    "_id" : ObjectId("58246b3285bffea550427032"),
//    "source" : "docChat",
//    "isDeleted" : false,
//    "type" : "recmnd_fans",
//    "fromId" : "57e0de0f54d5efdf6177ee7a",
//    "fromRef" : ObjectId("57e0de0f54d5efdf6177ee7a"),
//    "toId" : "57cce766410a3967495be7cf",
//    "toRef" : ObjectId("57cce766410a3967495be7cf"),
//    "weight" : 200.0000000000000000
//}
//
///* 9 */
//{
//    "_id" : ObjectId("58246ba285bffea550427033"),
//    "source" : "docChat",
//    "isDeleted" : false,
//    "type" : "ad",
//    "fromId" : "57e0de0f54d5efdf6177ee7a",
//    "fromRef" : ObjectId("57e0de0f54d5efdf6177ee7a"),
//    "toId" : "57cce5c0410a3967495be7ce",
//    "toRef" : ObjectId("57cce5c0410a3967495be7ce"),
//    "weight" : 100.0000000000000000
//}
//
///* 10 */
//{
//    "_id" : ObjectId("58246bc185bffea550427034"),
//    "source" : "docChat",
//    "isDeleted" : true,
//    "type" : "ass",
//    "fromId" : "57e0de0f54d5efdf6177ee7a",
//    "fromRef" : ObjectId("57e0de0f54d5efdf6177ee7a"),
//    "toId" : "57cce5c0410a3967495be7ce",
//    "toRef" : ObjectId("57cce5c0410a3967495be7ce"),
//    "weight" : 100.0000000000000000
//}
//
///* 11 */
//{
//    "_id" : ObjectId("58246dcb85bffea550427035"),
//    "source" : "docChat",
//    "isDeleted" : false,
//    "type" : "recmnd_fans",
//    "fromId" : "57d7c21e169991094da7ce2c",
//    "fromRef" : ObjectId("57d7c21e169991094da7ce2c"),
//    "toId" : "57e0de0f54d5efdf6177ee7a",
//    "toRef" : ObjectId("57e0de0f54d5efdf6177ee7a"),
//    "weight" : 100.0000000000000000
//}
//
///* 12 */
//{
//    "_id" : ObjectId("5824706e85bffea550427036"),
//    "source" : "docChat",
//    "isDeleted" : false,
//    "type" : "ad",
//    "fromId" : "57cce5c0410a3967495be7ce",
//    "fromRef" : ObjectId("57cce5c0410a3967495be7ce"),
//    "toId" : "57e0de0f54d5efdf6177ee7a",
//    "toRef" : ObjectId("57e0de0f54d5efdf6177ee7a"),
//    "weight" : 100.0000000000000000
//}
//
///* 13 */
//{
//    "_id" : ObjectId("5824751185bffea550427037"),
//    "source" : "docChat",
//    "isDeleted" : false,
//    "type" : "recmnd_fans",
//    "fromId" : "57f860dfad699c6a0dee19ff",
//    "fromRef" : ObjectId("57f860dfad699c6a0dee19ff"),
//    "toId" : "57cce766410a3967495be7cf",
//    "toRef" : ObjectId("57cce766410a3967495be7cf"),
//    "weight" : 100.0000000000000000
//}
//
///* 14 */
//{
//    "_id" : ObjectId("5824751985bffea550427038"),
//    "source" : "docChat",
//    "isDeleted" : false,
//    "type" : "recmnd_fans",
//    "fromId" : "57f860dfad699c6a0dee19ff",
//    "fromRef" : ObjectId("57f860dfad699c6a0dee19ff"),
//    "toId" : "57e0de0f54d5efdf6177ee7a",
//    "toRef" : ObjectId("57e0de0f54d5efdf6177ee7a"),
//    "weight" : 100.0000000000000000
//}
//
///* 15 */
//{
//    "_id" : ObjectId("5824757685bffea550427039"),
//    "source" : "docChat",
//    "isDeleted" : false,
//    "type" : "ass",
//    "fromId" : "57f860dfad699c6a0dee19ff",
//    "fromRef" : ObjectId("57f860dfad699c6a0dee19ff"),
//    "toId" : "57cce766410a3967495be7cf",
//    "toRef" : ObjectId("57cce766410a3967495be7cf"),
//    "weight" : 100.0000000000000000
//}