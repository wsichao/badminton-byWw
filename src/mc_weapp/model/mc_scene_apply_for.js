/**
 * 申请小清单表(mcSceneApplyFor)
 * Backend.Schema.Types.ObjectId
 */
module.exports = {
  config: {
    // 用户唯一标识
    userId: Backend.Schema.Types.ObjectId,
    // 关联用户唯一标识（预推荐码）
    preRefUserId: Backend.Schema.Types.ObjectId,
    // 100：申请中; 200：申请成功;
    status: {
      type: Number,
      enum: [100, 200],
      default: 100
    },
    // 商户名称
    name: String,
    // 商户头像
    avatar: String,
    // 商户所在省唯一标识
    provinceId: Backend.Schema.Types.ObjectId,
    // 商户所在省名称
    provinceName: String,
    // 商户所在市唯一标识
    cityId: Backend.Schema.Types.ObjectId,
    // 商户所在市名称
    cityName: String,
    // 商户所在县唯一标识
    countyId: Backend.Schema.Types.ObjectId,
    // 商户所在县名称
    countyName: String,
    // 商户所在地详细地址
    address: String,
    // 自取=1；配送=2；默认自取
    deliveryType: [{
      type: Number,
      enum: [1, 2],
      default: 1
    }],
    // 申请人姓名
    userName: String,
    // 用户名
    uName: String,
    // 用户手机号
    uPhoneNum: String,
    //推荐人
    refUserId: String,
    refUserName: String,
    refUserPhone: String
  },
  options: {
    collection: 'mcSceneApplyFor'
  }
}