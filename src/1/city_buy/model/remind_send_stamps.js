/**
 * Created by Mr.Carry on 2017/5/24.
 */
/**
 * 提醒商户发券
 * @type {{config: {}, options: {collection: string}}}
 */
module.exports = {
  config: {
    userIds: {type: []}, // 用户唯一标识
    shopId: {type: Backend.Schema.Types.ObjectId}, // 商户唯一标识
    isRemind: {type: Boolean, default: true}
  },
  options: {
    collection: 'remindSendStamps'
  }
}