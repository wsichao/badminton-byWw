/**
 * 预约医生订单表
 * Created by yichen on 2017/12/14.
 */


"use strict";
let
  mongodb = require('./../../configs/db'),
  Schema = mongodb.mongoose.Schema;

let makeAppointmentOrder = new Schema({
  createdAt: { type: Number, default: Date.now },//用户注册时间
  updatedAt: { type: Number, default: Date.now },//用户最近的更新时间
  isDeleted: { type: Boolean, default: false },//该条记录是否被删除
  statisticsUpdatedAt: { type: Number, default: Date.now },


  orderId: String, //订单号
  servicePackageOrderObjectId: Schema.ObjectId, // 服务包订单唯一标识
  wxorderId: String, //微信订单号
  servicePackageOrderId: String,//服务包订单号
  wxTimeStamp: Number, // 微信时间戳
  userId: Schema.ObjectId, //用户id
  userName: String, //用户姓名
  userPhoneNum: String, //用户电话
  doctorId: Schema.ObjectId, //服务包医生id
  doctorAvatar: String, //医生头像
  doctorName: String, //医生姓名
  doctorHospital: String, //医生所属医院
  doctorDepartment: String, //医生科室
  doctorJobTitle: String, //医生职称
  orderTime: Number,//预约时间
  address: String, //预约地址（非id）
  addressId: Schema.ObjectId,//出诊地址Id
  price: Number,//预约费用 实际数值*100  单位元
  status: { type: Number, enum: [100, 200, 300, 400, 600], default: 100 },//状态   100 未支付, 200支付成功,300取消订单,400预约完成，600订单过期
  from: { type: Number, enum: [1, 2], default: 1 }, //来源 ( 1:app用户  2:运营用户) 操作人员 区分不同人员 区分不同boss操作和app操作 预约成功可编辑/boss端新增预约才可取消(是否有前置要求)
  operatePhoneNum: String, //操作人员手机号
  operateAssistantId : Schema.ObjectId, //操作助理id

  isVerification: { type: Boolean, default: false },
  paidTime: { type: Number },//支付时间
  paidType: { type: String, enum: ['wechat', 'alipay', 'balance'] },//支付方式
  items: [String],//预约项目
  desc: String,//预约说明
  guidePic: [String]//检查单

}, {
    collection: 'makeAppointmentOrder'
  });

let MakeAppointmentOrder = mongodb.mongoose.model('MakeAppointmentOrder', makeAppointmentOrder);
module.exports = MakeAppointmentOrder;