/**
 * Created by guoyichen on 2016/11/28.
 */

//db.applications.find({source: "docChat", type: 15}).forEach(function(d){
//    if (!d.applicantRef){
//        d.applicantRef =  d.applicantId;
//    }
//})
var remap = function(x){
    if (!x.applicantRef && x.applicantId) {
        db.applications.update({_id: x._id}, {$set: {applicantRef: ObjectId(x.applicantId)}});
    }
};
db.applications.find({ source: "docChat", type: 15}).forEach(remap)