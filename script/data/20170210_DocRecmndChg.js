



db.doctors.find({docChatNum: "801571749"})
db.doctors.find({docChatNum: "801756566"})
db.doctors.find({docChatNum: "800060265"})

//"https://api.dc.zlycare.com/1/customer/doctor/recommendList/:type"
ass_shanghai
recmnd_fans_shanghai
ad_shanghai

// 更新关系
db.relations.find({
  fromId: "5865e7cb987da3384476d781",
  type: {$in: ["recmnd_fans", "ass","ad"]}
}).forEach(function(d){

  d.type = d.type+"_shanghai"
  db.relations.save(d)
})