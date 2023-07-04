/**
 *
 *  DocChat-backend
 *  Authors: Jacky.L;
 *  Created by Jacky.L on 10/21/16.
 *  Copyright (c) 2014 ZLYCare. All rights reserved.
 */
var
  mongodb = require('../configs/db'),
  Schema = mongodb.mongoose.Schema;


var BannerSchema = new Schema({

  // 基本属性
  targetGrp: [String], // 目标用户群体，不存在或者为空 则默认所有用户可见; 否则根据用户所在分组可见;
  source: Number,
  // 1- 会诊 , 2- 服务 3-医生 4-普通页面 5-24热线
  type: {type: Number, default: 0},
  //数据类型:
  // 1-广告 2-会诊类型 3-首页运营活动类型 4-医生端 首页运营活动 banner
  // 5-24热线广告
  createdAt: {type: Number, default: Date.now},//
  updatedAt: {type: Number, default: Date.now},//
  isDeleted: {type: Boolean, default: false},//  是否被删除、禁用
  alertTimeInterval: Number,// 提示时间间隔 timstamp

  // Settings 设置
  supportMinVer: String, // 该条banner支持的最小版本号
  supportMaxVer: String, // 该条banner支持的最大版本号
  needBrokerAuth: Boolean, // 是否开通24热线账号

  commercialID: String,                       //source代表的ID
  commercialName: {type: String, default: ''},//名称-title
  commercialImg: {type: String, default: ''},       //小图
  commercialLargeImg: {type: String, default: ''},  //大图
  commercialLink: {type: String, default: ''},      //链接-h5 页面、跳转位置
  commercialLinkType: {type: Number, default: 0}, // 新增 h5页面type 对应不同webView 页面于native交互用
  //0-默认webView 1-会员额度支付 2-外部页面（返回按钮可点击）
  commercialLinkNeedId: {type: Boolean, default: false},//当前连接是否需要拼接用户身份信息
  commercialContent: {type: String, default: ''},   //描述

  /////////////////////Params for ZLY app/////////////////////
  activityId: String,                              //活动Id －－ source代表的ID
  activityTitle: String,                            //活动标题
  activityContent: String,                          //活动描述
  activityImg: String,                              //活动图片
  activityLink: String,                             //活动链接
  activitySort: Number,                             //活动显示顺序
  notice: String,                                   //活动提示
  guide: String,                                    //引导内容  具体文案的拼接

  isShare: {type: Boolean, default: false},   //是否需要分享
  shareTitle: {type: String, default: ''},  //分享的标题，如果isShare为true则该字段必填
  shareImg: {type: String, default: ''},    //分享的图片
  shareDesc: {type: String, default: ''},   //分享的描述，如果isShare为true则该字段必填
  shareLink: {type: String, default: ''},   //分享的链接，如果isShare为true则该字段必填

  startTime: {type: Number, default: Date.now},
  endTime: {type: Number, default: Date.now},
  money: {type: Number, default: 0},
  bannerButton: {type: Boolean, default: false},//是否需要在banner显示按钮
  version: {type: Number, default: 0}, //版本号，默认1，
  //activity: [ActivitySchema],
  sortNum: Number,
  zlyDept: {    // 对应唯一二级科室id
    zlyDeptGrpId: String,   // 朱李叶二级科室分组ID
    zlyDeptGrpName: String, // 朱李叶二级科室分组名称
    zlyDeptId: String,      // 朱李叶二级科室ID
    zlyDeptName: String,    // 朱李叶二级科室名称
  },
}, {
  collection: 'commercials'
});

var Banner = mongodb.mongoose.model('commercials', BannerSchema);

module.exports = Banner;