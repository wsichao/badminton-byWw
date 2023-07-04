var
    mongodb = require('../configs/db'),
    StatisticsHelper = require('../../lib/StatisticsHelper'),
    Customer = require('./Customer');
    Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;
var fields = {
    key: String, // 查询关键字,存储的是用户姓名
    keyType: {type: String, default: 'name', enum: ['name', 'occupation', 'hospital', 'department', 'position', 'shopName']}, //name-姓名, occupation-职业
    userCreatedAt: Number,
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now}
};
var searchSchema = new Schema(fields, {
    collection: 'searchs'
});

mongoosePre(searchSchema, 'search');

hookUpModel(searchSchema);
var Search = mongodb.mongoose.model('Search', searchSchema);
Search.fields = fields;
module.exports = Search;