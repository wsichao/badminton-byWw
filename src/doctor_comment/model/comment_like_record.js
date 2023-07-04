/**
 * Created by yichen on 2018/3/1.
 */
'use strict';
module.exports = {
  config: {
    userId : {type:Backend.Schema.Types.ObjectId}, //用户id唯一标识
    recordId : {type:Backend.Schema.Types.ObjectId}, //用户评论id或者用户回复id
    isLiked : {type : Boolean,default : true} //是否点赞 默认创建时候点赞
  },
  options:{
    collection: 'commentLikeRecord'
  },
  methods:{
    set(data){
      return this.create(data);
    },
    like(id){
      return this.findOneAndUpdate({_id:id},{isLiked:true},{new:true})
    },
    unlike(id){
        return this.findOneAndUpdate({_id: id}, {isLiked: false}, {new: true})
    },

    delete(id){
      return this.findOneAndUpdate({_id:id},{isDeleted:true},{new:true})
    },
    get(userId,id){
      return this.findOne({userId:userId,_id:id,isDeleted:false});
    },
    getCommentByCond(cond){
      cond.isDeleted=false;
      return this.find(cond);
    },
    udpCommentByCond(cond,updates){
      cond.isDeleted=false;
      updates.updatedAt=Date.now();
      return this.update(cond,updates,{new:true});

    },
    insertComment(comment){
        console.log('插入数据',comment);
      return this.create(comment)
    }
  }
}