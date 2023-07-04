/**
 * Created by lijinxia on 2018/3/1.
 */
'user strict';
let co = require('co'),
    doctorComment = Backend.model('doctor_comment', undefined, 'doctor_comment'),
    doctorReply = Backend.service('doctor_comment', 'doctorReply');


module.exports = {
    __rule: function (valid) {
        return valid.object({
            commentReplyId: valid.string().required()
        });
    },
    mockAction: function () {
        let resObj = {code: '200', msg: ''};
        return this.success(resObj);
    },
    putAction: function () {
        let REPLYWEIGHT = 10, APPROVEWEIGHT = 100;

        let self = this;
        let req = self.req;
        let user = self.req.identity && self.req.identity.user;
        let userId = user._id;

        let commentReplyId = req.body.commentReplyId;
        if (!userId) {
            return self.fail(8005);
        }
        // if (!commentReplyId) {
        //     return self.fail(8005);
        // }

        let result = co(function *() {
            let doctorReplyInfo = yield doctorReply.getOneDoctorReply(commentReplyId);
            if (!doctorReplyInfo) {
                return self.fail(2434);
            }

            // console.log('回复信息',doctorReplyInfo.commentId);
            let delReply = yield doctorReply.delDoctorReply(userId, commentReplyId);
            // console.log('删除回复结果', delReply);


            let doctorCommentUpdates = {
                $inc: {replyCount: -1, weight: -REPLYWEIGHT}
            };
            //修改回复的权重数
            let udpDoctorComment = yield doctorComment.methods.udpOneCommentByCond(
                {_id: doctorReplyInfo.commentId},
                doctorCommentUpdates
            );

            console.log('删除评论回复后,修改评论的权重', udpDoctorComment);
            return self.success({code: '200', msg: ''});
        }).catch(function (err) {
            console.log(err);
        });

        return result;
    }
};