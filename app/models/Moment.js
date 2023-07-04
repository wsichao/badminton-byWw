var
    mongodb = require('../configs/db'),
    StatisticsHelper = require('../../lib/StatisticsHelper'),
    User = require('./Customer'),
    Hongbao= require('./Hongbao'),
    Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;
var fields = {
    type: {type: String, default: ''}, //商户-shop,医疗-medical,金融-finance,个人-personal
    userId: String, //发表动态用户主账号ID
    userRefId: String, //发表动态用户副账号ID
    userName: String,//发表动态用户的userName
    userDocChatNum: String, //发表动态用户的热线号
    userCity: String, //发表动态用户所在地区

    originalContent: {type: String, default: ''},//源内容,private
    displayContent: {type: String, default: ''},//连接转换后的要显示的内容
    momentURL: [], //运营维护的字段,数据形式:
    pics: [String],
    isOriginal: {type: Boolean, default: true}, //是否首发

    //首发人信息
    originalUser: {
        userId: String,
        userName: String,
        docChatNum: String,
        userCity:String,
        moment: {type: Schema.Types.ObjectId, ref: 'Moment'}, //该动态为转发时,被转发的动态id
    },
    //
    viewedCount: {type: Number, default: 0},
    commentCount : {type:Number,default: 0}, //评论数
    zanCount: {type: Number, default: 0},
    zanUsers: [String],//点赞人主账号ID
    sharedCount: {type: Number, default: 0},
    sharedUsers: [{
        userId: String,
        sharedType: {type:String , default: 'inner',
            enum: ['inner', 'wxShareTimeLine', 'wxChat']}, // inner: 内部转发, wxShareTimeLine: 微信朋友圈, wxChat:微信聊天
        createdAt: {type: Number, default: Date.now},
    }],//转发人主账号ID

    hongbao: {type: Schema.Types.ObjectId, ref: 'Hongbao'}, //绑定的红包
    hongbaoTotalCount: Number, //红包总数
    hongbaoTotalValue: Number, //红包总金额

    //被推荐人
    recommendedUser: {type: Schema.Types.ObjectId, ref: 'User'},

    //单张图片尺寸
    singlePicWidth:Number,
    singlePicHeight:Number,
    //发布动态而非转发动态时,定位的位置
    location: {type: [Number,Number], index: '2d', default: []},  //[longitude, latitude] // 经纬度
    //商户发布动态,没有指定动态位置信息,纪录发布该动态的店铺位置
    shopLocation: {type: [Number,Number], index: '2d', default: []},  //[longitude, latitude] // 经纬度

    //动态标签
    tags : [String],

    isDeleted: {type: Boolean, default: false},
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now},
    statisticsUpdatedAt: {type: Number, default: Date.now}
};
var momentSchema = new Schema(fields, {
    collection: 'moments'
});

mongoosePre(momentSchema, 'moment');

hookUpModel(momentSchema);
var Moment = mongodb.mongoose.model('Moment', momentSchema);
Moment.fields = fields;
Moment.publicFields = 'displayContent viewedCount zanCount sharedCount isOriginal originalUser pics ' +
    'zanUsers hongbaoTotalCount createdAt recommendedUser originalContent singlePicWidth singlePicHeight momentURL location commentCount';
Moment.limitFields = 'viewedCount zanCount sharedCount isOriginal originalUser pics zanUsers hongbaoTotalCount';
module.exports = Moment;

