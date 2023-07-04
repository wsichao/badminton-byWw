/**
 * 2030健康-用户关联表
 */
module.exports = {
    config: {
      // 城市经理用户唯一标识	
      rootUserId: Backend.Schema.Types.ObjectId,
      // 邀请人用户唯一标识	
      pUserId: Backend.Schema.Types.ObjectId,
      // 用户唯一标识
      userId: Backend.Schema.Types.ObjectId,
      //是否被删除
      isDeleted: {type: Boolean, default: false},
    },
    options: {
      collection: 'mcUserRef'
    }
  }