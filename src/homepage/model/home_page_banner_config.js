/**
 * 首页banner配置
 */
module.exports = {
  config: {
    // 活动名称
    activityName: String,
    // 图片位置"top" "middle"
    imgPosition: {
      type: String,
      enum: ["top", "middle"]
    },
    // 图片
    img: String,
    // 跳转链接	
    redirectLink: String,
    // 权重
    weight: Number,
    // 活动开始时间	
    startTime: Number,
    // 活动结束时间
    endTime: Number,
    // 备注
    remark: String,
    share: {
      title: String,
      context: String,
      url: String
    }
  },
  options: {
    collection: 'homePageBannerConfig'
  }
}