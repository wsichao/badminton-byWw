/**
 * Created by Mr.Carry on 2017/6/21.
 */

"use strict";
let service = Backend.service("1/city_buy", "moment_msg");

module.exports = {
  getAction: function () {
    let content = '欢迎访问我的个人网站：http://www.baidu.com/ds?123';
    console.log(service.momentURL(content))
    return this.success(service.momentURL(content));
  }
}