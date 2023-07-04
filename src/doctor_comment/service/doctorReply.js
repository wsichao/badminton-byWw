/**
 * Created by lijinxia on 2018/3/1.
 */
"use strict";
let doctorReply = Backend.model('doctor_comment', undefined, 'doctorReply'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId;
module.exports = {
    getOneDoctorReply: function (id) {
        return doctorReply.findOne({_id: id, isDeleted: false});
    },
    getDoctorReplyList: function (commentId, bookmark, weight, pageSize) {
        let cond = {commentId: new ObjectId(commentId), status: {$ne: 200}, isDeleted: false};
        if (weight > -1) {
            cond.weight = {$lte: weight};
        }
        if (bookmark > 1) {
            cond.replyTime = {$lt: bookmark};
        }

        return doctorReply.aggregate([
            {'$match': cond},
            {'$lookup': {from: 'users', localField: 'userId', foreignField: '_id', as: 'userInfo'}},

            {'$sort': {weight: -1, replyTime: -1}},
            {'$limit': pageSize}
        ]).exec();
    },
    insertDoctorReply: function (reply) {
        reply.replyTime=Date.now();
        return doctorReply.create(reply);
    },
    udpDoctorReply: function (cond, updates) {
        cond.isDeleted = false;
        return doctorReply.update(cond, updates, {new: true});
    },
    delDoctorReply: function (userId, replyId) {
        return doctorReply.findOneAndUpdate({userId: userId, _id: replyId}, {isDeleted: true}, {new: true});
    }
};