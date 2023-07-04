/**
 * 
 * 预推荐码表
 * 
 */
module.exports = {
  config: {
    _id: Backend.Schema.Types.ObjectId,
    isUse: {
      type: Boolean,
      default: false
    }
  },
  options: {
    collection: 'mcScenePreRef'
  }
}