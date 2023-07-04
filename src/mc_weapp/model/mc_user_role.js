/**
 * 2030健康-用户角色表
 */
module.exports = {
  config: {
    // 角色类型 默认城市经理
    //0，默认为城市经理
    //1：业务负责人
    //2：医生BD人员
    //3：销售助理
    //4：服务助理
    type: { type: Number, default: 0 },
    // 用户唯一标识	
    userId: Backend.Schema.Types.ObjectId,
    //是否被删除
    isDeleted: { type: Boolean, default: false },
  },
  options: {
    collection: 'mcUserRole'
  }
}