/**
 * Created by Mr.Carry on 2017/5/25.
 */

module.exports = {
  config: {
    userId: {type: Backend.Schema.Types.ObjectId, ref: 'User'}, //收到通知用户主账号ID
    type: {type: String, enum: ['hongbao_record', 'hongbao_refund', 'sys', 'personal', 'moment']}, //类型
    subType: {type: String, default: 'normal'},
    //子类型 type=personal,subType = ['normal', 'pay']
    //子类型 type=sys,subType = ['normal', 'income_tf', 'assistant', 'couponReward', 'marketing']
    //**orderId income_tf-给被转帐人消息 asssistant-给服务助理的消息
    //**trxId couponReward-用券返现 hongbaoRefund
    //**marketing-用户领取了代金券后给商家的消息
    title: String, //消息的标题
    content: String, //消息的内容
    link: String, //消息的链接
    link_title: String, //跳转页面显示标题
    linkType: String, //web-跳转到外部网页, marketing-推广, assistant-服务助理, income_tf-收款 couponReward-用券返现, hongbaoRefund-红包退款  shop : 跳转付费推广  user :跳转店铺主页
    trxType: String, //交易明细类型(api:/customer/transaction?orderId=&trxType=): hongbaoRefund,couponReward
    isViewed: {type: Boolean, default: false, enum: [false, true]}, //是否被查看
    orderValue: {type: Number, default: 0}, //收款订单金额
    linkData: {type: String, default: ''}, //linkType= assistant时,为收款人id
    orderId: {type: String}, //orderId,而非trxId;另被提醒支付订单Id

    //给用户留言
    messageFrom: {type: Backend.Schema.Types.ObjectId, ref: 'User'},
    messageTo: {type: Backend.Schema.Types.ObjectId, ref: 'User'},
    pics: [String], //留言相应的图片

    isDeleted: {type: Boolean, default: false, enum: [false, true]},
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now},
    statisticsUpdatedAt: {type: Number, default: Date.now},

    toMessageId: String //回复的留言id
  },
  options: {
    collection: 'messages'
  }
}