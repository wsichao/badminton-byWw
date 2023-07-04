/**
 * 用户收到的点赞评论消息
 * Created by yichen on 2017/6/29.
 */


module.exports = {
  config: {
    source: {type: String, default: 'docChat'},

    fromUserId : String,                                    //发评论用户id
    toUserId : String,                                      //接受评论用户id
    comment : String,                                       //评论内容
    commentId : String,                                     //评论id
    moment : {
      momentId : String,                                    //动态id
      content : String,                                     //动态内容
      pics : [String]                                       //动态图片
    },
    isZan : {type: Boolean, default: false},                                        //是否为点赞
    isRead : {type: Boolean, default: false},                                       //是否已读
    createdAt: {type: Number, default: Date.now},           //新建时间
    updatedAt: {type: Number, default: Date.now},           //最近的更新时间
    isDeleted: {type: Boolean, default: false},             //该条记录是否被删除
    statisticsUpdatedAt: {type: Number, default: Date.now},  //统计数据使用
  },
  options: {
    collection: 'commentMessages'
  }
}