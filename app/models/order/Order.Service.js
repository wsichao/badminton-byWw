/**
 * 会员额度 | 推广额度
 * Created by guoyichen on 2016/11/23.
 */
var
  mongodb = require('../../configs/db'),
  Schema = mongodb.mongoose.Schema;
var service_fields = {
  serviceValue: {type: Number, default: 0}, //购买额度, //会员额度|推广额度
  price: {type: Number, default: 0}, //实际发费

  // 购买者
  customerId: String, // 购买用户的ID
  customerRefId: String, // 购买用户的副账户ID
  customerName: String, // 购买用户的姓名
  customerPhoneNum: String, // 购买用户的手机号
  customerDocChatNum: String,// 购买者医聊号码

  //邀请码用户
  memberInviteId:String,//填写邀请码用户的id
  memberInviteDocChatNum:String,//填写邀请码用户的热线号
  memberInviteName: String, // 邀请码用户的姓名
  memberInvitePhoneNum: String, // 邀请码用户的手机号

  receipt: {type: String, default: ''}, //iso,IAP凭证
  iapResStatus: {type: Number, default: -10}, //0 验证成功; -1 请求超时
  iapRes: {type: Schema.Types.Mixed}, //iap 验证返回数据
  //21000	App Store不能读取你提供的JSON对象
  //21002	receipt-data域的数据有问题
  //21003	//receipt无法通过验证
  //21004	提供的shared secret不匹配你账号中的shared secret
  //21005	receipt服务器当前不可用
  //21006	receipt合法，但是订阅已过期。服务器接收到这个状态码时，receipt数据仍然会解码并一起发送
  //21007	receipt是Sandbox receipt，但却发送至生产系统的验证服务
  //21008	receipt是生产receipt，但却发送至Sandbox环境的验证服务
  reqPayload: {type: Schema.Types.Mixed},
  membershipId: String, //会员卡id
  cardNo: String, //卡片的No
  cardType : String //会员卡类型 - city_buy全城购 - zlycare朱李叶高级会员 - zlycare_vip朱李叶vip会员
};

module.exports = exports = service_fields;