/**
 * 活动报名表
 */
module.exports = {
  config: {
    // 活动唯一标识
    mcActivityId: Backend.Schema.Types.ObjectId,
    // 用户唯一标识
    userId: Backend.Schema.Types.ObjectId,
    // 分享人唯一标识
    shareId: Backend.Schema.Types.ObjectId,
  },
  options: {
    collection: 'mcActivitySignup'
  }
}