/**
 * 优惠券-商品表
 */
module.exports = {
    config: {
        // 类型		
        //default:
        //voucher ：代金券	
        type: {
            type: String,
            default: 'voucher',
        },
        // 优惠券名称	
        name: String,
        // 额度	
        limit: Number,
        // 满多少钱可用		
        workingCondition: Number,
        // 有效期	
        periodOfValidity: Number,
        // 适用的服务	
        memberServices: [{
            type: Backend.Schema.Types.ObjectId
        }]

    },
    options: {
        collection: 'discountCoupon'
    }
}