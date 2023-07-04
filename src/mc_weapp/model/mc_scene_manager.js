/**
 * 商务经理表(mcSceneManager)
 * Backend.Schema.Types.ObjectId
 */
module.exports = {
  config: {
    //  用户唯一标识
    userId: Backend.Schema.Types.ObjectId,
    //  真实姓名
    name: String,
    //  真实手机号
    phone: String
  },
  options: {
    collection: 'mcSceneManager'
  }
}