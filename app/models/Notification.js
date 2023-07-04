/**
 * Created by lijinxia on 2017/10/16.
 */
var
    mongodb = require('../configs/db'),
    StatisticsHelper = require('../../lib/StatisticsHelper'),
    Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;


var fields = {
    type: String, //type:1-消息通知   2-文章推送 3-商品推送 4-搜索推送  （）
    subType: String,//1-商品类  2-文章类
    subTag: String,//搜索标签，如：发烧、感冒
    pageId: String,//文章ID
    productId: String,//商品ID
    title: String, //消息的标题
    content: String, //消息的内容
    pics: [String], //图片地址
    link: String, //消息的链接
    isSend: {type: Boolean, default: false}, //是否已推送
    area: [String],//推送地区
    tagWeight: [{title: String, value: Number, updatedAt: {type: Number, default: Date.now}}],//标签组
    tagCode:[String],//推送的渠道码

    isDeleted: {type: Boolean, default: false},
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now},
    statisticsUpdatedAt: {type: Number, default: Date.now}
};
var notificationSchema = new Schema(fields, {
    collection: 'notification'
});

mongoosePre(notificationSchema, 'notification');

hookUpModel(notificationSchema);
var Notification = mongodb.mongoose.model('Notification', notificationSchema);
Notification.fields = fields;
Notification.publicFields = Object.keys(fields).join(' ');
module.exports = Notification;