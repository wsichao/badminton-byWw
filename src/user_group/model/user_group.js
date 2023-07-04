/**
 * 用户分组表(userGroup)
 *
 * Created by yichen on 2018/4/19.
 */

"use strict";

module.exports = {
  config: {
    code : Number, //分组编号
    factoryName : String, //	厂家名称
    factoryId : String, //厂家ID
    name : String, //分组名
    type : Number, //类别 	10初级 20高级

    showRule : {
      //初级
      planId : Backend.Schema.Types.ObjectId , //计划ID
      time : Number, //年月的时间戳
      minCount : Number, //补贴数量下限(包含起始值)
      maxCount : Number, //补贴数量上限(包含结束值)

      //高级
      group : [Backend.Schema.Types.ObjectId],  //初级分组id列表(["分组id1","分组id2","分组id3"])
      symbol : [String], //运算符列表  (difference 差集
                                      //intersection 交集
                                      //union 并集)   ["intersection","union"]
    } , //当前显示规则

    validRule : {
      //初级
      planId : Backend.Schema.Types.ObjectId , //计划ID
      time : Number, //年月的时间戳
      minCount : Number, //补贴数量下限(包含起始值)
      maxCount : Number, //补贴数量上限(包含结束值)

      //高级
      group : [Backend.Schema.Types.ObjectId],  //初级分组id列表(["分组id1","分组id2","分组id3"])
      symbol : [String], //运算符列表  (difference 差集
                        //intersection 交集
                        //union 并集)   ["intersection","union"]
    }, //当前生效规则(点击生成的时候 当前展示规则 替换到 当前生效规则)
    lastValidTime : Number, //最近生成时间(	从当前展示规则 替换 到 当前生效规则时 设置/点击生成 的时候)



  },
  options: {
    collection: 'userGroup'
  }
};