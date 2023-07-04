/**
 * 新版(CD合并) 语音订单 (包括 双向回拨 + Voip语音)
 */
var mongodb = require('../../configs/db'),
    Schema = mongodb.mongoose.Schema,
    PriceSchema = require('../PriceSchema');

var phone_fields = {

  // 主叫方信息
  callerId: String,//主叫方账户ID
  callerRefId: String,
  callerAccid: String,//主叫方的voip账户编号,仅限voip类型的订单
  callerName: String,//主叫方姓名
  callerPhoneNum: String,//主叫方手机号
  callerDocChatNum: String,//主叫方热线号
  callerDeviceId: String,//主叫方设备标识
  callerSex: String, //主叫方性别
  callerAvatar: String,//主叫方头像
  callerPayment: {
    type: Number,
    default: 0
  },//主叫方根据定价模型计算需支付的金额, 实际支付金额 = customerPayment - couponDeductedRMB

  // 被叫方信息
  calleeId: String,
  calleeRefId: String,
  calleeAccid: String,
  calleeName: String,
  calleePhoneNum: String,
  calleeDocChatNum: String,
  calleeSex: String,
  calleeAvatar: String,
  calleeIncome: {
    type: Number,
    default: 0
  },//被叫方根据定价模型计算收入的金额
  willIncome: {
    type: Number,
    default: 0
  },//被叫方待入账金额
  remindToPayAt: {type: Number, default: 0},
  callPrice: {
    type: Schema.Types.Mixed,
    ref: PriceSchema
  },// 被叫方定价模型

  sharePics: [{ //通话时,共享图片信息
    ownerId: String, //该图片的所有者的主账号ID
    sharePic: String, //该图片资源标识
    isDeleted: {type: Boolean, default: false, enum: [false, true]},
    createdAt: {type: Number, default: Date.now}
  }],

  // 具体通话信息
  callWay: {
    type: String,
    default: 'call_both',
    enum: ['call_both' , 'voip']
  },//呼叫方式,双向回拨-call_both;网络通话-voip
  channelId: String,//通话的频道ID, 对应到第三方的voip或双向回拨的ID,双向回拨中, 容联云通讯为callbackId,飞语云fyCallId,
  provider: { //双向回拨运营商, 容联云通讯-yuntongxun,  飞语云-feiyucloud
    type: String,
    default: '',
    enum: ['', 'yuntongxun', 'feiyucloud']
  },
  callerShowNum: {type: String, default: ''}, //主叫显号
  calleeShowNum: {type: String, default: ''}, //被叫显号
  appId: String, //飞语云某一应用appId

  callStatus: {
    type: String,
    default: 'waitingSS',
    enum: ['failed', 'waitingSS', 'busy', 'over', 'waitCB']
  },//通话状态: failed-未发起双向回拨;waitingSS-等待发起服务; busy-通话中; over-通话结束(包括未接通)；
  time: {type: Number, default: 0},//通话时长,单位秒
  maxTime: {type: Number, default: 0}, //用户拨打电话时,最长可通话时间
  byetype: { //
    type: String,
    default: '-11' //-11,未回调
  },
  /*飞语云中断原因:
  ** 1:主叫挂断 2:被叫挂断 3:呼叫不可及 5:超时未接 6:拒接或超时 7:网络问题 9:API请求挂断 10:余额不足
  ** 11:呼叫失败，系统错误 12:被叫拒接 13:被叫无人接听 14:被叫正忙 15:被叫不在线 16:呼叫超过最大呼叫时间
  * 容联云通讯双向回拨鉴权挂机类型
  * 常用类型有, -10(不接400)或-3(还未拨通被叫时挂断)或3(接通后挂断)主叫挂断 -9或4被叫挂断
  *
  * 详细类型
  * 1: 通话中取消回拨、直拨和外呼的正常结束通话 2: 账户欠费或者设置的通话时间到 3:回拨通话中主叫挂断，正常结束通话
  * 4:回拨通话中被叫挂断，正常结束通话 -1: 被叫没有振铃就收到了挂断消息 -2: 呼叫超时没有接通被挂断 -5: 被叫通道建立了被挂断
  * -6: 系统鉴权失败 -7: 第三方鉴权失败 -11: 账户余额不足 -3: 回拨主叫接通了主叫挂断 -4: 回拨主叫通道创建了被挂断
  * -9: 回拨被叫振铃了挂断 -10: 回拨主叫振铃了挂断 -14:回拨取消呼叫(通过取消回拨接口)
  ***/
  recordurl: String,//录音地址
  begincalltime: String,//YYYYMMDDHH24MISS
  ringingbegintime: String,//YYYYMMDDHH24MISS
  ringingendtime: String,//YYYYMMDDHH24MISS
  failedReason: Number,
  //callStatus=failed 原因：1303-余额不足  1402-有欠费订单 1301-医生不在线 1302-医生正忙 1304-患者正忙 5001-双向回拨请求失败,5002-voip无应答,5003-voip通话不可达，对方离线状态
  from: {
    type: String,
    default: "24_app"
  },// 语音通话订单的来源: freePhone-顾问免费电话发起的双向回拨
  otherCallbackData: { //回调的其他数据
    type: Schema.Types.Mixed
  },
  //删除flag
  isDeletedByCaller:Boolean,//主叫删除
  isDeletedByCallee:Boolean//被叫删除
};

module.exports = exports = phone_fields;