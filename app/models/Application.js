/**
 * 提款申请
 * Created by zhaoyifei on 15/4/21.
 */

var
  mongodb = require('../configs/db'),
  Doctor =  require('./Doctor'),
  StatisticsHelper = require('../../lib/StatisticsHelper'),
  Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;
var applicationSchema = new Schema({
  source: {type: String, default: 'docChat'},//数据来源: docChat-医聊
  // 基本属性
  type: {type: Number, default: 1},//申请类型: 1-提现申请 15-医生信息修改申请 16-名片申请 17-商家申请认证  20-新版本朱李叶健康提现申请
  status: {type: Number, default: 0},
  //提款进度:
  //  0 新建申请;
  //  1 - 待处理; 2 运营批准; 3 财务确认;
  //  －1 系统拒绝; -2 运营拒绝; -3 财务拒绝;
  //  15  0未提交 ；1审核中 -1审核未通过
  createdAt: {type: Number, default: Date.now},//
  updatedAt: {type: Number, default: Date.now},//
  isDeleted: {type: Boolean, default: false},//
  statisticsUpdatedAt: {type: Number, default: Date.now},
  future: {type: Number},//超期默认拒绝

  applicantId: String, //申请人id
  applicantRef: {type: Schema.ObjectId, ref: 'Doctor'},
  applicantName: String, //申请人
  applicantPhone: String, //申请人手机号
  applicantDocChatNum : String,//申请人热线号

  //approvalId: String,//受理人id
  //approvalName: String,//受理人

  sid: String,  //身份证号   //废弃

  cash: {type: Number, default: 0},  //金额
  alipayNum: String,//支付宝账号 
  alipayName: String, //支付宝绑定人姓名
  alipaySid:String,//支付宝身份证号
  bankCardNum: String,//银行卡号 
  bankCardName: String,//提款人开户行姓名 
  bankCardSid:String,//银行卡身份证号
  bankName: String,//开户行名称
  area: String, //开户行省
  subBankName: String,//开户行支行

  province: String,  //省
  city: String,  //市
  hospitalId: String,       //执业地点Id
  hospital: String,     //执业地点
  departmentId: String,     //科室Id
  department: String,   //科室
  position: {type: String, default: ''},   //职称

  //纸质名片申请需要信息
  receiveArea: {type: String}, //收货地区
  receiveAddress : {type: String}, // 详细地址
  receiveName : {type: String},//收件人姓名
  receivePhone : {type: String},//收件人电话
  receiveMemo : {type: String},//备注

  //商家认证申请
  shopCity : String,//店铺城市
  shopName : String,//店铺名称
  shopAddress : String,//店铺地址
  shopAddressMapLon : Number,//经度
  shopAddressMapLat : Number,//经度
  shopType : String,//店铺类型
  shopSubType : String,//店铺子类型
  shopPhoneNum : String,//店铺电话号码
  shopAvatar : String,//商家头像
  shopLicense : String, //商家营业执照

  //审核时间
  opReviewdAt : {type: Number, default: 0}, //提现运营审核时间
  financialReviewdAt : {type: Number, default: 0},//提现财务审核时间

  reason: String //拒绝原因
}, {
  collection: 'applications'
});

mongoosePre(applicationSchema, 'application');
hookUpModel(applicationSchema);
var Application = mongodb.mongoose.model('Application', applicationSchema);

module.exports = Application;