/**
 *
 * boss 端用 充值申请表 （node只做查询）
 *
 * Created by yichen on 2018/5/3.
 */


//用户收藏中心
module.exports = {
  config: {
    userId : Backend.Schema.Types.ObjectId,  //用户id
    userName: String, //用户姓名
    phoneNum:String,//手机号
    rechargeAmount:Number,//充值金额
    remark:String,//备注
    applicantAccount:{type: String},//申请人账号
    confirmAccount: {type: String},//确认人账户
    status:{type:Number},//充值状态
                        //0 申请充值
                        //1 充值成功

    isDeleted: {type: Boolean, default: false},//
    createdAt: {type: Number, default: Date.now},//
    updatedAt: {type: Number, default: Date.now},
    statisticsUpdatedAt: {type: Number, default: Date.now}
  },
  options:{
    collection: 'rechargeApplication'
  },
  methods:{
  }
}