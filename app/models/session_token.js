/**
 * Created by yichen on 2017/5/31.
 */

var
  mongodb = require('../configs/db'),
  Schema = mongodb.mongoose.Schema;


var SessionTokenSchema = new Schema({
    // 用户唯一标识
    userId: {
      type: Schema.Types.ObjectId
    },
    // 类型 2030Assistant：2030健康助理端；2030WechatMC：2030健康小程序;doctorWeChat: 朱李叶健康医生端小程序
    type: {
      type: String,
      enum: ['2030Assistant', '2030WechatMC', 'doctorWeChat']
    },
    // 鉴权唯一令牌
    token: {
      type: String
    },
    // 登录时间
    loginTime: {
      type: Number
    }
},{
  collection: 'SessionToken'
});

var SessionToken = mongodb.mongoose.model('SessionToken', SessionTokenSchema);

module.exports = SessionToken;