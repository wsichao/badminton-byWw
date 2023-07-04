/**
 * Created by lijinxia on 2017/9/5.
 */
var
    mongodb = require('../configs/db'),
    Schema = mongodb.mongoose.Schema,
    StatisticsHelper = require('../../lib/StatisticsHelper');
var hookUpModel = StatisticsHelper.hookUpModel;
var productCatalogSchema = new Schema({

    // 基本属性
    vipType: {type: String, enum: ['zlycare', 'zlycare_vip']}, //zlycare-高级会员;zlycare_vip-vip会员
    parentId: String, //上一层目录id
    parentIds: String, //长辈目录id, 用;隔开
    image:String,//图片
    name: {type: String, default: ''}, //目录名称
    icon: {type: String, default: ''}, //目录图标
    sort: Number, //目录权重
    show: {type: Number, enum: [0, 1]}, //是否显示,0-不显示;1-显示
    createdAt: {type: Number, default: Date.now},      //新建时间
    isDeleted: {type: Boolean, default: false},//该条记录是否被删除

}, {
    collection: 'productCatalog'
});

hookUpModel(productCatalogSchema);
var ProductCatalog = mongodb.mongoose.model('productCatalog', productCatalogSchema);

module.exports = ProductCatalog;
