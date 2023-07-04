/**
 * 活动详情表
 */
module.exports = {
  config: {
    // 省名称
    provinceName: String,
    // 市名称
    cityName: String,
    // 详细地址
    address: String,
    // 活动主题名称
    activityName: String,
    // 联系人姓名
    contactsName: String,
    // 联系人电话
    contactsPhone: String,
    // 活动开始时间
    conductTime: Number,
    // 自增Id（内置）
    incremenId: String,
    // 活动报名费用（默认0）
    price: {
      type: Number,
      default: 0
    },
    // 活动说明
    explain: String
  },
  options: {
    collection: 'mcActivity'
  }
}