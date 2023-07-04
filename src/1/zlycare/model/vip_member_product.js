/**
 * Created by fly on 2017－06－24.
 */
/**
 * Created by fly on 2017－05－22.
 */
'use strict';
module.exports = {
  config: {
    vipType: {type: String, default: 'zlycare', enum: ['zlycare', 'zlycare_vip'], index: true}, //zlycare-高级会员;zlycare_vip-VIP会员
    type: {type: String, default: ''}, //大分类,eg: 体检 新技术 药品 医疗服务 海外医疗等
    subType: {type: String, default: ''}, //子分类, eg: 药品下,感冒发烧|咳嗽用药等
    productName: {type: String}, //服务项目中的某一产品名称
    productDetail: {type: String, default: ''}, //产品详情
    productPics: [], //相关图片
    marketingPrice: {type: Number, default: 0}, //市场价
    realPrice: {type: Number, default: 0}, //实际报销价

    servicePeopleId: {type: String, default: ''}, //服务对接人id
    servicePeopleCall: {type: String, default: ''}, //服务对接人的联系电话
    servicePeopleName: {type: String, default: ''}, //服务对接人的姓名
    servicePeopleDocChatNum: {type: String, default: ''}, //服务对接人的热线号
    servicePeopleImUserName: {type: String, default: ''}, //服务对接人的im userName

    zlyPeopleId: {type: String, default: ''}, //zly对接人id
    zlyPeopleCall: {type: String, default: ''}, //zly对接人的联系电话
    zlyPeopleName: {type: String, default: ''}, //zly对接人的姓名
    zlyPeopleChatNum: {type: String, default: ''}, //zly对接人的热线号

    zlyChannelPrice: Number, //朱丽叶渠道价
    productDescription: {type: String, default: ''}, //一句话描述

    productCompanyName: {type: String, default: ''}, //厂家名称
    broker: {type: String, default: ''}, //厂家对接人
    brokerPhone: {type: String, default: ''}, //厂家对接人联系方式

    creator: {type: String, default: ''}, //提交人

    status: {type: Number, default: 0}, //审核状态 0-默认值,未处理;1-审核通过;-1-审核不通过;
    reason: {type: String, default: ''}, //拒绝原因
    online: {type: Number, default: 0}, //是否上线 0-不上线;1-上线

    thirdType: {type: String, default: ''}, //第三层目录类型id
    productSalesArea: [], //提供服务的地区
  },
  options: {
    collection: 'vipMemberProducts'
  }
}