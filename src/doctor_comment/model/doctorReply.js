/**
 * Created by lijinxia on 2018/3/1.
 */
'use strict';
module.exports = {
    config: {
        userId: {type: Backend.Schema.Types.ObjectId}, //用户ID
        commentId: {type: Backend.Schema.Types.ObjectId},//评价ID
        doctorId: {type: Backend.Schema.Types.ObjectId}, //医生ID
        content: String, //回复内容
        virtualLikeCount: {type: Number, default: 0}, //虚拟点赞数(评论的点赞基数，增量，默认0；总点赞数=virtualLikeCount+realLikeCount)
        status: {type: Number, default: 100},//100-未审核  200-审核拒绝
        realLikeCount: {type: Number, default: 0}, //真实点赞数(点赞后修改)
        virtualWeight: {type: Number, default: 0}, //虚拟权重(评论的权重基数，增量，默认0；总权重=virtualWeight+realWeight)
        weight: {type: Number,default:0}, //总权重，排序用(虚拟点赞数、真实点赞数、回复数、虚拟权重修改时实时修改总权重)
        replyTime: {type: Number, default: Date.now},//回复时间(非创建时间，必填)
        refuseReason: String, //拒绝原因
        operator: {type: Number, default: 2}, //创建者(1 BOSS运营账号 2 真实APP用户)
        createdAt: {type: Number, default: Date.now()},//创建时间
        updatedAt: {type: Number, default: Date.now()},//修改时间
        isDeleted: {type: Number, default: false},//是否被删除
    },
    options: {
        collection: 'doctorReply'
    }
}