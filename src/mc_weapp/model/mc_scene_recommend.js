/**
 * 推荐人表(mcSceneRecommend)
 * Backend.Schema.Types.ObjectId
 */
module.exports = {
  config: {
    // 用户唯一标识
    userId: Backend.Schema.Types.ObjectId,
    // 真实姓名
    name: String,
    // 真实手机号
    phone: String,
    // 场景唯一标识
    sceneId: Backend.Schema.Types.ObjectId,
    // 推荐人二维码
    qscode: String
  },
  options: {
    collection: 'mcSceneRecommend'
  }
}