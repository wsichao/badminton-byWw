/**
 *
 * 专属会员服务医生
 *
 */


"use strict";
module.exports = {
  config: {
    createdAt: { type: Number, default: Date.now },//用户注册时间
    updatedAt: { type: Number, default: Date.now },//用户最近的更新时间
    isDeleted: { type: Boolean, default: false },//该条记录是否被删除
    statisticsUpdatedAt: { type: Number, default: Date.now },


    name: { type: String, default: '' }, //名字
    gender: { type: String, default: '' }, //性别
    avatar: { type: String, default: '' }, //头像
    phone: { type: String, default: '' }, //医
    title: { type: String, default: '' }, //职称
    preSalesPhone: String, //售前电话
    speciality: String, //擅长
    desc: String, //简介
    remark: String, //简介
    provinceId: Schema.ObjectId,//省id
    province: { type: String, default: '' },//省名称
    cityId: Schema.ObjectId,//市id
    city: { type: String, default: '' },//市名称
    townId: Schema.ObjectId,//县id
    town: { type: String, default: '' },//县名称
    hospitalId: Schema.ObjectId, //医院id
    hospital: { type: String, default: '' },//医院名称
    department: { type: String, default: '' }, //科室
    businessId: Schema.ObjectId,//业务负责人Id
    businessName: { type: String, default: '' },//业务负责人
    businessDevelopmentId: Schema.ObjectId,//BD人员Id
    businessDevelopmentName: { type: String, default: '' },//BD人员
    assistantId: Schema.ObjectId,//助理Id
    assistantName: { type: String, default: '' }//助理
  }, options: {
    collection: 'mcDoctor'
  }
}