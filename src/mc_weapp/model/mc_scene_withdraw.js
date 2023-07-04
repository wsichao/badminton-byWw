/**
 * 
 * 用户提现申请表
 * 
 */
module.exports = {
  config: {
    _id: Backend.Schema.Types.ObjectId,
    // 用户Id
    userId: Backend.Schema.Types.ObjectId,
    // 用户openId
    openId: String,
    // 提现状态
    status: Number,
    // 提现金额
    cash: Number,
    // 补助金余额
    allCash: Number,
    // 可提现额度余额
    withdrawCash: Number,

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

    type: Number  // 提现类型 0:银行卡；1:对公账户
  },
  options: {
    collection: 'mcSceneWithdraw'
  }
}