




// db.relations.update(
//     {$where: "this.fromId==this.toId"}, 
//     {$set: {isDeleted: true}},
//     {multi: true}).sort({createdAt: 1}).count()

db.relations.update()

db.logs.aggregate([ 
{ '$match': { 
    "httpReqPayload.docChatNum": "00001",
    httpMethod: 'PUT', httpUri: '/1/customer/favoriteDoc', createdAt: { '$gte': 1479081600000, '$lt': 1479124000931 }, source: 'docChat', 'httpReqPayload._statistic_is_1st_fv': true } }, 
{ '$project': { docChatNum: '$httpReqPayload.docChatNum', userId: '$httpReqPayload.userId', createdAt: '$createdAt' } } ])
 
// 578c8c776b9a504e27137765  1479091428206.000000  57cfe3c215665c374e0b7fbb
// 53d20c062c4b9e6b3f97d0eb  1479092433200.000000  57c686d2b84826d577149df1
// 53edd9b466175d814fb7be4a  1479094487680.000000
// 581dc6a117bdc9871a9a9168  1479099642461.000000
// 56c5bf8b4e8cc7e23e0048f4  1479111614392.000000


db.orders.find({ 
    isDeleted: false, 
    createdAt: { '$lt': 1479111614392 }, 
    direction: 'C2D', 
    type: 'phone',
    time: {$gt: 0},
    customerId: '56c5bf8b4e8cc7e23e0048f4' }).sort({ createdAt: -1 })



db.doctors.find({docChatNum:"00001"})
ObjectId("57b2663a5ede55e371a62013")
db.relations.find({fromId: "57b2663a5ede55e371a62013"})


db.doctors.find({_id: ObjectId("57b5a65fd2be9e523159952f")})

db.doctors.find({_id: ObjectId("55d68d9b8faee0fbe0c4be97")})

    //"fromRef" : ObjectId("57b5a65fd2be9e523159952f"),
    //"toRef" : ObjectId("55d68d9b8faee0fbe0c4be97"),

db.relations.find({_id: ObjectId("5825a8c21883dec869ec07c8") })

db.orders.find({ 
    isDeleted: false, 
    createdAt: { '$lt': 1479026828824 }, 
    direction: 'C2D', 
    type: 'phone',
    customerId: '58240f26b0f1166d58f7a324' }).sort({ createdAt: -1 })

// db.relations.update({type:"recmnd_fans"},{$set: {fansId: []}}, {multi: true})


//db.doctors.find({_id:ObjectId("57b2f32ec67de73b69a3abe9")})
//fromRef: ObjectId("57b2f32ec67de73b69a3abe9"),
//toRef: ObjectId("57e0c650eab186870f897a2d")
////db.relations.insert(
//    { fromRef: ObjectId("57b2f32ec67de73b69a3abe9"), toRef: ObjectId("57e0c650eab186870f897a2d"), _id: ObjectId("582994cb28a403f5cbedf39f"), weight: 2, toId: '57e0c650eab186870f897a2d', fromId: '57b2f32ec67de73b69a3abe9', type: 'recmnd_fans', isDeleted: false, updatedAt: 1479120075202, createdAt: 1479120075202, source: 'docChat', __v: 0 })

db.logs.aggregate([
{ '$match': { 
    "httpReqPayload.docChatNum": "00001",
    httpMethod: 'PUT', httpUri: '/1/customer/favoriteDoc', createdAt: { '$gte': 1478908800000, '$lt': 1479081600000 }, source: 'docChat', 'httpReqPayload._statistic_is_1st_fv': true } }, 
{ '$project': { docChatNum: '$httpReqPayload.docChatNum', userId: '$httpReqPayload.userId', createdAt: '$createdAt' } } ])
// 5818a2421bd95dab0910ea08  1478917210035.000000  55d68d9b8faee0fbe0c4be97
// 5650408676e4b61c44b95079  1478928637110.000000  580c61c81d5046f275882ec8
// 582135a55ec5695b0e684ac9  1479014694584.000000  57e0c650eab186870f897a2d
// 582281d414e3996c6c7073c5  1479037239884.000000  57e0c650eab186870f897a2d
// 582281d514e3996c6c7073c9  1479037634247.000000  57fa0ebcdffb5acd4fb821db

db.orders.find({ 
    isDeleted: false, 
    createdAt: { '$lt': 1479037634247 }, 
    direction: 'C2D', 
    type: 'phone',
    customerId: '582281d514e3996c6c7073c9' }).sort({ createdAt: -1 }) 


db.relations.find({type: "ass"})


db.logs.aggregate([
{ '$match': {
    "httpReqPayload.docChatNum": "12856",
    httpMethod: 'PUT', httpUri: '/1/customer/favoriteDoc', createdAt: { '$gte': 1478908800000, '$lt': 1479081600000 }, source: 'docChat', 'httpReqPayload._statistic_is_1st_fv': true } }, 
{ '$project': { docChatNum: '$httpReqPayload.docChatNum', userId: '$httpReqPayload.userId', createdAt: '$createdAt' } } ])


db.logs.find({httpMethod: 'PUT', httpUri: '/1/customer/favoriteDoc', "httpReqPayload.docChatNum": "00001",source: 'docChat', 'httpReqPayload._statistic_is_1st_fv': true})

