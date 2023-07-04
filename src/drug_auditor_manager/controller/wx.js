/**
 * Created by Mr.Carry on 2018/3/12.
 * HOST_PRODUCTION = "https://pro.mtxhcare.com",//正式域名
 * HOST_TEST = "https://dev.mtxhcare.com",//测试域名
 * HOST_DEV = "https://care-dev.zlycare.com",//开发域名
 */
"use strict";
let base_url = 'https://dev.mtxhcare.com';
if (Backend.type == 'pro') {
  base_url = 'https://pro.mtxhcare.com';
}
let wx_url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx4ed521122f366f4c&redirect_uri=' + base_url + '/drug_auditor_manager/index&response_type=code&scope=snsapi_userinfo&state=STATE&connect_redirect=1#wechat_redirect'

module.exports = {
  getAction() {
    this.res.redirect(wx_url);
  }
}