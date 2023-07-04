//用户收藏中心
module.exports = {
    config: {
        user: Backend.Schema.Types.ObjectId, //收藏用户ID
        type:String,//1-药品收藏
        planId:Backend.Schema.Types.ObjectId,//会员维护计划ID
        drugId:Backend.Schema.Types.ObjectId,//药品ID
        collectedAt:{type: Number, default: Date.now},//收藏时间
        isCollected: {type: Boolean, default: true},//是否被收藏，true-已收藏，false-未收藏
        isSaled:{type:Boolean,default:true},//是否可补贴；true-是，false-否

        isDeleted: {type: Boolean, default: false},//
        createdAt: {type: Number, default: Date.now},//
        updatedAt: {type: Number, default: Date.now},
        statisticsUpdatedAt: {type: Number, default: Date.now}
    },
    options:{
        collection: 'collectionCenter'
    },
    methods:{
    }
}