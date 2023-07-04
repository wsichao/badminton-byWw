/**
 * Created by dell on 2017/6/28.
 */
/**
 * 评论点赞记录
 * Created by wyy on 2017/6/28.
 */

'use strict';
let service = Backend.service("1/moment","comment_msg_service");
let userService = Backend.service("common","user_service");
module.exports = {

    mockAction: function () {
        var resObj = {
            items : [
                {
                    name : "小彬",
                    avatar : "",
                    timeStamp : 1498645236000,
                    comment : "",
                    moment : {
                        content : "老师",
                        pics : []
                    },
                    isZan : true,
                },
                {
                    name : "一尘",
                    avatar : "",
                    timeStamp : 1498645236002,
                    comment : "人不错",
                    moment : {
                        content : "课代表",
                        pics : []
                    },
                    isZan : false,
                }
            ]
        };
        return this.success(resObj);
    },
    getAction:function () {

        let that = this;
        var userId = this.req.identity.userId;
        var user = this.req.identity.user;
        var pageSize = this.req.query.pageSize || pageSize20;
        //var pageSlice = getCurrentPageSlice(this.req, 0, pageSize20, {createdAt: -1},this.req.query.currentSize);
        var timeStamp = Number(this.req.query.timeStamp);
        var messageList;

        if (!isUUID24bit(userId) || !isExist(user)) {       //验证user和userId是否合法
            return that.fail(8005);
        }
        return service.findUnreadMessage(userId)
            .then(function (_messages) {

                if (_messages.length && !timeStamp){     //如果有未读消息,就去查询未读消息，更改isread的状态，加上读取状态时的时间
                    var unreadMessageIds  = [];
                    _messages.forEach(function (item) {
                        unreadMessageIds.push(item._id);
                    });
                    var update = {isRead:true,updatedAt:Date.now()};
                    service.updateMessages(unreadMessageIds,update);

                    return _messages;
                }else{   //没有未读消息，就去查询已读消息
                    return service.getListByToUserId(userId,true,pageSize,timeStamp);
                }
            })
            .then(function (_list) {
                messageList = _list;
                var userIds = [];
                _list.forEach(function(item){
                    userIds.push(item.fromUserId);    //发送评论的用户
                });
                return userService.getInfoByUserIds(userIds);


            })
            .then(function (_users) {
                var result = [];
                messageList.forEach(function (item) {   //循环拼接字符串
                    var resultItem = {
                        timeStamp : item.createdAt,
                        comment : item.comment,
                        moment : item.moment,
                        isZan : item.isZan,
                        isRead : item.isRead,
                    };
                    for(var i = 0;i<_users.length;i++){
                        if(item.fromUserId == _users[i]._id){
                            var name = _users[i].shopVenderApplyStatus >=3 ? (_users[i].shopName || _users[i].name || '') : (_users[i].name || '');
                            var avatar = _users[i].shopVenderApplyStatus >=3 ? (_users[i].shopAvatar || _users[i].avatar || '') : (_users[i].avatar || '');
                            resultItem.name = name;
                            resultItem.avatar = avatar;
                            resultItem.userId = _users[i]._id;
                            break;
                        }
                    }
                    result.push(resultItem);
                });
                return that.success({items: result});
            })


        // return service.getListByToUserId(userId)
        //     .then(function (_list) {
        //         return that.success(_list);
        //
        //     })

    }
}