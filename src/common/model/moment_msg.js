/**
 * Created by fly on 2017－07－11.
 */

module.exports = {
  config: {
    userId: {type: Schema.Types.ObjectId, ref: 'User'}, //收到通知用户主账号ID

    momentList : [ {
      moment : {type: Schema.Types.ObjectId, ref: 'Moment'},
      originalMomentId : {type: Schema.Types.ObjectId, ref: 'Moment'},
      momentUser : {type: Schema.Types.ObjectId, ref: 'User'},
      isDeleted: {type: Boolean, default: false, enum: [false, true]},
      msgCreatedAt: Number
    } ],//收到的动态
    isViewed: {type: Boolean, default: false, enum: [false, true]}, //是否被查看
  },
  options: {
    collection: 'momentMsg'
  }
}