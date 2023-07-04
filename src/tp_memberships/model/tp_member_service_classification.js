/**
 * 服务分类
 */
module.exports = {
  config: {
    // 名称
    name: String,
    // 大图
    bigImg: String,
    // 小图
    smallImg: String,
    // 一句话描述
    detail: String,
    // 权重
    weight: Number,
    // 是否展示
    isShow: {
      type: Boolean,
      default: false
    },
    memberServiceIds: [{
      type: Backend.Schema.Types.ObjectId
    }],
  },
  options: {
    collection: 'TPMemberServiceClassification'
  }
}