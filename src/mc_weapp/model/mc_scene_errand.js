/**
 * 配送员表(mcSceneErrand)
 * Backend.Schema.Types.ObjectId
 */
module.exports = {
  config: {
    // 用户唯一标识
    userId: Backend.Schema.Types.ObjectId,
    // 真实姓名
    name: String,
    // 手机号
    phone: String
  },
  options: {
    collection: 'mcSceneErrand'
  }
}