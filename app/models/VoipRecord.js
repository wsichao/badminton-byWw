/**
 * voip录音
 *
 */

var
    mongodb = require('../configs/db'),
    Schema = mongodb.mongoose.Schema,
    StatisticsHelper = require('../../lib/StatisticsHelper');
var hookUpModel = StatisticsHelper.hookUpModel;
var RecordSchema = new Schema({
    isCaller: Boolean,//是否是此通通话的发起者，若是则为true，若不是则没有此字段，可转为Boolean值
    channelid: String,//通道号，可转为Long值
    filename: String,//文件名，直接存储
    md5: String,//文件的md5值
    size: Number,//文件大小，单位为字符，可转为Long值
    type: String,//文件的类型（扩展名），包括aac、gz、mp4，分别表示音频、白板、视频
    url: String,//文件的下载地址
    user: String,//用户帐号
    createdAt: {type: Number, default: Date.now},
    isDeleted: {type: Boolean, default: false}
}, {
    collection: 'voipRecords'
});

hookUpModel(RecordSchema);
var VoipRecord = mongodb.mongoose.model('VoipRecord', RecordSchema);

module.exports = VoipRecord;