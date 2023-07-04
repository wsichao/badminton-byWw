/**
 * 2030健康-订单表
 */
module.exports = {
  config: {
    userId: Backend.Schema.Types.ObjectId,
    // 微信订单号	
    wxOrderId: String,
    // 订单号	
    orderId: String,
    // 类别	默认0-专家药费诊断服务 1-专属会员服务
    type: { type: Number, default: 0 },
    //支付状态100-未支付,
    //200-支付成功,
    //300-填写完被服务人信息,资料待审核
    //400-资料待补充,被打回
    //500-专家团队诊断中,
    //600-已完成药品诊断服务（可以购买）
    //700-已完成药品诊断服务（不可购买）
    //800-完成购买专属医生服务
    status: Number,
    // 被服务人唯一标识
    serviceManId: Backend.Schema.Types.ObjectId,
    // 微信时间戳
    wxTimeStamp: Number,
    //支付时间 
    paidTime: { type: Number },
    //支付价格  单位分 
    price: Number,
    //是否被删除
    isDeleted: { type: Boolean, default: false },
    //type ==1 需要选择就诊医生 就诊医生id
    doctorId: Backend.Schema.Types.ObjectId,
    //type ==1 服务到期时间
    dueTime: Number,
    //type ==0 购买专属服务订单id
    serviceOrderId: Backend.Schema.Types.ObjectId,
    //服务名称
    name: String,
    // 服务描述	
    desc: String,
    //助理唯一标识
    assistantId: Backend.Schema.Types.ObjectId,
    //原价	type ==1
    originalPrice : Number,
    // type == 0的时候 true - 来自助理端下单
    isPreFrom : Boolean
  },
  options: {
    collection: 'mcOrder'
  }
}
