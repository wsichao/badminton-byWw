/**
 * Created by lijinxia on 2018/2/28.
 */
'user strict';
let co = require('co'),
    doctorComment = Backend.model('doctor_comment', undefined, 'doctor_comment'),
    commentLikeRecord = Backend.model('doctor_comment', undefined, 'comment_like_record'),
    doctorReply = Backend.service('doctor_comment', 'doctorReply'),
    servicePackageDoctorService = require('./../../../app/services/service_package/servicePackageDoctorService'),
    servicePackageOrderService = require('./../../../app/services/service_package/servicePackageOrderService');


module.exports = {
    __rule: function (valid) {
        return valid.object({
            commentId: valid.string().required(),
            doctorId: valid.string().required(),
            content: valid.string().required()
        });
    },
    mockAction: function () {
        let resObj = {
            code: '200',
            msg: '',
            data: {
                _id: '5a97b30034bbfa8b0be05708',
                user: {
                    _id: '5a0519a7c9938a64073cd682',
                    name: "哈哈",
                    avatar: 'Fi4HdkqzzIDfmsaPULX0jjh2Dgri'
                },
                like_count: 10,
                content: '回复一条评论',
                replyTime: 1519883167705,
                weight: 10000,
                is_liked: true
            }

        };
        return this.success(resObj);
    },
    postAction: function () {
        let REPLYWEIGHT = 10, APPROVEWEIGHT = 100;

        let self = this;
        let user = self.req.identity && self.req.identity.user;
        let userId = user._id;
        let req = self.req;
        let commentId = req.body.commentId || '';
        let doctorId = req.body.doctorId || '';
        let content = req.body.content || '';
        console.log('用户信息', user);
        if (!userId) {
            return self.fail(8005);
        }
        // if (!commentId) {
        //     return this.fail(8005);
        // }
        // if (!doctorId) {
        //     return this.fail(8005);
        // }
        // if (!content) {
        //     return this.fail(8005);
        // }

        let result = co(function*() {
            //判断评论是否存在
            let commentInfo = yield doctorComment.methods.getOneComment(commentId);
            // console.log('评论内容', commentInfo);
            if (!commentInfo) {
                return self.fail(2433);
            }

            //医生是否存在
            let spDoctor = yield servicePackageDoctorService.findDoctorById(doctorId);
            if (!spDoctor) {
                return self.fail(2435);
            }

            //是否买过该医生的服务包且审核通过
            let spOrder = yield servicePackageOrderService.findOrdersByUserIdAndDoctorId(userId, doctorId);
            // console.log('购买服务包信息', spOrder);
            if (!spOrder || spOrder.length == 0) {
                return self.fail(2436);
            }


            let insertObj = {userId: userId, commentId: commentId, doctorId: doctorId, content: content};
            let replyInfo = yield doctorReply.insertDoctorReply(insertObj);

            // console.log('插入的评论数据', replyInfo);
            let likeRecordInfo = yield commentLikeRecord.methods.get(userId, commentId);
            // console.log('点赞信息', likeRecordInfo);

            //修改评论的回复数和权重
            let udpDoctorComment = yield doctorComment.methods.udpOneCommentByCond({_id: commentId}, {
                $inc: {replyCount: 1},
                weight: (commentInfo.realLikeCount + commentInfo.virtualLikeCount) * APPROVEWEIGHT + (commentInfo.replyCount + 1) * REPLYWEIGHT + commentInfo.virtualWeight
            });


            console.log('修改评论的评论数和权重', udpDoctorComment);

            let resObj = {
                code: '200',
                msg: '',
                data: {
                    _id: replyInfo._id,
                    user: {
                        _id: userId,
                        name: user.name,
                        avatar: user.avatar,
                    },
                    like_count: replyInfo.realLikeCount + replyInfo.virtualLikeCount,
                    content: replyInfo.content,
                    is_liked: false,
                    replyTime: replyInfo.replyTime,
                    weight: replyInfo.weight
                }

            };
            if (likeRecordInfo && likeRecordInfo.isLike) {
                resObj.data.isLike = true;
            }
            return self.success(resObj);
        }).catch(function (err) {
            console.log(err)
        });

        return result;
    }
};