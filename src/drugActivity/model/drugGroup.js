//药品分类管理
'use strict';
module.exports = {
    config: {
        name: String, 	//药品分类名称
        weight: Number,	//权重

        createdAt: {type: Number, default: Date.now},
        updatedAt: {type: Number, default: Date.now},
        isDeleted: {type: Boolean, default: false}
    },
    options: {
        collection: 'drugGroup'
    },
    methods: {
        getDrugAndGroupByCond: function (cond) {
            cond.isDeleted = false;
            return this.aggregate([{'$match': cond},
                {'$lookup': {from: 'drug', localField: '_id', foreignField: 'drugGroupId', as: 'drugInfo'}},
                {'$match': {'drugInfo.isDeleted': false}}, {'$sort': {weight: -1}}]).exec();
        }
    }
}