module.exports = {
  config: {
    // 用户唯一标识
    userId: {
      type: Backend.Schema.Types.ObjectId
    },
    // 类型 2030Assistant：2030健康助理端；2030WechatMC：2030健康小程序;
    type: {
      type: String,
      enum: ['2030Assistant', '2030WechatMC']
    },
    // 鉴权唯一令牌
    token: {
      type: String
    },
    // 登录时间
    loginTime: {
      type: Number
    }
  },
  options: {
    collection: 'SessionToken'
  }
}