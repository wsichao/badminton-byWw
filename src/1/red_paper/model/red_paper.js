/**
 * 活动红包
 * Created by yichen on 2017/7/10.
 */


module.exports = {
  config: {
    source: {type: String, default: 'docChat'},
    momentId : { type: String , default : '' , index : 1 },    //红包对应的动态id
    timeStr : { type: String , default : '' , index : 1 },     //动态创建时间  yyyy-MM-dd
    amount : Number,      //金额
    isReceived : { type: Boolean , default : false , index : 1 }, //有没有被领取
    receivedUserId : String, //领取者的userId
    publishUserId : String, //发红包的userId

  },
  options: {
    collection: 'redPapers'
  }
}