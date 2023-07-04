/**
 * 朱李叶助理端--预购商品订单
 */
module.exports = {
    config: {
        //用户唯一标识	
        userId: Backend.Schema.Types.ObjectId,
        //医生唯一标识
        doctorId: Backend.Schema.Types.ObjectId,
        //助理唯一标识
        assistantId: Backend.Schema.Types.ObjectId,
        //订单状态100：未购买，200：已购买
        status: Number,
        //订单id
        orderId: String,
        //服务类别 1-专属会员服务 2-朱李叶会员
        type: { type: Number, default: 1 },
        //服务名称
        name: String,
        // 服务描述	
        desc: String,
        //价格(单位 分)	
        price: Number,
        //被服务人姓名
        service_man_name: String,
        //被服务人手机号
        service_man_phone: String,
        // 是否被删除
        isDeleted: { type: Boolean, default: false },
    },
    options: {
        collection: 'mcPreOrder'
    }
}