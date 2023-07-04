/**
 * 2030健康-微信小程序版本审核配置
 */
module.exports = {
  config: {
    // 审核状态 100 审核中。200 审核成功；
    status: {
      type: Number,
      default: 100
    },
    // 审核中的版本号
    version: {
      type: String,
      default: '1.0'
    }
  },
  options: {
    collection: 'mcWXCheckConfig'
  }
}