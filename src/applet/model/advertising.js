/**
 * 广告管理表
 */
module.exports = {
  config: {
    headline: {type: String, required: true}, //广告标题
    picture:{type: String, required: true},//广告图片
    url:{type: String, required: true},//跳转连接
    weight:{type: Number, required: true},//权重
    remark:{type: String, required: true},//备注
    isShow:{type: Boolean, default: false}//是否在APP中显示
  },
  options:{
    collection: 'advertising'
  }
}