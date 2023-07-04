/**
 * voip异常的通话抄送
 *
 */

var
    mongodb = require('../configs/db'),
    Schema = mongodb.mongoose.Schema;
var VoipCallbackSchema = new Schema({
    channelid: String,//通道号，可转为Long值
    createtime: String,//音视频通话开始的时间
    duration: String,//此通通话的通话时长，精确到秒
    eventType: String,//为5，表示是实时音视频/白板时长类型事件
    live: String,//是否是互动直播的音视频，0：否，1：是
    members: String, //表示通话/白板的参与者： accid为用户帐号； 如果是通话的发起者的话，caller字段为true，否则无caller字段；
                    //duration表示对应accid用户的单方时长，其中白板消息暂无此单方时长的统计
    status: String,//通话状态
    type: String,//AUDIO：表示音频通话；
    createdAt: {type: Number, default: Date.now},
}, {
    collection: 'voipCallbacks'
});

var VoipCallback = mongodb.mongoose.model('VoipCallback', VoipCallbackSchema);

module.exports = VoipCallback;