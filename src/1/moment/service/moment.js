/**
 * Created by Mr.Carry on 2017/6/29.
 */
"use strict";
let comment_msg_model = Backend.model("1/moment", undefined, 'comment_msg');
let moment_msg_service = Backend.service("1/city_buy", "moment_msg");
let moment_model = Backend.model('1/moment', undefined, 'moment');
let comment_model = Backend.model('1/moment', undefined, 'comment');
let customer_model = Backend.model('common', undefined, 'customer');
let messages_service = Backend.service('1/message', 'messages');
let config_service = Backend.service('common', 'config_service');
let moment_service = Backend.service('1/moment', 'moment_service');
let dynamic_sample_service = Backend.service('1/recommend', 'dynamic_sample_service');
let personas_service = Backend.service('1/recommend', 'personas_service');

let _ = require('underscore');


let getUser = (userIds) => {
    return customer_model
        .find({_id: {$in: userIds}}, '_id avatar name shopVenderApplyStatus shopName shopAvatar')
        .then(data => {
            return data.map(item => {
                let name = '';
                let avatar = '';
                if (item.shopVenderApplyStatus >= 3) {
                    name = item.shopName || "";
                    avatar = item.shopAvatar || "";
                }
                else if (item.shopVenderApplyStatus <= 2) {
                    name = item.name || "";
                    avatar = item.avatar || "";
                }
                return {_id: item._id, name: name, avatar: avatar};
            })

        });
}


module.exports = {
    /**
     * 获取未读消息数及最近一个用户的头像
     * @param data
     * @returns {promise}
     */
    getUnreadCount: function (user_id) {
        let avatar = '';
        let def_result = {
            count: 0,
            avatar: ''
        };
        return comment_msg_model
            .findOne({toUserId: user_id, isDeleted: false, isRead: false})
            .sort({createdAt: -1})
            .then(data => {
                if (!data) return null;
                let from_user_id = data.fromUserId;
                return customer_model.findOne({_id: from_user_id}, '_id avatar shopVenderApplyStatus shopAvatar');
            })
            .then(data => {
                if (!data) return null;
                if (data.shopVenderApplyStatus >= 3) {
                    avatar = data.shopAvatar || "";
                }
                else if (data.shopVenderApplyStatus <= 2) {
                    avatar = data.avatar || "";
                }
                return comment_msg_model
                    .count({toUserId: user_id, isDeleted: false, isRead: false})
            })
            .then(function (count) {
                if (count == null) {
                    return def_result;
                }
                ;
                return {
                    count: count,
                    avatar: avatar
                };
            }).catch(err => {
                console.log(err);
                return {
                    count: 0,
                    avatar: ''
                }
            });
    },
    /**
     * 获取评论列表
     * @param moment_message_id
     * @param slices
     * @returns {promise}
     */
    getComments: function (moment_message_id, slices, options) {
        let userId = options && options.userId;
        let pageNum = options && options.pageNum;
        let count = 0;

        let result = [];
        return comment_model
            .find({moment_id: moment_message_id, isDeleted: false})
            .skip(slices.skip)
            .limit(slices.limit)
            .sort({'createdAt': -1})
            .then(data => {
                result = _.extend([], data);
                let user_ids = data.map(item => item.userId);
                let to_user_ids = data.map(item => item.to_user_id);
                // 合并user_id 与 to_user_id 并过滤其中重复与不存在数据
                user_ids = _.uniq(user_ids.concat(to_user_ids)).filter(item => item ? true : false);
                return getUser(user_ids);
            }).then(data => {
                let users = _.indexBy(data, "_id");
                result = result.map(item => {
                    let avatar = users[item.userId].avatar;
                    let name = users[item.userId].name;
                    let to_user_name = users[item.to_user_id] ? users[item.to_user_id].name : '';
                    return {
                        user_id: item.userId,
                        comment_id: item._id,
                        avatar: avatar || '',
                        name: name || '',
                        create_time: item.createdAt,
                        to_user_id: item.to_user_id || '',
                        to_user_name: to_user_name,
                        comment: item.content,
                        moment_id: moment_message_id
                    };
                });
                return comment_model
                    .count({moment_id: moment_message_id, isDeleted: false});
            }).then(_count => {
                count = _count;

                //[ 用户行为记录 ] 点击查看动态
                if (!userId || Number(pageNum) != 0) return;
                return moment_service.findMomentById(moment_message_id)
                    .then(function (moment) {
                        if (!moment || !moment.userId) return;
                        return config_service.getTagsByUserId(moment.userId)
                            .then(tags => {
                                if (!tags || tags.length == 0) return;
                                let sample_info = {
                                    type: 0,
                                    targetId: moment_message_id,
                                    action: 0,
                                    tags: tags
                                }
                                return dynamic_sample_service.genSample(userId, sample_info);
                            })
                    })

            })
            .then(() => {
                return {
                    count: count,
                    items: result
                };
            }).catch(err => {
                console.log(err);
                return {
                    count: 0,
                    items: []
                };
            });
    },
    getMomentByFavorite: function (favorite_ids, fields, options) {
        let cond = {
            isDeleted: false,
            userId: {$in: favorite_ids}
        }
        options = options || {limit: 24, skip: 0, sort: {createdAt: -1}};
        return moment_model.find(cond, fields || null, options).exec();
    },
    getMomentByType: function (type, fields, options) {
        let cond = {
            isDeleted: false,
            type: type
        }
        options = options || {limit: 24, skip: 0, sort: {createdAt: -1}};
        return moment_model.find(cond, fields || null, options).exec();
    },
    /**
     * 推送消息,通知用户收到新的赞和评论
     * @param to_user_id 用户唯一标识
     * @returns {Promise.<T>}
     */
    sendUnreadReminding: function (to_user_id) {
        let parmas = {toUserId: to_user_id, isDeleted: false, isRead: false};
        let pushId = '';
        return customer_model.findOne({_id: to_user_id}, "pushId")
            .then(data => {
                pushId = data.pushId;
                return comment_msg_model.find(parmas)
            })
            .then(data => {
                let status = {
                    isComment: false,
                    isZan: false
                };
                for (let i = 0; i < data.length; i++) {
                    let item = data[i];
                    if (item.isZan) {
                        status.isZan = true;
                    }
                    if (item.commentId) {
                        status.isComment = true;
                    }
                    if (status.isComment && status.isZan) {
                        break;
                    }
                }
                if (pushId && pushId != '') {
                    // 发送透传
                    var msg = '';
                    var extras = {
                        type: 1,//有新消息 
                        contentType: 'comment'
                    };
                    if (status.isComment) {
                        msg = '收到新的评论';
                    }
                    if (status.isZan) {
                        msg = '收到新的赞';
                    }
                    if (status.isZan && status.isComment) {
                        msg = '收到新的评论和赞';
                    }
                    if (msg != '') {
                        messages_service.pushMessage(pushId, msg, extras);
                    }
                }
                return status;
            });
    },
    /**
     * 根据moment_id 获取user_id
     * @param moment_id
     */
    getUserId: function (moment_id) {
        return moment_model.findOne({_id: moment_id}, "userId")
    },

    /**
     * 获取动态列表
     * @returns { Promise }
     */
    findByZlyCare: function (options, recommend_options, user_id) {
        let result = [];
        return Backend.Deferred.all([
            personas_service
                .findByUserId(user_id),
            config_service.getZlycareUser()
        ])
            .then(res => {
                let cond = {
                    isDeleted: false,
                    userId: {$in: res[1]} // 根据运营号获取动态
                };
                let new_tags = [];
                if (res[0]) {
                    _.filter(res[0].heat, function (tag) {
                        for (var p in tag) {
                            if (tag[p] > 20) {
                                new_tags.push(p)
                                return true
                            }
                        }
                        return false
                    });
                }

                // 获取大于四十的标签
                return Backend.Deferred.all([
                    moment_model
                        .find(cond, '_id userId createdAt displayContent originalContent pics momentURL', options || null)
                        .sort({'createdAt': -1}),
                    moment_model
                        .find({tags: {$in: new_tags}}, '_id userId createdAt displayContent originalContent pics momentURL', recommend_options || null)
                        .sort({'createdAt': -1})
                ])
            })
            // 获取用户信息
            .then(function (res) {
                result = JSON.parse(JSON.stringify(res[0]));
                let result1 = JSON.parse(JSON.stringify(res[1]));
                result1 = result1.map(item => {
                    item.displayContent = '[ 推荐 ] ' + item.displayContent;
                    return item;
                })
                result = result.concat(result1);
                result = _.shuffle(result);

                result = _.uniq(result, false, function (x) {
                    return x._id;
                });

                let user_ids = result.map(item => item.userId);
                user_ids = _.uniq(user_ids);
                let users = getUser(user_ids);
                return users;
            }).then(function (u) {
                u = _.indexBy(u, "_id");
                result = result.map(item => {
                    let user_obj = u[item.userId] || {};
                    // 获取用户名称
                    item.title='我是标题';
                    item.desc='我是描述',
                    item.user_name = user_obj.name || '未知用户';
                    item.moment_id = item._id;
                    item.displayURL = moment_msg_service.momentURL(item.displayContent, item.momentURL || []);
                    item.momentURL = undefined;
                    item.displayContent = undefined;
                    item.originalContent = undefined;
                    item.userId = undefined;
                    item._id = undefined;
                    return item;
                })
                return {items: result};
            })
    }
}