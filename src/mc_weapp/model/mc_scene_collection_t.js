/**
 * 收藏推荐人表(mcSceneCollection)
 */
module.exports = {
  config: {
    // 用户唯一标识	
    userId: Backend.Schema.Types.ObjectId,
    //是否被删除
    sceneRecommend: [{
      userId: Backend.Schema.Types.ObjectId,
      createdAt: Number
    }]
  },
  options: {
    collection: 'mc_scene_collection_t'
  }
}