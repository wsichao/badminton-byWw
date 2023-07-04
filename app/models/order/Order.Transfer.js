/**
 * 转账订单
 * Created by guoyichen on 2016/11/23.
 */
var
    mongodb = require('../../configs/db'),
    Schema = mongodb.mongoose.Schema;
var transfer_fields = {
    price: Number, // 订单价格
    memo : String,//付款说明

    transferType : String,//转账类型 "normal" "product", "checkin"
    //商品信息
    productId : String,//对应product的id
    productSnapshot:{     //商品快照
        title: String,          //商品标题
        displayPrice:Number,  //价格
        actualPrice:Number,  //实际价格
        rewardPrice:Number, //奖励价格
        owner : {type: Schema.Types.ObjectId, ref: 'User'}//拥有者的主账号id
    },
    productCouponId:String,//购买优惠券商品后生成的couponId
    // 服务助理信息（兼容老版字段）
    productCode : String, // 服务助理热线号
    productMainId: String, // 服务助理主账户id
    productDocId: String, // 服务助理副账户id
    productDocName: String, // 服务助理姓名
    // 购买者
    customerId: String, // 购买用户的ID
    customerName: String, // 购买用户的姓名
    customerPhoneNum: String, // 购买用户的手机号
    customerDocChatNum: String,// 购买者医聊号码
    // 商家信息
    doctorId: String, // 用户的副账户ID
    doctorMainId: String, //用户的主账户ID
    doctorRealName: String, // 医生真实姓名
    doctorDocChatNum: String,// 医生医聊号码
    doctorPhoneNum: String, // 医生手机号码
    doctorPushId: String,// 医生推送id
    doctorSex: String, // 医生性别
    doctorAvatar: String, //医生头像

    //transferType = checkin,商家收券
    customerReward: {type: Number, default: 0}, //商家收券时,用户的奖励
    venderIncome: {type: Number, default: 0}, //商家收到券的金额
    checkinType: {type: String, default: '', enum:['', 'qrScan', 'unionCode']},  //商家收到券的金额
    memberships: [{
        membershipId: String, //会员卡id
        cost: Number, //抵扣会员额度
        cardNo: String
    }],
    shopProp: {type: Number, default: 0}, //商户运营类型,0-默认值,1-运营商户
};

module.exports = exports = transfer_fields;