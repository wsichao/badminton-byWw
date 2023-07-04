/**
 * Created by guoyichen on 2017/2/13.
 */
var
    mongodb = require('../configs/db'),
    StatisticsHelper = require('../../lib/StatisticsHelper'),
    Customer = require('./Customer'),
    Moment = require('./Moment'),
    Hongbao = require('./Hongbao'),
    Schema = mongodb.mongoose.Schema;

var hookUpModel = StatisticsHelper.hookUpModel;
var fields = {
    userId: {type: Schema.Types.ObjectId, ref: 'User'}, //收到通知用户主账号ID

    momentList : [ {
        moment : {type: Schema.Types.ObjectId, ref: 'Moment'},
        originalMomentId : {type: Schema.Types.ObjectId, ref: 'Moment'},
        momentUser : {type: Schema.Types.ObjectId, ref: 'User'},
        isDeleted: {type: Boolean, default: false, enum: [false, true]},
        msgCreatedAt: Number
    } ],//收到的动态
    isViewed: {type: Boolean, default: false, enum: [false, true]}, //是否被查看

    isDeleted: {type: Boolean, default: false, enum: [false, true]},
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now},
    statisticsUpdatedAt: {type: Number, default: Date.now}

};                     
var momentMsgSchema = new Schema(fields, {
    collection: 'momentMsg'
});

mongoosePre(momentMsgSchema, 'momentMsg');

hookUpModel(momentMsgSchema);
var MomentMsg = mongodb.mongoose.model('MomentMsg', momentMsgSchema);
MomentMsg.fields = fields;
MomentMsg.publicFields = Object.keys(fields).join(' ');
module.exports = MomentMsg;
