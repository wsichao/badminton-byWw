/**
 * 2030健康-用户信息表
 */
module.exports = {
  config: {
    // 二维码	
    qcode: String,
    //用户唯一标识
    userId: Backend.Schema.Types.ObjectId,
    role: {
      type: String,
      enum: ["director"]
    },
    //是否被删除
    isDeleted: {
      type: Boolean,
      default: false
    },
    // 咨询人真实信息
    consultingObj: {
      name: String, //咨询人真实姓名
      phoneNum: String, //咨询人真实手机号
    },
    //上级用户唯一标识
    volunteersUserId: Backend.Schema.Types.ObjectId,
    // 变更上级时间
    volunteersUserTime: Number,
    // 收件人信息
    recipientInfo: {
      name: String, //姓名
      phoneNum: String, //联系方式
      address: String, //收货地址
    },
    // 关联用户唯一标识（预推荐码）
    preRefUserId: Backend.Schema.Types.ObjectId,
    //用户的提现信息
    withdrawMessage: {
      bankCardName: String,     //真实姓名
      sid: String,              //身份证号
      bankCardNum: String,      //银行卡号
      bankName: String,         //开户行名称
      applicantPhone: String,   //收款人手机号

      corporateName: String,     //收款单位名称
      corporateCradNum: String,  //收款单位账号
      corporatebankName: String  //收款单位开户行
    },
     //收件人信息列表
     shopAddressInfo: [
      {
        name: String, //姓名
        phoneNum: String, //联系方式
        province: String, //省名称
        provinceId: Backend.Schema.Types.ObjectId, //省 id
        city: String, //市名称
        cityId: Backend.Schema.Types.ObjectId, //市 id
        county: String, //县名称
        countyId: Backend.Schema.Types.ObjectId, //县id
        infoAddress: String, //收货地址
        isDeleted: {type: Boolean, default: false}, //是否删除
        defaultWeight: {
          type: Number,
          default: 0
        } //默认地址权重 设置为默认的 时间戳变成权重 权重最大的 就是默认的地址
      }
    ],
    //腾讯平台的 id
    unionid: String,
    //微信小程序的 openid
    openid: String
  },
  options: {
    collection: 'mcUserInfo'
  }
}