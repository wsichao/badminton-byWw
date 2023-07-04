/**
 * ad 广告订单
 */

var ad_fields = {
    
    price: Number, // 订单价格

    // 消费账户信息, 目前仅支持用户购买
    customerId: String, // 购买用户的ID
    customerName: String, // 购买用户的姓名
    customerPhoneNum: String, // 购买用户的手机号
    customerDocId: String, // 用户关联的医生ID
    customerDocChatNum: String, // 购买用户的医疗账号

    // 商品信息, AD订单中即为医生/顾问信息
    doctorMainId: String, //用户的主账户ID
    doctorId: String, // 用户的副账号ID
    doctorRealName: String, // 医生真实姓名
    doctorDocChatNum: String,// 医生医聊号码
    doctorPhoneNum: String, // 医生手机号码
    doctorSex: String, // 医生性别
    doctorAvatar: String,
    // doctorPhoneNum: String, // 医生手机号-医生隐私信息不做冗余!!!!
};

module.exports = exports = ad_fields;