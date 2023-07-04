/**
 * 同仁订单数据
 */

var
  mongodb = require('../../app/configs/db'),
  Schema = mongodb.mongoose.Schema;

var fields = {
  reportType: String,//tongrenaibi, zlyapp,
  //患者信息
  sid: String,                //身份证号
  customerName: String,       //患者姓名
  customerSex: String,        //患者性别
  customerPhone: String,      //患者联系方式

  reportSelf: {type:String, default:""},         //患者添加本人症状
  //selfCreatedAt: Number,      //患者添加本人症状创建时间
  //selfUpdatedAt: Number,      //患者添加本人症状更新时间
  customerImgs: [String],             //患者上传图片

  //医生信息
  orderNum: Number,           //就诊序号
  doctorId: String,           //医生ID
  doctorName: String,         //就诊医生姓名
  imgs: [String],             //医生上传图片
  doctorReport: String,       //医生为患者添加症状
  hospitalId:String,          //医院ID
  hospitalName: String,       //医院名字
  symptom:{},                 //症状//zhengzhuang: {}, 医生添加
  diagnosis:{},               //诊断 //zhenduan: {},   医生添加
  checkResult:{},             //检查结果//jianchajieguo: {},
  medicine:{},                //处方药物//chufangyaowu: {},
  surgery:{},                 //手术情况 //shoushuqingkuang: {},
  prevTreatment:{},           //既往治疗//jiwangzhiliao: {},
  curMedHistory:{},           //现病史 //xianbingshi: {},
  prevMedHistory:{},          //既往病史 //jiwangbingshi: {},
  bodyCheck:{},               //查体//chati: {},
  medicalOrders:{},           //医嘱//yizhu: {},
  docCreatedAt: Number,      //医生为患者添加症状创建时间
  docUpdatedAt: Number,       //医生为患者添加症状更新时间

  channelId:{type: String, default: "1"},
  //顾问信息
  brokerId: String,           //顾问ID
  brokerAvatar: String,       //顾问头像
  //zly信息
  //zlyRecord: [ZlyRecord],
  //zlyName: String,            //zly录入人姓名
  //reportZly: String,          //zly 或顾问添加患者症状
  //zlyImgs: [String],          //zly上传图片
  //zlyCreatedAt: Number,       //zly为患者添加症状创建时间
  //zlyUpdatedAt: Number,       //zly为患者添加症状更新时间
  //zlyTest:{type:Schema.Types.Mixed , ref: ZlyRecord},

  recordName: String,         //录入人姓名

  createdAt: {type: Number, default: Date.now},//
  updatedAt: {type: Number, default: Date.now},//
  isDeleted: {type: Boolean, default: false},//
  status: {type: Number, default: 0},

  version: {type: Number},
  lock: {type: Number}

};


var selectFields = "";
(function(){
  for(var fi in fields){
    selectFields+= fi+" ";
  }
})();

var ReportSchema = new Schema(fields, {
  collection: 'reports'
});

var Report = mongodb.mongoose.model('Report', ReportSchema);
Report.fields = fields;
Report.selectFields = selectFields;
module.exports = Report;