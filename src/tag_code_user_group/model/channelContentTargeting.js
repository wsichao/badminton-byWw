/**
 * 渠道文章定向(channelContentTargeting)
 *
 * Created by yichen on 2018/4/19.
 */

"use strict";

module.exports = {
  config: {
    factoryId : Backend.Schema.Types.ObjectId, //厂家ID
    factoryName : String, //厂家名称
    articleId : String, //文章id
    articleIdTitle : String, //文章标题
    userGroup: [Backend.Schema.Types.ObjectId], //分组id列表
                                               /* 一篇文章可以分给多个用户分组
                                                一个分组不能包含多个文章
                                                因分组名称可修改，此处不冗余分组名称*/
    isStart: Boolean, //是否开始执行
    startTime: Number, //开始执行时间
    validTime: Number, //有效小时 7*24 h
    articleExist: Boolean, //文章是否存在, 默认存在true, 删除后忽略此内容定向
  },
  options: {
    collection: 'channelContentTargeting'
  }
};