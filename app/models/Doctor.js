/**
 * 医生信息
 * @type {exports}
 */
var
  mongodb = require('../configs/db'),
  PriceSchema = require('./PriceSchema'),
  Moment = require('./Moment'),
  StatisticsHelper = require('../../lib/StatisticsHelper'),
  Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;

var customerNoteSchema = new Schema(
  {
    customerId: String,
    note: String,
    createdAt: {type: Number, default: Date.now},//创建时间
    updatedAt: {type: Number, default: Date.now}//最近的更新时间
  }
);
var commentTagSchema = new Schema(
  {
    tag: String,
    num: Number
  }
);
var tagSchema = new Schema(
  {
    tag: String,
    num: Number
  }
);
var CONS = {
  RECMND_TYPE: {
    DOC: "doctor",
    WEB: "webview",
    NONE: "none"
  },
  RECMND_ITEM: {// 推荐条目 / 推荐主题 
    BAK: "bak",
    ASS: "ass",
    AD: "ad"
  },
  RECMND_MORE_TYPE: {
    DOC_LIST: "doctor_list"
  }
};
var recommendSchema = new Schema({
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
});

var fields = {
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
  callPrice: {type: Schema.Types.Mixed, ref: PriceSchema},

  callToken: String,
  accid: String,
  isAccidBlocked: {type: Boolean, default: false},//云信账号是否被屏蔽

  recommendConf: [recommendSchema],

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
    jkLastestLoginTime: {type: Number, default: Date.now}, //朱李叶健康上次登录时间
  latestFavoritedSMSTime: {type: Number, default: 0}, //最新收藏短信发送时间
  createdAt: {type: Number, default: Date.now},//用户注册时间
  updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
  isDeleted: {type: Boolean, default: false},//该条记录是否被删除
  statisticsUpdatedAt: {type: Number, default: Date.now},

  toVeryPhone: {type: Boolean, default: false}//账号是否迁移到专属热线
};
var selectFields = "-phoneNum -password";//TODO: removed?
// 用户个人信息通用的字段
var commonFields = "-phoneNum -password";
var frontEndFields = 'hospital department city province  position zanNum commentNum favoritedNum isOnline occupation lastPriceChgAt from isDeleted callPrice message2Customer toVeryPhone';
// 对外公开的信息字段
var publicFields = "docChatNum realName pinyinName sex avatar occupation callPrice province city hospital hospitalId department departmentId position favoritedNum commentNum zanNum isOnline from message2Customer isDeleted recommendConf toVeryPhone";
var docSelectFields = "-password";
//(function () {
//  for (var fi in fields) {
//    selectFields += fi + " ";
//  }
//})();
var doctorSchema = new Schema(fields, {
  collection: 'doctors'
});
//创建doctor时,生成search
//doctorSchema.post('save', function(doctor){
//  var Customer = require('./Customer');
//  Customer.findOne({phoneNum: this.phoneNum},'_id name createdAt').exec()
//      .then(function(customer){
//        if(!customer.name || (!/^7/.test(doctor.docChatNum))){
//          return;
//        }
//        var SearchService = require('../services/SearchService');
//        SearchService.createSearch(customer);
//      });
//});
mongoosePre(doctorSchema, 'doctor');

hookUpModel(doctorSchema);
var Doctor = mongodb.mongoose.model('Doctor', doctorSchema);
Doctor.fields = fields;
Doctor.selectFields = selectFields;
Doctor.publicFields = publicFields;
Doctor.docSelectFields = docSelectFields;
Doctor.frontEndFields = frontEndFields;
Doctor.CONS = CONS;

module.exports = Doctor;
