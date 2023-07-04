/**
 * 会员卡
 */
module.exports = {
  config: {
    // 用户唯一标识
    userId: {
      type: Backend.Schema.Types.ObjectId
    },
    // 会员卡类型唯一标识
    cardId: Backend.Schema.Types.ObjectId,
    // 到期时间
    dueTime: {
      type: Number,
      default: Date.now()
    }
  },
  options: {
    collection: 'TPMembershipCard'
  }
}