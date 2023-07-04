/**
 *
 *  Customer
 *  患者基本信息
 *  Authors: Tom
 *  Created by Tom on on 5/20/15.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var
    mongodb = require('../configs/db'),
    StatisticsHelper = require('../../lib/StatisticsHelper'),
    Doctor = require('./Doctor'),
    Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;
var noteSchema = new Schema(
    {
        customerId: String,
        note: String,
        createdAt: {type: Number, default: Date.now},//创建时间
        updatedAt: {type: Number, default: Date.now}//最近的更新时间
    }
);
var fields = {
    loginPassword: String, //新增登录密码
    source: {type: String, default: 'docChat'},//首次数据来源: docChat-医聊注册 webFavorite-医聊下载网页关注注册(废弃了，通过from判断)、
                                                // blued-blued合作导流;    朱李叶相关：reg-正常注册; zly-原朱李叶注册账户迁移;
                                                // opc-运营导入 share-分享注册;zlyBoss-朱李叶健康boss评论账户管理
    from: {type: String, default: 'app'}, //来源：app-app注册、web-来源于网页(网页关注顾问)、dFreePhone-顾问免费电话、friendShare(邀请有奖)、
                                            // double12(双12活动)、webCall(网页电话)、sharePromotion(分享活动);
                                            //zlyBossComment-朱李叶健康boss评论账户管理，drugInvited-药品核销活动邀请用户、
                                            // zlyBossOrderImport-朱李叶健康boos订单导入, applet-小程序
    bossType : String, // boss 端type tagCodeUserGroup-渠道订单用户分组
    usedApp: [String],//使用过的app：docChat-医聊 zly-朱李叶
    accountType: {type: String, default: 'Official'},//账号类型：Official-正式账号; Temporary-临时账号
    phoneNum: String,//注册手机号码
    phoneType: {type: String, default: 'mobile'}, //号码类型,mobile-手机号|fixed-座机号
    sex: {type: String, default: ''},
    gender: Number, //性别字段 默认为-1 
    avatar: {type: String, default: ''},
    docChatNum: String,//热线号
    _docChatNum: String,//更改前的医聊号码
    name: {type: String, default: ''},//姓名
    mainPageTitle: {type: String, default: ''},//主页标题
    pinyinName: String,
    favoriteDocs: [String], //当前收藏医生的Id
    collectedDocs: [String], //所有收藏过的医生的Id（包括取消收藏的）
    pushId: String, // 绑定的第三方Push Server ID
    pushType: {type: String, default: 'jg'}, // 绑定的第三方Push Type : baidu、jg、mi
    deviceId: String, //设备id（最新一次登录时记录的）
    referrer: String, //介绍人id
    im: { // IM 用户
        userName: {type: String, default: '', index: true}, // 用户名
        pwd: {type: String, default: ''},       // 密码
        nickName: {type: String, default: ''},   // 昵称
        isSync: {type: Boolean, default: false}  // 是否已同步 IM
    },

    doctorRef: { // 关联的医生账户
        type: Schema.ObjectId,
        ref: 'Doctor'
    },
    payPwd: String,//支付密码  废弃
    payPassword: String,//支付密码 朱李叶健康余额支付使用
    callToken: String,
    accid: String,
    isAccidBlocked: {type: Boolean, default: false},//云信账号是否被屏蔽

    sid: String,//身份证号
    sidName: String,//身份证上姓名

    momentType: {type: String, default: '', enum: ['', 'pic']}, //动态类型,''-不需特别指明,pic-有图片无文字
    currentMoment: {type: String, default: ''}, //冗余展示给用户的动态信息,用户的最新动态,用户自己维护;用户自己发动态时,momentURL置空
    momentURL: [], //运营维护的字段,数据形式:[title + url]的字符串形式
    momentRef: {type: Schema.Types.ObjectId, ref: 'Moment'}, //动态详细信息
    momentUpdatedAt: {type: Number, default: 0}, //动态更新时间
    momentLocation: {
        type: [Number, Number], //发布动态而非转发动态时,定位的位置
        index: '2d', default: []
    },  //[longitude, latitude] // 经纬度


    // 屏蔽医生推送列表,doc._id,不收听列表中医生的动态,存储主账号id
    blockDocs: [String],
    // 黑名单列表,不接听列表中用户的电话,存储主账号id
    blackList: [String],
    // 对其他用户的备注
    userNotes: [noteSchema], //new
    invitedUsers: [{ //被邀请开通热线号的用户信息
        userId: String, //被邀请的用户的主账号ID
        latestInvitedAt: Number //最近一次被邀请的时间
    }],
    channelCode: String, //渠道号
    channelNum: {type: Number, default: 0}, //渠道数量
    profile: {type: String, default: ''},//个人简介
    lastestLoginTime: {type: Number, default: Date.now}, //上次登录时间
    jkLastestLoginTime: {type: Number, default: Date.now}, //朱李叶健康上次登录时间
    appInstalled: {type: Boolean, default: false},  //是否安装过app

    createdAt: {type: Number, default: Date.now},//用户注册时间
    updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
    isDeleted: {type: Boolean, default: false},//该条记录是否被删除
    statisticsUpdatedAt: {type: Number, default: Date.now},

    //查看过消息后,是否又有新消息
    hasNewMessage: {type: Boolean, default: false},
    isRedMoneyBlocked: {type: Boolean, default: false},// 是否能抢到红包
    canSearched: {type: Boolean, default: true}, //能否被搜索到
    msgReadStatus: {
        all: {type: Boolean, default: false}, //
        moment: {type: Boolean, default: false}, //是否有未读的动态
        personal: {type: Boolean, default: false}, //是否有未读的个人留言
        sys: {type: Boolean, default: false} //是否有未读的系统通知
    },
    occupation: {type: String, default: ''}, //新增:职业 //确定类型  医生 、 商家
    hospital: {type: String, default: ''},     //执业地点
    department: {type: String, default: ''},   //科室
    position: {type: String, default: ''},   //职称

    latestLoginVersion: {type: String, default: ''}, //最近一次登陆版本号
    leaveMsgUsers: [String], //留言的用户的主账号ID

    callBothType: {type: String, default: '', enum: ['', 'yuntongxun', 'feiyucloud']}, //双向回拨类型,为空是容联云, yuntongxun－容联云, feiyucloud-飞语云,
    //hasReceivedMsg: {type: Boolean, default: false} //是否已收到过留言
    frozen: {type: Boolean, default: false}, //new D->C: 是否冻结帐号，冻结后禁止接听电话呼入&不接到收藏奖励和短信

    //商家信息
    isVender: Boolean,//是否是一个商家
    isCouponVender: Boolean,//是否是一个优惠券商家
    couponDeductible: Number, //优惠券抵扣总额

    //自动离线 
    isAutoOffline: {type: Boolean, default: false}, //是否开启自动离线
    offlineBeginTime: {type: String, default: '22:00'}, //离线开始时间 
    offlineEndTime: {type: String, default: '08:00'}, //离线结束时间

    province: {type: String, default: ''},  //省
    city: {type: String, default: ''},  //市

    membership: { // 用户的会员相关信息
        balance: {type: Number, default: 0},//当前会员可用的消费福利
        cost: {type: Number, default: 0}, // 当前会员实际已经消耗掉的福利
        boughtNum: {type: Number, default: 0}, // 购买次数
        isFreeBalanceToken: {type: Boolean, default: false}, // 是否领取过免费额度，暂定100元
        isShareRewardReceived: {type: Boolean, default: false}, //是否领取过分享奖励
        isTriDayRewardReceived: {type: Boolean, default: false},//3天3夜活动通用券是否领取  对应 6元券和7元券
        isTriDayShareRewardReceived: {type: Boolean, default: false}//通过分享3天3夜活动通用券是否领取  对应 8元券
    },
    marketing: { // 用户的营销推广相关信息, 营销地区用city和regionPinyin
        balance: {type: Number, default: 0}, // 营销推广余额,当前账户未被使用的，实际消费时抵扣
        remainBalance: {type: Number, default: 0},// 营销推广余额扣除掉已经被预定了的，实际领券时抵扣
        checkinNum: {type: Number, default: 0}, // 商家实际收取了多少代金券

        // 注意充值时两个balance都应该增加
        remainMemberSize: {type: Number, default: 0},// 当前剩余的会员名额
        consumedMemberSize: {type: Number, default: 0},// 当前消耗掉的会员名额
        cps: {type: Number, default: 0}, //cost per sale

        lowestCost: {type: Number, default: -1}, //最低消费,即满减

        cpsUpdatedAt: {type: Number, default: Date.now},//cps修改时间

        isMarketingClosed: {type: Boolean, default: false}, //true-暂停推广, false-继续推广


    },
    //商家审核状态
    shopVenderApplyStatus: {type: Number, default: 0},//0-未申请 1-申请中 2-拒绝 3-通过 4-再次申请 5-再次拒绝
    //商家认证信息
    shopCity: String,//店铺城市
    shopName: String,//店铺名称
    shopAddress: String,//店铺地址
    shopAddressMapLon: Number,//经度
    shopAddressMapLat: Number,//纬度
    shopLocation: {type: [Number, Number], index: '2d', default: [0, 0]},  //[longitude, latitude] // 经纬度
    shopType: String,//店铺类型
    shopTypeIndex: String,//店铺类型
    shopSubType: String,//店铺子类型
    shopSubTypeIndex: String,//店铺子类型
    shopPhoneNum: String,//店铺电话号码
    shopAvatar: String,//商家头像
    shopLicense: String, //商家营业执照

    selectRegion: String, //用户在首页中选择的地区

    shopProp: {type: Number, default: 0}, //商户运营类型,0-默认值,1-运营商户
    shopCheckinNum: {type: Number, default: 0}, //统计普通商户和运营商户收券总数

    hasBoughtSenior: {type: Boolean, default: false}, //是否是第一次购买高级会员,第一次购买为1元,否则为298元

    vipMembershipPurchase: {//用户购买健康会员卡额度限制
        limit: Number,
        updatedAt: Number
    },

    thirdParty: {//第三方登录信息,wx-微信,qq-QQ , wb-微博
        // "wx" : {
        //     id : String,
        //     nickName : String,
        //     updatedAt: Number
        // },
        // "wb" : {
        //     id : String,
        //     nickName : String,
        //     updatedAt: Number
        // },
        // "qq" : {
        //     id : String,
        //     nickName : String,
        //     updatedAt: Number
        // }
    },
    tagGroup:{id:Number,title:String,updatedAt: Number},//标签组信息
    location:{province:String,city:String,updatedAt: Number},//存储用户的位置信息，province-省 ，city-市
    tagCode:String,//渠道管理码，用于预注册上的渠道添加
    storeChannel: String,//渠道名称

    //用户中心字段
    openId : String
};
var selectFields = "-payPwd -payPassword";
// 用户个人信息通用的字段
var commonFields = "-from -usedApp -accountType ";
//app需求字段
var frontEndFields = 'loginPassword payPwd payPassword phoneNum name pinyinName avatar sex docChatNum pushId pushType accid ' +
    'callToken isAccidBlocked sidName sid updatedAt createdAt favoriteDoc doctorRef mainPageTitle profile channelCode ' +
    'hasNewMessage canSearched msgReadStatus occupation hospital isAutoOffline offlineBeginTime offlineEndTime province city '
    + 'shopVenderApplyStatus selectRegion im.userName shopName shopAvatar location openId';
// 对外公开的信息字段
var publicFields = 'docChatNum name pinyinName avatar doctorRef sex mainPageTitle profile favoriteDocs currentMoment ' +
    'momentRef isVender isCouponVender isVenderExaminePassed ' +
    'shopVenderApplyStatus shopCity shopName shopAddress shopLocation shopType shopPhoneNum shopAvatar shopLicense ' +
    'shopSubType marketing shopProp im.userName momentURL location';

var listFields = 'avatar sex name pinyinName docChatNum currentMoment profile occupation hospital department position' +
    ' shopVenderApplyStatus shopAvatar shopName momentType location';
//(function () {
//  for (var fi in fields) {
//    selectFields += fi + " ";
//  }
//})();

var customerSchema = new Schema(fields, {
    collection: 'users'
});

mongoosePre(customerSchema, 'customer');
/*customerSchema.pre('count', function(){
 this._conditions.source = {$ne: 'zs'};
 console.log('customer count pre:', this._conditions);
 });
 customerSchema.pre('find', function(){
 this._conditions.source = {$ne: 'zs'};
 console.log('customer find pre:', this._conditions);
 });
 customerSchema.pre('findOne', function(){
 this._conditions.source = {$ne: 'zs'};
 console.log('customer findOne pre:', this._conditions);
 });
 customerSchema.pre('findOneAndRemove', function(){
 this._conditions.source = {$ne: 'zs'};
 console.log('customer findOneAndRemove pre:', this._conditions);
 });
 customerSchema.pre('findOneAndUpdate', function(){
 this._conditions.source = {$ne: 'zs'};
 console.log('customer findOneAndUpdate pre:', this._conditions);
 });
 customerSchema.pre('insertMany', function(){
 this._conditions.source = {$ne: 'zs'};
 console.log('customer insertMany pre:', this._conditions);
 });
 customerSchema.pre('update', function(){
 this._conditions.source = {$ne: 'zs'};
 console.log('customer update pre:', this._conditions);
 });*/

hookUpModel(customerSchema);
var Customer = mongodb.mongoose.model('User', customerSchema);
Customer.fields = fields;
Customer.selectFields = selectFields;
Customer.publicFields = publicFields;
Customer.frontEndFields = frontEndFields;
Customer.listFields = listFields;

module.exports = Customer;
