/**
 * 更新医生的 推荐助理 信息
 */

var updates = [];
var relations = [];
db.doctors.find({source: "docChat", seedDoctor: true, applyStatus:'done', operatorName: {$exists: true}}).forEach(function(d){
    if (d.operatorName != ''){
        updates.push({
          fromId: d._id.valueOf(),
          fromRef: d._id,
          toName: d.operatorName
        })   
    }
})
//print(updates)
updates.forEach(function(d){
    var toDoc = db.doctors.findOne({
        realName: d.toName, 
        applyStatus:'done',
        source: "docChat", 
        isDeleted: false
    });
    if (toDoc){
        d.toId = toDoc._id.valueOf();
        d.toRef = toDoc._id;
        d.source = "docChat";
        d.isDeleted = false;
        d.type = "ass";
        d.weight = 100;
        relations.push(d);
    }
})

print(relations)
db.relations.find().count()
//db.relations.insert(relations)