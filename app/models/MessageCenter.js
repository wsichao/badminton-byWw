/**
 * Created by lijinxia on 2017/10/16.
 */
var
    mongodb = require('../configs/db'),
    StatisticsHelper = require('../../lib/StatisticsHelper'),
    // Customer = require('./Customer'),
    // N = require('./Notification'),
    Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;

var fields = {
    user: {type: Schema.Types.ObjectId, ref: 'User'}, //收到通知用户主账号ID
    notification : {type: Schema.Types.ObjectId, ref: 'Notification'}, //通知表中的消息ID

    isViewed: {type: Boolean, default: false}, //是否被查看
    userDeleted: {type: Boolean, default: false},//用户删除

    type: String, //type:1-消息通知   2-文章推送 3-商品推送 4-搜索推送（1-商品类  2-文章类） 5-药品补贴
                    // 6-提现进度 7-专属医生进度 8-收藏药品变动 9-boss充值
    subType: String,//（1-商品类  2-文章类;
                    // type == 5 ： 1-药品补贴审核通过  2-药品补贴审核失败；
                    // type == 6 1-提现成功  2-提现失败）
                    // type == 7 1-审核通过 2-审核未通过 3-退款成功
                    // type == 8 1-上涨 2-下降 3-下架
                    // type == 9
    title: String, //消息的标题
    content: String, //消息的内容
    link: String, //消息的链接（type:1时才可能存在）
    images: [String], //图片地址
    messageRef:Schema.ObjectId,//订单ID，用于跳转到"账单明细"和"补贴详情"

    isDeleted: {type: Boolean, default: false},//标记删除
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now},
    statisticsUpdatedAt: {type: Number, default: Date.now}
};
var messageCenterSchema = new Schema(fields, {
    collection: 'messageCenter'
});

mongoosePre(messageCenterSchema, 'messageCenter');

hookUpModel(messageCenterSchema);
var MessageCenter = mongodb.mongoose.model('messageCenter', messageCenterSchema);
MessageCenter.fields = fields;
MessageCenter.publicFields = Object.keys(fields).join(' ');
module.exports = MessageCenter;