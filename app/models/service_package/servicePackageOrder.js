/**
 * 服务包订单表
 * Created by Mr.Carry on 2017/12/11.
 */
"use strict";
var
  mongodb = require('./../../configs/db'),
  Schema = mongodb.mongoose.Schema;

let servicePackageOrder = new Schema({
  createdAt: {type: Number, default: Date.now},//用户注册时间
  updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
  isDeleted: {type: Boolean, default: false},//该条记录是否被删除
  statisticsUpdatedAt: {type: Number, default: Date.now},
  orderId: String, //订单号
  wxorderId: String, //微信订单号
  wxTimeStamp: Number, // 微信时间戳
  paidTime: {type: Number},//支付时间
  paidType: {type: String, enum: ['wechat', 'alipay','balance']},//支付方式   wechat-微信，alipay-支付宝，balance-余额
  deadlinedAt: Number,//服务包截止时间
  duration: Number,//服务包服务时长(月为单位)
  userId: Schema.ObjectId, //用户id
  userName: String, //用户姓名
  userPhoneNum: String,//用户手机号
  orderStatus: {type: Number, default: 100, enum: [100, 200, 300, 400, 500, 600, 700,800,900,1000]},
  //订单状态 100 未支付, 200支付成功,300审核中,400审核成功,500审核失败,600订单过期,700已退款,800已换单,900已退单，1000已结单
  mountOfRealPay: Number, //实付金额   单位是分
  vipPrice:Number,//会员价   单位分
  vipDiscountsPrice : Number,//会员优惠金额 单位是分

  servicePackageId: Schema.ObjectId, //服务包Id
  servicePackageDoctorRef: Schema.ObjectId,//服务包医生关系Id
  servicePackageName: String, //服务包名称
  doctorId: Schema.ObjectId, //服务包医生id
  doctorAvatar: String, //医生头像
  doctorName: String, //医生姓名
  doctorHospital: String, //医生所属医院
  doctorDepartment: String, //医生科室
  doctorJobTitle: String, //医生职称
  caseDescription: String, //病例说明
  casePics: [String], //病例图片
  reason : String, //病况审核说明
  caseTime : {type:Number}, //病况审核时间

  fromApp :String, //哪个app来的 assistant 助理用户
   
  serviceType : String, //服务类型 存储 "once"、"upgrade"、"zs" 值
                        //对应 单次服务、升级包、专属医生
                        //来自 servicePackageDoctorRef 表

  isOrderConvert : Boolean, //是否是脚本导入的 2018/8/27
  old : Boolean //boss查看是否老订单 是否分账
}, {
  collection: 'servicePackageOrder'
});

let ServicePackageOrder = mongodb.mongoose.model('ServicePackageOrder', servicePackageOrder);
module.exports = ServicePackageOrder;