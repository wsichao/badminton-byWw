/**
 *  订单 通用属性 
 */
var
  mongodb = require('../../configs/db'),
  Schema = mongodb.mongoose.Schema;

// 订单通用评论信息
var commentSchema = new Schema({
  rank: Number, // 评分
  tags: [String], // 标签
  tagStr: String, // 标签
  isContentChecked: Boolean, // 评论内容是否审核通过
  content: String, //评论内容
  createdAt: Number // 评论时间
});

// 订单通用属性
var common_fields = {

  orderNo: {// 订单编号, 自增序列
    type: Number,
    default: 100000,
    required: true,
    index: {unique: true}
  },
  source: {type: String, default: 'docChat'},//数据来源:  docChat-医聊
  type: {type: String, default: 'phone'},
  //订单类型
  // phone - 电话订单;
  // exclusiveDoctor - 专属医生订单;
  // ad - 广告位购买; 顾问以用户的身份消费,建立顾问和顾问间的ad关系;
  // voip - 网络通话;
  // tf -转账
  // hb红包
  // membership - 会员额度
  // marketing - 推广额度
  payType: String,
  //支付类型
  // null 未付款, 
  // ali_pay - 支付宝付款;
  // sys_pay - 系统账户余额付款;
  // union_pay - 银联付款;
  // wx_pay - 微信支付;
  // wx_pub_pay - 微信公众号支付; 
  // wx_scan_pay - 微信扫码支付
  // sys_card - 系统礼品卡支付;
  // cash - 线下沟通付款;
  // iap - ios,IAP支付;

  payStatus: {
    type: String,
    default: 'toPay',
    enum: ['toPay', 'paid', 'refund']},
  //支付状态
  // null-初始状态 
  // toPay-待支付 
  // paid-支付成功
  // refund-已退单/已退款
  prepareId: String, // 预支付订单号

  couponId: {type: String, default: ''},// 代金券uuid
  couponType: Number, // 代金券类型
  couponDeductedRMB: {type: Number, default: 0},// 代金券抵扣金额(<=customerPayment)

  isCommentHint: {type: Boolean, default: false},// 评论提示, 是否查询过
  isCommented: {type: Boolean, default: false},// 是否以评论
  comment: {type: Schema.Types.Mixed, ref: commentSchema},

  createdAt: {type: Number, default: Date.now},//创建时间,如果createdAt<= now - 30min，则callStatus视为结束(双向回拨最多30min)
  updatedAt: {type: Number, default: Date.now},//更新时间
  isDeleted: {type: Boolean, default: false},//该条记录是否被删除
  statisticsUpdatedAt: {type: Number, default: Date.now}
}

module.exports = exports = common_fields;