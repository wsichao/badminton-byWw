/**
 * 供应商
 */
module.exports = {
  config: {
    // 供应商名称
    name: String,
    // 所在地区
    area: String,
    //所在省
    province : String,
    //所在省ID
    provinceId : Backend.Schema.Types.ObjectId,
    //所在市
    city : String,
    //所在市ID
    cityId : Backend.Schema.Types.ObjectId,
    //所在区
    district : String,
    //所在区ID
    districtId : Backend.Schema.Types.ObjectId,
    // 地址
    address: String,
    // 联系人
    concat: {
      // 联系人名字
      name: String,
      // 联系人手机号
      phone: String,
      //联系人备注
      note: String,
    },
    // 服务管理人员
    serviceUsers: [{
      // 服务管理人员id
      userId: Backend.Schema.Types.ObjectId,
      // 服务管理人员备注
      remark: String
    }],
   // memberServiceId : Backend.Schema.Types.ObjectId , //服务id 
  },
  options: {
    collection: 'TPMemberSupplier'
  }
}