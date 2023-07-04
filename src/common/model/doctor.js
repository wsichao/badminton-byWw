/**
 * Created by fly on 2017－07－11.
 */
'use strict';

module.exports = {
  config: {
    pinyinName: String,
    applicationId : {type : String},//新增：用户修改信息处理id;
    profileModifyAppStatus:{type : Number,default: 0},//修改信息处理状态 0未修改 1审核中 -1审核失败
    lastPriceChgAt: {type:Number, default: 0},//最后一次更改callprice时间
    profile : {type : String},//个人简介
    occupation : {type : String , default: ''}, //新增:职业
    source: {type: String, default: 'docChat'},//数据来源:  docChat-医聊注册
    applyStatus: {type: String, default: 'done'}, //医生申请状态：handling-处理中 done-已完成  refused－已拒绝  repeated-重复了(已通过)
    phoneNum: String,//注册手机号码,必需
    docChatNum: {
      type: String//,
      //index: {unique: true}
    },//医聊号码
    realName: {type: String, default: ''},//真实姓名
    password: String, //TODO: removed?
    sex: {type: String, default: ''},
    avatar: String,
    bussinessCardNum: {type: Number, default: 0}, //已发名片数目
    pushId: String, // 绑定的第三方Push Server ID
    pushType: {type: String, default: 'jg'}, // 绑定的第三方Push Type : baidu、jg、mi

    frozen: {type: Boolean, default: false}, //@废弃，使用customer中的字段  是否冻结帐号，冻结后禁止接听电话呼入&提现
    seedDoctor: {type: Boolean, default: false},  //是否为种子医生
    double12Doctor: {type: Boolean, default: false},  //双12活动医生
    seedDoctorCouponUnlimited: {type: Boolean, default: false},  //患者使用种子医生优惠券联系医生无限制
    favoritedReward: {type: Boolean, default: false},  //被收藏是否可以获得奖励
    isOnline: {type: Boolean, default: true},//是否处于上班状态
    isOnlineOnLogout: {type: Boolean, default: true},//退出登录时处于的上班状态，再次登录时恢复这个状态
    message2Customer: String, // 医生展示的动态信息
    // customerNote: [customerNoteSchema],//对患者的备注
    offlineCallers: [String], //下线时打电话的患者电话
    busyCallers: [String],//通话中打电话的患者电话
    favoritedNum: {type: Number, default: 0}, //被患者收藏数
    scannedNum: {type: Number, default: 0}, //二维码被扫描次数
    sharedNum: {type: Number, default: 0}, //被分享次数
    downloadNum: {type: Number, default: 0}, //通过扫码下载数
    orderNum: {type: Number, default: 0}, //电话总数
    commentNum: {type: Number, default: 0}, // 评论次数
    zanNum: {type: Number, default: 0}, // 评论中点赞次数
    commentedTags: {type: Schema.Types.Mixed},//[commentTagSchema],// 已评论tag统计
    callPrice: {
      //_id: {type: Schema.ObjectId, unique: true},
      customerInitiateTime: {type: Number, default: 5}, //患者起步价包含时长，单位分钟
      doctorInitiateTime: {type: Number, default: 5}, //医生起步价包含时长,单位分钟
      initiatePayment: Number, //患者起步支出
      initiateIncome: Number, //医生起步收入
      paymentPerMin: Number, //患者起步时长后每分钟支出
      incomePerMin: Number, //医生起步时长后每分钟收入
      discount: {type: Number, default: 1},  //给患者的折扣 0~1之间
      canLackMoney: {type: Boolean, default: false}, //能否欠费
      lackedMoney: {type: Number, default: 0}, //欠费金额
    },

    callToken: String,
    accid: String,
    isAccidBlocked: {type: Boolean, default: false},//云信账号是否被屏蔽

    recommendConf: [{
      item: {type: String, default: ''}, // 推荐条目标识, bak-备用联系人列表; ass-服务助理; ad-合作广告
      isVisiable: {type: Boolean, default: true},// 是否显示该推荐条目
      // 首推信息
      disabled: {type: Boolean, default: false}, // 该条目的首推是否拒绝点击
      type: {type: String, default: ''}, // 该条目首推类型, doctor-顾问/医生; webview-网页地址; none-暂无
      title: {type: String, default: ''}, // 该条目首推标题/医生姓名
      docChatNum: {type: String, default: ''},  // type==doctor时,医疗号
      link: {type: String, default: ''},//type==webview时,链接
      // 更多信息
      more: {
        disabled: {type: Boolean, default: false}, // '更多'能否点击
        type: {type: String, default: ''}, // '更多'的类型, doctor_list-医生列表
        title: {type: String, default: ''}, // '更多'的标题
        url: {type: String, default: ''} // ‘更多’的数据来源
      }
    }],

    province: {type: String, default: ''},  //省
    city: {type: String, default: ''},  //市
    hospital: {type: String, default: ''},     //执业地点
    hospitalId: {type: String, default: ''},       //执业地点Id
    department: {type: String, default: ''},   //科室
    departmentId: {type: String, default: ''},     //科室Id
    position: {type: String, default: ''},   //职称

    latestOnLineNotifyAt: Number, //上一次该医生接收上线通知的时间
    managerName: String, //医生介绍人姓名(废弃)
    operatorName: String, //医生发展人姓名
    operatorId: String, //医生发展人ID(doctorId)
    operatorCreatedAt: {type: Number, default: Date.now},
    introducerName: String, //医生介绍人姓名
    introducerId: String, //医生介绍人ID(doctorId)

    systag: String, //身份标记：employee-公司员工，doctor-医生
    from: {type: String, default: ""}, //ucom-肿瘤联盟
    deviceId: String, //设备id（最新一次登录时记录的）
    lastestLoginTime: {type: Number, default: Date.now},
    latestFavoritedSMSTime: {type: Number, default: 0}, //最新收藏短信发送时间

    toVeryPhone: {type: Boolean, default: false}//账号是否迁移到专属热线
  },
  options: {
    collection: 'doctors'
  }
}