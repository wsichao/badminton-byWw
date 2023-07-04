/**
 *
 * 服务包 - 医生 关系
 *
 * Created by yichen on 2017/12/12.
 */


"use strict";
var
  mongodb = require('./../../configs/db'),
  Schema = mongodb.mongoose.Schema;

let servicePackageDoctorRef = new Schema({
  createdAt: {type: Number, default: Date.now},//用户注册时间
  updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
  isDeleted: {type: Boolean, default: false},//该条记录是否被删除
  statisticsUpdatedAt: {type: Number, default: Date.now},


  doctorId: Schema.ObjectId, //医生id
  serviceId: Schema.ObjectId, //服务包id
  vipPrice: Number, //会员价 实际数值*100   单位元
  vipNum: Number, //会员名额
  orderPrice: Number, //实付金额

  vipDiscountsPrice : Number, //会员优惠金额
  type : {type : String}, // 类别  产科、零级、其他
  desc : String ,//服务描述

  serviceType : String, //服务类型 "once"、"upgrade"、"zs" ；单次服务、升级包、专属医生

  isShow : Boolean, //上架下架状态 true 上架 false 下架 (实隐藏展示，非真实上下架)
  packageType : Number, // 服务类型 100:专属医生、200:升级包、300:单次服务
  sortWeight : Number, // 排序权重 0~N对应从下到上（数值越小，排序靠下；会有多个0出现）

}, {
  collection: 'servicePackageDoctorRef'
});

let ServicePackageDoctorRef = mongodb.mongoose.model('ServicePackageDoctorRef', servicePackageDoctorRef);
module.exports = ServicePackageDoctorRef;