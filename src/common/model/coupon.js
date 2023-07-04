/**
 * Created by yichen on 2017/5/25.
 */


module.exports = {
  config: {
    source: {type: String, default: 'docChat'},//数据来源: docChat-医聊
    // 1. 基本属性
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now},
    consumedAt: {type: Number, default: 0}, //被使用的时间
    isDeleted: {type: Boolean, default: false},
    statisticsUpdatedAt: {type: Number, default: Date.now},


    // 2. 优惠劵基本信息
    type: {type: Number, default: 0},// 数据类型: 0-普通电话优惠卷(有截至时间)
                                     // 1-活动电话优惠券(限定日期以及时间段。结算先使用活动优惠券，然后才是普通优惠券)
                                     // 2-购买专属医生专用折扣券
                                     // 3-种子医生专用电话优惠券(有截至时间)
                                     // 4-双12活动医生专用优惠券
                                     // 5-24热线全城购代金券
                                     // 6-24热线全城购特惠券
                                     // 7-24热线全城购折扣券
                                     // 8-返利代金券,含有二维码,
                                     // 9-通用代金券,含有二维码,不消耗商家推广额度,不消耗用户会员额度,不返利

    activityNO: {type: String, default: ""},//活动编号
    //serialNO: {type: String, default: '0'},//序号
    //activateType: {type: Number, default: 0},
    //激活类型:
    // 0-默认为优惠码(一个码可以激活N个劵,N=当前码对应券的数量)
    // 1-活动激活(一个用户只能激活一次,一个活动可以被N个用户激活,N=当前活动对应券的数量)
    //activateNO: {type: String, default: ''},// 活动码优惠码, 标识
    //couponNO: {type: String, default: ''},// 优惠码, 标识

    title: {type: String, default: ''},//优惠劵标题
    subTitle: {type: String, default: ''},//优惠劵副标题
    description: {type: String, default: ''},//优惠劵
    manual: {type: String, default: ''},//使用说明
    rmb: {type: Number, default: 0}, // 代金券面值
    rmbDescription: {type: String, default: ''},//面值描述

    isConsumed: {type: Boolean, default: false}, // 是否已被消费过
    deductedRMB: {type: Number, default: 0},// 优惠券实际抵扣金额
    expiredAt: {type: Number, default: Date.now},// 过期时间,必需大于等于当前时间才能够正常使用
    //type=8,有效期为两个自然日
    validAt:{type:Number,default: Date.now}, //生效时间
    //type=1时
    dateBegin: {type: Number, default: 0},
    dateEnd: {type: Number, default: 0},
    timeBegin: {type: Number, default: 0},
    timeEnd: {type: Number, default: 0},
    callbackMaxCallTime: {type: Number, default: 180}, //默认3分钟

    //type=2 7时
    discount: {type: Number, default: 0}, //折扣率

    // 3. 发行账户信息(商家),默认是朱李叶
    sponsorName: {type: String, default: ''},//赞助商名字
    sponsorAvatar: {type: String, default: ''},//赞助商头像

    // 4. 绑定的账户信息
    boundUserId: {type: String, default: ''},//绑定用户的UUID
    boundUserName: {type: String, default: ''},//绑定用户的姓名
    boundUserPhoneNum: {type: String, default: ''},//绑定用户的手机号

    // 5. 使用规则???
    lowerThreshold: {type: Number, default: 0}, //使用的下限阀值，当交易额大于阀值时可以使用
    higherThreshold: Number,//使用的上限阀值，最多抵扣值
    //关联的order信息
    orderId:String, //对应的orderId

    //特定商家提供的代金券,有二维码信息
    boundVenderId: {type: String, default: ''}, //特定商家提供的代金券
    unionCode: {// 唯一编号, 自增序列,couponId-58d2355a69202f562cd0beae;注意此次类型为字符串,自增,直接加一;
      type: String,
      default: ''
    }, // 唯一编号
    qrCode: {type: String, default: ''}, // 二维码,“boundUserId ＋ boundVenderId ＋ couponId ＋ unionCode”,注意混淆
    cps: {type: Number, default: 0}, //生成优惠券时的cps
    memberships: [{
      membershipId: String, //会员卡id
      cost: Number, //抵扣会员额度
      cardNo: String
    }],
    shopProp: {type: Number, default: 0}, //商户运营类型,0-默认值,1-运营商户
    balance : Number, //剩余多少活动券 0524活动 id-591a979def5de8ed051bf26e
    from : {type: String, default: 'app'}, //app -app中获得
    lowestCost: {type: Number, default: 0} //最低消费,即满减
  },
  options: {
    collection: 'coupons'
  }
};

