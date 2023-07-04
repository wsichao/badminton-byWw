/**
 * 助理基础信息表
 */
module.exports = {
  config: {
    name: String,   //助理名字
    phoneNum: String,  // 电话号码
    provinceId: Backend.Schema.Types.ObjectId, // 省id
    province: String, //省名 
    cityId: Backend.Schema.Types.ObjectId, // 市id
    city: String, // 市名称
    townId: Backend.Schema.Types.ObjectId, //县id
    town: String, // 区名
    gender: String, // 性别
    remark: String, // 备注
    avatar: String, // 头像

  },
  options: {
    collection: 'servicePackageAssistant'
  }
}