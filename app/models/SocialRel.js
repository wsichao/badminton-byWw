/**
 *  sns_relation
 *
 *  社交关系(区别与商业关系)
 *    － 粉丝/关注
 *    － 备注名
 *    － 拉黑
 *
 */
var
  mongodb = require('../configs/db'),
  StatisticsHelper = require('../../lib/StatisticsHelper'),
  Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;
var fields = {
  user: {type: Schema.Types.ObjectId, ref: 'User'}, //主用户
  userDoctorRef: {type: Schema.Types.ObjectId, ref: 'Doctor'}, //主用户副账号
  userDocChatNum: String,

  relUser: {type: Schema.Types.ObjectId, ref: 'User'}, // 相关的用户
  relUserDoctorRef: {type: Schema.Types.ObjectId, ref: 'User'}, // 相关的用户副账号
  relUserDocChatNum: String,

  isRelUserFavorite: {type: Boolean, default: false}, //user是否收藏了relUser
  isRelUserBlocked: {type: Boolean, default: false}, //收藏用户后,是否屏蔽其动态
  theTrueRelCreatedAt: {type: Number, default: 0}, //关系确定的时间
  isRelUserBlacked: {type: Boolean, default: false}, //relUser是否被user拉黑,是否屏蔽其电话
  isUserBlacked: {type: Boolean, default: false}, //user是否被relUser拉黑

  noteInfo: { //对relUser的备注信息
    noteName: {type: String, default: ''}, //备注的姓名
    desc: {type: String, default: ''}, //对relUser的描述
    pics: [String] //相关图片
  },
  notedName: {type: String, default: ''}, //relUser对user的备注姓名
  from:String,//关注来源，健康号使用（doctor-医生号 factory-厂家号）
  createdAt: {type: Number, default: Date.now},//用户注册时间
  updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
  isDeleted: {type: Boolean, default: false},//该条记录是否被删除
  statisticsUpdatedAt: {type: Number, default: Date.now}
};



var socialRelSchema = new Schema(fields, {
  collection: 'socialRels'
});

mongoosePre(socialRelSchema, 'socialRel');

hookUpModel(socialRelSchema);
var SocialRel = mongodb.mongoose.model('SocialRel', socialRelSchema);
SocialRel.fields = fields;
module.exports = SocialRel;
