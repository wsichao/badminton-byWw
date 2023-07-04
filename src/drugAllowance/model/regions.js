'use strict';
module.exports = {
    config: {
        areaId: {type: String},
        name: {type: String},
        type: {type: Number, default: 0},//数据类型: 1-省直辖市 2-地级市或者区 3-县
        parentId: {type: Backend.Schema.Types.ObjectId},

        createdAt: {type: Number, default: Date.now},
        updatedAt: {type: Number, default: Date.now},
        isDeleted: {type: Boolean, default: false},

        hospitalNum: {type: Number, default: 0}
    },
    options: {
        collection: 'regions'
    },
    methods: {
        getCommentByCond(cond) {
            cond.isDeleted = false;
            return this.find(cond);
        }
    }
}