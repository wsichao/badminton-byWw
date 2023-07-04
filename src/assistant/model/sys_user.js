/**
 * 助理登录信息表
 */
module.exports = {
  config: {
    userName: String,   //账号
    password: String,  // 密码
    role: String, //用户角色
    assistantId: Backend.Schema.Types.ObjectId, //助理基础信息表唯一标识
    isDeleted: Boolean,
    jkLastestLoginTime: Number, // 登录时间
    pwdErrorLoginTime: Number, //密码登陆错误时间
    pwdErrorLoginCount:{type:Number,default:0} //密码登陆错误count
  },
  options: {
    collection: 'sysUser'
  }
}