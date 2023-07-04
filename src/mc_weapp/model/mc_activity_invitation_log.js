/**
 * 活动邀请函日志表
 */
module.exports = {
  config: {
    // 用户唯一标识
    userId: Backend.Schema.Types.ObjectId,
    // 邀请函七牛key
    invitationImg: String,
    // 副标题
    titleSub: String
  },
  options: {
    collection: 'mcActivityInvitationLog'
  }
}