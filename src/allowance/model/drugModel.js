
module.exports = {
    config: {
        factoryCode:Number, //厂家ID
        factoryName:String,//厂家名称
        name:String,//药品名称
        images:[String],//药品图片
        packageInfo:String,//包装规格
        desc:String,//功能简介
        barCode:String,//条形码编号
        drugGroupId:Backend.Schema.Types.ObjectId,//药品分类ID

        isDeleted: {type: Boolean, default: false},//标记删除
        createdAt: {type: Number, default: Date.now},
        updatedAt: {type: Number, default: Date.now},
        statisticsUpdatedAt: {type: Number, default: Date.now}
    },
    options:{
        collection: 'drug'
    },
    methods:{

    }
}