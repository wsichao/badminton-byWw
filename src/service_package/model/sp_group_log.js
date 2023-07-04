/**
 *
 * 服务包--群组定时脚本日志
 */


"use strict";

module.exports = {
  config: {
    groupId: String,   //群组唯一标识
    servicePackageOrderId: String,  // 服务包订单号
    option: String, //操作 ['发消息','删除']
    params: Object, //参数
    message: String
  },
  options: {
    collection: 'spGroupLog'
  }
};