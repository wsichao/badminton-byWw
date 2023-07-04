/**
 *
 * 送药上门
 *
 * Created by yichen on 2018/5/15.
 */
'use strict';
module.exports = {
  config: {
    channelId	: Backend.Schema.ObjectId, //渠道id
    channelName:String, 	//String	渠道名称	是
    avatar : String,	//String	渠道图片	是
    provinceId	: Backend.Schema.ObjectId, //省id	是
    province  : String,
    cityId	: Backend.Schema.ObjectId, //市id	是
    city : String,
    districtId	: Backend.Schema.ObjectId, //县id	是
    district : String,
    address : String,	//渠道地址	是
    location	:[Number], //List<Double>	位置	是 [116.456387, 39.910366]/[经度, 纬度]
    phoneNum : String,	//联系电话	是

    createdAt: {type: Number, default: Date.now},
    updatedAt: {type: Number, default: Date.now},
    isDeleted: {type: Boolean, default: false}
  },
  options: {
    collection: 'drugDelivery'
  },
  methods: {
    getCommentByCond(cond) {
      cond.isDeleted = false;
      return this.find(cond);
    }
  }
}