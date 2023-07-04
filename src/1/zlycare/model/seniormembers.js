/**
 * Created by fly on 2017－05－22.
 */
'use strict';
module.exports = {
  config: {
    type: Number,
    typeName: {type: String}, //服务项目
    productName: {type: String}, //服务项目中的某一产品名称
    productDetail: {type: String, default: ''}, //产品详情
    productPics: [], //相关图片
    servicePeopleId: {type: String, default: ''}, //服务对接人id
    servicePeopleCall: {type: String, default: ''}, //服务对接人的联系电话
    servicePeopleName: {type: String, default: ''}, //服务对接人的姓名
    zlyPeopleId: {type: String, default: ''}, //zly对接人id
    zlyPeopleCall: {type: String, default: ''}, //zly对接人的联系电话
    zlyPeopleName: {type: String, default: ''}, //zly对接人的姓名
    zlyPeopleChatNum: {type: String, default: ''}, //zly对接人的热线号
    createdAt: {type: Number, default: Date.now},//
    updatedAt: {type: Number, default: Date.now},//
    isDeleted: {type: Boolean, default: false},//
    statisticsUpdatedAt: {type: Number, default: Date.now}
  },
  options: {
    collection: 'seniormembers'
  }
}