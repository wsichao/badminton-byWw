/**
 * Created by lijinxia on 2018/3/1.
 */
'user strict';
let co = require('co'),
    commentLikeRecord = Backend.model('doctor_comment', undefined, 'comment_like_record'),
    doctorReply = Backend.service('doctor_comment', 'doctorReply'),
    _ = require('underscore');


module.exports = {
    __rule: function(valid){
        return valid.object({
            commentId : valid.string().required(),
            pageSize : valid.number(),
            bookmark : valid.number(),
            weight : valid.number()
        });
    },
    mockAction: function () {
        let resObj = [{
            user: {
                _id: '5a0519a7c9938a64073cd682',
                name: "哈哈",
                avatar: 'Fi4HdkqzzIDfmsaPULX0jjh2Dgri'
            },
            like_count: 10,
            content: '回复一条评论',
            replyTime: 1519883167705,
            is_liked: true
        }]
        return this.success(resObj);
    },
    getAction: function () {
        let self = this;
        let req = self.req;
        let userId = this.req.identity.userId||'';
        console.log('用户ID',userId);
        let commentId = req.query.commentId || '';
        let pageSize = Number(req.query.pageSize || 20);
        let bookmark = Number(req.query.bookmark || -1);
        let weight = Number(req.query.weight || -1);

        if (!commentId) {
            return self.fail(8005);
        }
        let result = co(function *() {
            let replyInfo = yield doctorReply.getDoctorReplyList(commentId, bookmark, weight, pageSize);
            // console.log('回复列表信息', replyInfo);

            let resObj = [], replyIds = [];
            for (var i = 0; i < replyInfo.length; i++) {
                if (replyInfo[i] && replyInfo[i].userInfo && replyInfo[i].userInfo.length > 0) {
                    replyIds.push(replyInfo[i]._id);
                    resObj.push({
                        _id: replyInfo[i]._id,
                        user: {
                            _id: replyInfo[i].userInfo[0]._id,
                            name: replyInfo[i].userInfo[0].name,
                            avatar: replyInfo[i].userInfo[0].avatar
                        },
                        content: replyInfo[i].content,
                        like_count: replyInfo[i].realLikeCount + replyInfo[i].virtualLikeCount,
                        replyTime: replyInfo[i].replyTime,
                        weight: replyInfo[i].weight,
                        is_liked: false
                    });
                }
            }

            if(userId){
                let likeCond = {userId:userId,recordId: {$in: replyIds},isLiked:true};
                let likeInfoList = yield commentLikeRecord.methods.getCommentByCond(likeCond);
                // console.log('点赞记录', likeInfoList);
                let likeMap = _.indexBy(likeInfoList, 'recordId');
                // console.log('点赞map', likeMap);

                for (var key in resObj) {
                    if (likeMap[resObj[key]._id]) {
                        resObj[key].is_liked = true;
                    }
                }
            }

            return self.success({items:resObj});
        }).catch(function (err) {
            console.log(err);
        })

        return result;
    }
};