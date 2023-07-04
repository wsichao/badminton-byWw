/**
 *
 * 动态评论
 * Created by yichen on 2017/6/29.
 */

module.exports = {
  config: {
    source: {type: String, default: 'docChat'},

    userId : String,                                        //发评论用户id
    content: String,                                        //评论内容
    moment_id : String,                                     //评论对应动态id
    commentId : String,                                     //对某条评论评论时，对应评论id
    to_user_id : String,                                    //对某用户评论，用户id

    createdAt: {type: Number, default: Date.now},           //新建时间
    updatedAt: {type: Number, default: Date.now},           //最近的更新时间
    isDeleted: {type: Boolean, default: false},             //该条记录是否被删除
    statisticsUpdatedAt: {type: Number, default: Date.now},  //统计数据使用
  },
  options: {
    collection: 'momentComments'
  }
}