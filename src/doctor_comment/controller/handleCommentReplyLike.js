/**
 * Created by lijinxia on 2018/3/1.
 */
'user strict';
let co = require('co'),
    doctorReply = Backend.service('doctor_comment', 'doctorReply'),
    commentLikeRecord = Backend.model('doctor_comment', undefined, 'comment_like_record');


module.exports = {
    __rule: function (valid) {
        return valid.object({
            commentReplyId: valid.string().required()
        });
    },
    mockAction: function () {
        let res_obj =
            {
                "code": '200',
                "msg": ''
            };
        return this.success(res_obj);
    },
    putAction: function () {
        let REPLYWEIGHT = 10, APPROVEWEIGHT = 100;

        let self = this;
        let req = self.req;
        let userId = self.req.identity && self.req.identity.user && self.req.identity.user._id;
        let commentReplyId = req.body.commentReplyId || '';

        console.log('请求参数', commentReplyId);
        // if (!commentReplyId) {
        //     return self.fail(8005);
        // }
        let result = co(function *() {
            //点赞的回复是否存在
            let doctorReplyInfo = yield doctorReply.getOneDoctorReply(commentReplyId);
            if (!doctorReplyInfo) {
                return self.fail(2434);
            }

            //是否被点赞过
            let replyLikeInfo = yield commentLikeRecord.methods.getCommentByCond({
                userId: userId,
                recordId: commentReplyId
            });

            let hasLikeRecord = false, isLiked = false;//是否存在点赞记录,是否点赞
            if (replyLikeInfo && replyLikeInfo.length > 0) {
                hasLikeRecord = true;
                if (replyLikeInfo[0].isLiked) {
                    isLiked = true;
                }
            }


            let doctorReplyUpdates = {};
            // console.log('取消点赞的记录ID', replyLikeInfo);
            //修改点赞记录
            if (hasLikeRecord) {//有点赞记录
                let likeRecordUpdates = {};
                if (isLiked) {//取消点赞
                    likeRecordUpdates = {isLiked: false};
                    doctorReplyUpdates = {
                        $inc: {realLikeCount: -1},
                        weight: (doctorReplyInfo.realLikeCount - 1 + doctorReplyInfo.virtualLikeCount) * APPROVEWEIGHT + doctorReplyInfo.virtualWeight
                    };

                } else {//点赞
                    likeRecordUpdates = {isLiked: true};
                    doctorReplyUpdates = {
                        $inc: {realLikeCount: 1},
                        weight: (doctorReplyInfo.realLikeCount + 1 + doctorReplyInfo.virtualLikeCount) * APPROVEWEIGHT + doctorReplyInfo.virtualWeight
                    };
                }
                let udpReplyLike = yield commentLikeRecord.methods.udpCommentByCond({_id: replyLikeInfo[0]._id}, likeRecordUpdates);
                // console.log('操作点赞结果', udpReplyLike);
            } else {//没有点赞记录，点赞
                let insertReplyLike = yield commentLikeRecord.methods.insertComment({
                    userId: userId,
                    recordId: doctorReplyInfo._id,
                    isLike: true
                });

                doctorReplyUpdates = {
                    $inc: {realLikeCount: 1},
                    weight: (doctorReplyInfo.realLikeCount + 1 + doctorReplyInfo.virtualLikeCount) * 100 + doctorReplyInfo.virtualWeight
                };
                // console.log('点赞结果', insertReplyLike);
            }
            //修改回复的权重数
            let udpDoctorReply = yield doctorReply.udpDoctorReply(
                {_id: commentReplyId},
                doctorReplyUpdates
            );

            // console.log('点赞后的结果', udpDoctorReply);


            let res_obj = {code: '200', msg: ''};
            return self.success(res_obj);

        }).catch(function (err) {
            console.log(err);
        });

        return result;
    }
};