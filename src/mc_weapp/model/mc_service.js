/**
 * 2030健康-服务商品表
 */
module.exports = {
    config: {
        // 服务名称	
        name: String,
        // 服务描述	
        desc: String,
        // 服务图片
        avatar: { type: String, default: '' }, 
        //服务价格(单位 分)	
        price: Number,
        //服务原价(单位 分)
        originalPrice: Number,
        //服务时长
        duration: Number,
        // 服务编号（与订单表中的type对应）	
        sericeNumber: Number,
        // 是否被删除
        isDeleted: {type: Boolean, default: false},
    },
    options: {
        collection: 'mcService'
    }
}