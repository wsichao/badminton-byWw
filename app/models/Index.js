/**
 *  索引表  地区、医院、科室信息
 *
 *  zlycare-web
 *  Created by Jacky.L on 1/13/15.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */

var
  mongodb = require('../configs/db'),
  Schema = mongodb.mongoose.Schema;

var indexSchema = new Schema({

  // 基本属性
  type: {type: Number, default: 0},
  //数据类型: 1 - 地区 2 - 医院 3 - 科室  4 - 疾病大科室 5 - 疾病小科室 6 - 疾病
  source: {type: String, default: 'bd'},//数据来源hdf - 来源好大夫, 默认bd - 商务发展

  createdAt: {type: Number, default: Date.now},//用户注册时间
  updatedAt: {type: Number, default: Date.now},//用户最近的更新时间
  isDeleted: {type: Boolean, default: false},//该条记录是否被删除

  //通用
  hdfId: String, //(医院/科室)内部编号
  key: {type: String, unique: true},  //hdf索引键key
  name:{type: String, default:"" },   //
  namePinYin:{type: String, default:"" },   //
  pinYinName: String,      // 名字的拼音
  description: String,     //描述信息
  sort: Number,            //重点科室排序
  isMain: {type:Boolean , default:false},//是否为重点科室
  iosImageUrl: String,     //ios image url
  androidImageUrl: String, //android image url
  icon: String,   // 二级科室图标

  // 医院属性
  provinceId: String,   //省市uuid -->
  provinceName: String, //医院所属省市
  district: String,     //地区名,例如: 海淀区
  districtId: String,
  districtName: String,
  grade: Number,        //医院评级:  6-三级甲等; 5-三级; 4-二级甲等; 3-二级; 2-一级甲等; 1-一级; 0-未评定等级医院;
  featuredFaculties: String,//医院特色: 综合、神经外科
  gps: [],//GPS //index_0:经度,index_1:纬度

  //科室属性
  hospitalId: String,//医院uuid
  hospitalName: String, //医院名称
  category: String,    //科室所属类别:妇儿、内科、外科、其他
  order: Number,       //医院内科室排序编号

  //疾病一级科室 关系信息，供二级科室查询用
  facultyId: String,//一级疾病索引uuid
  facultyKey: String, //一级疾病索引键
  facultyName: String,//一级疾病科室名

  //疾病二级科室 关系信息，供疾病查询用
  subFacultyId: {type:String, default: ""},//二级科室索引Id
  subFacultyName: {type:String, default: ""},//二级科室索引名

  //疾病
  brief: String,//简介

  doctorCount: Number,//(医院/科室)医生数量
  caseDoctorCount: Number,//(医院/科室)医生接诊数量
  bookingDoctorCount: Number//(医院/科室)预约医生数量

},{
  collection: 'indexes'
});

var Index = mongodb.mongoose.model('Index', indexSchema);

module.exports = Index;