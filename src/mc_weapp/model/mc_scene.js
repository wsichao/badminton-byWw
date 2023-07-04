/**
 * 场景详情表(mcScene)
 * Backend.Schema.Types.ObjectId
 */

// isDefault: Boolean,
// type: Number,
// createdAt: Number,
// isDeleted: Boolean
module.exports = {
  config: {
    // 商品信息
    sceneGoods: [Backend.Schema.Types.ObjectId],
    // 场景对应的配送员
    sceneErrand: [Backend.Schema.Types.ObjectId],
    // 商务经理Id
    sceneManagerId: Backend.Schema.Types.ObjectId,
    // 场景名称
    name: String,
    // 场景 - 用户 - 商品
    sceneUserGoods: [{
      // 用户唯一标识
      userId: Backend.Schema.Types.ObjectId,
      //  商品唯一标识
      goodsId: Backend.Schema.Types.ObjectId,
    }],
    ownerUserId: Backend.Schema.Types.ObjectId, //所有人UserId
    ownerName: String, //所有人姓名
    ownerPhone: String, //所有人电话
    avatar: String, //清单头像
    deliveryType: [Number], // 共2种: 自取=1；配送=2；默认自取 可多选。
    provinceId: Backend.Schema.Types.ObjectId, //商户所在省唯一标识
    provinceName: String, //商户所在省名称
    cityId: Backend.Schema.Types.ObjectId, //商户所在市唯一标识
    cityName: String, //商户所在市名称
    countyId: Backend.Schema.Types.ObjectId, //商户所在县唯一标识
    countyName: String, //商户所在县名称
    address: String, //商户所在地详细地址
    isShowOwner: Boolean, //是否展示所有人信息(电话) 默认不展示false, 展示true
    //商品分类相关
    categorys: [{
      categoryId: Backend.Schema.Types.ObjectId,
      categoryName: String,
      isDefault: Boolean,
      type: {
        type: Number,
        default: 0
      },
      createdAt: Number,
      isDeleted: Boolean
    }]
  },
  options: {
    collection: 'mcScene'
  }
}