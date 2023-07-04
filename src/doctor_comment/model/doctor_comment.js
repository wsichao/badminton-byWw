/**
 * Created by yichen on 2018/3/1.
 */
'use strict';
module.exports = {
  config: {
    userId : {type:Backend.Schema.Types.ObjectId}, //用户id唯一标识
    doctorId : {type:Backend.Schema.Types.ObjectId}, //医生id唯一标识
    content : String, //评论内容
    replyCount : {type:Number,default : 0}, //回复数量
    virtualLikeCount : {type:Number,default : 0}, //虚拟点赞数(评论的点赞基数，增量，默认0；总点赞数=virtualLikeCount+realLikeCount)
    realLikeCount : {type:Number,default : 0}, //真实点赞数(点赞后修改)
    virtualWeight : {type:Number,default : 0}, //虚拟权重(评论的权重基数，增量，默认0；总权重=virtualWeight+realWeight)
    weight : {type:Number,default : 0}, //总权重，排序用(虚拟点赞数、真实点赞数、回复数、虚拟权重修改时实时修改总权重)
    commentTime : {type:Number,default : Date.now},//评论时间(非创建时间，必填)
    auditStatus : {type:Number,default : 100}, //0 未审核  100审核中 200审核失败
    refuseReason : {type:String,default : ''}, //拒绝原因
    operator : {type:Number,default : 2} //创建者(1 BOSS运营账号 2 真实APP用户)
  },
  options:{
    collection: 'doctorComment'
  },
    methods:{
        getOneComment(id){
            return this.findOne({_id:id,isDeleted:false});
        },
        udpOneCommentByCond(cond,updates){
          cond.isDeleted=false;
          return this.update(cond,updates,{new:true});
        }
    }
}