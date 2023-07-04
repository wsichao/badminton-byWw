/**
 * 语音通话订单
 */
var mongodb = require('../../configs/db'),
    Schema = mongodb.mongoose.Schema,
    PriceSchema = require('../PriceSchema');
var phone_fields = {
  callerAccid: String,
  calleeAccid: String,
  channelId: String,
  callWay: {type: String, default: 'call_both', enum: ['call_both','voip']},//呼叫方式,双向回拨-call_both;网络通话-voip

  doctorId: String,
  doctorRealName: String,
  doctorPhoneNum: String,
  doctorDocChatNum: String,//医生医聊号码
  doctorSex: String, //医生性别
  doctorAvatar: String,
  isSeedDoctor: {type: Boolean, default: false}, //是否为种子医生
  double12Doctor:{type: Boolean, default: false}, //是否为双12医生
  seedDoctorCouponUnlimited: {type: Boolean, default: false},  //患者使用种子医生优惠券联系医生无限制

  customerId: String,
  customerName: String,
  customerPhoneNum: String,
  customerDocChatNum: String,//患者医聊号码
  customerDeviceId: String,
  customerAvatar: String,
  direction: {type: String, default: 'C2D'}, //通话方向：C2D-患者联系医生 D2C-医生联系患者
  callPrice: {type: Schema.Types.Mixed, ref: PriceSchema},

  callStatus: {type: String, default: 'waitingSS'}, //通话状态: failed-未发起双向回拨;waitingSS-等待发起服务; busy-通话中; over-通话结束(包括未接通)；
  failedReason: Number,  //callStatus=failed 原因：1303-余额不足  1402-有欠费订单 1301-医生不在线 1302-医生正忙 1304-患者正忙 5001-双向回拨请求失败,5002-voip无应答,5003-voip通话不可达，对方离线状态
  isNotifyDoctor: {type: Boolean, default: false},//是否通知医生(例如医生不在线通知医生上线)
  callbackId: String, //双向回拨对应id
  time: {type: Number, default: 0},//通话时长,单位秒
  doctorIncome: {type: Number, default: 0},
  customerPayment: {type: Number, default: 0}, //患者定价模型计算需支付的金额，实际需支付金额为customerPayment-couponDeductedRMB

  from: String, //freePhone-顾问免费电话发起的双向回拨

  //以下是双向回拨回调返回数据
  byetype: {type: String, default: '-10'},  //-10(不接400)或-3(还未拨通被叫时挂断)或3(接通后挂断)主叫挂断 -9或4被叫挂断  注：主叫挂断都是-10，不区分是直接挂断还是通话后挂断(可通过通话时长判断这点)
  recordurl: String,  //录音地址
  begincalltime: String, //YYYYMMDDHH24MISS
  ringingbegintime: String, //YYYYMMDDHH24MISS
  ringingendtime: String, //YYYYMMDDHH24MISS

};
// var selectFields = "-doctorPhoneNum -customerPhoneNum -recordurl";
// Order.fields = fields;
// Order.selectFields = selectFields;


// module.exports = Order;
module.exports = exports = phone_fields;