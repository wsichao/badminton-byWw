/**
 * Created by lijinxia on 2017/9/7.
 */
var
    mongodb = require('../configs/db'),
    Schema = mongodb.mongoose.Schema;


var DynamicSampleSchema = new Schema({
    source: {type: String, default: 'docChat'},
    userId: {type: String}, // 用户id
    type: {type: Number, default: 0},// [{ 0 : 动态 , 1 : 朱丽叶健康, 2: 购买 }]
    targetId: {type: String},
    action: {type: Number}, // [ { 0 : 查看 , 1 : 点赞 ,2 : 评论 ,3 : 转发 , 4: 购买成功 5: 购买失败 }  ]
    tags: [],
    createdAt: {type: Number, default: Date.now},      //新建时间
    isDeleted: {type: Boolean, default: false},//该条记录是否被删除
}, {
    collection: 'dynamic_sample'
});

var DynamicSample = mongodb.mongoose.model('dynamic_sample', DynamicSampleSchema);

module.exports = DynamicSample;